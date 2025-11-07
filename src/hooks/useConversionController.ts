import { saveAs } from "file-saver";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createArchiveFromConversions } from "@/lib/downloadAll";
import {
	convertImage,
	type GifConversionOptions,
	isSupportedInputFile,
	type OutputFormat,
	type PngConversionOptions,
} from "@/lib/imageConversion";
import { MAX_TOTAL_BYTES } from "@/lib/uploadLimits";
import { createId, formatBytes } from "@/lib/utils";
import {
	type ConversionItem,
	createDefaultGifOptions,
	createDefaultPngOptions,
	defaultQuality,
} from "@/types/conversion";

const formatUsesQuality = (format: OutputFormat) => format === "jpeg" || format === "webp";

const cloneGifOptions = (options: GifConversionOptions): GifConversionOptions => ({ ...options });

const clonePngOptions = (options: PngConversionOptions): PngConversionOptions => ({ ...options });

interface UseConversionControllerResult {
	items: ConversionItem[];
	globalFormat: OutputFormat;
	globalQuality: number;
	globalGifOptions: GifConversionOptions;
	globalPngOptions: PngConversionOptions;
	averageReduction: {
		convertedTotal: number;
		originalTotal: number;
		delta: number;
		ratio: number;
	} | null;
	uploadError: string | null;
	hasItems: boolean;
	hasDownloadableItems: boolean;
	isExporting: boolean;
	handleFiles: (files: FileList | null) => void;
	handleFormatChange: (id: string, format: OutputFormat) => void;
	handleQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
	handleUseGlobalSettingsChange: (id: string, useGlobal: boolean) => void;
	handleGifOptionsChange: (id: string, options: Partial<GifConversionOptions>) => void;
	handlePngOptionsChange: (id: string, options: Partial<PngConversionOptions>) => void;
	handleGlobalQualityChange: (value: number) => void;
	handleGlobalFormatChange: (format: OutputFormat) => void;
	handleGlobalGifOptionsChange: (options: Partial<GifConversionOptions>) => void;
	handleGlobalPngOptionsChange: (options: Partial<PngConversionOptions>) => void;
	handleSplitChange: (id: string, value: number) => void;
	removeItem: (id: string) => void;
	clearAll: () => void;
	downloadAll: () => Promise<void>;
}

export const useConversionController = (): UseConversionControllerResult => {
	const [items, setItems] = useState<ConversionItem[]>([]);
	const [globalFormat, setGlobalFormat] = useState<OutputFormat>("webp");
	const [globalQuality, setGlobalQuality] = useState(defaultQuality("webp"));
	const [globalGifOptions, setGlobalGifOptions] = useState(createDefaultGifOptions);
	const [globalPngOptions, setGlobalPngOptions] = useState(createDefaultPngOptions);
	const [isExporting, setIsExporting] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const itemsRef = useRef<ConversionItem[]>([]);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	const releaseResources = useCallback((item: ConversionItem) => {
		URL.revokeObjectURL(item.originalUrl);
		if (item.convertedUrl) {
			URL.revokeObjectURL(item.convertedUrl);
		}
	}, []);

	useEffect(() => {
		return () => {
			itemsRef.current.forEach(releaseResources);
		};
	}, [releaseResources]);

	const runConversion = useCallback(async (job: ConversionItem) => {
		try {
			const result = await convertImage(
				job.file,
				job.targetFormat === "gif"
					? { format: "gif", options: job.gifOptions }
					: job.targetFormat === "png"
						? { format: "png", options: job.pngOptions }
						: { format: job.targetFormat, quality: job.quality },
			);
			setItems((prev) =>
				prev.map((item) => {
					if (item.id !== job.id) return item;
					if (item.convertedUrl && item.convertedUrl !== result.url) {
						URL.revokeObjectURL(item.convertedUrl);
					}
					return {
						...item,
						convertedBlob: result.blob,
						convertedUrl: result.url,
						status: "done",
						width: result.width,
						height: result.height,
					};
				}),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Conversion failed.";
			setItems((prev) =>
				prev.map((item) =>
					item.id === job.id
						? {
								...item,
								status: "error",
								error: message,
							}
						: item,
				),
			);
		}
	}, []);

	const scheduleConversion = useCallback(
		(
			id: string,
			overrides?:
				| Partial<
						Pick<
							ConversionItem,
							| "targetFormat"
							| "quality"
							| "usesGlobalQuality"
							| "usesGlobalFormat"
							| "gifOptions"
							| "pngOptions"
						>
				  >
				| ((item: ConversionItem) => Partial<ConversionItem>),
		) => {
			setItems((prev) =>
				prev.map((item) => {
					if (item.id !== id) return item;
					const patch = typeof overrides === "function" ? overrides(item) : (overrides ?? {});
					const updated: ConversionItem = {
						...item,
						...patch,
						status: "processing",
						error: undefined,
					};
					queueMicrotask(() => runConversion(updated));
					return updated;
				}),
			);
		},
		[runConversion],
	);

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;
			const additions: ConversionItem[] = [];
			const unsupportedFiles: string[] = [];
			const oversizedFiles: string[] = [];
			const limitLabel = formatBytes(MAX_TOTAL_BYTES);
			let runningTotal = itemsRef.current.reduce((acc, item) => acc + item.originalSize, 0);
			for (const file of files) {
				if (!isSupportedInputFile(file)) {
					unsupportedFiles.push(file.name);
					continue;
				}
				if (runningTotal + file.size > MAX_TOTAL_BYTES) {
					oversizedFiles.push(file.name);
					continue;
				}
				const originalUrl = URL.createObjectURL(file);
				const targetFormat: OutputFormat = globalFormat;
				const usesGlobalQuality = formatUsesQuality(targetFormat);
				const quality = usesGlobalQuality ? globalQuality : defaultQuality(targetFormat);
				const job: ConversionItem = {
					id: createId(),
					file,
					originalUrl,
					originalSize: file.size,
					targetFormat,
					quality,
					usesGlobalQuality,
					usesGlobalFormat: true,
					gifOptions: cloneGifOptions(globalGifOptions),
					pngOptions: clonePngOptions(globalPngOptions),
					status: "processing",
					compareSplit: 50,
				};
				additions.push(job);
				runningTotal += file.size;
				queueMicrotask(() => runConversion(job));
			}
			if (additions.length > 0) {
				setItems((prev) => [...prev, ...additions]);
			}
			const messages: string[] = [];
			if (unsupportedFiles.length > 0) {
				messages.push(
					unsupportedFiles.length === 1
						? `The file format of "${unsupportedFiles[0]}" is not supported.`
						: `The file formats of the following files are not supported: ${unsupportedFiles.join(
								", ",
							)}.`,
				);
			}
			if (oversizedFiles.length > 0) {
				messages.push(
					oversizedFiles.length === 1
						? `Could not add "${oversizedFiles[0]}" because the total size would exceed ${limitLabel}.`
						: `Could not add these files (${oversizedFiles.join(
								", ",
							)}) because the total size would exceed ${limitLabel}.`,
				);
			}
			setUploadError(messages.length > 0 ? messages.join(" ") : null);
		},
		[globalFormat, globalGifOptions, globalPngOptions, globalQuality, runConversion],
	);

	const removeItem = useCallback(
		(id: string) => {
			setItems((prev) => {
				const target = prev.find((item) => item.id === id);
				if (target) {
					releaseResources(target);
				}
				return prev.filter((item) => item.id !== id);
			});
		},
		[releaseResources],
	);

	const clearAll = useCallback(() => {
		setItems((prev) => {
			prev.forEach(releaseResources);
			return [];
		});
	}, [releaseResources]);

	const handleFormatChange = useCallback(
		(id: string, format: OutputFormat) => {
			const current = itemsRef.current.find((item) => item.id === id);
			const usesSlider = formatUsesQuality(format);
			const shouldUseGlobal = usesSlider ? Boolean(current?.usesGlobalQuality) : false;
			const baseQuality = usesSlider
				? shouldUseGlobal
					? globalQuality
					: defaultQuality(format)
				: defaultQuality(format);
			scheduleConversion(id, (item) => ({
				targetFormat: format,
				quality: baseQuality,
				usesGlobalQuality: usesSlider ? shouldUseGlobal : false,
				usesGlobalFormat:
					item.usesGlobalFormat && format === item.targetFormat ? item.usesGlobalFormat : false,
				gifOptions: format === "gif" ? cloneGifOptions(globalGifOptions) : item.gifOptions,
				pngOptions: format === "png" ? clonePngOptions(globalPngOptions) : item.pngOptions,
			}));
		},
		[globalGifOptions, globalPngOptions, globalQuality, scheduleConversion],
	);

	const handleQualityChange = useCallback(
		(id: string, event: ChangeEvent<HTMLInputElement>) => {
			const quality = Number(event.target.value);
			scheduleConversion(id, { quality, usesGlobalQuality: false });
		},
		[scheduleConversion],
	);

	const handleUseGlobalSettingsChange = useCallback(
		(id: string, useGlobal: boolean) => {
			const current = itemsRef.current.find((item) => item.id === id);
			if (!current) return;
			if (useGlobal) {
				const nextFormat = globalFormat;
				const formatHasQuality = formatUsesQuality(nextFormat);
				const nextQuality = formatHasQuality ? globalQuality : defaultQuality(nextFormat);
				scheduleConversion(id, {
					targetFormat: nextFormat,
					quality: nextQuality,
					usesGlobalFormat: true,
					usesGlobalQuality: formatHasQuality,
					gifOptions: nextFormat === "gif" ? cloneGifOptions(globalGifOptions) : current.gifOptions,
					pngOptions: nextFormat === "png" ? clonePngOptions(globalPngOptions) : current.pngOptions,
				});
			} else {
				scheduleConversion(id, {
					usesGlobalFormat: false,
					usesGlobalQuality: false,
				});
			}
		},
		[globalFormat, globalGifOptions, globalPngOptions, globalQuality, scheduleConversion],
	);

	const handleGifOptionsChange = useCallback(
		(id: string, options: Partial<GifConversionOptions>) => {
			scheduleConversion(id, (item) => ({
				gifOptions: { ...item.gifOptions, ...options },
			}));
		},
		[scheduleConversion],
	);

	const handlePngOptionsChange = useCallback(
		(id: string, options: Partial<PngConversionOptions>) => {
			scheduleConversion(id, (item) => ({
				pngOptions: { ...item.pngOptions, ...options },
			}));
		},
		[scheduleConversion],
	);

	const handleGlobalQualityChange = useCallback(
		(value: number) => {
			setGlobalQuality(value);
			setItems((prev) => {
				const next = prev.map((item) => {
					if (!item.usesGlobalQuality) return item;
					const updated: ConversionItem = {
						...item,
						quality: value,
						status: "processing",
						error: undefined,
					};
					queueMicrotask(() => runConversion(updated));
					return updated;
				});
				return next;
			});
		},
		[runConversion],
	);

	const handleGlobalGifOptionsChange = useCallback(
		(options: Partial<GifConversionOptions>) => {
			setGlobalGifOptions((prev) => {
				const next = { ...prev, ...options };
				setItems((prevItems) =>
					prevItems.map((item) => {
						if (item.targetFormat !== "gif" || !item.usesGlobalFormat) return item;
						const updated: ConversionItem = {
							...item,
							gifOptions: cloneGifOptions(next),
							status: "processing",
							error: undefined,
						};
						queueMicrotask(() => runConversion(updated));
						return updated;
					}),
				);
				return next;
			});
		},
		[runConversion],
	);

	const handleGlobalPngOptionsChange = useCallback(
		(options: Partial<PngConversionOptions>) => {
			setGlobalPngOptions((prev) => {
				const next = { ...prev, ...options };
				setItems((prevItems) =>
					prevItems.map((item) => {
						if (item.targetFormat !== "png" || !item.usesGlobalFormat) return item;
						const updated: ConversionItem = {
							...item,
							pngOptions: clonePngOptions(next),
							status: "processing",
							error: undefined,
						};
						queueMicrotask(() => runConversion(updated));
						return updated;
					}),
				);
				return next;
			});
		},
		[runConversion],
	);

	const handleGlobalFormatChange = useCallback(
		(format: OutputFormat) => {
			setGlobalFormat(format);
			setItems((prev) => {
				const next = prev.map((item) => {
					if (!item.usesGlobalFormat) return item;
					const usesGlobalQuality = item.usesGlobalQuality;
					const nextQuality = usesGlobalQuality ? globalQuality : item.quality;
					const updated: ConversionItem = {
						...item,
						targetFormat: format,
						quality: nextQuality,
						usesGlobalFormat: true,
						usesGlobalQuality,
						status: "processing",
						error: undefined,
						gifOptions: format === "gif" ? cloneGifOptions(globalGifOptions) : item.gifOptions,
						pngOptions: format === "png" ? clonePngOptions(globalPngOptions) : item.pngOptions,
					};
					queueMicrotask(() => runConversion(updated));
					return updated;
				});
				return next;
			});
		},
		[globalGifOptions, globalPngOptions, globalQuality, runConversion],
	);

	const handleSplitChange = useCallback((id: string, value: number) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							compareSplit: value,
						}
					: item,
			),
		);
	}, []);

	const averageReduction = useMemo(() => {
		const successful = items.filter((item) => item.status === "done" && item.convertedBlob);
		if (successful.length === 0) return null;
		const originalTotal = successful.reduce((acc, item) => acc + item.originalSize, 0);
		const convertedTotal = successful.reduce(
			(acc, item) => acc + (item.convertedBlob?.size ?? 0),
			0,
		);
		const delta = originalTotal - convertedTotal;
		return {
			convertedTotal,
			originalTotal,
			delta,
			ratio: originalTotal > 0 ? (delta / originalTotal) * 100 : 0,
		};
	}, [items]);

	const hasDownloadableItems = useMemo(() => items.some((item) => item.convertedBlob), [items]);

	const downloadAll = useCallback(async () => {
		if (isExporting) return;
		const ready = itemsRef.current.filter((item) => item.convertedBlob);
		if (ready.length === 0) return;
		setIsExporting(true);
		try {
			const archive = await createArchiveFromConversions(ready);
			if (!archive) return;
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			saveAs(archive, `conversions-${timestamp}.zip`);
		} finally {
			setIsExporting(false);
		}
	}, [isExporting]);

	return {
		items,
		globalFormat,
		globalQuality,
		globalGifOptions,
		globalPngOptions,
		averageReduction,
		uploadError,
		hasItems: items.length > 0,
		hasDownloadableItems,
		isExporting,
		handleFiles,
		handleFormatChange,
		handleQualityChange,
		handleUseGlobalSettingsChange,
		handleGifOptionsChange,
		handlePngOptionsChange,
		handleGlobalQualityChange,
		handleGlobalFormatChange,
		handleGlobalGifOptionsChange,
		handleGlobalPngOptionsChange,
		handleSplitChange,
		removeItem,
		clearAll,
		downloadAll,
	};
};
