import type { APIRoute } from 'astro';
import { buildRawMarkdown } from '../lib/raw-markdown';

// /llms.txt — markdown representation of the site for AI agents (llmstxt.org).
// GitHub Pages serves this as text/plain (extension-derived), which is the
// llms.txt convention; the Content-Type below is honored by `astro preview`.
export const GET: APIRoute = async () => {
  const md = await buildRawMarkdown();
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
