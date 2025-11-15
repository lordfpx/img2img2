import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { memo, useState } from "react";

import { SimpleButton } from "@/components/ui/SimpleButton";

const previewModes = [
	{ value: "contain", label: "Fit to container" },
	{ value: "actual", label: "Actual size" },
	{ value: "double", label: "Double size" },
] as const;

interface ComparePreviewModalProps {
	activeModal: "original" | "converted" | null;
	originalUrl: string;
	convertedUrl?: string | null;
	onOpenChange: (open: boolean) => void;
	onToggleTarget?: () => void;
}

export const ComparePreviewModal = memo(
	({
		activeModal,
		originalUrl,
		convertedUrl,
		onOpenChange,
		onToggleTarget,
	}: ComparePreviewModalProps) => {
		const [previewModeIndex, setPreviewModeIndex] = useState(0);

		const { value: previewMode, label: previewModeLabel } = previewModes[previewModeIndex];
		const isContainMode = previewMode === "contain";

		const effectiveModalTarget = activeModal ?? "original";
		const modalImageSrc =
			effectiveModalTarget === "converted" ? (convertedUrl ?? originalUrl) : originalUrl;
		const modalImageClassName = clsx(
			"pixelated",
			isContainMode ? "h-full w-full object-contain" : "h-auto w-auto max-w-none max-h-none m-auto",
		);
		const modalImageStyle = previewMode === "double" ? { scale: 2 } : undefined;

		const handlePreviewModeToggle = () =>
			setPreviewModeIndex((prev) => (prev + 1) % previewModes.length);

		return (
			<Dialog.Root open={activeModal !== null} onOpenChange={onOpenChange}>
				{activeModal !== null ? (
					<Dialog.Portal>
						<Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
						<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,90%)] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-md border border-border bg-surface p-4 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<Dialog.Title className="text-lg font-semibold">
										{activeModal === "converted" ? "Converted" : "Original"} preview
									</Dialog.Title>

									{convertedUrl ? (
										<SimpleButton onClick={onToggleTarget} className="px-2 py-1 text-xs">
											{activeModal === "converted" ? "Show original" : "Show converted"}
										</SimpleButton>
									) : null}
								</div>

								<div className="flex justify-end items-center gap-3">
									Mode:
									<SimpleButton onClick={handlePreviewModeToggle} className="px-2 py-1 text-xs">
										{previewModeLabel}
									</SimpleButton>
								</div>

								<Dialog.Close
									className="text-xl leading-none text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
									aria-label="Close preview"
								>
									&times;
								</Dialog.Close>
							</div>

							<div className="max-h-[70vh] overflow-auto rounded border border-border bg-surface-muted p-2">
								<div
									className={clsx(
										"mx-auto flex min-h-[40vh] bg-surface u-checkboard",
										isContainMode ? "aspect-square lg:aspect-video " : "items-start justify-start",
									)}
								>
									<img
										src={modalImageSrc}
										alt=""
										className={modalImageClassName}
										style={modalImageStyle}
									/>
								</div>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				) : null}
			</Dialog.Root>
		);
	},
);
