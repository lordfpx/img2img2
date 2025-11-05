import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

interface SimpleTitleProps {
	children: ReactNode;
	as?: ElementType;
	className?: string;
}

export const SimpleTitle = ({ children, as: Component = "h2", className }: SimpleTitleProps) => {
	return (
		<Component className={clsx("text-lg font-medium text-gray-900", className)}>
			{children}
		</Component>
	);
};
