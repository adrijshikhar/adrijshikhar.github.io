import type { APIRoute } from 'astro';
import { buildAgentSkillsIndex } from '../../../lib/agent-skills';

// /.well-known/agent-skills/index.json — Agent Skills Discovery RFC v0.2.0.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(buildAgentSkillsIndex(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
