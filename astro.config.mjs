import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adrijshikhar.github.io',
  integrations: [
    mdx(),
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  vite: {
    server: {
      fs: {
        // Allow the dev server to serve deps that resolve to the parent repo's
        // node_modules (git worktrees share the parent checkout). Dev-only.
        allow: ['..', '../..', '../../..'],
      },
    },
  },
});
