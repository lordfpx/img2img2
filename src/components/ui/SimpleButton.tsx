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
				"border border-gray-400 px-3 py-2 text-sm text-gray-900",
				variant === "default" ? "bg-gray-100" : "bg-white",
				className,
			)}
			{...props}
		/>
	);
};
