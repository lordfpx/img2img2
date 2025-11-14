import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";

export type ThemePreference = "system" | "light" | "dark";
type Theme = "light" | "dark";

interface ThemeContextValue {
	preference: ThemePreference;
	resolvedTheme: Theme;
	setPreference: Dispatch<SetStateAction<ThemePreference>>;
}

const THEME_STORAGE_KEY = "minipix-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);
const isBrowser = typeof window !== "undefined";

const getSystemTheme = (): Theme => {
	if (!isBrowser) return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredPreference = (): ThemePreference => {
	if (!isBrowser) return "system";
	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [preference, setPreference] = useState<ThemePreference>(() => getStoredPreference());
	const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());

	useEffect(() => {
		if (!isBrowser) return undefined;
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (event: MediaQueryListEvent) => {
			setSystemTheme(event.matches ? "dark" : "light");
		};
		mediaQuery.addEventListener("change", handleChange);
		setSystemTheme(mediaQuery.matches ? "dark" : "light");
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	useEffect(() => {
		if (!isBrowser) return;
		window.localStorage.setItem(THEME_STORAGE_KEY, preference);
	}, [preference]);

	const resolvedTheme = preference === "system" ? systemTheme : preference;

	useEffect(() => {
		if (typeof document === "undefined") return;
		document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
	}, [resolvedTheme]);

	const value = useMemo(
		() => ({
			preference,
			resolvedTheme,
			setPreference,
		}),
		[preference, resolvedTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
