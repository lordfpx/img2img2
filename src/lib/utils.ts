export const formatBytes = (bytes: number) => {
	if (!Number.isFinite(bytes)) return "—";
	const units = ["o", "Ko", "Mo", "Go"];
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

export const createId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2);
