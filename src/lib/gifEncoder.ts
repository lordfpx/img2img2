import { applyPalette, GIFEncoder, quantize } from "gifenc";
import type { GifConversionOptions } from "@/lib/imageConversion";
import {
	applyBackground,
	clamp,
	ensureColorCount,
	hasTransparentPixels,
	parseHexColor,
} from "@/lib/imageUtils";

type Palette = number[][];

const gifQuantize = quantize as unknown as (
	data: Uint8ClampedArray,
	maxColors: number,
	options?: Record<string, unknown>,
) => Palette;

const gifApplyPalette = applyPalette as unknown as (
	data: Uint8ClampedArray,
	palette: Palette,
	format?: string,
) => Uint8Array;

const GifEncoderCtor = GIFEncoder as unknown as new () => {
	writeFrame(
		index: Uint8Array,
		width: number,
		height: number,
		options?: {
			palette: Palette;
			delay?: number;
			transparent?: boolean | number;
			transparentIndex?: number;
			repeat?: number;
		},
	): void;
	finish(): void;
	bytesView(): Uint8Array;
};

const floydSteinbergDither = (
	source: Uint8ClampedArray,
	width: number,
	height: number,
	palette: number[][],
	allowAlpha: boolean,
) => {
	const data = new Uint8ClampedArray(source);
	const index = (x: number, y: number) => (y * width + x) * 4;

	const findNearestColor = (r: number, g: number, b: number, a: number) => {
		let best = 0;
		let bestDistance = Infinity;
		for (let i = 0; i < palette.length; i++) {
			const color = palette[i];
			const dr = color[0] - r;
			const dg = color[1] - g;
			const db = color[2] - b;
			const da = allowAlpha ? (color[3] ?? 255) - a : 0;
			const distance = dr * dr + dg * dg + db * db + da * da;
			if (distance < bestDistance) {
				bestDistance = distance;
				best = i;
			}
		}
		return palette[best];
	};

	const distribute = (x: number, y: number, err: [number, number, number], factor: number) => {
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return;
		}
		const offset = index(x, y);
		data[offset] = clamp(Math.round(data[offset] + err[0] * factor), 0, 255);
		data[offset + 1] = clamp(Math.round(data[offset + 1] + err[1] * factor), 0, 255);
		data[offset + 2] = clamp(Math.round(data[offset + 2] + err[2] * factor), 0, 255);
	};

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const offset = index(x, y);
			const alpha = data[offset + 3];
			if (allowAlpha && alpha < 128) {
				continue;
			}
			const oldR = data[offset];
			const oldG = data[offset + 1];
			const oldB = data[offset + 2];
			const target = findNearestColor(oldR, oldG, oldB, alpha);
			data[offset] = target[0];
			data[offset + 1] = target[1];
			data[offset + 2] = target[2];
			data[offset + 3] = allowAlpha ? (target[3] ?? alpha) : 255;

			const err: [number, number, number] = [oldR - target[0], oldG - target[1], oldB - target[2]];

			distribute(x + 1, y, err, 7 / 16);
			distribute(x - 1, y + 1, err, 3 / 16);
			distribute(x, y + 1, err, 5 / 16);
			distribute(x + 1, y + 1, err, 1 / 16);
		}
	}

	return data;
};

export const quantizePalette = (
	data: Uint8ClampedArray,
	maxColors: number,
	options?: Record<string, unknown>,
) => gifQuantize(data, maxColors, options);

export const applyPaletteMapping = (data: Uint8ClampedArray, palette: Palette, format?: string) =>
	gifApplyPalette(data, palette, format);

export const convertGifWithOptions = (
	imageData: ImageData,
	options: GifConversionOptions,
): Blob => {
	const colorCount = ensureColorCount(options.colorCount);
	const workingData = new Uint8ClampedArray(imageData.data);
	const backgroundRgb = parseHexColor(options.backgroundColor);

	if (!options.preserveAlpha) {
		applyBackground(workingData, backgroundRgb);
	}

	const hasAlpha = options.preserveAlpha && hasTransparentPixels(workingData);
	const quantizeFormat = hasAlpha ? "rgba4444" : "rgb565";
	const palette = gifQuantize(workingData, colorCount, {
		format: quantizeFormat,
		oneBitAlpha: hasAlpha ? true : undefined,
		clearAlpha: true,
	});

	const ditheredData =
		options.dithering === "floyd-steinberg"
			? floydSteinbergDither(workingData, imageData.width, imageData.height, palette, hasAlpha)
			: workingData;

	const indexData = gifApplyPalette(ditheredData, palette, quantizeFormat);
	let transparentIndex = -1;
	if (hasAlpha) {
		transparentIndex = palette.findIndex((entry) => entry.length > 3 && entry[3] === 0);
		if (transparentIndex === -1 && palette.length < 256) {
			palette.push([0, 0, 0, 0]);
			transparentIndex = palette.length - 1;
		}
	}

	const gif = new GifEncoderCtor();
	gif.writeFrame(indexData, imageData.width, imageData.height, {
		palette,
		transparent: hasAlpha && transparentIndex >= 0,
		transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
		delay: 0,
		repeat: options.loopCount < 0 ? -1 : options.loopCount,
	});
	gif.finish();
	const bytes = gif.bytesView();
	const buffer = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(buffer).set(bytes);
	return new Blob([buffer], { type: "image/gif" });
};
