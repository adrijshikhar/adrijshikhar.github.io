import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adrijshikhar.dev',
  // GitHub Pages serves directory-style output (/path/index.html) and 301-redirects
  // /path -> /path/. Emit canonical trailing-slash URLs everywhere so crawlers/users
  // hit 200 directly instead of the redirect; keeps the sitemap consistent too.
  trailingSlash: 'always',
  // Dual Shiki themes emitted as CSS variables (no baked color), so fenced code
  // blocks are readable in BOTH light and dark — switched by [data-mode] in globals.css.
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  integrations: [
    mdx(),
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
});
