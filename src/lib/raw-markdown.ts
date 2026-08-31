import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import matter from 'gray-matter';

/**
 * Single source of truth for the site's raw-markdown representation.
 *
 * Backs two consumers that MUST stay in parity (see CLAUDE.md):
 *   - the machine view (`window.__RAW_MARKDOWN__`, assembled in index.astro)
 *   - the `/llms.txt` endpoint for AI agents
 */

function readContent(filename: string) {
  const raw = readFileSync(join(process.cwd(), 'src/content', filename), 'utf-8');
  const { data, content } = matter(raw);
  return { meta: data, content };
}

function splitBySlug(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = content.split(/<!--\s*([\w-]+)\s*-->/);
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i]] = parts[i + 1]?.trim() || '';
  }
  return sections;
}

function formatExpEntry(entry: any, body: string): string {
  return `### ${entry.position} @ ${entry.company} (${entry.startDate} — ${entry.endDate})\n\n${body}`;
}

function formatProjEntry(entry: any, body: string): string {
  const header = entry.link
    ? `### [${entry.title}](${entry.link}) — ${entry.company}`
    : `### ${entry.title} — ${entry.company}`;
  return `${header}\n\n${body}`;
}

export async function buildRawMarkdown(): Promise<string> {
  const about = readContent('about.md');
  const experience = readContent('experience.md');
  const projects = readContent('projects.md');
  const skills = readContent('skills.md');
  const education = readContent('education.md');
  const achievements = readContent('achievements.md');
  const interests = readContent('interests.md');

  const expSections = splitBySlug(experience.content);
  const projSections = splitBySlug(projects.content);

  const latestPosts = (
    await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true))
  )
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 3);

  return [
    `# ${about.meta.name}\n\n${about.content}`,
    `\n---\n\n## Experience\n\n${experience.meta.entries.map((e: any) => formatExpEntry(e, expSections[e.slug] || '')).join('\n\n---\n\n')}`,
    `\n---\n\n## Projects\n\n${projects.meta.entries.map((p: any) => formatProjEntry(p, projSections[p.slug] || '')).join('\n\n---\n\n')}`,
    `\n---\n\n## Writing\n\n${latestPosts.map((post) => `- [${post.data.title}](/blogs/${post.id}/)`).join('\n') || '_No posts yet._'}`,
    // skills.md carries its own `##` headings; demote them so they nest under
    // this one instead of becoming siblings of the top-level sections.
    `\n---\n\n## Skills\n\n${skills.content.trim().replace(/^## /gm, '### ')}`,
    `\n---\n\n## Education\n\n${education.meta.entries.map((e: any) => `### ${e.institution}\n\n${e.degree}${e.field ? ` — ${e.field}` : ''}`).join('\n\n')}`,
    `\n---\n\n## Achievements\n\n${achievements.content}`,
    `\n---\n\n## Interests\n\n${interests.content}`,
  ].join('\n');
}
