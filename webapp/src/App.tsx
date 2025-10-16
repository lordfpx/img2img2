import { ConversionItem } from "@/components/ConversionItem";
import { ConversionStats } from "@/components/ConversionStats";
import { FileUpload } from "@/components/FileUpload";
import { GlobalQualityControl } from "@/components/GlobalQualityControl";
import { Header } from "@/components/Header";
import { type OutputFormat, convertImage } from "@/lib/imageConversion";
import { createId } from "@/lib/utils";
import {
	type ConversionItem as ConversionItemType,
	defaultQuality,
} from "@/types/conversion";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const App = () => {
	const [items, setItems] = useState<ConversionItemType[]>([]);
	const [globalFormat, setGlobalFormat] = useState<OutputFormat>("webp");
	const [globalQuality, setGlobalQuality] = useState(defaultQuality("webp"));
	const itemsRef = useRef<ConversionItemType[]>([]);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	const releaseResources = useCallback((item: ConversionItemType) => {
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

	const runConversion = useCallback(async (job: ConversionItemType) => {
		try {
			const result = await convertImage(
				job.file,
				job.targetFormat,
				job.quality,
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
			const message =
				error instanceof Error ? error.message : "La conversion a échoué.";
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
				Pick<
					ConversionItemType,
					"targetFormat" | "quality" | "usesGlobalQuality" | "usesGlobalFormat"
				>
			>,
		) => {
			setItems((prev) => {
				const next = prev.map((item) => {
					if (item.id !== id) return item;
					const updated: ConversionItemType = {
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
			const additions: ConversionItemType[] = [];
			for (const file of files) {
				const originalUrl = URL.createObjectURL(file);
				const targetFormat: OutputFormat = globalFormat;
				const usesGlobalQuality = targetFormat !== "svg";
				const quality = targetFormat === "svg" ? 100 : globalQuality;
				const job: ConversionItemType = {
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
			const shouldUseGlobal =
				format !== "svg" && (current?.usesGlobalQuality ?? true);
			const useGlobalFormat = format === globalFormat;
			const baseQuality =
				format === "svg"
					? 100
					: shouldUseGlobal
						? globalQuality
						: defaultQuality(format);
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
				: (current?.quality ??
					(current ? defaultQuality(current.targetFormat) : globalQuality));
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
					if (item.targetFormat === "svg" || !item.usesGlobalQuality)
						return item;
					const updated: ConversionItemType = {
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
					const usesGlobalQuality =
						format === "svg" ? false : item.usesGlobalQuality;
					const nextQuality =
						format === "svg"
							? 100
							: usesGlobalQuality
								? globalQuality
								: item.quality;
					const updated: ConversionItemType = {
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
		const successful = items.filter(
			(item) => item.status === "done" && item.convertedBlob,
		);
		if (successful.length === 0) return null;
		const originalTotal = successful.reduce(
			(acc, item) => acc + item.originalSize,
			0,
		);
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

	return (
		<div className="min-h-screen bg-slate-950 pb-24">
			<Header onClearAll={clearAll} hasItems={items.length > 0} />

			<main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
				<section>
					<GlobalQualityControl
						format={globalFormat}
						onFormatChange={handleGlobalFormatChange}
						quality={globalQuality}
						onQualityChange={handleGlobalQualityChange}
					/>
				</section>

				<section>
					<FileUpload onFilesSelected={handleFiles} />
				</section>

				{averageReduction && (
					<ConversionStats
						originalTotal={averageReduction.originalTotal}
						convertedTotal={averageReduction.convertedTotal}
						delta={averageReduction.delta}
						ratio={averageReduction.ratio}
					/>
				)}

				<section className="flex flex-col gap-8">
					{items.length === 0 && (
						<div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
							Importez une image pour commencer la conversion.
						</div>
					)}

					{items.map((item) => (
						<ConversionItem
							key={item.id}
							item={item}
							globalQuality={globalQuality}
							onFormatChange={handleFormatChange}
							onQualityChange={handleQualityChange}
							onUseGlobalQualityChange={handleUseGlobalQualityChange}
							onSplitChange={handleSplitChange}
							onRemove={removeItem}
						/>
					))}
				</section>
			</main>
		</div>
	);
};

export default App;
