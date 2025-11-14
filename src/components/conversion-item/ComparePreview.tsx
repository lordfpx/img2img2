import { type ChangeEvent, memo } from "react";

import type { ConversionItem as ConversionItemType } from "@/types/conversion";

interface ComparePreviewProps {
	originalUrl: string;
	convertedUrl?: string | null;
	compareSplit: number;
	status: ConversionItemType["status"];
	error?: string;
	onSplitChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ComparePreview = memo(
	({
		originalUrl,
		convertedUrl,
		compareSplit,
		status,
		error,
		onSplitChange,
	}: ComparePreviewProps) => (
		<div className="flex-1 space-y-2 max-sm:-ml-2 max-sm:-mr-2">
			<div className="relative pb-6 border border-border">
				<div className="relative flex aspect-square lg:aspect-video items-center justify-center bg-surface u-checkboard">
					<img
						src={convertedUrl ?? originalUrl}
						alt={convertedUrl ? "Converted" : "Original"}
						loading="lazy"
						className="h-full w-full object-contain"
					/>

					{convertedUrl ? (
						<img
							src={originalUrl}
							alt="Original"
							loading="lazy"
							className="absolute inset-0 h-full w-full object-contain"
							style={{ clipPath: `inset(0 ${100 - compareSplit}% 0 0)` }}
						/>
					) : null}

					<div
						className={`h-full border-l border-l-foreground/70 border-r border-r-background/70 opacity-50 w-px absolute top-0 bottom-0 translate-x-1/2 transition-transform`}
						style={{ left: `${compareSplit}%` }}
					></div>

					<div className="pointer-events-none absolute inset-0 flex items-start justify-between text-xs text-muted-foreground">
						<span className="bg-surface-muted px-2 py-1">Original</span>
						<span className="bg-surface-muted px-2 py-1">Converted</span>
					</div>
				</div>
				<input
					type="range"
					min={0}
					max={100}
					value={compareSplit}
					onChange={onSplitChange}
					className="absolute bottom-2 h-2 w-full"
				/>
			</div>

			{status === "error" ? (
				<p className="text-xs text-red-600">{error ?? "Something went wrong."}</p>
			) : null}
		</div>
	),
);
