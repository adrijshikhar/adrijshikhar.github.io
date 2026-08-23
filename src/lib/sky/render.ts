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
import {
  altAz, planetRaDec, moonRaDec, sunRaDec,
  BODY_KM, SATURN_RING_KM, apparentArcsec, planetIllum, D2R, AU_LY, AU_KM,
} from './astronomy';
import { project, FLOOR } from './projection';
import { DIST_LY } from './catalogue';

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
  /** J2000 right ascension (hours) and declination (degrees). Kept on the
   *  rendered body because true 3-D separation needs the direction vector, not
   *  just where the body landed on screen. */
  ra: number;
  dec: number;
  /** Distance from the Sun in light years. Absent when unknown. */
  distLy?: number;
}

export interface FaintStarPos {
  mag: number;
  alt: number;
  x: number;
  y: number;
}

/** Tiny seeded PRNG (same one the prototype used) so the faint field is
 *  reproducible across reloads instead of reshuffling on every visit. Shared
 *  with game.ts's collision-flare radiation jets — same generator, different seed. */
export function rnd(seed: number): () => number {
  let h = (seed * 2654435761) >>> 0;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h >>> 8) / 16777216;
  };
}

const R2D = 180 / Math.PI;

/** Faint field: deliberately EMPTY. There were 420 anonymous procedural stars
 *  here. They could not be hovered, named, or looked up, so on an instrument
 *  whose whole argument is that every mark is a true statement they were the one
 *  purely decorative element — and at 1px they read as dust on the display
 *  rather than as sky. Every dot on the canvas is now a catalogued object.
 *
 *  Kept as an empty export rather than deleted so the draw loops and the
 *  computeSky signature stay intact for whoever wants a real faint catalogue
 *  here later. Populate it and the renderer picks it up with no other change. */
export const FAINT_FIELD: Array<{ ra: number; dec: number; mag: number }> = [];

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
    return { name, mag, alt, az, ra, dec, distLy: DIST_LY[name], x: p.x, y: p.y, vr: vrFor(mag) };
  });
  const faint: FaintStarPos[] = FAINT_FIELD.map((f) => {
    const { alt, az } = altAz(f.ra, f.dec, obs.lat, obs.lon, when);
    const p = project(alt, az, W, H);
    return { mag: f.mag, alt, x: p.x, y: p.y };
  });
  return { pts, faint };
}

const starAlpha = (mag: number): number => Math.max(0.12, Math.min(1, (2.6 - mag) / 3.4));

/** Every colour the renderer paints with, resolved once per frame by the
 *  caller (SkyField.tsx) from CSS custom properties + the active `data-mode`.
 *  This module stays DOM-blind — it never reads `document` or `matchMedia`
 *  itself, it just paints whatever it's handed, so the same draw code
 *  produces the dark-mode "photographic sky" or the light-mode "engraved
 *  chart" purely from which strings it's given. */
export interface SkyColors {
  accent: string;
  muted: string;
  /** Full-brightness star/bloom colour — white in dark mode, full ink in light mode. */
  bright: string;
  /** Moon's lit-limb fill + terminator-ring stroke. */
  moonLit: string;
  /** Moon's earthshine disc — a low-alpha wash behind the lit limb. */
  moonGlow: string;
  /** Planet disc/ring/persistent-label colour. slate-300 (#CBD5E1, neutral like the Moon —
   *  Vega): planets shine by reflected sunlight, so they read cool, and A is
   *  visibly distinct from the near-white F the bright stars take. */
  planet: string;
  /** The Sun only. amber-300 (#FCD34D) — the Sun is a G-class star, so warm here is a
   *  same hue the chrome uses for Sun values, so the readout and the disc agree. */
  sun: string;
  /** Faint background field colour — already faded, since the faint field's
   *  per-star magnitude alpha still multiplies on top of it. */
  faint: string;
  /** Light mode draws an engraved chart, not a photographed sky. Colour alone
   *  can't carry that: a filled disc reads as a glowing star on black but as a
   *  dirt speck on cream, because a luminous point inverts to a hole, not to a
   *  drawn mark. So the glyph SHAPE changes too — bright stars become open
   *  rings (the star-chart convention) and the faint field thins out. */
  engraved: boolean;
}

/** Above this painted radius a star is drawn as an open ring in engraved mode.
 *  Below it a ring would collapse into a blob, so it stays a small solid dot. */
const ENGRAVED_RING_MIN_VR = 1.9;

/** Draw one catalogue star: a filled disc normally, an open ring when engraved
 *  and big enough to hold one. Shared by the quiet and full views so the two
 *  can't drift apart. */
function markStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vr: number,
  colour: string,
  alpha: number,
  engraved: boolean,
): void {
  if (engraved && vr >= ENGRAVED_RING_MIN_VR) {
    // Open ring: ink on the circumference only. Keeps the star's size legible
    // without laying down a solid dark blob over cream.
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = colour;
    ctx.lineWidth = Math.min(1.1, 0.45 + vr * 0.12);
    ctx.beginPath();
    ctx.arc(x, y, vr * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, vr, 0, Math.PI * 2);
  ctx.fill();
}

/** Blend `base` toward transparent at `alpha` (0–1) via CSS `color-mix` —
 *  works for any valid CSS colour string (hex, oklch, …), so one helper
 *  builds gradient/wash stops for both the dark and light palettes without
 *  the caller having to hand-format rgba() vs oklch() alpha strings. */
export function fade(base: string, alpha: number): string {
  if (alpha <= 0) return 'transparent';
  return `color-mix(in srgb, ${base} ${(alpha * 100).toFixed(2)}%, transparent)`;
}

/** Twilight. The one ambient light in the scene, anchored to the Sun's real
 *  computed position and driven by its real altitude — so the page is warm
 *  where the light actually comes from, and dark when the Sun is genuinely
 *  down. It replaced a fixed warm blob in the top-left corner, which was a
 *  glow from nowhere on a sky that claims to be true.
 *
 *  The ramp is the standard definition, not a taste curve: full strength with
 *  the Sun up, fading through civil/nautical/astronomical twilight, and out
 *  entirely at -18 degrees, which is where astronomical night begins and no
 *  sunlight reaches the sky. Below that the page is black because it should be.
 *
 *  The two modes state it differently, for the same reason the stars do. Dark
 *  mode EMITS: a soft bloom, because that is what light on black looks like.
 *  Light mode ENGRAVES: concentric rings spreading from the disc and fading as
 *  they go, which is how a printed chart draws radiance it cannot glow. A warm
 *  bloom on paper is a stain; a ring is a mark.
 *
 *  Geometry measured off the sprite, not guessed. The sheet blits into a 2r box,
 *  so in units of the painted radius the glyph is: orange disc to 0.53, then
 *  three dashed rings at 0.58 / 0.77 / 0.96, outermost ink at 1.01, ink about
 *  three quarters of each step. The ripple starts just past that and keeps the
 *  same 0.19 spacing, so it continues the glyph rather than orbiting it —
 *  getting these in the wrong units is what left a dead band around the Sun. */
const TWILIGHT_FLOOR = -18;
const GLOW_MAX_ALPHA = 0.115;
/** Engraved radiance: concentric dashed circles leaving the disc and fading as
 *  they spread — the Sun glyph's own language, continued outward. Measured off
 *  the icon rather than guessed: its dashes are arc segments with a SMALL gap
 *  (dash roughly 3x the gap), in two staggered rings sitting at 1.4-1.7x the
 *  disc radius. So the ripple starts outside that and reaches only ~4 radii,
 *  in Sun radii rather than viewport diagonal — at diagonal scale this was
 *  just the old corner wash wearing a different shape. */
const RING_COUNT = 3;
const RING_START = 1.12;
const RING_REACH = 1.55;
/** Quiet-mode draw: the faint field, the named stars, and the planets, Moon
 *  and Sun — the bodies that make it a sky on a given night rather than a
 *  generic starfield. What quiet still withholds is the *instrument*: no
 *  graticule, no constellations, no hover readout, no game.
 *
 *  Stars below the horizon (down to FLOOR) are drawn dimmer rather than
 *  hidden, matching the wider-than-horizon disc. */
/** A rectangle, in canvas pixels, where the sky must give way to reading.
 *
 *  Kept as a plain object on purpose: `render.ts` has to stay DOM-blind so
 *  `scripts/verify-sky.mjs` can import it under Node. The caller measures the
 *  reading column and passes numbers. */
export type KeepOut = { x: number; y: number; w: number; h: number; strength?: number };

/** Erase a fraction of the sky's own ink inside `k`.
 *
 *  This is `destination-out`, not a translucent wash on top. That distinction is
 *  the whole point: a wash ADDS a layer and leaves canvas alpha untouched, so
 *  text over it still fails the 169/255 ceiling. Erasing genuinely lowers the
 *  alpha `verify:legibility` samples, while leaving most of the sky visible.
 *
 *  FULL WIDTH, on purpose. An earlier version erased only a column-width band
 *  and feathered 96px at each side. Feathering does not remove a brightness
 *  step, it only softens its edge, so the result read as a vertical fade down
 *  both sides of the text — a lighting artifact with no cause in the sky. Erasing
 *  across the whole width has no vertical edge to notice at all.
 *
 *  Strength is deliberately low. Worst measured alpha with no keep-out was 193;
 *  at 0.45 that lands at ~106 against a ceiling of 169, so the sky keeps more
 *  than half its ink and still clears the contract with 63 to spare. Do not
 *  raise this to "be safe" — every point costs sky. */
function applyKeepOut(ctx: CanvasRenderingContext2D, k: KeepOut, W: number): void {
  const strength = k.strength ?? 0.45;
  const feather = 140;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'destination-out';

  // Vertical feather at the top edge only: that boundary is where the hero hands
  // over to the content, so a gradient there reads as the sky receding rather
  // than as a seam. The bottom simply runs to the end of the content.
  const top = ctx.createLinearGradient(0, k.y - feather, 0, k.y);
  top.addColorStop(0, 'rgba(0,0,0,0)');
  top.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = top;
  ctx.fillRect(0, k.y - feather, W, feather);

  ctx.fillStyle = `rgba(0,0,0,${strength})`;
  ctx.fillRect(0, k.y, W, k.h);

  ctx.globalCompositeOperation = prev;
}

export function drawQuiet(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bodies: BodyPos[],
  faint: FaintStarPos[],
  moonPhase: MoonPhase,
  colors: SkyColors,
  sprite?: PlanetSpriteRef | null,
  sunPhase = 0,
  keepOut?: KeepOut | null,
): void {
  ctx.clearRect(0, 0, W, H);

  for (const f of faint) {
    if (f.alt < FLOOR) continue;
    // Engraved mode drops the faintest half of the field. On black these are
    // atmospheric dust; on cream the same marks are just grubby stipple, and
    // they were the bulk of the ink on the page.
    if (colors.engraved && f.mag > 5.3) continue;
    const below = f.alt < 0 ? 0.22 : 1;
    const dust = colors.engraved ? 1.2 : 1; // ink on paper — see DESIGN.md

    ctx.globalAlpha = Math.min(1, (0.3 - (f.mag - 3.6) * 0.055) * below * dust);
    ctx.fillStyle = colors.faint;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.mag < 4.6 ? 1.15 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Same renderer the home page uses, with hover disabled. The per-body alpha
  // ceiling it applies is what keeps this safe over prose — these are the
  // routes that exist to be read.
  drawBodies(ctx, bodies, moonPhase, -1, colors, sprite);

  ctx.globalAlpha = 1;
  // Last: erase, so everything drawn above is thinned inside the reading column.
  if (keepOut) applyKeepOut(ctx, keepOut, W);
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
  /** The Sun. Drawn as a rayed disc: the rays break the silhouette, which is
   *  the only reason a body this small stays identifiable at 11px. */
  isSun: boolean;
  /** Illuminated fraction, 0..1. Inner planets show real crescents; outer ones
   *  sit at ~1 and draw full without needing a special case. */
  illum?: number;
  /** Distance from Earth in AU — solar-system bodies only. Its presence is what
   *  tells `separationLabel` to answer in km rather than light years. */
  au?: number;
}

/** The planet glyph sheet, loaded by SkyField (see planet-sprite.ts) and passed
 *  in as data so this module stays DOM-blind and importable under Node. */
export interface PlanetSpriteRef {
  image: CanvasImageSource;
  row: number;
  column: (name: string) => number | undefined;
}
export const SPRITE_CELL = 64;

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
/** Sun and Moon subtend almost the same angle from Earth (~0.5 deg), so they
 *  share a size. Rays then extend to ~1.05x beyond this. */
const SUN_VR = 11;
/** Planets are sized by APPARENT ANGULAR EXTENT, not brightness. Magnitude sizing
 *  made Saturn near-smallest because it is dim, when in fact its rings are the
 *  widest planetary feature in the sky. sqrt compresses the ~9x spread between
 *  Mars and Saturn into something drawable; 1.85 puts Saturn at ~12px, just under
 *  the Moon, which preserves the true ordering (Sun and Moon really are ~45x
 *  larger than any planet). */
const APPARENT_SCALE = 1.85;
/** Saturn's globe as a fraction of its ring radius. True ratio is 17.9/42 = 0.43,
 *  but a 5px disc inside a 24px hoop reads as an empty ring rather than a planet,
 *  so the body is fattened. The astronomy stays exact where it is load-bearing
 *  (position, distance, the extent that decides Saturn is the biggest planet);
 *  only the split of that extent into ink is a legibility choice. */
const SATURN_BODY_FRAC = 0.62;
/** A terminator only means something if the crescent is wide enough to see.
 *  Below this radius the lit-fraction ellipse is a sub-pixel sliver off a dot,
 *  which reads as a rendering fault rather than a phase.
 *
 *  This gates on SIZE as well as phase because phase alone was not enough:
 *  Mars swings 0.877-0.986 illuminated and spends ~42% of its time under the
 *  0.92 phase gate, so for roughly five months in every two years it drew a
 *  bite out of a 4px disc. Mars peaks at 6.6px near opposition, so the
 *  threshold sits at 7 rather than 6 - the invariant caught that 6 still let
 *  it through. Venus reaches 14px and keeps its crescent; Mercury peaks at
 *  6.5px and now always draws a plain disc, which is right for the same
 *  reason: its crescent was equally invisible. */
const TERMINATOR_MIN_VR = 7;

function planetVr(name: string, au: number): number {
  const km = name === 'Saturn' ? SATURN_RING_KM : BODY_KM[name];
  if (!km) return vrFor(0);
  return Math.sqrt(apparentArcsec(km, au)) * APPARENT_SCALE;
}
const SUN_MAG = -26.7;

/** Ceiling on how opaque any single body (star, planet, or Moon) may draw in
 *  the full instrument view. `starAlpha`'s own clamp tops out at 1.0 — fully
 *  opaque — which every body brighter than mag -0.8 hits (the Moon at -8,
 *  Venus at -4.1, Jupiter at -2.2, but also ordinary catalogue stars like
 *  Sirius). The Moon's alt/az is real and time-varying, so it lands on
 *  different page content for different visitors; the field is background
 *  and must never fully occlude prose. Applied uniformly to every body here
 *  — not a Moon-only special case — so whichever body happens to be bright
 *  and well-placed today can't repeat this.
 *
 *  Picked by measurement (see task-7-report.md's fix addendum), driving the
 *  clock across a day and several dates and sampling `getImageData` over
 *  every `main p`/`main li`/`.atelier-card` on the home page: 0.5 keeps the
 *  Moon/Venus/Jupiter worst case (disc only now; earthshine and bloom are gone,
 *  layered case) at alpha ~137–153/255 in the worst positions found, under
 *  the ≤169 every other sampled element sits under. Left out of `starAlpha`
 *  itself (used by `drawQuiet` too) — quiet mode has no planets or Moon, and
 *  its ordinary stars were not part of what was flagged.
 *
 *  Note: the same sweep also turned up ordinary catalogue stars (Sirius,
 *  Alnitak, Sadr…) occasionally reaching 170–196 at multi-segment
 *  constellation vertices — that's independent of this cap (it reproduces
 *  even at BODY_ALPHA_CAP = 0, i.e. bodies invisible) and comes from
 *  multiple SEGMENTS strokes compositing at a shared vertex, a different
 *  mechanism this task wasn't asked to touch. Moon/Venus/Jupiter can never
 *  hit it — they aren't named in any FIGURES segment. */
const BODY_ALPHA_CAP = 0.5;

/** Build once per frame and thread through — every SEGMENTS lookup by name
 *  otherwise rebuilds the same map. */
export function bodyIndex(bodies: BodyPos[]): Map<string, BodyPos> {
  return new Map(bodies.map((b) => [b.name, b]));
}

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
  const stars: BodyPos[] = pts.map((s) => ({ ...s, isPlanet: false, isMoon: false, isSun: false }));

  const planets: BodyPos[] = Object.keys(PLANETS).map((name) => {
    const { ra, dec, au } = planetRaDec(name, when);
    const { alt, az } = altAz(ra, dec, obs.lat, obs.lon, when);
    const p = project(alt, az, W, H);
    const mag = PLANETS[name][2] ?? 0;
    return {
      name, mag, alt, az, ra, dec, x: p.x, y: p.y,
      vr: planetVr(name, au), isPlanet: true, isMoon: false, isSun: false,
      illum: planetIllum(name, au),
      au, distLy: au * AU_LY,
    };
  });

  const moon = moonRaDec(when);
  const { alt, az } = altAz(moon.ra, moon.dec, obs.lat, obs.lon, when);
  const p = project(alt, az, W, H);
  const moonAu = moon.km / AU_KM;
  const moonBody: BodyPos = {
    name: 'Moon', mag: MOON_MAG, alt, az, ra: moon.ra, dec: moon.dec, x: p.x, y: p.y, vr: MOON_VR,
    isPlanet: false, isMoon: true, isSun: false,
    au: moonAu, distLy: moonAu * AU_LY,
  };

  // The Sun. Below the horizon it dims like everything else, which is exactly
  // the point: it is the body that explains why the rest of the sky is visible.
  const sunPos = sunRaDec(when);
  const sunAA = altAz(sunPos.ra, sunPos.dec, obs.lat, obs.lon, when);
  const sp = project(sunAA.alt, sunAA.az, W, H);
  const sunBody: BodyPos = {
    name: 'Sun', mag: SUN_MAG, alt: sunAA.alt, az: sunAA.az, ra: sunPos.ra, dec: sunPos.dec,
    x: sp.x, y: sp.y, vr: SUN_VR, isPlanet: false, isMoon: false, isSun: true,
    au: 1, distLy: AU_LY,
  };

  return {
    bodies: [...stars, ...planets, moonBody, sunBody],
    faint,
    moonPhase: { illum: moon.illum, waxing: moon.waxing },
  };
}

/** Nearest indexed point within `max` px of (mx, my) — shared by star hover
 *  (`nearestBody`, 22px) and the game's grab/link hit-test (`SkyGame.nearest`,
 *  28px), which otherwise duplicated this exact scan. */
export function nearestPoint<T extends { x: number; y: number }>(
  points: readonly T[],
  mx: number,
  my: number,
  max: number,
): number {
  let best = -1;
  let bd = max * max;
  points.forEach((p, i) => {
    const dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** Nearest body under the cursor, within `max` px — the same 22px hit radius
 *  the prototype used for star hover. Returns -1 when nothing is close enough. */
export function nearestBody(bodies: BodyPos[], mx: number, my: number, max = 22): number {
  return nearestPoint(bodies, mx, my, max);
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
 *  null before anything meaningful has drawn yet. `byName` is a `bodyIndex()`
 *  built once per frame by the caller, not rebuilt here. */
export function figureAt(
  byName: Map<string, BodyPos>,
  scrollT: number,
  mx: number,
  my: number,
  tol = 9,
): string | null {
  if (scrollT < 0.04) return null;
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
  colors: { muted: string; engraved?: boolean },
): void {
  const K = colors.engraved ? 1.35 : 1; // ink on paper — see DESIGN.md
  const GR = Math.hypot(W, H) * 0.52, cx = W / 2, cy = H / 2;
  const altR = (a: number) => ((90 - a) / (90 - FLOOR)) * GR;

  ctx.strokeStyle = colors.muted;
  for (const a of [60, 30, 0, -15]) {
    const horizon = a === 0;
    ctx.globalAlpha = (horizon ? 0.26 : 0.105) * K;
    ctx.lineWidth = horizon ? 1.25 : 1;
    ctx.setLineDash(a === -15 ? [2, 6] : []);
    ctx.beginPath();
    ctx.arc(cx, cy, altR(a), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  ctx.setLineDash([2, 8]);
  ctx.globalAlpha = 0.06 * K;
  for (let az = 0; az < 360; az += 30) {
    const t = (az - 180) * D2R; // fixed to the instrument, not the sky
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(t) * altR(75), cy - Math.cos(t) * altR(75));
    ctx.lineTo(cx + Math.sin(t) * altR(FLOOR), cy - Math.cos(t) * altR(FLOOR));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.3 * K;
  for (let az = 0; az < 360; az += 10) {
    const t = (az - 180) * D2R;
    const major = az % 30 === 0;
    const r0 = altR(0), len = major ? 7 : 3.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(t) * r0, cy - Math.cos(t) * r0);
    ctx.lineTo(cx + Math.sin(t) * (r0 + len), cy - Math.cos(t) * (r0 + len));
    ctx.stroke();
  }

  ctx.font = '500 8px ui-monospace,Menlo,monospace';
  ctx.textAlign = 'left';
  ctx.globalAlpha = Math.min(1, 0.34 * K);
  ctx.fillStyle = colors.muted;
  for (const a of [60, 30, 0]) {
    ctx.fillText(a === 0 ? 'HORIZON' : `${a}°`, cx + 6, cy - altR(a) + 11);
  }

  ctx.globalAlpha = Math.min(1, 0.3 * K); // zenith reticle
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
/** Paints stars, planets, the Moon and the Sun — the one body renderer, shared
 *  by both views so a planet can never look like two different objects
 *  depending on which page you are on. Everything above it (graticule,
 *  constellations) and below it (hover readout) belongs to `drawFull` alone.
 *
 *  `hoverIndex` is -1 in quiet mode, which disables every hover branch. */
export function drawBodies(
  ctx: CanvasRenderingContext2D,
  bodies: BodyPos[],
  moonPhase: MoonPhase,
  hoverIndex: number,
  colors: SkyColors,
  sprite?: PlanetSpriteRef | null,
): void {
  const { accent, muted, bright, moonLit, planet } = colors;

  for (let i = 0; i < bodies.length; i++) {
    const s = bodies[i];
    if (s.alt < FLOOR) continue;
    const below = s.alt < 0 ? 0.3 : 1;
    const a = Math.min(BODY_ALPHA_CAP, starAlpha(s.mag)) * below;
    const r = s.vr; // single source of truth for the painted radius

    if (s.isMoon) {
      // Real phase: the terminator is an ellipse whose semi-minor axis is
      // r·|1−2k| for illuminated fraction k. The lit limb faces the Sun,
      // which side waxing/waning tells us.
      const k = moonPhase.illum;
      ctx.globalAlpha = a;
      // No earthshine disc: glow is gone from every body, so the Moon is the
      // terminator and nothing else. The unlit side is simply not drawn.
      const side = moonPhase.waxing ? 1 : -1; // lit limb on the right if waxing
      ctx.fillStyle = i === hoverIndex ? accent : moonLit;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, -Math.PI / 2, Math.PI / 2, side < 0); // the lit half
      ctx.ellipse(
        s.x, s.y, r * Math.abs(1 - 2 * k), r, 0,
        Math.PI / 2, -Math.PI / 2, (k > 0.5) === (side > 0),
      );
      ctx.fill();
      ctx.globalAlpha = a * 0.22;
      ctx.strokeStyle = moonLit;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const colour = i === hoverIndex ? accent : s.isSun ? colors.sun : s.isPlanet ? planet : s.mag < 1.0 ? bright : muted;
      let drawn = false;

      // Glyph sheet first. Six bodies draw from it; the Moon never does, its
      // identity being a live terminator a raster cannot carry. Falls through
      // to the computed silhouettes below while the sheet is still loading, or
      // if the fetch failed -- so the sky is never blank waiting on an image.
      const spriteCol = sprite && !s.isMoon ? sprite.column(s.name) : undefined;
      if (sprite && spriteCol !== undefined) {
        const d = r * 2;
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.drawImage(
          sprite.image,
          spriteCol * SPRITE_CELL, sprite.row * SPRITE_CELL, SPRITE_CELL, SPRITE_CELL,
          s.x - r, s.y - r, d, d,
        );
        drawn = true;
      }

      // Silhouette glyphs. Only three bodies get one, and only because each has
      // a real feature that survives ~10px: the Sun's rays and Saturn's ring
      // both extend BEYOND the disc (so they read at any size), and Jupiter's
      // bands terminate on the disc edge rather than fading (so they stay
      // crisp instead of blurring to grey). Mercury, Venus and Mars have no
      // such feature, so they stay plain discs -- inventing surface texture for
      // them would be decoration dressed as data.
      if (drawn) {
        // already painted from the sheet
      } else if (s.isSun) {
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(0.75, r * 0.085);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.62, 0, Math.PI * 2);
        ctx.stroke();
        const rays = 12;
        for (let k = 0; k < rays; k++) {
          const ang = (k / rays) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(s.x + Math.cos(ang) * r * 0.8, s.y + Math.sin(ang) * r * 0.8);
          ctx.lineTo(s.x + Math.cos(ang) * r * 1.05, s.y + Math.sin(ang) * r * 1.05);
          ctx.stroke();
        }
      } else if (s.name === 'Saturn') {
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(0.7, r * 0.085);
        // Back half of the ring, then the globe, then the front half. Drawing it
        // in three passes is what makes the ring read as passing BEHIND Saturn
        // rather than as a flat ellipse laid over it.
        const ringX = r;
        const ringY = r * 0.3;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(-0.38);
        ctx.beginPath();
        ctx.ellipse(0, 0, ringX, ringY, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * SATURN_BODY_FRAC, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(-0.38);
        ctx.beginPath();
        ctx.ellipse(0, 0, ringX, ringY, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      } else if (s.isPlanet && s.illum !== undefined && s.illum < 0.92 && r >= TERMINATOR_MIN_VR) {
        // A real terminator, same construction as the Moon's. Only the inner
        // planets ever get here: Mars sits at ~0.94 and the outer ones at 1.0,
        // so they fall through to a full disc without being special-cased.
        // This is Galileo's observation of Venus, drawn from live geometry.
        const k = s.illum;
        const br = r * 0.9;
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(0.7, r * 0.085);
        ctx.beginPath();
        ctx.arc(s.x, s.y, br, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(s.x, s.y, br, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(s.x, s.y, br * Math.abs(1 - 2 * k), br, 0, Math.PI / 2, -Math.PI / 2, k > 0.5);
        ctx.fill();
      } else if (s.name === 'Jupiter') {
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(0.7, r * 0.085);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.9, 0, Math.PI * 2);
        ctx.clip(); // bands stop at the limb, which is what keeps them crisp
        for (const off of [-0.34, 0.06, 0.42]) {
          ctx.beginPath();
          ctx.moveTo(s.x - r, s.y + r * off);
          ctx.lineTo(s.x + r, s.y + r * off);
          ctx.stroke();
        }
        ctx.restore();
      } else {
      // Planets keep their solid disc even when engraved — a filled disc against
      // ringed stars is exactly how a print chart distinguishes a planet from a
      // star, so here the shape difference is signal rather than noise.
      if (colors.engraved && !s.isPlanet) {
        markStar(ctx, s.x, s.y, r, colour, a * (i === hoverIndex ? 1 : 0.92), true);
      } else {
        ctx.globalAlpha = a * (i === hoverIndex ? 1 : 0.92);
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (s.isPlanet) {
        ctx.globalAlpha = a * 0.3;
        ctx.strokeStyle = planet;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      }
    }

    // persistent label for planets and the Moon — they earn a name without hover.
    // Same cap as the disc: near the zenith this formula alone reaches 0.67,
    // which is exactly the kind of "bright body over prose" the cap exists for.
    if ((s.isPlanet || s.isMoon || s.isSun) && s.alt > 0 && i !== hoverIndex) {
      ctx.globalAlpha = Math.min(BODY_ALPHA_CAP, 0.42 + 0.25 * (s.alt / 90));
      ctx.fillStyle = planet;
      ctx.font = '500 9px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name.toUpperCase(), s.x, s.y + r + 11);
      ctx.textAlign = 'start';
    }

    // No bloom. Bright bodies are discs at their real magnitude-scaled radius;
    // a radial halo was the last glow in the renderer and it is gone too.
  }
  ctx.globalAlpha = 1;
}

export function drawFull(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bodies: BodyPos[],
  byName: Map<string, BodyPos>,
  faint: FaintStarPos[],
  moonPhase: MoonPhase,
  scrollT: number,
  hoverIndex: number,
  hoverFig: string | null,
  mouse: { x: number; y: number },
  colors: SkyColors,
  sprite?: PlanetSpriteRef | null,
  sunPhase = 0,
  keepOut?: KeepOut | null,
): void {
  ctx.clearRect(0, 0, W, H);
  const { accent } = colors;

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
    if (colors.engraved && f.mag > 5.3) continue; // see drawQuiet: stipple on cream
    const below = f.alt < 0 ? 0.22 : 1;
    const dust = colors.engraved ? 1.2 : 1; // ink on paper — see DESIGN.md

    ctx.globalAlpha = Math.min(1, (0.3 - (f.mag - 3.6) * 0.055) * below * dust);
    ctx.fillStyle = colors.faint;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.mag < 4.6 ? 1.15 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // stars/planets/Moon — below-horizon ones are dimmed, not hidden (the wider field)
  drawBodies(ctx, bodies, moonPhase, hoverIndex, colors, sprite);

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
  if (keepOut) applyKeepOut(ctx, keepOut, W);
}
