import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleButton } from "@/components/ui/SimpleButton";
import { SimpleTitle } from "@/components/ui/SimpleTitle";

interface HeaderProps {
	onClearAll?: () => void;
	hasItems: boolean;
	onDownloadAll?: () => void;
	hasDownloadableItems: boolean;
	isExporting?: boolean;
}

export const Header = ({
	onClearAll,
	hasItems,
	onDownloadAll,
	hasDownloadableItems,
	isExporting = false,
}: HeaderProps) => {
	return (
		<header className="border-b border-gray-300 bg-white">
			<div className="mx-auto max-w-5xl py-4">
				<SimpleBlock className="flex flex-col gap-4 border-0 bg-transparent p-0 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<SimpleTitle as="h1" className="text-4xl">
							Image Converter
						</SimpleTitle>
						<p className="text-sm text-gray-600">Import - Preview - Download</p>
					</div>
					{hasItems && (onClearAll || onDownloadAll) ? (
						<div className="flex flex-col gap-2 sm:flex-row">
							{onDownloadAll ? (
								<SimpleButton onClick={onDownloadAll} disabled={!hasDownloadableItems || isExporting}>
									{isExporting ? "Preparing…" : "Download all"}
								</SimpleButton>
							) : null}
							{onClearAll ? (
								<SimpleButton onClick={onClearAll} variant="outline">
									Clear all
								</SimpleButton>
							) : null}
						</div>
					) : null}
				</SimpleBlock>
			</div>
		</header>
	);
};
