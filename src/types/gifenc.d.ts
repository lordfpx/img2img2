declare module "gifenc" {
	export class GIFEncoder {
		writeFrame(
			image: Uint8Array | Uint8ClampedArray,
			width: number,
			height: number,
			options: {
				palette: Uint8Array;
				delay?: number;
				transparent?: number | boolean;
			},
		): void;
		finish(): void;
		bytesView(): Uint8Array;
	}

	export function quantize(
		data: Uint8Array | Uint8ClampedArray,
		options?: { maxColors?: number },
	): Uint8Array;

	export function applyPalette(
		data: Uint8Array | Uint8ClampedArray,
		palette: Uint8Array,
		options?: { dither?: boolean },
	): Uint8Array;
}
