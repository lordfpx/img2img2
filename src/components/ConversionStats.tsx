import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import { formatBytes } from "@/lib/utils";

interface ConversionStatsProps {
	originalTotal: number;
	convertedTotal: number;
	delta: number;
	ratio: number;
}

export const ConversionStats = ({
	originalTotal,
	convertedTotal,
	delta,
	ratio,
}: ConversionStatsProps) => {
	return (
		<SimpleBlock className="space-y-3 text-sm text-gray-700">
			<SimpleTitle>Summary</SimpleTitle>
			<div className="grid gap-2 grid-cols-4">
				<div className="border border-gray-300 bg-white p-3">
					<p className="text-xs uppercase text-gray-500">Original</p>
					<p className="text-base font-medium text-gray-900">{formatBytes(originalTotal)}</p>
				</div>
				<div className="border border-gray-300 bg-white p-3">
					<p className="text-xs uppercase text-gray-500">Converted</p>
					<p className="text-base font-medium text-gray-900">{formatBytes(convertedTotal)}</p>
				</div>
				<div className="border border-gray-300 bg-white p-3">
					<p className="text-xs uppercase text-gray-500">Savings</p>
					<p className="text-base font-medium text-gray-900">{formatBytes(delta)}</p>
				</div>
				<div className="border border-gray-300 bg-white p-3">
					<p className="text-xs uppercase text-gray-500">Average reduction</p>
					<p className="text-base font-medium text-gray-900">{ratio.toFixed(1)}%</p>
				</div>
			</div>
		</SimpleBlock>
	);
};
