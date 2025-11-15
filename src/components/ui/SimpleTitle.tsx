import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

interface SimpleTitleProps {
	children: ReactNode;
	as?: ElementType;
	className?: string;
}

export const SimpleTitle = ({ children, as: Component = "h2", className }: SimpleTitleProps) => {
	return (
		<Component
			className={clsx("font-bold text-foreground", className, {
				"text-xl": Component === "h2",
				"text-l": Component === "h3",
			})}
		>
			{children}
		</Component>
	);
};
