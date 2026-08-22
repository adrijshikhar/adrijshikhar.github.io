/**
 * Tech tag hue, by category.
 *
 * The design assigns tags a ramp hue rather than one flat grey, so a glance at a
 * card tells you what KIND of thing each tag is. The categories are the ones the
 * ramp already owns elsewhere, so nothing new is invented here:
 *
 *   K  #eda05b  language   — the same hue numbers take
 *   A  #bfd2f2  infra      — the same hue types take
 *   G  #f0ce72  data       — the same hue strings and Sun values take
 *
 * Anything unrecognised stays muted on purpose. A wrong colour is a false
 * statement about the tag; grey is merely silent, and silence is the safe default
 * when the classifier does not know.
 */
export type TechHue = 'lang' | 'infra' | 'data' | 'unknown';

const LANG = new Set([
  'java', 'python', 'typescript', 'javascript', 'go', 'golang', 'rust', 'lua',
  'kotlin', 'swift', 'c', 'c++', 'sql', 'bash', 'shell', 'scala', 'ruby', 'php',
]);

const INFRA = new Set([
  'docker', 'kubernetes', 'k8s', 'temporal', 'kafka', 'aws', 'gcp', 'azure',
  'terraform', 'nginx', 'grafana', 'prometheus', 'opentelemetry', 'jenkins',
  'circleci', 'astro', 'react', 'node.js', 'nodejs', 'node', 'vite', 'löve',
  'love', 'canvas', 'graphql', 'slash graphql', 'salesforce', 'llm',
]);

const DATA = new Set([
  'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'snowflake', 'bigquery',
  'clickhouse', 'debezium', 'cdc', 'influxdb', 'elasticsearch', 's3', 'dgraph',
]);

export function techHue(tech: string): TechHue {
  const t = tech.trim().toLowerCase();
  if (LANG.has(t)) return 'lang';
  if (INFRA.has(t)) return 'infra';
  if (DATA.has(t)) return 'data';
  return 'unknown';
}

/** Tailwind text class per category. */
export const HUE_CLASS: Record<TechHue, string> = {
  lang: 'text-spectral-k',
  infra: 'text-spectral-a',
  data: 'text-spectral-g',
  unknown: 'text-muted',
};
