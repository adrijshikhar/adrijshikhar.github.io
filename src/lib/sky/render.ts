/**
 * Canvas draw logic for the ambient sky field, ported from `stars.html`'s
 * `build()`/`recompute()`/`draw()`. Pure with respect to the DOM: takes a
 * CanvasRenderingContext2D and plain data in, mutates the canvas, returns
 * nothing. No React, no globals, no interaction state.
 *
 * SkyField.tsx owns the canvas element, the rAF loop, resize/geolocation —
 * this module only knows how to turn (observer, time) into pixels. The later
 * 'full' mode (graticule, planets, Moon, labels, hover, the game) extends the
 * sky by adding more draw passes here, alongside `drawQuiet`.
 */
import { STARS, PLANETS, FIGURES } from './catalogue';
import { altAz, planetRaDec, moonRaDec } from './astronomy';
import { project, FLOOR } from './projection';

const D2R = Math.PI / 180;

export interface Observer {
  lat: number;
  lon: number;
}

export interface NamedStarPos {
  name: string;
  mag: number;
  alt: number;
  az: number;
  x: number;
  y: number;
  /** Radius the star is painted at — single source of truth, matches the prototype. */
  vr: number;
}

export interface FaintStarPos {
  mag: number;
  alt: number;
  x: number;
  y: number;
}

/** Tiny seeded PRNG (same one the prototype used) so the faint field is
 *  reproducible across reloads instead of reshuffling on every visit. */
function rnd(seed: number): () => number {
  let h = (seed * 2654435761) >>> 0;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h >>> 8) / 16777216;
  };
}

const R2D = 180 / Math.PI;

/** Faint field: 420 anonymous stars spread UNIFORMLY over the celestial sphere
 *  — dec = asin(uniform), NOT uniform-in-dec, which would clump them at the
 *  poles. They are not catalogued objects; they exist so the sky has real
 *  density, and they rise/set with the true sky because they live in RA/Dec too. */
export const FAINT_FIELD: Array<{ ra: number; dec: number; mag: number }> = (() => {
  const r = rnd(20260801);
  const out: Array<{ ra: number; dec: number; mag: number }> = [];
  for (let i = 0; i < 420; i++) {
    out.push({ ra: r() * 24, dec: Math.asin(r() * 2 - 1) * R2D, mag: 3.6 + r() * 2.6 });
  }
  return out;
})();

const vrFor = (mag: number): number => 1.4 + Math.max(0, 3.0 - mag) * 1.15;

/** Recompute alt/az and screen position for every star at `when`, for `obs`. */
export function computeSky(
  obs: Observer,
  when: Date,
  W: number,
  H: number,
): { pts: NamedStarPos[]; faint: FaintStarPos[] } {
  const pts: NamedStarPos[] = STARS.map(([name, ra, dec, mag]) => {
    const { alt, az } = altAz(ra, dec, obs.lat, obs.lon, when);
    const p = project(alt, az, W, H);
    return { name, mag, alt, az, x: p.x, y: p.y, vr: vrFor(mag) };
  });
  const faint: FaintStarPos[] = FAINT_FIELD.map((f) => {
    const { alt, az } = altAz(f.ra, f.dec, obs.lat, obs.lon, when);
    const p = project(alt, az, W, H);
    return { mag: f.mag, alt, x: p.x, y: p.y };
  });
  return { pts, faint };
}

const starAlpha = (mag: number): number => Math.max(0.12, Math.min(1, (2.6 - mag) / 3.4));

/** Quiet-mode draw: faint field + named stars only — no graticule, planets,
 *  Moon, labels, hover or interaction. Stars below the horizon (down to FLOOR)
 *  are drawn dimmer rather than hidden, matching the wider-than-horizon disc. */
export function drawQuiet(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  pts: NamedStarPos[],
  faint: FaintStarPos[],
  colors: { accent: string; muted: string },
): void {
  ctx.clearRect(0, 0, W, H);

  for (const f of faint) {
    if (f.alt < FLOOR) continue;
    const below = f.alt < 0 ? 0.22 : 1;
    ctx.globalAlpha = (0.3 - (f.mag - 3.6) * 0.055) * below;
    ctx.fillStyle = colors.muted;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.mag < 4.6 ? 1.15 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const s of pts) {
    if (s.alt < FLOOR) continue;
    const below = s.alt < 0 ? 0.3 : 1;      // under the earth -> dim, not hidden
    const a = starAlpha(s.mag) * below;

    ctx.globalAlpha = a * 0.92;
    ctx.fillStyle = s.mag < 1.0 ? '#fff' : colors.muted;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.vr, 0, Math.PI * 2);
    ctx.fill();

    // Bloom on the brightest stars — MUST be a radial gradient; a flat-alpha
    // disc has a hard edge and reads as a grey ring, not a glow.
    if (s.mag < 0.6 && s.alt > 0) {
      const R = s.vr * 4.2;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
      g.addColorStop(0, `rgba(255,255,255,${(a * 0.3).toFixed(3)})`);
      g.addColorStop(0.35, `rgba(255,255,255,${(a * 0.1).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

/* ===========================================================================
   FULL INSTRUMENT VIEW — home page only. Adds the alt/az graticule, the five
   planets and the Moon (with a true terminator), persistent labels, hover
   naming, and the scroll-driven constellation reveal on top of the quiet
   field above. Ported from `stars.html`'s `draw()`, minus the orbital-
   mechanics game (slingshot, cursor gravity, collisions) which is a later,
   separate task — this view is look-only.
   =========================================================================== */

/** A star, planet, or the Moon — everything the full view draws as a point
 *  body. Planets/Moon set isPlanet/isMoon so `drawFull` can give them a disc,
 *  ring, terminator and persistent label the plain stars don't get. */
export interface BodyPos extends NamedStarPos {
  isPlanet: boolean;
  isMoon: boolean;
}

export interface MoonPhase {
  illum: number;
  waxing: boolean;
}

/** Flat, ordered segment list — the brief's "47 segments across 14 figures"
 *  all draw simultaneously over the same scroll range, in this fixed order. */
export const SEGMENTS: Array<{ name: string; a: string; b: string }> = FIGURES.flatMap(
  ([name, segs]) => segs.map(([a, b]) => ({ name, a, b })),
);

const MOON_MAG = -8;
// Running the Moon's real magnitude (-12.7) through the star size curve
// produces an absurd disc — it's fixed at a plausible instrument radius instead.
const MOON_VR = 13;

/** Recompute stars, faint field, planets and the Moon for `when`. Planets and
 *  the Moon are cheap enough (one Kepler solve or a handful of trig terms
 *  each) to recompute every frame right alongside the stars — no separate
 *  interval, which is exactly the abrupt "sky resets" jump the per-frame star
 *  recompute already fixed. */
export function computeFullSky(
  obs: Observer,
  when: Date,
  W: number,
  H: number,
): { bodies: BodyPos[]; faint: FaintStarPos[]; moonPhase: MoonPhase } {
  const { pts, faint } = computeSky(obs, when, W, H);
  const stars: BodyPos[] = pts.map((s) => ({ ...s, isPlanet: false, isMoon: false }));

  const planets: BodyPos[] = Object.keys(PLANETS).map((name) => {
    const { ra, dec } = planetRaDec(name, when);
    const { alt, az } = altAz(ra, dec, obs.lat, obs.lon, when);
    const p = project(alt, az, W, H);
    const mag = PLANETS[name][2] ?? 0;
    return { name, mag, alt, az, x: p.x, y: p.y, vr: vrFor(mag), isPlanet: true, isMoon: false };
  });

  const moon = moonRaDec(when);
  const { alt, az } = altAz(moon.ra, moon.dec, obs.lat, obs.lon, when);
  const p = project(alt, az, W, H);
  const moonBody: BodyPos = {
    name: 'Moon', mag: MOON_MAG, alt, az, x: p.x, y: p.y, vr: MOON_VR,
    isPlanet: false, isMoon: true,
  };

  return {
    bodies: [...stars, ...planets, moonBody],
    faint,
    moonPhase: { illum: moon.illum, waxing: moon.waxing },
  };
}

/** Nearest body under the cursor, within `max` px — the same 22px hit radius
 *  the prototype used for star hover. Returns -1 when nothing is close enough. */
export function nearestBody(bodies: BodyPos[], mx: number, my: number, max = 22): number {
  let best = -1;
  let bd = max * max;
  bodies.forEach((s, i) => {
    const dx = s.x - mx, dy = s.y - my, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** Distance from a point to a line SEGMENT (not an infinite line) — used to
 *  hover-test the drawn portion of a constellation line. */
function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
  if (L2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / L2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Which constellation, if any, is under the cursor — hit-tests only the
 *  portion of each segment that has actually drawn in at `scrollT`. Returns
 *  null before anything meaningful has drawn yet. */
export function figureAt(
  bodies: BodyPos[],
  scrollT: number,
  mx: number,
  my: number,
  tol = 9,
): string | null {
  if (scrollT < 0.04) return null;
  const byName = new Map(bodies.map((b) => [b.name, b]));
  let best: string | null = null;
  let bd = tol;
  for (const seg of SEGMENTS) {
    const a = byName.get(seg.a), b = byName.get(seg.b);
    if (!a || !b) continue;
    const ex = a.x + (b.x - a.x) * scrollT;
    const ey = a.y + (b.y - a.y) * scrollT;
    const d = distToSeg(mx, my, a.x, a.y, ex, ey);
    if (d < bd) { bd = d; best = seg.name; }
  }
  return best;
}

/** Alt/az graticule — altitude rings at 60/30/0/-15° and azimuth spokes every
 *  30°, plus a zenith reticle. This is the INSTRUMENT: it never moves, the sky
 *  drifts through it exactly like the reticle in a real eyepiece. Altitude
 *  labels only, deliberately no N/E/S/W — a fixed frame cannot honestly say
 *  "north" once travel has turned the sky, but altitude above the horizon
 *  stays true at any bearing. */
export function drawGraticule(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  colors: { muted: string },
): void {
  const GR = Math.hypot(W, H) * 0.52, cx = W / 2, cy = H / 2;
  const altR = (a: number) => ((90 - a) / (90 - FLOOR)) * GR;

  ctx.strokeStyle = colors.muted;
  ctx.lineWidth = 1;
  for (const a of [60, 30, 0, -15]) {
    ctx.globalAlpha = a === 0 ? 0.15 : 0.055; // the horizon ring is emphasised
    ctx.setLineDash(a === 0 ? [] : [2, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, altR(a), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.setLineDash([2, 8]);
  ctx.globalAlpha = 0.045;
  for (let az = 0; az < 360; az += 30) {
    const t = (az - 180) * D2R; // fixed to the instrument, not the sky
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(t) * altR(75), cy - Math.cos(t) * altR(75));
    ctx.lineTo(cx + Math.sin(t) * altR(FLOOR), cy - Math.cos(t) * altR(FLOOR));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.font = '500 8px ui-monospace,Menlo,monospace';
  ctx.textAlign = 'left';
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = colors.muted;
  for (const a of [60, 30, 0]) {
    ctx.fillText(a === 0 ? 'HORIZON' : `${a}°`, cx + 6, cy - altR(a) + 11);
  }

  ctx.globalAlpha = 0.2; // zenith reticle
  ctx.strokeStyle = colors.muted;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy); ctx.lineTo(cx - 2, cy);
  ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 7, cy);
  ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy - 2);
  ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 7);
  ctx.stroke();

  ctx.textAlign = 'start';
  ctx.globalAlpha = 1;
}

/** Full instrument-mode draw: constellation lines, graticule, faint field,
 *  named stars/planets/Moon (with the Moon's true terminator), persistent
 *  planet/Moon labels, and the hover readout. Star hover wins over a
 *  constellation hover when both are under the cursor. Draw order matches the
 *  prototype: constellation lines sit UNDER the graticule and the bodies, so
 *  named stars always read clearly on top of the instrument. */
export function drawFull(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bodies: BodyPos[],
  faint: FaintStarPos[],
  moonPhase: MoonPhase,
  scrollT: number,
  hoverIndex: number,
  hoverFig: string | null,
  mouse: { x: number; y: number },
  colors: { accent: string; muted: string },
): void {
  ctx.clearRect(0, 0, W, H);
  const { accent, muted } = colors;
  const byName = new Map(bodies.map((b) => [b.name, b]));

  // Constellations join progressively with scroll — every segment starts at
  // the same moment and finishes at the same moment, across the whole page.
  // (Sequential reveal gave each line ~2% of the page and they snapped.)
  if (scrollT > 0) {
    ctx.lineCap = 'round';
    for (const seg of SEGMENTS) {
      const a = byName.get(seg.a), b = byName.get(seg.b);
      if (!a || !b) continue;
      const lit = hoverFig === seg.name;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = (lit ? 0.95 : 0.3) * Math.min(1, scrollT * 6); // fade in over the first sixth
      ctx.lineWidth = lit ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * scrollT, a.y + (b.y - a.y) * scrollT);
      ctx.stroke();
    }
  }

  drawGraticule(ctx, W, H, colors);

  for (const f of faint) {
    if (f.alt < FLOOR) continue;
    const below = f.alt < 0 ? 0.22 : 1;
    ctx.globalAlpha = (0.3 - (f.mag - 3.6) * 0.055) * below;
    ctx.fillStyle = muted;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.mag < 4.6 ? 1.15 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // stars/planets/Moon — below-horizon ones are dimmed, not hidden (the wider field)
  for (let i = 0; i < bodies.length; i++) {
    const s = bodies[i];
    if (s.alt < FLOOR) continue;
    const below = s.alt < 0 ? 0.3 : 1;
    const a = starAlpha(s.mag) * below;
    const r = s.vr; // single source of truth for the painted radius

    if (s.isMoon) {
      // Real phase: the terminator is an ellipse whose semi-minor axis is
      // r·|1−2k| for illuminated fraction k. The lit limb faces the Sun,
      // which side waxing/waning tells us.
      const k = moonPhase.illum;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(255,246,232,0.10)'; // faint earthshine disc behind the lit portion
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      const side = moonPhase.waxing ? 1 : -1; // lit limb on the right if waxing
      ctx.fillStyle = i === hoverIndex ? accent : '#fff8ec';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, -Math.PI / 2, Math.PI / 2, side < 0); // the lit half
      ctx.ellipse(
        s.x, s.y, r * Math.abs(1 - 2 * k), r, 0,
        Math.PI / 2, -Math.PI / 2, (k > 0.5) === (side > 0),
      );
      ctx.fill();
      ctx.globalAlpha = a * 0.22;
      ctx.strokeStyle = '#fff8ec';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
      // planets read as small discs with a faint ring — steady, not point-like
      ctx.fillStyle = i === hoverIndex ? accent : s.isPlanet ? '#ffe9c4' : s.mag < 1.0 ? '#fff' : muted;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (s.isPlanet) {
        ctx.globalAlpha = a * 0.3;
        ctx.strokeStyle = '#ffe9c4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // persistent label for planets and the Moon — they earn a name without hover
    if ((s.isPlanet || s.isMoon) && s.alt > 0 && i !== hoverIndex) {
      ctx.globalAlpha = 0.42 + 0.25 * (s.alt / 90);
      ctx.fillStyle = '#ffe9c4';
      ctx.font = '500 9px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name.toUpperCase(), s.x, s.y + r + 11);
      ctx.textAlign = 'start';
    }

    // Bloom on the brightest stars. MUST be a radial gradient — a flat-alpha
    // disc has a hard edge and reads as a grey ring around the star, not a glow.
    if (s.mag < 0.6 && s.alt > 0) {
      const R = r * 4.2;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
      g.addColorStop(0, `rgba(255,255,255,${(a * 0.3).toFixed(3)})`);
      g.addColorStop(0.35, `rgba(255,255,255,${(a * 0.1).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // hover readout — star name wins over the constellation name when both are
  // under the cursor
  ctx.font = '500 11px ui-monospace,Menlo,monospace';
  if (hoverIndex >= 0) {
    const s = bodies[hoverIndex];
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.fillText(
      `${s.name.toUpperCase()}  ${s.mag.toFixed(2)}m  ALT ${s.alt.toFixed(0)}°${s.alt < 0 ? '  (BELOW HORIZON)' : ''}`,
      s.x + 12, s.y - 9,
    );
  } else if (hoverFig) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.fillText(hoverFig.toUpperCase(), mouse.x + 14, mouse.y - 10);
  }
  ctx.globalAlpha = 1;
}
