import clsx from "clsx";
import { memo } from "react";

import { SimpleButton } from "@/components/ui/SimpleButton";
import { formatBytes } from "@/lib/utils";
import type { ConversionItem as ConversionItemType } from "@/types/conversion";

interface ItemStatsProps {
	status: ConversionItemType["status"];
	error?: string;
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
		status,
		error,
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
		<div className="flex w-full flex-col gap-3 md:w-64">
			<div className="space-y-2 border border-gray-300 bg-white p-3 text-sm text-gray-700">
				<div className="flex justify-between">
					<span>Status</span>
					<span className="font-medium text-gray-900">
						{status === "processing"
							? "Converting"
							: status === "error"
								? (error ?? "Something went wrong")
								: "Ready"}
					</span>
				</div>

				<div className="flex justify-between">
					<span>Source format</span>
					<span className="font-medium text-gray-900">{fileType}</span>
				</div>

				<div className="flex justify-between">
					<span>Target format</span>
					<span className="font-medium text-gray-900">{formatLabel}</span>
				</div>

				<div className="flex justify-between">
					<span>Dimensions</span>
					<span className="font-medium text-gray-900">
						{width && height ? `${width} × ${height}px` : "Processing"}
					</span>
				</div>

				<div className="flex justify-between">
					<span>Original size</span>
					<span className="font-medium text-gray-900">{formatBytes(originalSize)}</span>
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
				disabled={!canDownload}
				onClick={onDownload}
				className={clsx("text-center", !canDownload && "cursor-not-allowed opacity-50")}
			>
				Download
			</SimpleButton>
		</div>
	),
);
