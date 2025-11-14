import { useTheme, type ThemePreference } from "@/hooks/useTheme";

const THEME_SEQUENCE: ThemePreference[] = ["system", "light", "dark"];

const LABELS: Record<ThemePreference, string> = {
	system: "Auto",
	light: "Clair",
	dark: "Sombre",
};

const ICONS: Record<ThemePreference, string> = {
	system: "🖥️",
	light: "☀️",
	dark: "🌙",
};

export const ThemeSwitch = () => {
	const { preference, resolvedTheme, setPreference } = useTheme();

	const handleToggle = () => {
		const currentIndex = THEME_SEQUENCE.indexOf(preference);
		const nextIndex = (currentIndex + 1) % THEME_SEQUENCE.length;
		setPreference(THEME_SEQUENCE[nextIndex]);
	};

	const description =
		preference === "system"
			? `Configuré automatiquement (${resolvedTheme === "dark" ? "sombre" : "clair"})`
			: `Mode ${LABELS[preference]}`;

		return (
			<button
				type="button"
				onClick={handleToggle}
				className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				title={`Basculer le thème · ${description}`}
				aria-label="Basculer le thème"
			>
			<span aria-hidden="true">{ICONS[preference]}</span>
			<span>{LABELS[preference]}</span>
		</button>
	);
};
