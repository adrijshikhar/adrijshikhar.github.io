/**
 * Regenerates public/assets/resume.pdf from scripts/resume-print.html.
 *
 * The previous PDF came out of a resume builder and had no source in this
 * repo, so it went stale without anyone noticing: it still advertised claims
 * the site content had already dropped (15x metadata scaling, 10x
 * source-object generation, PostgreSQL TOAST datum) while the Download button
 * on /resume sat beside the current narrative. The template is now the source.
 *
 *   bun run gen:resume
 *
 * Content mirrors the hevo-senior chunk of src/content/experience.md — when
 * that changes, change the template. Contact details and references carry over
 * verbatim from the old PDF; they are the author's own data, not stale claims.
 *
 * Needs Chrome. Print backgrounds are on, so the navy sidebar survives.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'scripts/resume-print.html');
const OUT = join(ROOT, 'public/assets/resume.pdf');

execFileSync(CHROME, [
  '--headless', '--disable-gpu', '--allow-file-access-from-files',
  '--no-pdf-header-footer', `--print-to-pdf=${OUT}`, `file://${SRC}`,
], { stdio: 'ignore' });

console.log(`  wrote public/assets/resume.pdf (${(statSync(OUT).size / 1024).toFixed(0)} KB)`);
