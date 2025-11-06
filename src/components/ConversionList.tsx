import type { ChangeEvent } from "react";

import { ConversionItem } from "@/components/ConversionItem";
import { SimpleBlock } from "@/components/ui/SimpleBlock";
import type { OutputFormat } from "@/lib/imageConversion";
import type { ConversionItem as ConversionItemType } from "@/types/conversion";
import type { GifConversionOptions, PngConversionOptions } from "@/lib/imageConversion";

interface ConversionListProps {
	items: ConversionItemType[];
	globalFormat: OutputFormat;
	onFormatChange: (id: string, format: OutputFormat) => void;
	onQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
	onUseGlobalSettingsChange: (id: string, useGlobal: boolean) => void;
	onGifOptionsChange: (id: string, options: Partial<GifConversionOptions>) => void;
	onPngOptionsChange: (id: string, options: Partial<PngConversionOptions>) => void;
	onSplitChange: (id: string, value: number) => void;
	onRemove: (id: string) => void;
}

export const ConversionList = ({
	items,
	globalFormat,
	onFormatChange,
	onQualityChange,
	onUseGlobalSettingsChange,
	onGifOptionsChange,
	onPngOptionsChange,
	onSplitChange,
	onRemove,
}: ConversionListProps) => {
	if (items.length === 0) {
		return (
			<SimpleBlock>
				<p className="text-sm text-gray-700">Importez une image pour commencer la conversion.</p>
			</SimpleBlock>
		);
	}

	return (
		<>
			{items.map((item) => (
				<ConversionItem
					key={item.id}
					item={item}
					globalFormat={globalFormat}
					onFormatChange={onFormatChange}
					onQualityChange={onQualityChange}
					onUseGlobalSettingsChange={onUseGlobalSettingsChange}
					onGifOptionsChange={onGifOptionsChange}
					onPngOptionsChange={onPngOptionsChange}
					onSplitChange={onSplitChange}
					onRemove={onRemove}
				/>
			))}
		</>
	);
};
