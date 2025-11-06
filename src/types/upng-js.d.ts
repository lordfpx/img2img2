declare module "upng-js" {
	const UPNG: {
		encode(
			frames: ArrayBuffer[],
			width: number,
			height: number,
			colorCount?: number,
			delays?: number[] | undefined,
			options?: Record<string, unknown> | undefined,
		): ArrayBuffer;
	};
	export default UPNG;
}
