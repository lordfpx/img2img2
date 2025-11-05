import clsx from "clsx";
import type { ReactNode } from "react";

interface SimpleFieldProps {
	label: ReactNode;
	children: ReactNode;
	helper?: ReactNode;
	direction?: "column" | "row";
	className?: string;
}

export const SimpleField = ({
	label,
	children,
	helper,
	direction = "column",
	className,
}: SimpleFieldProps) => {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: TODO
<label
			className={clsx(
				"text-sm text-gray-700",
				direction === "row" ? "flex items-center gap-2" : "flex flex-col gap-2",
				className,
			)}
		>
			<span className="font-medium">{label}</span>
			<div className={direction === "row" ? "flex-1" : undefined}>{children}</div>
			{helper ? <span className="text-xs text-gray-500">{helper}</span> : null}
		</label>
	);
};
