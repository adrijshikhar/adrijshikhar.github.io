/**
 * verify-legibility — holds the 169/255 canvas-alpha ceiling.
 *
 * DESIGN.md makes this a hard contract: "Canvas alpha is sampled under every text
 * rectangle and held under 169/255. Any change to the sky, the graticule, or the chrome
 * requires re-measuring." Until now nothing enforced it but a comment in render.ts.
 *
 * Why this script is not `verify-sky.mjs`-shaped: that suite is pure Node because
 * render.ts is deliberately DOM-blind, so its physical invariants can be checked with
 * arithmetic. Legibility cannot. It depends on what the browser actually rasterised —
 * device pixel ratio, font metrics, the real composited canvas — so it needs a real
 * engine.
 *
 * Why it has no dependencies: adding Playwright would make CI install a browser on every
 * build and deploy, and this check is only meaningful when someone is deliberately
 * changing the palette or the sky. So it attaches over CDP to a Chrome you already have
 * open, and the sampling runs *inside* the page — only numbers cross the wire, never
 * pixels, so nothing needs to decode an image.
 *
 * Usage:
 *   bun run dev                                     # in one terminal
 *   <chrome> --remote-debugging-port=9222           # in another (any Chromium build)
 *   bun run verify:legibility
 *
 * Options (env):
 *   LEGIBILITY_PORT     CDP port                   (default 9222)
 *   LEGIBILITY_BASE     site origin                (default http://localhost:4321)
 *   LEGIBILITY_CEILING  max permitted alpha        (default 169)
 *
 * Flags:
 *   --json    emit machine-readable output instead of a table
 *   --all     report every sampled element, not just the worst offenders
 */

const PORT = Number(process.env.LEGIBILITY_PORT ?? 9222);
const BASE = (process.env.LEGIBILITY_BASE ?? 'http://localhost:4321').replace(/\/$/, '');
const CEILING = Number(process.env.LEGIBILITY_CEILING ?? 169);
const AS_JSON = process.argv.includes('--json');
const SHOW_ALL = process.argv.includes('--all');

/** Routes worth checking. trailingSlash is 'always' — a bare path 404s in dev. */
const ROUTES = [
  ['home', '/'],
  ['experience', '/experience/'],
  ['archive', '/archive/'],
  ['post', '/blogs/mysql-binlog-4gib-position-wrap/'],
  ['resume', '/resume/'],
];
const MODES = ['dark', 'light'];

/**
 * Runs in the page. For every element that renders visible text, sample the canvas
 * pixels beneath its bounding box and return the maximum alpha found there.
 *
 * Max, not mean: a single bright graticule stroke crossing a 9px label is what breaks
 * legibility, and a mean over the whole rect would hide it behind empty sky.
 */
const SAMPLER = /* js */ `(() => {
  const cv = document.querySelector('canvas');
  if (!cv) return { error: 'no canvas on this route' };

  const cvRect = cv.getBoundingClientRect();
  // The backing store may be DPR-scaled relative to CSS pixels; map through it.
  const sx = cv.width / cvRect.width;
  const sy = cv.height / cvRect.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { error: 'canvas has no 2d context' };

  // 1x1 scratch canvas used to resolve any CSS colour string to a true alpha value.
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  const alphaOf = (css) => {
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = 'rgba(0,0,0,0)';
    pctx.fillStyle = css;              // invalid values leave the previous fillStyle
    pctx.fillRect(0, 0, 1, 1);
    return pctx.getImageData(0, 0, 1, 1).data[3];
  };

  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.textContent || '').trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    // Astro injects a dev-only toolbar in a shadow root; it never ships.
    if (el.closest('astro-dev-toolbar')) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (parseFloat(cs.opacity) === 0) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    // Only text currently over the canvas can be affected by it.
    if (r.bottom < cvRect.top || r.top > cvRect.bottom) continue;
    seen.add(el);

    const x = Math.max(0, Math.floor((r.left - cvRect.left) * sx));
    const y = Math.max(0, Math.floor((r.top - cvRect.top) * sy));
    const w = Math.min(cv.width - x, Math.ceil(r.width * sx));
    const h = Math.min(cv.height - y, Math.ceil(r.height * sy));
    if (w <= 0 || h <= 0) continue;

    let maxAlpha = 0;
    const data = ctx.getImageData(x, y, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > maxAlpha) maxAlpha = data[i];
    }

    // Is anything fully opaque stacked between this text and the canvas? A card's fill is
    // the documented legibility guarantee (137 alpha carded vs 108 bare), so canvas ink
    // under a carded label cannot actually reach the reader. Recording this keeps a high
    // reading triageable instead of arguable — the raw number still reports the contract
    // as DESIGN.md words it, and the flag says whether it can bite.
    // Resolve alpha through a canvas rather than parsing the string: this project authors
    // colour in oklch, and getComputedStyle returns 'oklch(...)' verbatim, which no
    // rgba() regex will ever match. Rasterising is syntax-agnostic and cannot drift.
    // Stop at <body>. The ground → canvas → content stack means html/body backgrounds paint
    // BENEATH the fixed sky canvas, so they shield nothing; counting them would mark every
    // element on the site as protected and the check would pass unconditionally.
    let shielded = false;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const bg = getComputedStyle(a).backgroundColor;
      if (!bg || bg === 'transparent') continue;
      if (alphaOf(bg) >= 255) { shielded = true; break; }
    }

    out.push({
      text: text.slice(0, 40).replace(/\\s+/g, ' '),
      cls: (el.className || '').toString().trim().split(/\\s+/).slice(0, 2).join(' '),
      fontSize: cs.fontSize,
      maxAlpha,
      shielded,
    });
  }

  out.sort((a, b) => b.maxAlpha - a.maxAlpha);
  return {
    dpr: +sx.toFixed(2),
    canvas: cv.width + 'x' + cv.height,
    sampled: out.length,
    elements: out,
  };
})()`;

// ── minimal CDP client ────────────────────────────────────────────────────────

async function findTarget() {
  let res;
  try {
    res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  } catch {
    console.error(
      `\nCannot reach Chrome on port ${PORT}.\n\n` +
        `Start one with remote debugging enabled, e.g.\n` +
        `  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\\n` +
        `    --remote-debugging-port=${PORT} --user-data-dir=/tmp/legibility-profile\n\n` +
        `and make sure the site is running (bun run dev).\n`
    );
    process.exit(2);
  }
  const targets = await res.json();
  const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!page) {
    console.error(`Chrome is on ${PORT} but has no inspectable page tab open.`);
    process.exit(2);
  }
  return page.webSocketDebuggerUrl;
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const listeners = new Map();

    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve: r, reject: j } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? j(new Error(msg.error.message)) : r(msg.result);
      } else if (msg.method && listeners.has(msg.method)) {
        listeners.get(msg.method).forEach((fn) => fn(msg.params));
      }
    });
    ws.addEventListener('error', reject);
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          return new Promise((r, j) => {
            const n = ++id;
            pending.set(n, { resolve: r, reject: j });
            ws.send(JSON.stringify({ id: n, method, params }));
          });
        },
        once(method) {
          return new Promise((r) => {
            const arr = listeners.get(method) ?? [];
            const fn = (p) => {
              listeners.set(method, (listeners.get(method) ?? []).filter((f) => f !== fn));
              r(p);
            };
            listeners.set(method, [...arr, fn]);
          });
        },
        close: () => ws.close(),
      })
    );
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── run ───────────────────────────────────────────────────────────────────────

const wsUrl = await findTarget();
const cdp = await connect(wsUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
// The sky branches on prefers-reduced-motion and renders a single static frame under
// 'reduce'. That frame is a legitimate render and must also pass, but the animated path
// is the one most visitors get — so measure that one.
await cdp.send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
});
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

const report = [];
let worstOverall = { maxAlpha: -1 };

for (const mode of MODES) {
  for (const [name, path] of ROUTES) {
    const url = `${BASE}${path}?mode=${mode}`;
    const loaded = cdp.once('Page.loadEventFired');
    await cdp.send('Page.navigate', { url });
    await loaded;
    // The canvas paints on rAF after fonts settle; give it room on a cold cache.
    await sleep(1800);

    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
      expression: SAMPLER,
      returnByValue: true,
      awaitPromise: false,
    });
    if (exceptionDetails) {
      console.error(`\n${mode}/${name}: sampler threw — ${exceptionDetails.text}`);
      process.exit(1);
    }
    const data = result.value;
    if (data.error) {
      report.push({ mode, name, skipped: data.error });
      continue;
    }

    // Only unshielded text can actually be harmed — an opaque card between the text and
    // the canvas is the documented guarantee. Shielded exceedances are reported, never
    // failed, so the check stays worth listening to.
    const exposed = data.elements.filter((e) => !e.shielded);
    const over = exposed.filter((e) => e.maxAlpha > CEILING);
    const overShielded = data.elements.filter((e) => e.shielded && e.maxAlpha > CEILING);
    const worst = exposed[0] ?? { maxAlpha: 0, text: '(no unshielded text over canvas)', fontSize: '—' };
    if (worst.maxAlpha > worstOverall.maxAlpha) worstOverall = { ...worst, mode, route: name };
    report.push({
      mode, name, dpr: data.dpr, canvas: data.canvas,
      sampled: data.sampled, exposed: exposed.length,
      worst, over, overShielded, elements: data.elements,
    });
  }
}

cdp.close();

const failures = report.flatMap((r) => (r.over ?? []).map((e) => ({ ...e, mode: r.mode, route: r.name })));

if (AS_JSON) {
  console.log(JSON.stringify({ ceiling: CEILING, worstOverall, failures, report }, null, 2));
} else {
  console.log(`\nCanvas legibility — ceiling ${CEILING}/255, viewport 1440x900\n`);
  for (const r of report) {
    if (r.skipped) {
      console.log(`  ~ ${r.mode.padEnd(5)} ${r.name.padEnd(11)} skipped (${r.skipped})`);
      continue;
    }
    const ok = r.over.length === 0;
    const head = `${ok ? '✓' : '✗'} ${r.mode.padEnd(5)} ${r.name.padEnd(11)}`;
    const margin = CEILING - r.worst.maxAlpha;
    console.log(
      `  ${head} worst ${String(r.worst.maxAlpha).padStart(3)}/${CEILING}` +
        `  (margin ${String(margin).padStart(3)})  ${r.exposed}/${r.sampled} exposed  — ${r.worst.text}`
    );
    for (const e of SHOW_ALL ? r.elements : r.over) {
      const flag = e.maxAlpha > CEILING && !e.shielded ? '✗' : ' ';
      const shield = e.shielded ? ' [carded]' : '';
      console.log(`      ${flag} ${String(e.maxAlpha).padStart(3)}  ${e.fontSize.padStart(7)}  ${e.text}${shield}`);
    }
    if (r.overShielded.length && !SHOW_ALL) {
      console.log(
        `        note: ${r.overShielded.length} carded element(s) read over ${CEILING} ` +
          `(max ${r.overShielded[0].maxAlpha}) — an opaque fill stands between them and the canvas.`
      );
    }
  }

  console.log(
    `\n  Tightest margin anywhere: ${worstOverall.maxAlpha}/${CEILING} ` +
      `(${worstOverall.mode}/${worstOverall.route}) — ${worstOverall.text}`
  );
}

if (failures.length) {
  console.error(
    `\n${failures.length} element(s) exceed the ${CEILING}/255 ceiling. ` +
      `DESIGN.md treats this as a hard contract — either reduce the sky's ink under those ` +
      `rectangles or give the text an opaque ground.\n`
  );
  process.exit(1);
}

if (!AS_JSON) console.log('\n  All sampled text sits under the ceiling.\n');
