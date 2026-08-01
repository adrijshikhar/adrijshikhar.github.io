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
import { STARS } from './catalogue';
import { altAz } from './astronomy';
import { project, FLOOR } from './projection';

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
