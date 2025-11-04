import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import { formatBytes } from "@/lib/utils";

interface ConversionStatsProps {
        originalTotal: number;
        convertedTotal: number;
        delta: number;
        ratio: number;
}

export const ConversionStats = ({ originalTotal, convertedTotal, delta, ratio }: ConversionStatsProps) => {
        return (
                <SimpleBlock className="space-y-3 text-sm text-gray-700">
                        <SimpleTitle>Résultats globaux</SimpleTitle>
                        <div className="grid gap-2 sm:grid-cols-2">
                                <div className="border border-gray-300 bg-white p-3">
                                        <p className="text-xs uppercase text-gray-500">Original</p>
                                        <p className="text-base font-medium text-gray-900">{formatBytes(originalTotal)}</p>
                                </div>
                                <div className="border border-gray-300 bg-white p-3">
                                        <p className="text-xs uppercase text-gray-500">Converti</p>
                                        <p className="text-base font-medium text-gray-900">{formatBytes(convertedTotal)}</p>
                                </div>
                                <div className="border border-gray-300 bg-white p-3">
                                        <p className="text-xs uppercase text-gray-500">Gain</p>
                                        <p className="text-base font-medium text-gray-900">{formatBytes(delta)}</p>
                                </div>
                                <div className="border border-gray-300 bg-white p-3">
                                        <p className="text-xs uppercase text-gray-500">Réduction moyenne</p>
                                        <p className="text-base font-medium text-gray-900">{ratio.toFixed(1)}%</p>
                                </div>
                        </div>
                </SimpleBlock>
        );
};
