import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite";

const repoBase = "/img2img2/";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react(), tailwindcss(),],
	// Use the repository sub-path when building the static bundle for GitHub Pages
	base: process.env.GITHUB_PAGES === "true" && mode === "production" ? repoBase : "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
