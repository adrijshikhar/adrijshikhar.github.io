import type { APIRoute } from 'astro';
import { buildRawMarkdown } from '../lib/raw-markdown';

// /index.md — same markdown payload as /llms.txt, at a conventional .md path.
export const GET: APIRoute = async () => {
  const md = await buildRawMarkdown();
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
