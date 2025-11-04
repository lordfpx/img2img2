import { ConversionList } from "@/components/ConversionList";
import { ConversionStats } from "@/components/ConversionStats";
import { FileUpload } from "@/components/FileUpload";
import { GlobalQualityControl } from "@/components/GlobalQualityControl";
import { Header } from "@/components/Header";
import { useConversionController } from "@/hooks/useConversionController";

const App = () => {
	const {
		items,
		globalFormat,
		globalQuality,
		averageReduction,
		hasItems,
		hasDownloadableItems,
		isExporting,
		handleFiles,
		handleFormatChange,
		handleQualityChange,
		handleUseGlobalQualityChange,
		handleGlobalQualityChange,
		handleGlobalFormatChange,
		handleSplitChange,
		removeItem,
		clearAll,
		downloadAll,
	} = useConversionController();

	return (
		<div className="min-h-screen bg-gray-100 pb-16">
			<Header
				onClearAll={clearAll}
				onDownloadAll={downloadAll}
				hasItems={hasItems}
				hasDownloadableItems={hasDownloadableItems}
				isExporting={isExporting}
			/>

			<main className="flex flex-col">
				<div className="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-6">
					<div className="grid grid-cols-2 gap-4">
						<GlobalQualityControl
							format={globalFormat}
							onFormatChange={handleGlobalFormatChange}
							quality={globalQuality}
							onQualityChange={handleGlobalQualityChange}
						/>

						<FileUpload onFilesSelected={handleFiles} />
					</div>

					{averageReduction ? (
						<ConversionStats
							originalTotal={averageReduction.originalTotal}
							convertedTotal={averageReduction.convertedTotal}
							delta={averageReduction.delta}
							ratio={averageReduction.ratio}
						/>
					) : null}
				</div>

				<section className="flex flex-col gap-4">
					<ConversionList
						items={items}
						globalQuality={globalQuality}
						onFormatChange={handleFormatChange}
						onQualityChange={handleQualityChange}
						onUseGlobalQualityChange={handleUseGlobalQualityChange}
						onSplitChange={handleSplitChange}
						onRemove={removeItem}
					/>
				</section>
			</main>
		</div>
	);
};

export default App;
