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
				"border px-3 py-1.5 text-m font-bold cursor-pointer transition-colors",
				{
					"bg-blue-500 text-white border-blue-500 hover:bg-blue-700": variant === "default",
					"bg-white text-gray-900 border-gray-400 hover:bg-gray-200": variant === "outline",
				},
				className,
			)}
			{...props}
		/>
	);
};
