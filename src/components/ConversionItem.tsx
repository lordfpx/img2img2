import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from "react";

import { ComparePreview } from "@/components/conversion-item/ComparePreview";
import { FormatSelector } from "@/components/conversion-item/FormatSelector";
import { ItemStats } from "@/components/conversion-item/ItemStats";
import { SettingsControls } from "@/components/conversion-item/SettingsControls";
import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleButton } from "@/components/ui/SimpleButton";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import type {
	GifConversionOptions,
	OutputFormat,
	PngConversionOptions,
} from "@/lib/imageConversion";
import { type ConversionItem as ConversionItemType, formatOptions } from "@/types/conversion";

interface ConversionItemProps {
	item: ConversionItemType;
	globalFormat: OutputFormat;
	onFormatChange: (id: string, format: OutputFormat) => void;
	onQualityChange: (id: string, value: number) => void;
	onUseGlobalSettingsChange: (id: string, useGlobal: boolean) => void;
	onGifOptionsChange: (id: string, options: Partial<GifConversionOptions>) => void;
	onPngOptionsChange: (id: string, options: Partial<PngConversionOptions>) => void;
	onSplitChange: (id: string, value: number) => void;
	onRemove: (id: string) => void;
}

const formatLabelMap = new Map(formatOptions.map((option) => [option.value, option.label]));

const ConversionItemComponent = ({
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
	const {
		convertedSize,
		formatLabel,
		globalFormatLabel,
		usesGlobalSettings,
		qualityDisabled,
		formatDisabled,
		settingsDisabled,
		delta,
		gainRatio,
	} = useMemo(() => {
		const mappedFormatLabel = formatLabelMap.get(item.targetFormat) ?? item.targetFormat;
		const mappedGlobalLabel = formatLabelMap.get(globalFormat) ?? globalFormat;
		const converted = item.convertedBlob?.size ?? null;
		const isQualityFormat = item.targetFormat === "jpeg" || item.targetFormat === "webp";
		const globalSettings = item.usesGlobalFormat && (!isQualityFormat || item.usesGlobalQuality);
		const qualityDisabled = isQualityFormat && (item.usesGlobalQuality || globalSettings);
		const delta = converted !== null ? item.originalSize - converted : null;
		const gainRatio =
			delta !== null && item.originalSize > 0 ? (delta / item.originalSize) * 100 : null;
		return {
			convertedSize: converted,
			formatLabel: mappedFormatLabel,
			globalFormatLabel: mappedGlobalLabel,
			usesGlobalSettings: globalSettings,
			qualityDisabled,
			formatDisabled: globalSettings,
			settingsDisabled: globalSettings,
			delta,
			gainRatio,
		};
	}, [globalFormat, item]);

	const handleFormatSelect = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) =>
			onFormatChange(item.id, event.target.value as OutputFormat),
		[item.id, onFormatChange],
	);

	const handleUseGlobalToggle = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onUseGlobalSettingsChange(item.id, event.target.checked),
		[item.id, onUseGlobalSettingsChange],
	);

	const [qualityDraft, setQualityDraft] = useState(item.quality);

	useEffect(() => {
		setQualityDraft(item.quality);
	}, [item.quality]);

	useEffect(() => {
		if (qualityDisabled) return;
		if (qualityDraft === item.quality) return;
		const handle = window.setTimeout(() => {
			onQualityChange(item.id, qualityDraft);
		}, 300);
		return () => window.clearTimeout(handle);
	}, [qualityDisabled, qualityDraft, item.id, item.quality, onQualityChange]);

	const handleQualityInputChange = useCallback((value: number) => {
		setQualityDraft(value);
	}, []);

	const updateGifOptions = useCallback(
		(options: Partial<GifConversionOptions>) => onGifOptionsChange(item.id, options),
		[item.id, onGifOptionsChange],
	);

	const updatePngOptions = useCallback(
		(options: Partial<PngConversionOptions>) => onPngOptionsChange(item.id, options),
		[item.id, onPngOptionsChange],
	);

	const handleSplitSlider = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onSplitChange(item.id, Number(event.target.value)),
		[item.id, onSplitChange],
	);

	const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);

	const handleDownload = useCallback(() => {
		if (!item.convertedBlob) return;
		const link = document.createElement("a");
		const extension = item.targetFormat === "jpeg" ? "jpg" : item.targetFormat;
		const url = URL.createObjectURL(item.convertedBlob);
		link.href = url;
		link.download = `${item.file.name.replace(/\.[^.]+$/, "")}.${extension}`;
		link.click();
		URL.revokeObjectURL(url);
	}, [item.convertedBlob, item.file.name, item.targetFormat]);

	return (
		<SimpleBlock className="space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1 flex gap-2 items-start w-full">
					<SimpleTitle as="h3" className="text-xl">
						{item.file.name}
					</SimpleTitle>
					<SimpleButton onClick={handleRemove} variant="outline" className="ml-auto">
						&times;
						<span className="sr-only">Remove</span>
					</SimpleButton>
				</div>
			</div>

			<div className="mx-auto flex max-w-5xl flex-col gap-4">
				<label className="flex items-center gap-2 text-xs text-gray-600">
					<input
						type="checkbox"
						checked={usesGlobalSettings}
						onChange={handleUseGlobalToggle}
						className="h-4 w-4 border border-gray-400"
					/>
					<b>Use default settings</b> - {globalFormatLabel}
				</label>

				<div className="grid gap-4 md:grid-cols-2">
					<FormatSelector
						value={item.targetFormat}
						disabled={formatDisabled}
						onFormatChange={handleFormatSelect}
					/>
					<SettingsControls
						targetFormat={item.targetFormat}
						quality={qualityDraft}
						qualityDisabled={qualityDisabled}
						gifOptions={item.gifOptions}
						pngOptions={item.pngOptions}
						settingsDisabled={settingsDisabled}
						onQualityChange={handleQualityInputChange}
						onGifOptionsChange={updateGifOptions}
						onPngOptionsChange={updatePngOptions}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<ComparePreview
					originalUrl={item.originalUrl}
					convertedUrl={item.convertedUrl}
					compareSplit={item.compareSplit}
					status={item.status}
					error={item.error}
					onSplitChange={handleSplitSlider}
				/>

				<ItemStats
					fileType={item.file.type || "Auto"}
					formatLabel={formatLabel}
					width={item.width}
					height={item.height}
					originalSize={item.originalSize}
					convertedSize={convertedSize}
					delta={delta}
					gainRatio={gainRatio}
					canDownload={Boolean(item.convertedBlob)}
					onDownload={handleDownload}
				/>
			</div>
		</SimpleBlock>
	);
};

export const ConversionItem = memo(ConversionItemComponent);
