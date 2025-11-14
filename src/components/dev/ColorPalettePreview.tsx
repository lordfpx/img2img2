import { SimpleBlock } from "@/components/ui/SimpleBlock";
import { SimpleTitle } from "@/components/ui/SimpleTitle";

const palette = [
	{ name: "Background", className: "bg-background text-foreground", varName: "--color-background" },
	{ name: "Surface", className: "bg-surface text-foreground", varName: "--color-surface" },
	{
		name: "Surface Muted",
		className: "bg-surface-muted text-foreground",
		varName: "--color-surface-muted",
	},
	{
		name: "Surface Strong",
		className: "bg-surface-strong text-foreground",
		varName: "--color-surface-strong",
	},
	{ name: "Border", className: "bg-border text-foreground", varName: "--color-border" },
	{
		name: "Border Muted",
		className: "bg-border-muted text-foreground",
		varName: "--color-border-muted",
	},
	{ name: "Foreground", className: "bg-foreground text-background", varName: "--color-foreground" },
	{
		name: "Muted Foreground",
		className: "bg-muted-foreground text-background",
		varName: "--color-muted-foreground",
	},
	{
		name: "Subtle Foreground",
		className: "bg-subtle-foreground text-background",
		varName: "--color-subtle-foreground",
	},
	{ name: "Accent", className: "bg-accent text-accent-foreground", varName: "--color-accent" },
	{
		name: "Accent Foreground",
		className: "bg-accent-foreground text-foreground",
		varName: "--color-accent-foreground",
	},
	{ name: "Brand 500", className: "bg-brand-500 text-white", varName: "--color-brand-500" },
	{ name: "Brand 600", className: "bg-brand-600 text-white", varName: "--color-brand-600" },
	{ name: "Brand 700", className: "bg-brand-700 text-white", varName: "--color-brand-700" },
];

export const ColorPalettePreview = () => {
	return (
		<div className="space-y-6 p-4">
			<SimpleTitle as="h3" className="text-xl">
				Color Palette Preview
			</SimpleTitle>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{palette.map((color) => (
					<SimpleBlock
						key={color.name}
						className={`${color.className} border border-border-muted shadow-sm`}
					>
						<div className="flex flex-col gap-1">
							<span className="text-sm font-semibold">{color.name}</span>
							<span className="text-xs opacity-80">{color.varName}</span>
						</div>
					</SimpleBlock>
				))}
			</div>
		</div>
	);
};
