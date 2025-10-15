interface GlobalQualityControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const GlobalQualityControl = ({ value, onChange }: GlobalQualityControlProps) => {
  return (
    <section className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-inner shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">
            Compression globale
          </p>
          <h2 className="text-xl font-semibold text-white">Réglage par défaut de la qualité</h2>
          <p className="text-sm text-slate-400">
            Ce niveau de compression sera appliqué à toutes les images, sauf si vous définissez un réglage spécifique par image.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={30}
            max={100}
            step={1}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-slate-700"
          />
          <span className="w-12 text-right text-sm font-semibold text-white">{value}</span>
        </div>
      </div>
    </section>
  );
};
