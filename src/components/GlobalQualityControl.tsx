import type { OutputFormat } from "@/lib/imageConversion";
import { formatOptions } from "@/types/conversion";

interface GlobalQualityControlProps {
	format: OutputFormat;
	onFormatChange: (format: OutputFormat) => void;
	quality: number;
	onQualityChange: (value: number) => void;
}

export const GlobalQualityControl = ({
	format,
	onFormatChange,
	quality,
	onQualityChange,
}: GlobalQualityControlProps) => {
	const isQualityDisabled = format === "svg";

	return (
		<section className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-inner shadow-black/20">
			<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">
						Réglages globaux
					</p>
					<h2 className="text-xl font-semibold text-white">
						Format et qualité par défaut
					</h2>
					<p className="text-sm text-slate-400">
						Le format sélectionné et ce niveau de compression seront appliqués à
						toutes les nouvelles images, sauf si vous définissez un réglage
						spécifique par image.
					</p>
				</div>
				<div className="flex flex-col items-stretch gap-4 sm:items-end">
					<label className="flex flex-col gap-2 text-sm text-slate-300">
						<span>Format par défaut</span>
						<select
							value={format}
							onChange={(event) =>
								onFormatChange(event.target.value as OutputFormat)
							}
							className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-sm font-medium text-white focus:border-brand-500 focus:outline-none"
						>
							{formatOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-sm text-slate-300 sm:items-end">
						<span>Qualité par défaut</span>
						<div className="flex items-center gap-3">
							<input
								type="range"
								min={0}
								max={100}
								step={1}
								value={quality}
								disabled={isQualityDisabled}
								onChange={(event) => onQualityChange(Number(event.target.value))}
								className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-slate-700 disabled:cursor-not-allowed"
							/>
							<span className="w-12 text-right text-sm font-semibold text-white">
								{isQualityDisabled ? "N/A" : quality}
							</span>
						</div>
					</label>
					{isQualityDisabled && (
						<p className="text-xs text-slate-500">
							La qualité n&apos;affecte pas les conversions SVG.
						</p>
					)}
				</div>
			</div>
		</section>
	);
};
