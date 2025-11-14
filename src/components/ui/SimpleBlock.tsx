import clsx from "clsx";
import type { ReactNode } from "react";

interface SimpleBlockProps {
	children: ReactNode;
	className?: string;
}

export const SimpleBlock = ({ children, className }: SimpleBlockProps) => {
	return (
		<div className={clsx("border border-gray-300 bg-white p-2 md:p-4", className)}>{children}</div>
	);
};
