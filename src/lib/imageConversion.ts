import { GIFEncoder, applyPalette, quantize } from "gifenc";

export type OutputFormat = "jpeg" | "png" | "webp" | "gif";

export interface ConversionResult {
	blob: Blob;
	url: string;
	width: number;
	height: number;
}

const mimeMap: Record<OutputFormat, string> = {
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
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
		console.warn("createImageBitmap a échoué, fallback sur HTMLImageElement", error);
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

const convertToGif = (imageData: ImageData, quality: number): Blob => {
	const maxColors = Math.min(256, Math.max(8, Math.round((quality / 100) * 240 + 16)));
	const palette = quantize(imageData.data, { maxColors });
	const indexData = applyPalette(imageData.data, palette);
	const gif = new GIFEncoder();
	gif.writeFrame(indexData, imageData.width, imageData.height, {
		palette,
		transparent: false,
		delay: 0,
	});
	gif.finish();
	const bytes = gif.bytesView();
	const buffer = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(buffer).set(bytes);
	return new Blob([buffer], { type: "image/gif" });
};

export const convertImage = async (
	file: File,
	format: OutputFormat,
	quality: number,
): Promise<ConversionResult> => {
	const { source, width, height, release } = await loadImageSource(file);
	try {
		const canvas = document.createElement("canvas");
		const ctx = drawOnCanvas(canvas, source, width, height);

		if (format === "gif") {
			const imageData = ctx.getImageData(0, 0, width, height);
			const blob = convertToGif(imageData, quality);
			return {
				blob,
				url: URL.createObjectURL(blob),
				width,
				height,
			};
		}

		const mimeType = mimeMap[format];
		const blob = await new Promise<Blob>((resolve, reject) => {
			const qualityValue = format === "png" ? undefined : qualityToFloat(quality);
			canvas.toBlob(
				(result) => {
					if (result) {
						resolve(result);
					} else {
						reject(new Error("La conversion a échoué."));
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

export const getMimeType = (format: OutputFormat) => mimeMap[format];
