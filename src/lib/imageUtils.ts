export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export const ensureColorCount = (value: number) => clamp(Math.round(value), 2, 256);

export const parseHexColor = (hex: string): [number, number, number] => {
	const normalized = hex.trim().replace(/^#/, "");
	if (normalized.length === 3) {
		const r = normalized[0];
		const g = normalized[1];
		const b = normalized[2];
		return [
			parseInt(`${r}${r}`, 16) || 255,
			parseInt(`${g}${g}`, 16) || 255,
			parseInt(`${b}${b}`, 16) || 255,
		];
	}
	if (normalized.length === 6) {
		return [
			parseInt(normalized.slice(0, 2), 16) || 255,
			parseInt(normalized.slice(2, 4), 16) || 255,
			parseInt(normalized.slice(4, 6), 16) || 255,
		];
	}
	return [255, 255, 255];
};

export const hasTransparentPixels = (data: Uint8ClampedArray) => {
	for (let i = 3; i < data.length; i += 4) {
		if (data[i] < 250) {
			return true;
		}
	}
	return false;
};

export const applyBackground = (data: Uint8ClampedArray, background: [number, number, number]) => {
	for (let i = 0; i < data.length; i += 4) {
		const alpha = data[i + 3] / 255;
		if (alpha < 1) {
			const invAlpha = 1 - alpha;
			const r = data[i] * alpha + background[0] * invAlpha;
			const g = data[i + 1] * alpha + background[1] * invAlpha;
			const b = data[i + 2] * alpha + background[2] * invAlpha;
			data[i] = Math.round(r);
			data[i + 1] = Math.round(g);
			data[i + 2] = Math.round(b);
			data[i + 3] = 255;
		}
	}
};
