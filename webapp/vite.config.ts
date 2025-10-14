import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = '/img2img2/';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use the repository sub-path when building the static bundle for GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' && mode === 'production' ? repoBase : '/',
}));
