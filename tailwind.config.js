/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				brand: {
					500: "#00E5A8",
					600: "#00C48A",
					700: "#009C6D",
				},
			},
			boxShadow: {
				glow: "0 0 30px -10px rgba(0, 229, 168, 0.45)",
			},
		},
	},
	plugins: [],
};
