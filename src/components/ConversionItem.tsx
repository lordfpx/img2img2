import clsx from "clsx";
import type { ChangeEvent } from "react";
import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleButton } from "@/components/ui/SimpleButton";
import { SimpleField } from "@/components/ui/SimpleField";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import type {
	GifConversionOptions,
	OutputFormat,
	PngConversionOptions,
} from "@/lib/imageConversion";
import { formatBytes } from "@/lib/utils";
import { type ConversionItem as ConversionItemType, formatOptions } from "@/types/conversion";

interface ConversionItemProps {
	item: ConversionItemType;
	globalFormat: OutputFormat;
	onFormatChange: (id: string, format: OutputFormat) => void;
	onQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
	onUseGlobalSettingsChange: (id: string, useGlobal: boolean) => void;
	onGifOptionsChange: (id: string, options: Partial<GifConversionOptions>) => void;
	onPngOptionsChange: (id: string, options: Partial<PngConversionOptions>) => void;
	onSplitChange: (id: string, value: number) => void;
	onRemove: (id: string) => void;
}

export const ConversionItem = ({
	item,
	globalFormat,
	onFormatChange,
	onQualityChange,
	onUseGlobalSettingsChange,
	onGifOptionsChange,
	onPngOptionsChange,
	onSplitChange,
	onRemove,
}: ConversionItemProps) => {
	const convertedSize = item.convertedBlob?.size ?? null;
	const formatLabel =
		formatOptions.find((option) => option.value === item.targetFormat)?.label ?? item.targetFormat;
	const globalFormatLabel =
		formatOptions.find((option) => option.value === globalFormat)?.label ?? globalFormat;
	const isQualityFormat = item.targetFormat === "jpeg" || item.targetFormat === "webp";
	const usesGlobalSettings = item.usesGlobalFormat && (!isQualityFormat || item.usesGlobalQuality);
	const qualityDisabled = isQualityFormat && (item.usesGlobalQuality || usesGlobalSettings);
	const formatDisabled = usesGlobalSettings;
	const settingsDisabled = usesGlobalSettings;
	const delta = convertedSize !== null ? item.originalSize - convertedSize : null;
	const gainRatio =
		delta !== null && item.originalSize > 0 ? (delta / item.originalSize) * 100 : null;

	const renderQualityControls = () => (
		<SimpleField label="Quality" className="md:w-full">
			<div className="flex items-center gap-3">
				<input
					type="range"
					min={0}
					max={100}
					step={1}
					value={item.quality}
					disabled={qualityDisabled}
					onChange={(event) => onQualityChange(item.id, event)}
					className="h-1 w-full disabled:opacity-50"
				/>
				<span className="w-12 text-sm text-gray-600">{item.quality}</span>
			</div>
		</SimpleField>
	);

	const renderGifControls = () => {
		const options = item.gifOptions;
		const showBackground = !options.preserveAlpha;
		return (
			<SimpleBlock className="space-y-3">
				<SimpleTitle as="h4" className="text-base">
					GIF options
				</SimpleTitle>
				<div className="space-y-3 text-sm text-gray-700">
					<label className="flex flex-col gap-1">
						<span>Number of colors</span>
						<div className="flex items-center gap-3">
							<input
								type="range"
								min={2}
								max={256}
								step={1}
								value={options.colorCount}
								disabled={settingsDisabled}
								onChange={(event) =>
									onGifOptionsChange(item.id, { colorCount: Number(event.target.value) })
								}
								className="h-1 w-full disabled:opacity-50"
							/>
							<span className="w-12 text-right">{options.colorCount}</span>
						</div>
					</label>

					<label className="flex flex-col gap-1">
						<span>Dithering</span>
						<select
							value={options.dithering}
							disabled={settingsDisabled}
							onChange={(event) =>
								onGifOptionsChange(item.id, {
									dithering: event.target.value as GifConversionOptions["dithering"],
								})
							}
							className="w-full border border-gray-400 bg-white px-2 py-2 text-sm disabled:opacity-60"
						>
							<option value="none">None</option>
							<option value="floyd-steinberg">Floyd-Steinberg</option>
						</select>
					</label>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={options.preserveAlpha}
							disabled={settingsDisabled}
							onChange={(event) =>
								onGifOptionsChange(item.id, { preserveAlpha: event.target.checked })
							}
							className="h-4 w-4 border border-gray-400 disabled:opacity-50"
						/>
						<span>Preserve transparency</span>
					</label>

					{showBackground ? (
						<label className="flex items-center gap-3">
							<span>Background color</span>
							<input
								type="color"
								value={options.backgroundColor}
								disabled={settingsDisabled}
								onChange={(event) =>
									onGifOptionsChange(item.id, { backgroundColor: event.target.value })
								}
								className="h-8 w-12 border border-gray-400 bg-white disabled:opacity-60"
							/>
						</label>
					) : null}

					<label className="flex flex-col gap-1">
						<span>Loop count (0 = infinite)</span>
						<input
							type="number"
							min={-1}
							value={options.loopCount}
							disabled={settingsDisabled}
							onChange={(event) =>
								onGifOptionsChange(item.id, { loopCount: Number(event.target.value) })
							}
							className="w-full border border-gray-400 px-2 py-2 text-sm disabled:opacity-60"
						/>
					</label>
				</div>
			</SimpleBlock>
		);
	};

	const renderPngControls = () => {
		const options = item.pngOptions;
		const showBackground = !options.preserveAlpha;
		return (
			<SimpleBlock className="space-y-3">
				<SimpleTitle as="h4" className="text-base">
					PNG options
				</SimpleTitle>
				<div className="space-y-3 text-sm text-gray-700">
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={options.reduceColors}
							disabled={settingsDisabled}
							onChange={(event) =>
								onPngOptionsChange(item.id, { reduceColors: event.target.checked })
							}
							className="h-4 w-4 border border-gray-400 disabled:opacity-50"
						/>
						<span>Reduce color count</span>
					</label>

					<label className="flex flex-col gap-1">
						<span>Palette (2 – 256)</span>
						<div className="flex items-center gap-3">
							<input
								type="range"
								min={2}
								max={256}
								step={1}
								value={options.colorCount}
								disabled={!options.reduceColors || settingsDisabled}
								onChange={(event) =>
									onPngOptionsChange(item.id, { colorCount: Number(event.target.value) })
								}
								className="h-1 w-full disabled:opacity-40"
							/>
							<span className="w-12 text-right">{options.colorCount}</span>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={options.preserveAlpha}
							disabled={settingsDisabled}
							onChange={(event) =>
								onPngOptionsChange(item.id, { preserveAlpha: event.target.checked })
							}
							className="h-4 w-4 border border-gray-400 disabled:opacity-50"
						/>
						<span>Preserve transparency</span>
					</label>

					{showBackground ? (
						<label className="flex items-center gap-3">
							<span>Background color</span>
							<input
								type="color"
								value={options.backgroundColor}
								disabled={settingsDisabled}
								onChange={(event) =>
									onPngOptionsChange(item.id, { backgroundColor: event.target.value })
								}
								className="h-8 w-12 border border-gray-400 bg-white disabled:opacity-60"
							/>
						</label>
					) : null}

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={options.interlaced}
							disabled={settingsDisabled}
							onChange={(event) =>
								onPngOptionsChange(item.id, { interlaced: event.target.checked })
							}
							className="h-4 w-4 border border-gray-400 disabled:opacity-50"
						/>
						<span>Interlaced (progressive)</span>
					</label>
				</div>
			</SimpleBlock>
		);
	};

	const renderSettingsControls = () => {
		if (item.targetFormat === "gif") return renderGifControls();
		if (item.targetFormat === "png") return renderPngControls();
		return renderQualityControls();
	};

	return (
		<SimpleBlock className="space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<SimpleTitle as="h3" className="text-xl">
						{item.file.name}
					</SimpleTitle>
				</div>
				<SimpleButton onClick={() => onRemove(item.id)} variant="outline">
					Remove
				</SimpleButton>
			</div>

			<div className="mx-auto flex max-w-5xl flex-col gap-4">
				<div className="grid gap-4 md:grid-cols-2">
					<SimpleField label="Format">
						<select
							value={item.targetFormat}
							onChange={(event) => onFormatChange(item.id, event.target.value as OutputFormat)}
							disabled={formatDisabled}
							className="w-full border border-gray-400 bg-white px-2 py-2 text-sm disabled:opacity-60"
						>
							{formatOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
							<input
								type="checkbox"
								checked={usesGlobalSettings}
								onChange={(event) => onUseGlobalSettingsChange(item.id, event.target.checked)}
								className="h-4 w-4 border border-gray-400"
							/>
							<b>Use default settings</b> - {globalFormatLabel}
						</label>
					</SimpleField>
					{renderSettingsControls()}
				</div>
			</div>

			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex-1 space-y-2">
					<div className="relative pb-6 border border-gray-300">
						<div className="relative flex aspect-video items-center justify-center  bg-white">
							<img src={item.originalUrl} alt="Original" className="h-full w-full object-contain" />

							{item.convertedUrl ? (
								<img
									src={item.convertedUrl}
									alt="Converted"
									className="absolute inset-0 h-full w-full object-contain"
									style={{ clipPath: `inset(0 ${100 - item.compareSplit}% 0 0)` }}
								/>
							) : null}

							<div
								className={`h-full border-l border-l-black border-r border-r-white opacity-50 w-[1px] absolute top-0 bottom-0 translate-x-1/2 transition-transform`}
								style={{ left: `${item.compareSplit}%` }}
							></div>

							<div className="pointer-events-none absolute inset-0 flex items-start justify-between text-xs text-gray-700">
								<span className="bg-slate-300 px-2 py-1">Converted</span>
								<span className="bg-slate-300 px-2 py-1">Original</span>
							</div>
						</div>
						<input
							type="range"
							min={0}
							max={100}
							value={item.compareSplit}
							onChange={(event) => onSplitChange(item.id, Number(event.target.value))}
							className="absolute bottom-2 h-3 w-full"
						/>
					</div>

					{item.status === "processing" ? (
						<p className="text-xs text-gray-600">Converting…</p>
					) : null}
					{item.status === "error" ? (
						<p className="text-xs text-red-600">{item.error ?? "Something went wrong."}</p>
					) : null}
				</div>

				<div className="flex w-full flex-col justify-between gap-3 md:w-64">
					<div className="space-y-2 border border-gray-300 bg-white p-3 text-sm text-gray-700">
						<div className="flex justify-between">
							<span>Status</span>
							<span className="font-medium text-gray-900">
								{item.status === "processing"
									? "Converting"
									: item.status === "error"
										? (item.error ?? "Something went wrong")
										: "Ready"}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Source format</span>
							<span className="font-medium text-gray-900">{item.file.type || "Auto"}</span>
						</div>
						<div className="flex justify-between">
							<span>Target format</span>
							<span className="font-medium text-gray-900">{formatLabel}</span>
						</div>
						<div className="flex justify-between">
							<span>Dimensions</span>
							<span className="font-medium text-gray-900">
								{item.width && item.height
									? `${item.width} × ${item.height}px`
									: "Processing"}
							</span>
						</div>

						<div className="flex justify-between">
							<span>Original size</span>
							<span className="font-medium text-gray-900">{formatBytes(item.originalSize)}</span>
						</div>
						<div className="flex justify-between">
							<span>Converted size</span>
							<span className="font-medium text-gray-900">
								{convertedSize !== null ? formatBytes(convertedSize) : "—"}
							</span>
						</div>
						{gainRatio !== null && delta !== null ? (
							<div className="flex justify-between">
								<span>Savings</span>
								<span className="font-medium text-gray-900">
									{formatBytes(delta)} ({gainRatio.toFixed(1)}%)
								</span>
							</div>
						) : null}
					</div>
					<SimpleButton
						disabled={!item.convertedBlob}
						onClick={() => {
							if (!item.convertedBlob) return;
							const link = document.createElement("a");
							const extension = item.targetFormat === "jpeg" ? "jpg" : item.targetFormat;
							const url = URL.createObjectURL(item.convertedBlob);
							link.href = url;
							link.download = `${item.file.name.replace(/\.[^.]+$/, "")}.${extension}`;
							link.click();
							URL.revokeObjectURL(url);
						}}
						className={clsx("text-center", !item.convertedBlob && "cursor-not-allowed opacity-50")}
					>
						Download
					</SimpleButton>
				</div>
			</div>
		</SimpleBlock>
	);
};
