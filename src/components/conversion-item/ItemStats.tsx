import clsx from "clsx";
import { memo } from "react";

import { SimpleButton } from "@/components/ui/SimpleButton";
import { formatBytes } from "@/lib/utils";

interface ItemStatsProps {
	fileType: string;
	formatLabel: string;
	width?: number;
	height?: number;
	originalSize: number;
	convertedSize: number | null;
	delta: number | null;
	gainRatio: number | null;
	canDownload: boolean;
	onDownload: () => void;
}

export const ItemStats = memo(
	({
		fileType,
		formatLabel,
		width,
		height,
		originalSize,
		convertedSize,
		delta,
		gainRatio,
		canDownload,
		onDownload,
	}: ItemStatsProps) => (
		<div className="flex w-full flex-row gap-3 justify-center md:justify-end items-center">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-1 border border-border bg-surface p-2 md:p-3 text-sm text-muted-foreground">
				<div className="flex justify-between gap-4 md:gap-4">
					<span>Source format</span>
					<span className="font-bold text-foreground">{fileType}</span>
				</div>

				<div className="flex justify-between gap-4 md:gap-5">
					<span>Dimensions</span>
					<span className="font-bold text-foreground">
						{width && height ? `${width} × ${height}px` : "Processing"}
					</span>
				</div>

				<div className="flex justify-between gap-4 md:gap-5">
					<span>Target format</span>
					<span className="font-bold text-foreground">{formatLabel}</span>
				</div>

				<div className="flex justify-between gap-4 md:gap-5">
					<span>Original size</span>
					<span className="font-bold text-foreground">
						{formatBytes(originalSize)}
					</span>
				</div>

				<div className="flex justify-between gap-4 md:gap-5">
					<span>Converted size</span>
					<span className="font-bold text-foreground">
						{convertedSize !== null ? formatBytes(convertedSize) : "—"}
					</span>
				</div>

				{gainRatio !== null && delta !== null ? (
					<div className="flex justify-between gap-4 md:gap-5">
						<span>Savings</span>
						<span className="font-bold text-foreground">
							{formatBytes(delta)} ({gainRatio.toFixed(1)}%)
						</span>
					</div>
				) : null}
			</div>

			<SimpleButton
				disabled={!canDownload}
				onClick={onDownload}
				className={clsx("text-center", !canDownload && "cursor-not-allowed opacity-50")}
			>
				Download
			</SimpleButton>
		</div>
	),
);
