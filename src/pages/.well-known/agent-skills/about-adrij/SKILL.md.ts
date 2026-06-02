import type { APIRoute } from 'astro';
import { ABOUT_ADRIJ_SKILL_MD } from '../../../../lib/agent-skills';

// /.well-known/agent-skills/about-adrij/SKILL.md — served verbatim; its sha256 is the
// digest published in the discovery index.
export const GET: APIRoute = async () =>
  new Response(ABOUT_ADRIJ_SKILL_MD, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
