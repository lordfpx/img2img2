import { ChangeEvent, DragEvent, useState } from 'react';
import clsx from 'clsx';
import { getMimeType } from '@/lib/imageConversion';
import { formatOptions } from '@/types/conversion';

interface FileUploadProps {
  onFilesSelected: (files: FileList | null) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const acceptMimeTypes = formatOptions
    .map((option) => getMimeType(option.value))
    .concat(['image/jpg', 'image/x-icon'])
    .join(',');

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    onFilesSelected(event.dataTransfer?.files ?? null);
  };

  return (
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
  );
};
