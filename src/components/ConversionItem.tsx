import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleButton } from "@/components/ui/SimpleButton";
import { SimpleField } from "@/components/ui/SimpleField";
import { SimpleTitle } from "@/components/ui/SimpleTitle";
import type { OutputFormat } from "@/lib/imageConversion";
import { formatBytes } from "@/lib/utils";
import {
        type ConversionItem as ConversionItemType,
        formatOptions,
} from "@/types/conversion";
import clsx from "clsx";
import type { ChangeEvent } from "react";

interface ConversionItemProps {
        item: ConversionItemType;
        globalQuality: number;
        onFormatChange: (id: string, format: OutputFormat) => void;
        onQualityChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
        onUseGlobalQualityChange: (id: string, useGlobal: boolean) => void;
        onSplitChange: (id: string, value: number) => void;
        onRemove: (id: string) => void;
}

export const ConversionItem = ({
        item,
        globalQuality,
        onFormatChange,
        onQualityChange,
        onUseGlobalQualityChange,
        onSplitChange,
        onRemove,
}: ConversionItemProps) => {
        const convertedSize = item.convertedBlob?.size ?? null;
        const formatLabel =
                formatOptions.find((option) => option.value === item.targetFormat)?.label ??
                item.targetFormat;
        const qualityDisabled = item.targetFormat === "svg" || item.usesGlobalQuality;
        const delta = convertedSize !== null ? item.originalSize - convertedSize : null;
        const gainRatio =
                delta !== null && item.originalSize > 0
                        ? (delta / item.originalSize) * 100
                        : null;

        return (
                <SimpleBlock className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                        <SimpleTitle as="h3" className="text-xl">
                                                {item.file.name}
                                        </SimpleTitle>
                                        <p className="text-sm text-gray-600">
                                                {formatBytes(item.originalSize)} ·{" "}
                                                {item.width && item.height
                                                        ? `${item.width} × ${item.height}px`
                                                        : "Analyse en cours"}
                                        </p>
                                </div>
                                <SimpleButton onClick={() => onRemove(item.id)} variant="outline">
                                        Retirer
                                </SimpleButton>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row">
                                <SimpleField label="Format" className="md:w-1/3">
                                        <select
                                                value={item.targetFormat}
                                                onChange={(event) =>
                                                        onFormatChange(item.id, event.target.value as OutputFormat)
                                                }
                                                className="w-full border border-gray-400 bg-white px-2 py-2 text-sm"
                                        >
                                                {formatOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                                {option.label}
                                                        </option>
                                                ))}
                                        </select>
                                        {item.usesGlobalFormat ? (
                                                <span className="text-xs text-gray-500">Utilise le format global</span>
                                        ) : null}
                                </SimpleField>
                                <SimpleField label="Qualité" className="md:w-1/3">
                                        <div className="flex items-center gap-3">
                                                <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={item.quality}
                                                        disabled={qualityDisabled}
                                                        onChange={(event) => onQualityChange(item.id, event)}
                                                        className="h-1 w-full"
                                                />
                                                <span className="w-12 text-sm text-gray-600">
                                                        {item.targetFormat === "svg" ? "N/A" : item.quality}
                                                </span>
                                        </div>
                                        {item.targetFormat !== "svg" ? (
                                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                                        <input
                                                                type="checkbox"
                                                                checked={item.usesGlobalQuality}
                                                                onChange={(event) =>
                                                                        onUseGlobalQualityChange(item.id, event.target.checked)
                                                                }
                                                                className="h-4 w-4 border border-gray-400"
                                                        />
                                                        Utiliser la qualité globale ({globalQuality})
                                                </label>
                                        ) : null}
                                </SimpleField>
                                <SimpleField label="État" className="md:w-1/3">
                                        <p className="text-sm text-gray-700">
                                                {item.status === "processing"
                                                        ? "Conversion en cours"
                                                        : item.status === "error"
                                                                ? item.error ?? "Une erreur est survenue"
                                                                : "Prêt"}
                                        </p>
                                </SimpleField>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1 space-y-2">
                                        <div className="relative flex aspect-video items-center justify-center border border-gray-300 bg-white">
                                                <img
                                                        src={item.originalUrl}
                                                        alt="Original"
                                                        className="h-full w-full object-contain"
                                                />
                                                {item.convertedUrl ? (
                                                        <img
                                                                src={item.convertedUrl}
                                                                alt="Converti"
                                                                className="absolute inset-0 h-full w-full object-contain"
                                                                style={{ clipPath: `inset(0 ${100 - item.compareSplit}% 0 0)` }}
                                                        />
                                                ) : null}
                                                <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-2 text-xs text-gray-700">
                                                        <span>Converti</span>
                                                        <span>Original</span>
                                                </div>
                                                <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={item.compareSplit}
                                                        onChange={(event) => onSplitChange(item.id, Number(event.target.value))}
                                                        className="absolute bottom-2 left-1/2 h-1 w-2/3 -translate-x-1/2"
                                                />
                                        </div>
                                        {item.status === "processing" ? (
                                                <p className="text-xs text-gray-600">Conversion en cours…</p>
                                        ) : null}
                                        {item.status === "error" ? (
                                                <p className="text-xs text-red-600">
                                                        {item.error ?? "Une erreur est survenue."}
                                                </p>
                                        ) : null}
                                </div>
                                <div className="flex w-full flex-col justify-between gap-3 md:w-64">
                                        <div className="space-y-2 border border-gray-300 bg-white p-3 text-sm text-gray-700">
                                                <div className="flex justify-between">
                                                        <span>Format original</span>
                                                        <span className="font-medium text-gray-900">
                                                                {item.file.type || "Auto"}
                                                        </span>
                                                </div>
                                                <div className="flex justify-between">
                                                        <span>Format converti</span>
                                                        <span className="font-medium text-gray-900">{formatLabel}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                        <span>Poids original</span>
                                                        <span className="font-medium text-gray-900">
                                                                {formatBytes(item.originalSize)}
                                                        </span>
                                                </div>
                                                <div className="flex justify-between">
                                                        <span>Poids converti</span>
                                                        <span className="font-medium text-gray-900">
                                                                {convertedSize !== null ? formatBytes(convertedSize) : "—"}
                                                        </span>
                                                </div>
                                                {gainRatio !== null && delta !== null ? (
                                                        <div className="flex justify-between">
                                                                <span>Gain</span>
                                                                <span className="font-medium text-gray-900">
                                                                        {formatBytes(delta)} ({gainRatio.toFixed(1)}%)
                                                                </span>
                                                        </div>
                                                ) : null}
                                        </div>
                                        <SimpleButton
                                                disabled={!item.convertedBlob}
                                                onClick={() => {
                                                        if (!item.convertedBlob) return;
                                                        const link = document.createElement("a");
                                                        const extension = item.targetFormat === "jpeg" ? "jpg" : item.targetFormat;
                                                        const url = URL.createObjectURL(item.convertedBlob);
                                                        link.href = url;
                                                        link.download = `${item.file.name.replace(/\.[^.]+$/, "")}.${extension}`;
                                                        link.click();
                                                        URL.revokeObjectURL(url);
                                                }}
                                                className={clsx("text-center", !item.convertedBlob && "cursor-not-allowed opacity-50")}
                                        >
                                                Télécharger
                                        </SimpleButton>
                                </div>
                        </div>
                </SimpleBlock>
        );
};
