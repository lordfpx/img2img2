interface ConversionProgressBarProps {
	value: number;
	completed: number;
	total: number;
	isActive: boolean;
}

export const ConversionProgressBar = ({
	value,
	completed,
	total,
	isActive,
}: ConversionProgressBarProps) => {
	const percentage = Math.min(100, Math.max(0, Math.round(value * 100)));
	if (total === 0 || (!isActive && percentage >= 100)) return null;
	return (
		<div className="fixed bottom-4 left-1/2 z-50 w-[min(90vw,480px)] -translate-x-1/2 rounded-full border border-white/70 bg-slate-900/80 px-4 py-3 shadow-xl backdrop-blur">
			<div className="flex items-center justify-between text-xs font-medium text-white/80">
				<span>Conversion</span>
				<span className="flex items-center gap-2">
					<span>
						{completed}/{total} · {percentage}%
					</span>
					<span className="relative inline-flex h-3 w-3" aria-hidden="true">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
						<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
					</span>
				</span>
			</div>
			<div className="mt-2 h-2 w-full rounded-full bg-white/20">
				<div
					className="h-full rounded-full bg-emerald-400 transition-[width]"
					style={{ width: `${percentage}%` }}
					role="progressbar"
					aria-valuenow={percentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Conversion progress"
				/>
			</div>
		</div>
	);
};
