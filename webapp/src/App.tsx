import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { convertImage, getMimeType, OutputFormat } from './lib/imageConversion';
import clsx from 'clsx';

interface ConversionItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  convertedUrl?: string;
  convertedBlob?: Blob;
  status: 'idle' | 'processing' | 'done' | 'error';
  targetFormat: OutputFormat;
  quality: number;
  error?: string;
  compareSplit: number;
  width?: number;
  height?: number;
}

const formatOptions: { value: OutputFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG (.jpg)' },
  { value: 'png', label: 'PNG (.png)' },
  { value: 'webp', label: 'WebP (.webp)' },
  { value: 'gif', label: 'GIF (.gif)' },
  { value: 'svg', label: 'SVG (.svg)' },
];

const defaultQuality = (format: OutputFormat) => {
  switch (format) {
    case 'jpeg':
      return 82;
    case 'webp':
      return 78;
    case 'gif':
      return 90;
    default:
      return 100;
  }
};

const acceptMimeTypes = formatOptions
  .map((option) => getMimeType(option.value))
  .concat(['image/jpg', 'image/x-icon'])
  .join(',');

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  const sign = Math.sign(bytes);
  let size = Math.abs(bytes);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const formatted = `${size.toFixed(size < 10 && unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
  return sign < 0 ? `-${formatted}` : formatted;
};

const App = () => {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const itemsRef = useRef<ConversionItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const releaseResources = useCallback((item: ConversionItem) => {
    URL.revokeObjectURL(item.originalUrl);
    if (item.convertedUrl) {
      URL.revokeObjectURL(item.convertedUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(releaseResources);
    };
  }, [releaseResources]);

  const runConversion = useCallback(async (job: ConversionItem) => {
    try {
      const result = await convertImage(job.file, job.targetFormat, job.quality);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== job.id) return item;
          if (item.convertedUrl && item.convertedUrl !== result.url) {
            URL.revokeObjectURL(item.convertedUrl);
          }
          return {
            ...item,
            convertedBlob: result.blob,
            convertedUrl: result.url,
            status: 'done',
            width: result.width,
            height: result.height,
          };
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'La conversion a échoué.';
      setItems((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: 'error',
                error: message,
              }
            : item,
        ),
      );
    }
  }, []);

  const scheduleConversion = useCallback(
    (id: string, overrides?: Partial<Pick<ConversionItem, 'targetFormat' | 'quality'>>) => {
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) return item;
          const updated: ConversionItem = {
            ...item,
            ...overrides,
            status: 'processing',
            error: undefined,
          };
          queueMicrotask(() => runConversion(updated));
          return updated;
        });
        return next;
      });
    },
    [runConversion],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const additions: ConversionItem[] = [];
      Array.from(files).forEach((file) => {
        const originalUrl = URL.createObjectURL(file);
        const targetFormat: OutputFormat = 'webp';
        const quality = defaultQuality(targetFormat);
        const job: ConversionItem = {
          id: createId(),
          file,
          originalUrl,
          originalSize: file.size,
          targetFormat,
          quality,
          status: 'processing',
          compareSplit: 50,
        };
        additions.push(job);
        queueMicrotask(() => runConversion(job));
      });
      setItems((prev) => [...prev, ...additions]);
    },
    [runConversion],
  );

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
      event.target.value = '';
    },
    [handleFiles],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer?.files ?? null);
    },
    [handleFiles],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target) {
          releaseResources(target);
        }
        return prev.filter((item) => item.id !== id);
      });
    },
    [releaseResources],
  );

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach(releaseResources);
      return [];
    });
  }, [releaseResources]);

  const handleFormatChange = useCallback(
    (id: string, format: OutputFormat) => {
      const baseQuality = defaultQuality(format);
      scheduleConversion(id, { targetFormat: format, quality: baseQuality });
    },
    [scheduleConversion],
  );

  const handleQualityChange = useCallback(
    (id: string, event: ChangeEvent<HTMLInputElement>) => {
      const quality = Number(event.target.value);
      scheduleConversion(id, { quality });
    },
    [scheduleConversion],
  );

  const averageReduction = useMemo(() => {
    const successful = items.filter((item) => item.status === 'done' && item.convertedBlob);
    if (successful.length === 0) return null;
    const originalTotal = successful.reduce((acc, item) => acc + item.originalSize, 0);
    const convertedTotal = successful.reduce((acc, item) => acc + (item.convertedBlob?.size ?? 0), 0);
    const delta = originalTotal - convertedTotal;
    return {
      convertedTotal,
      originalTotal,
      delta,
      ratio: originalTotal > 0 ? (delta / originalTotal) * 100 : 0,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Img2Img Converter</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Convertissez vos images en un clin d'œil</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Ajoutez vos fichiers, choisissez le format de sortie et ajustez la compression. Prévisualisez instantanément le rendu grâce à la comparaison avant/après.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-brand-500"
            >
              Tout effacer
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section>
          <label
            htmlFor="file-upload"
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={clsx(
              'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/10 bg-slate-900/60 px-6 py-16 text-center transition-all',
              'hover:border-brand-500 hover:bg-slate-900/80 hover:text-brand-500',
              isDragging && 'border-brand-500 bg-slate-900/80 text-brand-500 shadow-glow',
            )}
          >
            <input id="file-upload" type="file" multiple accept={acceptMimeTypes} onChange={onInputChange} className="hidden" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  fill="currentColor"
                  d="M12 3a1 1 0 0 1 1 1v8.17l2.59-2.58a1 1 0 0 1 1.41 1.41l-4.3 4.29a1 1 0 0 1-1.42 0l-4.3-4.29a1 1 0 1 1 1.41-1.41L11 12.17V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
                />
              </svg>
            </span>
            <div>
              <p className="text-lg font-semibold text-white">Déposez vos images ici</p>
              <p className="text-sm text-slate-400">Formats acceptés : jpg, png, gif, svg, webp…</p>
            </div>
          </label>
        </section>

        {averageReduction && (
          <section className="grid gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-300 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Original</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatBytes(averageReduction.originalTotal)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Converti</p>
              <p className="mt-1 text-lg font-semibold text-brand-500">{formatBytes(averageReduction.convertedTotal)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gain</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatBytes(averageReduction.delta)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Réduction moyenne</p>
              <p className="mt-1 text-lg font-semibold text-brand-500">{averageReduction.ratio.toFixed(1)}%</p>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-8">
          {items.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
              Importez une image pour commencer la conversion.
            </div>
          )}

          {items.map((item) => {
            const convertedSize = item.convertedBlob?.size ?? null;
            const formatLabel = formatOptions.find((option) => option.value === item.targetFormat)?.label ?? item.targetFormat;
            const qualityDisabled = item.targetFormat === 'svg';
            const delta = convertedSize !== null ? item.originalSize - convertedSize : null;
            const gainRatio = delta !== null && item.originalSize > 0 ? (delta / item.originalSize) * 100 : null;
            return (
              <article key={item.id} className="rounded-3xl border border-white/5 bg-slate-900/60 shadow-lg shadow-black/10">
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
                          onChange={(event) => handleFormatChange(item.id, event.target.value as OutputFormat)}
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
                          onChange={(event) => handleQualityChange(item.id, event)}
                          className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-slate-700 disabled:cursor-not-allowed"
                        />
                        <span className="w-10 text-right text-xs text-slate-400">{qualityDisabled ? 'N/A' : `${item.quality}`}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
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
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              setItems((prev) =>
                                prev.map((entry) =>
                                  entry.id === item.id
                                    ? {
                                        ...entry,
                                        compareSplit: value,
                                      }
                                    : entry,
                                ),
                              );
                            }}
                            className="absolute bottom-3 left-1/2 h-1 w-2/3 -translate-x-1/2 cursor-ew-resize appearance-none rounded-full bg-white/30"
                          />
                          <div className="pointer-events-none absolute inset-0 flex select-none items-start justify-between p-3 text-xs font-semibold uppercase tracking-wide text-white/70">
                            <span>Converti</span>
                            <span>Original</span>
                          </div>
                        </div>
                      </div>
                      {item.status === 'processing' && (
                        <p className="text-sm text-slate-400">Conversion en cours…</p>
                      )}
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
                          <span className="font-medium text-brand-500">{convertedSize !== null ? formatBytes(convertedSize) : '—'}</span>
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
          })}
        </section>
      </main>
    </div>
  );
};

export default App;
