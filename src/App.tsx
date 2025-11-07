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
		globalGifOptions,
		globalPngOptions,
		averageReduction,
		hasItems,
		hasDownloadableItems,
		isExporting,
		handleFiles,
		handleFormatChange,
		handleQualityChange,
		handleUseGlobalSettingsChange,
		handleGifOptionsChange,
		handlePngOptionsChange,
		handleGlobalQualityChange,
		handleGlobalFormatChange,
		handleGlobalGifOptionsChange,
		handleGlobalPngOptionsChange,
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
				<div className="mx-auto max-w-5xl px-2 py-2 md:py-4 lg:py-6 w-full flex flex-col gap-2 md:gap-4 lg:gap-6">
					<div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-4 lg:gap-6">
						<GlobalQualityControl
							format={globalFormat}
							onFormatChange={handleGlobalFormatChange}
							quality={globalQuality}
							onQualityChange={handleGlobalQualityChange}
							gifOptions={globalGifOptions}
							pngOptions={globalPngOptions}
							onGifOptionsChange={handleGlobalGifOptionsChange}
							onPngOptionsChange={handleGlobalPngOptionsChange}
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
						globalFormat={globalFormat}
						onFormatChange={handleFormatChange}
						onQualityChange={handleQualityChange}
						onUseGlobalSettingsChange={handleUseGlobalSettingsChange}
						onGifOptionsChange={handleGifOptionsChange}
						onPngOptionsChange={handlePngOptionsChange}
						onSplitChange={handleSplitChange}
						onRemove={removeItem}
					/>
				</section>
			</main>
		</div>
	);
};

export default App;
