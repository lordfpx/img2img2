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
				"border px-3 py-2 text-sm ",
				variant === "default" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-900 border-gray-400",
				className,
			)}
			{...props}
		/>
	);
};
