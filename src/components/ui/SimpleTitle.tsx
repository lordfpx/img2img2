import type { ReactNode } from "react";

interface SimpleTitleProps {
        children: ReactNode;
        as?: keyof JSX.IntrinsicElements;
        className?: string;
}

export const SimpleTitle = ({ children, as: Component = "h2", className }: SimpleTitleProps) => {
        return (
                <Component className={"text-lg font-medium text-gray-900" + (className ? ` ${className}` : "")}>
                        {children}
                </Component>
        );
};
