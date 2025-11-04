import type { ChangeEvent } from "react";

import { ConversionItem } from "@/components/ConversionItem";
import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { type OutputFormat } from "@/lib/imageConversion";
import { type ConversionItem as ConversionItemType } from "@/types/conversion";

interface ConversionListProps {
	items: ConversionItemType[];
	globalQuality: number;
	onFormatChange: (id: string, format: OutputFormat) => void;
	onQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
	onUseGlobalQualityChange: (id: string, useGlobal: boolean) => void;
	onSplitChange: (id: string, value: number) => void;
	onRemove: (id: string) => void;
}

export const ConversionList = ({
	items,
	globalQuality,
	onFormatChange,
	onQualityChange,
	onUseGlobalQualityChange,
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
					globalQuality={globalQuality}
					onFormatChange={onFormatChange}
					onQualityChange={onQualityChange}
					onUseGlobalQualityChange={onUseGlobalQualityChange}
					onSplitChange={onSplitChange}
					onRemove={onRemove}
				/>
			))}
		</>
	);
};
