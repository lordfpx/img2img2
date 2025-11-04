import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { saveAs } from "file-saver";

import { type OutputFormat, convertImage } from "@/lib/imageConversion";
import { createArchiveFromConversions } from "@/lib/downloadAll";
import { createId } from "@/lib/utils";
import { defaultQuality, type ConversionItem } from "@/types/conversion";

interface UseConversionControllerResult {
	items: ConversionItem[];
	globalFormat: OutputFormat;
	globalQuality: number;
	averageReduction: {
		convertedTotal: number;
		originalTotal: number;
		delta: number;
		ratio: number;
	} | null;
	hasItems: boolean;
	hasDownloadableItems: boolean;
	isExporting: boolean;
	handleFiles: (files: FileList | null) => void;
	handleFormatChange: (id: string, format: OutputFormat) => void;
	handleQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
	handleUseGlobalQualityChange: (id: string, useGlobal: boolean) => void;
	handleGlobalQualityChange: (value: number) => void;
	handleGlobalFormatChange: (format: OutputFormat) => void;
	handleSplitChange: (id: string, value: number) => void;
	removeItem: (id: string) => void;
	clearAll: () => void;
	downloadAll: () => Promise<void>;
}

export const useConversionController = (): UseConversionControllerResult => {
	const [items, setItems] = useState<ConversionItem[]>([]);
	const [globalFormat, setGlobalFormat] = useState<OutputFormat>("webp");
	const [globalQuality, setGlobalQuality] = useState(defaultQuality("webp"));
	const [isExporting, setIsExporting] = useState(false);
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
			const result = await convertImage(job.file, job.targetFormat, job.quality);
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
			const message = error instanceof Error ? error.message : "La conversion a échoué.";
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
			overrides?: Partial<
				Pick<ConversionItem, "targetFormat" | "quality" | "usesGlobalQuality" | "usesGlobalFormat">
			>,
		) => {
			setItems((prev) => {
				const next = prev.map((item) => {
					if (item.id !== id) return item;
					const updated: ConversionItem = {
						...item,
						...overrides,
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

	const handleFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;
			const additions: ConversionItem[] = [];
			for (const file of files) {
				const originalUrl = URL.createObjectURL(file);
				const targetFormat: OutputFormat = globalFormat;
				const usesGlobalQuality = true;
				const quality = globalQuality;
				const job: ConversionItem = {
					id: createId(),
					file,
					originalUrl,
					originalSize: file.size,
					targetFormat,
					quality,
					usesGlobalQuality,
					usesGlobalFormat: true,
					status: "processing",
					compareSplit: 50,
				};
				additions.push(job);
				queueMicrotask(() => runConversion(job));
			}
			setItems((prev) => [...prev, ...additions]);
		},
		[globalFormat, globalQuality, runConversion],
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
			const shouldUseGlobal = current?.usesGlobalQuality ?? true;
			const useGlobalFormat = format === globalFormat;
			const baseQuality = shouldUseGlobal ? globalQuality : defaultQuality(format);
			scheduleConversion(id, {
				targetFormat: format,
				quality: baseQuality,
				usesGlobalQuality: shouldUseGlobal,
				usesGlobalFormat: useGlobalFormat,
			});
		},
		[globalFormat, globalQuality, scheduleConversion],
	);

	const handleQualityChange = useCallback(
		(id: string, event: ChangeEvent<HTMLInputElement>) => {
			const quality = Number(event.target.value);
			scheduleConversion(id, { quality, usesGlobalQuality: false });
		},
		[scheduleConversion],
	);

	const handleUseGlobalQualityChange = useCallback(
		(id: string, useGlobal: boolean) => {
			const current = itemsRef.current.find((item) => item.id === id);
			const nextQuality = useGlobal
				? globalQuality
				: (current?.quality ?? (current ? defaultQuality(current.targetFormat) : globalQuality));
			scheduleConversion(id, {
				quality: nextQuality,
				usesGlobalQuality: useGlobal,
			});
		},
		[globalQuality, scheduleConversion],
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
					};
					queueMicrotask(() => runConversion(updated));
					return updated;
				});
				return next;
			});
		},
		[globalQuality, runConversion],
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
		averageReduction,
		hasItems: items.length > 0,
		hasDownloadableItems,
		isExporting,
		handleFiles,
		handleFormatChange,
		handleQualityChange,
		handleUseGlobalQualityChange,
		handleGlobalQualityChange,
		handleGlobalFormatChange,
		handleSplitChange,
		removeItem,
		clearAll,
		downloadAll,
	};
};
