import { ThemeSwitch } from "@/components/ThemeSwitch";
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
		<header className="border-b border-border bg-surface">
			<div className="mx-auto max-w-5xl py-2 lg:py-4">
				<SimpleBlock className="flex flex-col gap-4 border-0 bg-transparent p-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
					<div className="flex flex-col gap-1 text-foreground">
						<SimpleTitle as="h1" className="text-4xl">
							MiniPix
						</SimpleTitle>
						<p className="text-sm text-muted-foreground">Import - Preview - Download</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
						<ThemeSwitch />

						{hasItems && (onClearAll || onDownloadAll) ? (
							<div className="flex flex-col gap-2 sm:flex-row">
								{onDownloadAll && (
									<SimpleButton
										onClick={onDownloadAll}
										disabled={!hasDownloadableItems || isExporting}
									>
										{isExporting ? "Preparing…" : "Download all"}
									</SimpleButton>
								)}

								{onClearAll && (
									<SimpleButton onClick={onClearAll} variant="outline">
										Clear all
									</SimpleButton>
								)}
							</div>
						) : null}
					</div>
				</SimpleBlock>
			</div>
		</header>
	);
};
