import { formatBytes } from '@/lib/utils';

interface ConversionStatsProps {
  originalTotal: number;
  convertedTotal: number;
  delta: number;
  ratio: number;
}

export const ConversionStats = ({ originalTotal, convertedTotal, delta, ratio }: ConversionStatsProps) => {
  return (
    <section className="grid gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-300 sm:grid-cols-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Original</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatBytes(originalTotal)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Converti</p>
        <p className="mt-1 text-lg font-semibold text-brand-500">{formatBytes(convertedTotal)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gain</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatBytes(delta)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Réduction moyenne</p>
        <p className="mt-1 text-lg font-semibold text-brand-500">{ratio.toFixed(1)}%</p>
      </div>
    </section>
  );
};
