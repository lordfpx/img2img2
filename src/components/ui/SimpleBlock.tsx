import clsx from "clsx";
import type { ReactNode } from "react";

interface SimpleBlockProps {
	children: ReactNode;
	className?: string;
}

export const SimpleBlock = ({ children, className }: SimpleBlockProps) => {
	return (
		<div
			className={clsx(
				"SimpleBlock border border-border bg-surface p-2 md:p-4",
				className,
			)}
		>
			{children}
		</div>
	);
};
