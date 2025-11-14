import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface SimpleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline";
}

export const SimpleButton = ({
	variant = "default",
	className,
	type = "button",
	...props
}: SimpleButtonProps) => {
	return (
		<button
			type={type}
			className={clsx(
				"border px-3 py-1.5 text-m font-bold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
				{
					"bg-accent text-accent-foreground border-accent hover:bg-accent/80":
						variant === "default",
					"bg-surface text-foreground border-border hover:bg-surface-muted":
						variant === "outline",
				},
				className,
			)}
			{...props}
		/>
	);
};
