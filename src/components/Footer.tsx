const currentYear = new Date().getFullYear();

export const Footer = () => (
	<footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-sm">
		<p className="mx-auto max-w-5xl px-4 py-4 text-sm text-slate-600 text-center">
			<span>© {currentYear} Thierry Philippe</span> - {" "}
			<a
				className="font-medium text-blue-500 underline-offset-4 hover:text-blue-700 hover:underline transition-colors"
				href="https://github.com/lordfpx/minipix"
				target="_blank"
				rel="noreferrer"
			>
				GitHub
			</a>
		</p>
	</footer>
);
