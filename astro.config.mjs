import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { codeThemeLight, codeThemeDark } from './src/lib/code-theme.mjs';

export default defineConfig({
  site: 'https://adrijshikhar.dev',
  // GitHub Pages serves directory-style output (/path/index.html) and 301-redirects
  // /path -> /path/. Emit canonical trailing-slash URLs everywhere so crawlers/users
  // hit 200 directly instead of the redirect; keeps the sitemap consistent too.
  trailingSlash: 'always',
  // Dual Shiki themes emitted as CSS variables (no baked color), so fenced code
  // blocks are readable in BOTH light and dark — switched by [data-mode] in globals.css.
  // Themes are ours, not bundled: see src/lib/code-theme.mjs for why.
  markdown: {
    shikiConfig: {
      themes: { light: codeThemeLight, dark: codeThemeDark },
      defaultColor: false,
    },
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
});
