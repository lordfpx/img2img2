interface HeaderProps {
  onClearAll?: () => void;
  hasItems: boolean;
}

export const Header = ({ onClearAll, hasItems }: HeaderProps) => {
  return (
    <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Img2Img Converter</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Convertissez vos images en un clin d'œil</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Ajoutez vos fichiers, choisissez le format de sortie et ajustez la compression. Prévisualisez instantanément le rendu grâce à la comparaison avant/après.
          </p>
        </div>
        {hasItems && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-brand-500"
          >
            Tout effacer
          </button>
        )}
      </div>
    </header>
  );
};
