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
		<SimpleBlock className="space-y-3 text-sm text-muted-foreground">
			<SimpleTitle>Summary</SimpleTitle>

			<div className="grid gap-2 grid-cols-4">
				<div className="border border-border bg-surface p-1 md:p-3">
					<p className="text-xs uppercase text-subtle-foreground">Original</p>
					<p className="text-base font-medium text-foreground">
						{formatBytes(originalTotal)}
					</p>
				</div>
				<div className="border border-border bg-surface p-1 md:p-3">
					<p className="text-xs uppercase text-subtle-foreground">Converted</p>
					<p className="text-base font-medium text-foreground">
						{formatBytes(convertedTotal)}
					</p>
				</div>
				<div className="border border-border bg-surface p-1 md:p-3">
					<p className="text-xs uppercase text-subtle-foreground">Savings</p>
					<p className="text-base font-medium text-foreground">
						{formatBytes(delta)}
					</p>
				</div>
				<div className="border border-border bg-surface p-1 md:p-3">
					<p className="text-xs uppercase text-subtle-foreground">Average reduction</p>
					<p className="text-base font-medium text-foreground">
						{ratio.toFixed(1)}%
					</p>
				</div>
			</div>
		</SimpleBlock>
	);
};
