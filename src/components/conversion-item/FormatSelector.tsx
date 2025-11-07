import { type ChangeEvent, memo } from "react";

import { SimpleField } from "@/components/ui/SimpleField";
import { formatOptions } from "@/types/conversion";
import type { OutputFormat } from "@/lib/imageConversion";

interface FormatSelectorProps {
	value: OutputFormat;
	disabled: boolean;
	usesGlobalSettings: boolean;
	globalFormatLabel: string;
	onFormatChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	onUseGlobalToggle: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const FormatSelector = memo(
	({
		value,
		disabled,
		usesGlobalSettings,
		globalFormatLabel,
		onFormatChange,
		onUseGlobalToggle,
	}: FormatSelectorProps) => (
		<SimpleField label="Format">
			<select
				value={value}
				onChange={onFormatChange}
				disabled={disabled}
				className="w-full border border-gray-400 bg-white px-2 py-2 text-sm disabled:opacity-60"
			>
				{formatOptions.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
				<input
					type="checkbox"
					checked={usesGlobalSettings}
					onChange={onUseGlobalToggle}
					className="h-4 w-4 border border-gray-400"
				/>
				<b>Use default settings</b> - {globalFormatLabel}
			</label>
		</SimpleField>
	),
);
