const currentYear = new Date().getFullYear();

export const Footer = () => (
	<footer className="mt-auto border-t border-border bg-surface/80 backdrop-blur-sm">
		<p className="mx-auto max-w-5xl px-4 py-4 text-sm text-subtle-foreground text-center">
			<span>© {currentYear} Thierry Philippe</span> - {" "}
			<a
				className="font-medium text-accent underline-offset-4 hover:text-accent/80 hover:underline transition-colors"
				href="https://github.com/lordfpx/minipix"
				target="_blank"
				rel="noreferrer"
			>
				GitHub
			</a>
		</p>
	</footer>
);
