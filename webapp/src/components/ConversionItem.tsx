import { ChangeEvent } from 'react';
import clsx from 'clsx';
import { OutputFormat } from '@/lib/imageConversion';
import { formatBytes } from '@/lib/utils';
import { ConversionItem as ConversionItemType, formatOptions } from '@/types/conversion';

interface ConversionItemProps {
  item: ConversionItemType;
  onFormatChange: (id: string, format: OutputFormat) => void;
  onQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
  onSplitChange: (id: string, value: number) => void;
  onRemove: (id: string) => void;
}

export const ConversionItem = ({ item, onFormatChange, onQualityChange, onSplitChange, onRemove }: ConversionItemProps) => {
  const convertedSize = item.convertedBlob?.size ?? null;
  const formatLabel = formatOptions.find((option) => option.value === item.targetFormat)?.label ?? item.targetFormat;
  const qualityDisabled = item.targetFormat === 'svg';
  const delta = convertedSize !== null ? item.originalSize - convertedSize : null;
  const gainRatio = delta !== null && item.originalSize > 0 ? (delta / item.originalSize) * 100 : null;

  return (
    <article className="rounded-3xl border border-white/5 bg-slate-900/60 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{item.file.name}</h2>
            <p className="text-sm text-slate-400">
              {formatBytes(item.originalSize)} · {item.width && item.height ? `${item.width} × ${item.height}px` : 'Analyse…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              Format
              <select
                value={item.targetFormat}
                onChange={(event) => onFormatChange(item.id, event.target.value as OutputFormat)}
                className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-sm font-medium text-white focus:border-brand-500 focus:outline-none"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              Qualité
              <input
                type="range"
                min={30}
                max={100}
                step={1}
                value={item.quality}
                disabled={qualityDisabled}
                onChange={(event) => onQualityChange(item.id, event)}
                className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-slate-700 disabled:cursor-not-allowed"
              />
              <span className="w-10 text-right text-xs text-slate-400">
                {qualityDisabled ? 'N/A' : `${item.quality}`}
              </span>
            </label>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-rose-500 hover:text-rose-400"
              aria-label="Supprimer la conversion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M16.24 7.76a1 1 0 0 1 0 1.41L13.41 12l2.83 2.83a1 1 0 0 1-1.41 1.41L12 13.41l-2.83 2.83a1 1 0 0 1-1.41-1.41L10.59 12 7.76 9.17a1 1 0 0 1 1.41-1.41L12 10.59l2.83-2.83a1 1 0 0 1 1.41 0Z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <div className="relative aspect-video">
                <img src={item.originalUrl} alt="Original" className="h-full w-full object-contain" />
                {item.convertedUrl && (
                  <img
                    src={item.convertedUrl}
                    alt="Converti"
                    className="absolute inset-0 h-full w-full object-contain transition"
                    style={{ clipPath: `inset(0 ${100 - item.compareSplit}% 0 0)` }}
                  />
                )}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.compareSplit}
                  onChange={(event) => onSplitChange(item.id, Number(event.target.value))}
                  className="absolute bottom-3 left-1/2 h-1 w-2/3 -translate-x-1/2 cursor-ew-resize appearance-none rounded-full bg-white/30"
                />
                <div className="pointer-events-none absolute inset-0 flex select-none items-start justify-between p-3 text-xs font-semibold uppercase tracking-wide text-white/70">
                  <span>Converti</span>
                  <span>Original</span>
                </div>
              </div>
            </div>
            {item.status === 'processing' && <p className="text-sm text-slate-400">Conversion en cours…</p>}
            {item.status === 'error' && (
              <p className="text-sm text-rose-400">{item.error ?? 'Une erreur est survenue.'}</p>
            )}
          </div>

          <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-5">
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Format original</span>
                <span className="font-medium text-white">{item.file.type || 'Détecté automatiquement'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Format converti</span>
                <span className="font-medium text-brand-500">{formatLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Poids original</span>
                <span className="font-medium text-white">{formatBytes(item.originalSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Poids converti</span>
                <span className="font-medium text-brand-500">
                  {convertedSize !== null ? formatBytes(convertedSize) : '—'}
                </span>
              </div>
              {gainRatio !== null && delta !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Gain</span>
                  <span className="font-medium text-white">
                    {formatBytes(delta)} ({gainRatio.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!item.convertedBlob}
              onClick={() => {
                if (!item.convertedBlob) return;
                const link = document.createElement('a');
                const extension = item.targetFormat === 'jpeg' ? 'jpg' : item.targetFormat;
                const url = URL.createObjectURL(item.convertedBlob);
                link.href = url;
                link.download = `${item.file.name.replace(/\.[^.]+$/, '')}.${extension}`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                item.convertedBlob
                  ? 'bg-brand-500 text-slate-950 shadow-glow hover:bg-brand-600'
                  : 'bg-slate-800 text-slate-500',
              )}
            >
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
