import JSZip from "jszip";

import { type ConversionItem } from "@/types/conversion";

const buildFilename = (item: ConversionItem) => {
	const baseName = item.file.name.replace(/\.[^.]+$/, "");
	const extension = item.targetFormat === "jpeg" ? "jpg" : item.targetFormat;
	return `${baseName}.${extension}`;
};

export const createArchiveFromConversions = async (
	items: ConversionItem[],
): Promise<Blob | null> => {
	const zip = new JSZip();

	items.forEach((item) => {
		if (!item.convertedBlob) return;
		const filename = buildFilename(item);
		zip.file(filename, item.convertedBlob);
	});

	if (Object.keys(zip.files).length === 0) {
		return null;
	}

	return zip.generateAsync({ type: "blob" });
};
