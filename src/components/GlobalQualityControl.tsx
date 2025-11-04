import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleField } from "@/components/ui/SimpleField";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import type { OutputFormat } from "@/lib/imageConversion";
import { formatOptions } from "@/types/conversion";

interface GlobalQualityControlProps {
        format: OutputFormat;
        onFormatChange: (format: OutputFormat) => void;
        quality: number;
        onQualityChange: (value: number) => void;
}

export const GlobalQualityControl = ({
        format,
        onFormatChange,
        quality,
        onQualityChange,
}: GlobalQualityControlProps) => {
        const isQualityDisabled = format === "svg";

        return (
                <SimpleBlock className="space-y-4">
                        <SimpleTitle>Réglages par défaut</SimpleTitle>
                        <div className="flex flex-col gap-4 md:flex-row">
                                <SimpleField label="Format" className="md:w-1/2">
                                        <select
                                                value={format}
                                                onChange={(event) => onFormatChange(event.target.value as OutputFormat)}
                                                className="w-full border border-gray-400 bg-white px-2 py-2 text-sm"
                                        >
                                                {formatOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                                {option.label}
                                                        </option>
                                                ))}
                                        </select>
                                </SimpleField>
                                <SimpleField
                                        label="Qualité"
                                        className="md:w-1/2"
                                        helper={isQualityDisabled ? "La qualité n'affecte pas les conversions SVG." : undefined}
                                >
                                        <div className="flex items-center gap-3">
                                                <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={quality}
                                                        disabled={isQualityDisabled}
                                                        onChange={(event) => onQualityChange(Number(event.target.value))}
                                                        className="h-1 w-full"
                                                />
                                                <span className="w-10 text-sm text-gray-600">
                                                        {isQualityDisabled ? "N/A" : quality}
                                                </span>
                                        </div>
                                </SimpleField>
                        </div>
                </SimpleBlock>
        );
};
