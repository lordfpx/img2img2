import UPNG from "upng-js";

import { applyPaletteMapping, convertGifWithOptions, quantizePalette } from "@/lib/gifEncoder";
import { applyBackground, ensureColorCount, parseHexColor } from "@/lib/imageUtils";

export type OutputFormat = "jpeg" | "png" | "webp" | "gif";

export type GifDitheringMode = "none" | "floyd-steinberg";

export interface GifConversionOptions {
	colorCount: number;
	dithering: GifDitheringMode;
	preserveAlpha: boolean;
	backgroundColor: string;
	loopCount: number;
}

export interface PngConversionOptions {
	colorCount: number;
	reduceColors: boolean;
	preserveAlpha: boolean;
	backgroundColor: string;
	interlaced: boolean;
}

export type ConversionConfig =
	| { format: "jpeg"; quality: number }
	| { format: "webp"; quality: number }
	| { format: "png"; options: PngConversionOptions }
	| { format: "gif"; options: GifConversionOptions };

export interface ConversionResult {
	blob: Blob;
	url: string;
	width: number;
	height: number;
}

const mimeMap: Record<Exclude<OutputFormat, "gif" | "png">, string> = {
	jpeg: "image/jpeg",
	webp: "image/webp",
};

const qualityToFloat = (quality: number) => {
	return Math.min(1, Math.max(0.05, quality / 100));
};

const drawOnCanvas = (
	canvas: HTMLCanvasElement,
	image: CanvasImageSource,
	width: number,
	height: number,
) => {
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Impossible de dessiner sur le canvas.");
	}
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(image, 0, 0, width, height);
	return ctx;
};

const loadImageSource = async (
	file: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> => {
	const objectUrl = URL.createObjectURL(file);

	const revoke = () => URL.revokeObjectURL(objectUrl);

	try {
		if ("createImageBitmap" in window) {
			const bitmap = await createImageBitmap(file);
			return {
				source: bitmap,
				width: bitmap.width,
				height: bitmap.height,
				release: () => {
					bitmap.close();
					revoke();
				},
			};
		}
	} catch (error) {
		console.warn("createImageBitmap failed, falling back to HTMLImageElement", error);
	}

	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = objectUrl;
	});

	return {
		source: img,
		width: img.naturalWidth,
		height: img.naturalHeight,
		release: revoke,
	};
};

const reduceColors = (source: Uint8ClampedArray, targetColors: number, preserveAlpha: boolean) => {
	const palette = quantizePalette(source, targetColors, {
		format: preserveAlpha ? "rgba4444" : "rgb565",
		oneBitAlpha: preserveAlpha ? undefined : true,
		clearAlpha: true,
	});
	const indices = applyPaletteMapping(source, palette, preserveAlpha ? "rgba4444" : "rgb565");
	const result = new Uint8ClampedArray(source.length);
	for (let i = 0; i < indices.length; i++) {
		const paletteColor = palette[indices[i]];
		const dest = i * 4;
		result[dest] = paletteColor[0];
		result[dest + 1] = paletteColor[1];
		result[dest + 2] = paletteColor[2];
		result[dest + 3] =
			preserveAlpha && paletteColor.length > 3
				? paletteColor[3]
				: preserveAlpha
					? source[dest + 3]
					: 255;
	}
	return result;
};

const convertPng = (imageData: ImageData, options: PngConversionOptions): Blob => {
	const data = new Uint8ClampedArray(imageData.data);
	const background = parseHexColor(options.backgroundColor);

	if (!options.preserveAlpha) {
		applyBackground(data, background);
	}

	const shouldReduce = options.reduceColors && options.colorCount < 256;
	const processed = shouldReduce
		? reduceColors(data, ensureColorCount(options.colorCount), options.preserveAlpha)
		: data;

	const frameBuffer = processed.buffer.slice(
		processed.byteOffset,
		processed.byteOffset + processed.byteLength,
	);

	const colorCount = options.reduceColors ? ensureColorCount(options.colorCount) : 0;
	const upngOptions: Record<string, unknown> = {};
	if (options.interlaced) {
		upngOptions.interlace = 1;
	}
	const pngArrayBuffer = UPNG.encode(
		[frameBuffer],
		imageData.width,
		imageData.height,
		colorCount,
		undefined,
		upngOptions,
	);

	return new Blob([pngArrayBuffer], { type: "image/png" });
};

export const convertImage = async (
	file: File,
	config: ConversionConfig,
): Promise<ConversionResult> => {
	const { source, width, height, release } = await loadImageSource(file);
	try {
		const canvas = document.createElement("canvas");
		const ctx = drawOnCanvas(canvas, source, width, height);

		if (config.format === "gif") {
			const imageData = ctx.getImageData(0, 0, width, height);
			const blob = convertGifWithOptions(imageData, config.options);
			return {
				blob,
				url: URL.createObjectURL(blob),
				width,
				height,
			};
		}

		if (config.format === "png") {
			const imageData = ctx.getImageData(0, 0, width, height);
			const blob = convertPng(imageData, config.options);
			return {
				blob,
				url: URL.createObjectURL(blob),
				width,
				height,
			};
		}

		const mimeType = mimeMap[config.format];
		const blob = await new Promise<Blob>((resolve, reject) => {
			const qualityValue = qualityToFloat(config.quality);
			canvas.toBlob(
				(result) => {
					if (result) {
						resolve(result);
					} else {
						reject(new Error("Conversion failed."));
					}
				},
				mimeType,
				qualityValue,
			);
		});

		return {
			blob,
			url: URL.createObjectURL(blob),
			width,
			height,
		};
	} finally {
		release();
	}
};

export const getMimeType = (format: OutputFormat) => {
	if (format === "gif") return "image/gif";
	if (format === "png") return "image/png";
	return mimeMap[format];
};
