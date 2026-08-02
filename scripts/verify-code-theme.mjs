/**
 * Holds the fenced-code themes to the same contract as the rest of the site:
 * every token colour clears 4.5:1 against its own pane, and the palette stays
 * disciplined (few colours, narrow hue spread).
 *
 * This exists because the previous themes were bundled ones whose contrast was
 * only ever true against a pure-white editor background. The moment the pane
 * became paper, tokens silently dropped under the bar with nothing to catch it.
 */
import { createHighlighter } from 'shiki';
import { codeThemeLight, codeThemeDark, CODE_PALETTE } from '../src/lib/code-theme.mjs';

const LANGS = ['java', 'sql', 'xml', 'ts', 'bash', 'json', 'yaml', 'python', 'go', 'diff'];

const SAMPLES = [
  ['java', `@Override public void onRetry(TaskEvent e) { meter.counter("pool.retry").increment(); }
// compose it, do not subclass it
RetryPolicy p = RetryPolicy.builder().maxAttempts(3).build();`],
  ['sql', `SET GLOBAL max_binlog_size = 5368709120;\n-- 1 GiB. It clamped.\nSELECT @@max_binlog_size;`],
  ['ts', `export async function load(id: string): Promise<User | null> {
  const r = await fetch(\`/api/u/\${id}\`); // network boundary
  return r.ok ? r.json() : null;
}`],
  ['bash', `bun run build --mode production   # emits dist/`],
  ['json', `{ "name": "adrijshikhar.dev", "private": true, "version": 2 }`],
  ['yaml', `on:\n  push:\n    branches: [content]   # deploy target`],
  ['python', `def retry(fn, attempts=3):\n    """Back off and try again."""\n    return fn()`],
  ['go', `func Retry(ctx context.Context, n int) error { return nil } // no-op`],
  ['xml', `<dependency><groupId>dev.adrij</groupId><version>1.2.0</version></dependency>`],
];

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const hex2rgb = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const lum = (hex) => { const [r, g, b] = hex2rgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
};
const hue = (hex) => {
  const [r, g, b] = hex2rgb(hex);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 6) return null; // effectively neutral, carries no hue
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
};

const BAR = 4.5;
const MAX_COLOURS = 6;
const MAX_HUE_SPREAD = 190; // a rainbow is what we replaced; keep it narrow

const fails = [];
const pass = (msg) => console.log(`  [32m✓[0m ${msg}`);
const fail = (msg) => { fails.push(msg); console.log(`  [31m✗[0m ${msg}`); };

const hl = await createHighlighter({ themes: [codeThemeLight, codeThemeDark], langs: LANGS });

for (const [mode, theme, pane] of [
  ['light', codeThemeLight, CODE_PALETTE.LIGHT.bg],
  ['dark', codeThemeDark, CODE_PALETTE.DARK.bg],
]) {
  const used = new Map();
  for (const [lang, code] of SAMPLES) {
    for (const line of hl.codeToTokens(code, { lang, theme: theme.name }).tokens) {
      for (const t of line) {
        if (!t.content.trim() || !t.color) continue;
        if (!used.has(t.color)) used.set(t.color, `${lang}: ${t.content.trim().slice(0, 16)}`);
      }
    }
  }

  const worst = [...used.entries()]
    .map(([c, sample]) => ({ c, sample, r: ratio(c, pane) }))
    .sort((a, b) => a.r - b.r);

  const under = worst.filter((t) => t.r < BAR);
  if (under.length) {
    for (const t of under) fail(`${mode}: ${t.c} (${t.sample}) is ${t.r}:1 against the pane, under ${BAR}`);
  } else {
    pass(`${mode}: all ${worst.length} token colours clear ${BAR}:1 (worst ${worst[0].r} — ${worst[0].sample})`);
  }

  if (used.size > MAX_COLOURS) fail(`${mode}: ${used.size} distinct token colours, budget is ${MAX_COLOURS}`);
  else pass(`${mode}: ${used.size} distinct token colours, within budget of ${MAX_COLOURS}`);

  const hues = [...used.keys()].map(hue).filter((h) => h !== null);
  const spread = hues.length ? Math.max(...hues) - Math.min(...hues) : 0;
  if (spread > MAX_HUE_SPREAD) fail(`${mode}: hue spread ${spread}deg exceeds ${MAX_HUE_SPREAD}deg`);
  else pass(`${mode}: hue spread ${spread}deg, within ${MAX_HUE_SPREAD}deg`);
}

// The pane declared in the theme must match what the palette says, so the CSS
// token and the theme cannot drift apart unnoticed.
for (const [mode, theme, pane] of [
  ['light', codeThemeLight, CODE_PALETTE.LIGHT.bg],
  ['dark', codeThemeDark, CODE_PALETTE.DARK.bg],
]) {
  if (theme.colors['editor.background'].toLowerCase() !== pane.toLowerCase())
    fail(`${mode}: theme background ${theme.colors['editor.background']} != palette ${pane}`);
  else pass(`${mode}: theme background matches the palette`);
}

console.log('');
if (fails.length) {
  console.error(`[31m${fails.length} code-theme check(s) failed[0m`);
  process.exit(1);
}
console.log('[32mcode theme OK[0m');
