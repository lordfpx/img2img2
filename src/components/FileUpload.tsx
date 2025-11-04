import clsx from "clsx";
import { type ChangeEvent, type DragEvent, useState } from "react";
import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import { getMimeType } from "@/lib/imageConversion";
import { formatOptions } from "@/types/conversion";

interface FileUploadProps {
	onFilesSelected: (files: FileList | null) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
	const [isDragging, setIsDragging] = useState(false);

	const acceptMimeTypes = Array.from(
		new Set([
			"image/svg+xml",
			...formatOptions.map((option) => getMimeType(option.value)),
			"image/jpg",
			"image/x-icon",
		]),
	).join(",");

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		onFilesSelected(event.target.files);
		event.target.value = "";
	};

	const onDrop = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);
		onFilesSelected(event.dataTransfer?.files ?? null);
	};

	return (
		<SimpleBlock className="space-y-4">
			<SimpleTitle>Importer des images</SimpleTitle>
			<label
				htmlFor="file-upload"
				onDragOver={(event) => {
					event.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={onDrop}
				className={clsx(
					"flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-gray-400 bg-white p-8 text-center",
					isDragging && "bg-gray-50",
				)}
			>
				<input
					id="file-upload"
					type="file"
					multiple
					accept={acceptMimeTypes}
					onChange={onInputChange}
					className="hidden"
				/>
				<p className="text-sm text-gray-700">Déposez vos fichiers ici ou cliquez pour parcourir.</p>
				<p className="text-xs text-gray-500">Formats acceptés : jpg, png, gif, svg, webp…</p>
			</label>
		</SimpleBlock>
	);
};
