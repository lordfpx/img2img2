import { OutputFormat } from '@/lib/imageConversion';

export interface ConversionItem {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  convertedUrl?: string;
  convertedBlob?: Blob;
  status: 'idle' | 'processing' | 'done' | 'error';
  targetFormat: OutputFormat;
  quality: number;
  usesGlobalQuality: boolean;
  error?: string;
  compareSplit: number;
  width?: number;
  height?: number;
}

export const formatOptions: { value: OutputFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG (.jpg)' },
  { value: 'png', label: 'PNG (.png)' },
  { value: 'webp', label: 'WebP (.webp)' },
  { value: 'gif', label: 'GIF (.gif)' },
  { value: 'svg', label: 'SVG (.svg)' },
];

export const defaultQuality = (format: OutputFormat) => {
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
