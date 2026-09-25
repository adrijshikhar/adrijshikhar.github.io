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

/** Painted radius from magnitude. The faint end was 1.4px, which is a single
 *  device pixel on a 1x display — below the size at which a dot reads as an
 *  object rather than as sensor noise. Floor is 1.55px: enough to read as an
 *  object, small enough that 106 of them do not fill the frame. */
/** 1.423 / 1.044 are 1.5 / 1.1 scaled by sqrt(0.9): painted ink goes as r², so a
 *  10% density reduction is a 5.13% radius reduction, not 10%. Scaling both terms
 *  keeps the magnitude-to-size relationship intact rather than flattening it. */
const vrFor = (mag: number): number => 1.423 + Math.max(0, 3.0 - mag) * 1.044;

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

/** Alpha from magnitude. The old ramp reached zero at mag 2.6 and clamped to a
 *  0.12 floor, so 46% of the catalogue — everything fainter than mag 2.0 — was
 *  painted at 0.12-0.18 alpha. Near-white at 0.12 over a near-black ground is
 *  dark grey, which is why the field read as empty.
 *
 *  Only the FLOOR is lifted (0.12 -> 0.30); the ramp's slope is left close to the
 *  original. That distinction is the whole fix. Widening the ramp to (3.3-m)/3.0
 *  was tried and read as noisy — it took the stars above 0.45 alpha from 25 to
 *  53, which measured as a doubling of pixels over alpha 110 on the canvas. The
 *  faint end was never the problem; inflating the middle of the range was. */
const starAlpha = (mag: number): number => Math.max(0.30, Math.min(1, (2.8 - mag) / 3.4));

/** Every colour the renderer paints with, resolved once per frame by the
 *  caller (SkyField.tsx) from CSS custom properties + the active `data-mode`.
 *  This module stays DOM-blind — it never reads `document` or `matchMedia`
 *  itself, it just paints whatever it's handed, so the same draw code
 *  produces the dark-mode "photographic sky" or the light-mode "engraved
 *  chart" purely from which strings it's given. */
export interface SkyColors {
  accent: string;
  /** Neutral ink for idle figures; omitted by legacy/light palettes. */
  idleConstellation?: string;
  /** Persistent body-name ink, independent of the body geometry. */
  label?: string;
  muted: string;
  /** Full-brightness star/bloom colour — white in dark mode, full ink in light mode. */
  bright: string;
  /** Moon's lit-limb fill + terminator-ring stroke. */
  moonLit: string;
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

/** Erase canvas ink under the reading column so text keeps its contrast.
 *
 *  `destination-out`, not a translucent wash on top: a wash ADDS a layer and
 *  leaves canvas alpha untouched, so it cannot lower what verify:legibility
 *  measures. Erasing actually removes ink.
 *
 *  Scoped to the column, not the viewport. It used to be full width, which
 *  erased 45% of every mark on the canvas — including the planet labels and the
 *  hover readout out in the empty margins, where there is no text to protect. */
let keepOutCanvas: HTMLCanvasElement | null = null;
let keepOutCtx: CanvasRenderingContext2D | null = null;

/** Erase canvas ink under the reading column so text keeps its contrast.
 *
 *  `destination-out`, rendered through a smooth 2D offscreen buffer in a single
 *  composite blit so there are zero stepped bands, zero horizontal seams, and
 *  zero artifacts crossing celestial landmarks outside the prose column. */
function applyKeepOut(ctx: CanvasRenderingContext2D, k: KeepOut, W: number): void {
  const strength = k.strength ?? 0.45;
  const feather = 140;
  const side = 40; // tightly bounds the column without spilling into empty sky
  const x0 = Math.max(0, k.x - side);
  const x1 = Math.min(W, k.x + k.w + side);
  const kw = Math.round(x1 - x0);
  const kh = Math.round(k.h + feather);
  if (kw <= 0 || kh <= 0) return;

  if (typeof document === 'undefined') return;

  if (!keepOutCanvas) {
    keepOutCanvas = document.createElement('canvas');
    keepOutCtx = keepOutCanvas.getContext('2d');
  }
  if (!keepOutCanvas || !keepOutCtx) return;

  if (keepOutCanvas.width < kw || keepOutCanvas.height < kh) {
    keepOutCanvas.width = Math.max(keepOutCanvas.width, kw);
    keepOutCanvas.height = Math.max(keepOutCanvas.height, kh);
  }

  // Clear scratch region
  keepOutCtx.clearRect(0, 0, kw, kh);

  // 1. Horizontal gradient envelope: smooth fade along left and right flanks
  const gHoriz = keepOutCtx.createLinearGradient(0, 0, kw, 0);
  gHoriz.addColorStop(0, 'rgba(0,0,0,0)');
  const sLeft = Math.min(0.48, side / kw);
  const sRight = Math.max(0.52, 1 - side / kw);
  gHoriz.addColorStop(sLeft, 'rgba(0,0,0,1)');
  gHoriz.addColorStop(sRight, 'rgba(0,0,0,1)');
  gHoriz.addColorStop(1, 'rgba(0,0,0,0)');
  keepOutCtx.fillStyle = gHoriz;
  keepOutCtx.fillRect(0, 0, kw, kh);

  // 2. Vertical gradient: smooth top feather over `feather` pixels
  keepOutCtx.globalCompositeOperation = 'source-in';
  const gVert = keepOutCtx.createLinearGradient(0, 0, 0, kh);
  const fStop = Math.min(0.99, feather / kh);
  gVert.addColorStop(0, 'rgba(0,0,0,0)');
  gVert.addColorStop(fStop, 'rgba(0,0,0,1)');
  gVert.addColorStop(1, 'rgba(0,0,0,1)');
  keepOutCtx.fillStyle = gVert;
  keepOutCtx.fillRect(0, 0, kw, kh);
  keepOutCtx.globalCompositeOperation = 'source-over';

  // 3. Composite onto destination canvas in one single smooth blit
  const prev = ctx.globalCompositeOperation;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = strength;
  ctx.drawImage(keepOutCanvas, 0, 0, kw, kh, x0, k.y - feather, kw, kh);
  ctx.globalAlpha = prevAlpha;
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
  /** Withheld from the default field: a loose dim star, not part of any drawn
   *  constellation. Flagged rather than removed because game.sync() pairs
   *  bodies[i] with game.stars[i] positionally and hoverIndex is an index into
   *  this same array — dropping entries would misalign both silently. */
  suppressed?: boolean;
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
/** Every star named in a FIGURES segment. Derived, not hand-listed, so it cannot
 *  drift from the constellations actually drawn. */
export const FIGURE_MEMBERS: ReadonlySet<string> = new Set(
  FIGURES.flatMap(([, segs]) => segs.flatMap(([a, b]) => [a, b])),
);

/** Default-field rule: the ambient sky draws CONSTELLATIONS ONLY — 59 of 96.
 *  All 37 loose stars, bright ones included, move to dark sky.
 *
 *  The rule is membership rather than magnitude because a magnitude cut cannot
 *  go any deeper without fragmenting the figures: every member is by definition
 *  an endpoint of a segment, so hiding one leaves a constellation line running
 *  to a star that is not painted. Cutting only the loose stars by brightness
 *  moved the field 67 -> 64, which is not a reduction anyone would notice.
 *
 *  Going below 59 would mean dropping whole figures. That is possible and keeps
 *  them intact, but which figures are above the horizon depends on the hour and
 *  the observer, so a fixed subset risks a default sky with almost nothing in
 *  it. Not done without deciding that trade deliberately. */
export const inDefaultField = (name: string, _mag: number): boolean =>
  FIGURE_MEMBERS.has(name);

export const SEGMENTS: Array<{ name: string; a: string; b: string }> = FIGURES.flatMap(
  ([name, segs]) => segs.map(([a, b]) => ({ name, a, b })),
);

const MOON_MAG = -8;
// Running the Moon's real magnitude (-12.7) through the star size curve
// produces an absurd disc — it's fixed at a plausible instrument radius instead.
const MOON_VR = 13;
/** Sun and Moon subtend almost the same angle from Earth (~0.5 deg), so they
 *  share a size. */
const SUN_VR = 13;
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
 *  every `main p`/`main li`/card on the home page: 0.5 keeps the
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
  // A suppressed star is not painted, so it must not be hoverable either —
  // otherwise the readout names a star the visitor cannot see.
  const i = nearestPoint(bodies, mx, my, max);
  return i >= 0 && bodies[i].suppressed ? -1 : i;
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

  ctx.font = '600 11px ui-monospace,Menlo,monospace';
  ctx.textAlign = 'left';
  ctx.globalAlpha = Math.min(1, 0.55 * K);
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
// ---------------------------------------------------------------------------
// High-Fidelity Celestial Vector Renderers (Planetary Globes & System)
// ---------------------------------------------------------------------------

function drawMoon(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  moonPhase: MoonPhase,
  isHovered: boolean,
  accent: string,
  moonLit: string,
  a: number,
  r: number,
): void {
  const k = moonPhase.illum;
  const side = moonPhase.waxing ? 1 : -1;
  const bRad = r * Math.abs(1 - 2 * k);

  // 1. Earthshine unlit disc: soft luminous unlit face as seen through binoculars
  ctx.save();
  ctx.globalAlpha = a * 0.14;
  ctx.fillStyle = moonLit;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Faint outer rim stroke
  ctx.globalAlpha = a * 0.28;
  ctx.strokeStyle = isHovered ? accent : moonLit;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Lit phase with real Lunar Maria
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, -Math.PI / 2, Math.PI / 2, side < 0);
  ctx.ellipse(
    s.x, s.y, bRad, r, 0,
    Math.PI / 2, -Math.PI / 2, (k > 0.5) === (side > 0),
  );
  ctx.closePath();
  ctx.clip(); // Clip to illuminated phase!

  // Fill lit background
  ctx.globalAlpha = a;
  ctx.fillStyle = isHovered ? accent : moonLit;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Major Lunar Maria (dark basalt plains on the illuminated surface)
  const mScale = r / 36;
  ctx.globalAlpha = a * 0.38;
  ctx.fillStyle = '#0b0f14';

  // Oceanus Procellarum
  ctx.save();
  ctx.translate(s.x - 10 * mScale, s.y - 4 * mScale);
  ctx.rotate(-0.26);
  ctx.beginPath();
  ctx.ellipse(0, 0, 12 * mScale, 16 * mScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mare Imbrium
  ctx.beginPath();
  ctx.arc(s.x - 4 * mScale, s.y - 14 * mScale, 9 * mScale, 0, Math.PI * 2);
  ctx.fill();

  // Mare Serenitatis
  ctx.beginPath();
  ctx.arc(s.x + 8 * mScale, s.y - 12 * mScale, 7 * mScale, 0, Math.PI * 2);
  ctx.fill();

  // Mare Tranquillitatis
  ctx.beginPath();
  ctx.arc(s.x + 12 * mScale, s.y - 2 * mScale, 8 * mScale, 0, Math.PI * 2);
  ctx.fill();

  // Mare Crisium
  ctx.beginPath();
  ctx.ellipse(s.x + 22 * mScale, s.y - 8 * mScale, 5 * mScale, 4 * mScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mare Fecunditatis
  ctx.beginPath();
  ctx.ellipse(s.x + 14 * mScale, s.y + 8 * mScale, 7 * mScale, 5 * mScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mare Nubium
  ctx.beginPath();
  ctx.arc(s.x - 5 * mScale, s.y + 12 * mScale, 7 * mScale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end clip

  // 3. Subtle terminator elliptical arc boundary rule
  ctx.globalAlpha = a * 0.45;
  ctx.strokeStyle = isHovered ? accent : '#61afef';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, bRad, r, 0, -Math.PI / 2, Math.PI / 2, (k > 0.5) === (side > 0));
  ctx.stroke();
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  sunColor: string,
  a: number,
  r: number,
): void {
  const scale = r / 18;

  // 1. Outer Chromosphere boundary ring: smooth continuous circular motion
  const now = typeof performance !== 'undefined' ? performance.now() : 0;
  // Circular rotation around Sun center (~18s per revolution)
  const rotAngle = (now * 0.00036) % (Math.PI * 2);

  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(rotAngle);
  ctx.globalAlpha = a * 0.45;
  ctx.strokeStyle = sunColor;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2.5 * scale, 3 * scale]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Eastern Limb Prominence Loop Arch (breaching into space)
  ctx.save();
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = sunColor;
  ctx.lineWidth = Math.max(1.1, 1.2 * scale);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s.x + 12.5 * scale, s.y - 12.5 * scale);
  ctx.bezierCurveTo(
    s.x + 18 * scale, s.y - 19 * scale,
    s.x + 23 * scale, s.y - 13.5 * scale,
    s.x + 16.5 * scale, s.y - 7 * scale,
  );
  ctx.stroke();

  ctx.strokeStyle = '#eda05b'; // warm prominence filament
  ctx.lineWidth = Math.max(0.6, 0.6 * scale);
  ctx.globalAlpha = a * 0.6;
  ctx.beginPath();
  ctx.moveTo(s.x + 13.5 * scale, s.y - 11 * scale);
  ctx.bezierCurveTo(
    s.x + 17 * scale, s.y - 15.5 * scale,
    s.x + 20.5 * scale, s.y - 12 * scale,
    s.x + 16 * scale, s.y - 7.5 * scale,
  );
  ctx.stroke();
  ctx.restore();

  // 3. Photosphere Globe
  ctx.save();
  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#121820'; // obsidian ground matching other planets
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isHovered ? accent : sunColor;
  ctx.lineWidth = Math.max(1.15, r * 0.08);
  ctx.stroke();

  // Clip to disc for surface magnetic structures
  ctx.beginPath();
  ctx.arc(s.x, s.y, r - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // Solar Equator Axis (7.25° tilt) in instrument slate
  ctx.strokeStyle = '#8b949e';
  ctx.globalAlpha = a * 0.3;
  ctx.lineWidth = 0.6;
  ctx.setLineDash([2 * scale, 2 * scale]);
  ctx.beginPath();
  ctx.moveTo(s.x - r, s.y - 2.3 * scale);
  ctx.lineTo(s.x + r, s.y + 2.3 * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Northern Filament Channel: Shaded plasma ribbon (like Jupiter's wave belts)
  ctx.fillStyle = sunColor;
  ctx.globalAlpha = a * 0.22;
  ctx.beginPath();
  ctx.moveTo(s.x - 14 * scale, s.y - 4 * scale);
  ctx.quadraticCurveTo(s.x - 7 * scale, s.y - 11 * scale, s.x, s.y - 5 * scale);
  ctx.quadraticCurveTo(s.x + 7 * scale, s.y + 1 * scale, s.x + 13 * scale, s.y - 3 * scale);
  ctx.lineTo(s.x + 13 * scale, s.y - 6 * scale);
  ctx.quadraticCurveTo(s.x + 7 * scale, s.y - 2 * scale, s.x, s.y - 8 * scale);
  ctx.quadraticCurveTo(s.x - 7 * scale, s.y - 14 * scale, s.x - 14 * scale, s.y - 7 * scale);
  ctx.closePath();
  ctx.fill();

  // Core dark absorption spine of the filament
  ctx.strokeStyle = sunColor;
  ctx.globalAlpha = a * 0.95;
  ctx.lineWidth = Math.max(1.1, 1.3 * scale);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s.x - 13 * scale, s.y - 5.5 * scale);
  ctx.quadraticCurveTo(s.x - 6.5 * scale, s.y - 11.5 * scale, s.x + 0.5 * scale, s.y - 5.5 * scale);
  ctx.quadraticCurveTo(s.x + 7.5 * scale, s.y + 0.5 * scale, s.x + 13.5 * scale, s.y - 3.5 * scale);
  ctx.stroke();

  // Secondary fibril
  ctx.lineWidth = Math.max(0.7, 0.75 * scale);
  ctx.globalAlpha = a * 0.55;
  ctx.beginPath();
  ctx.moveTo(s.x - 8 * scale, s.y - 3.5 * scale);
  ctx.quadraticCurveTo(s.x - 3 * scale, s.y - 7 * scale, s.x + 3 * scale, s.y - 2 * scale);
  ctx.stroke();

  // Southern Bipolar Active Region & Magnetic Coronal Arcade
  ctx.strokeStyle = sunColor;
  ctx.globalAlpha = a * 0.7;
  ctx.lineWidth = Math.max(0.7, 0.85 * scale);
  ctx.beginPath();
  ctx.moveTo(s.x - 6 * scale, s.y + 8 * scale);
  ctx.quadraticCurveTo(s.x - 1 * scale, s.y, s.x + 5 * scale, s.y + 10 * scale);
  ctx.stroke();

  ctx.globalAlpha = a * 0.45;
  ctx.lineWidth = Math.max(0.5, 0.6 * scale);
  ctx.setLineDash([1.5 * scale, 1.5 * scale]);
  ctx.beginPath();
  ctx.moveTo(s.x - 8 * scale, s.y + 9 * scale);
  ctx.quadraticCurveTo(s.x - 1 * scale, s.y - 3 * scale, s.x + 7 * scale, s.y + 11 * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active Sunspot Cores (warm amber #eda05b with obsidian umbra)
  ctx.globalAlpha = a * 0.95;
  ctx.fillStyle = '#eda05b';
  ctx.beginPath();
  ctx.arc(s.x - 6 * scale, s.y + 8 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.arc(s.x + 5 * scale, s.y + 10 * scale, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0b0f14';
  ctx.beginPath();
  ctx.arc(s.x - 6 * scale, s.y + 8 * scale, 1.3 * scale, 0, Math.PI * 2);
  ctx.arc(s.x + 5 * scale, s.y + 10 * scale, 1.0 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Brilliant White Micro-Flare Glint (#f5f4ef)
  ctx.fillStyle = '#f5f4ef';
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.arc(s.x - 1 * scale, s.y + 5 * scale, 1.3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5f4ef';
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = a * 0.75;
  ctx.beginPath();
  ctx.moveTo(s.x - 1 * scale, s.y + 2.5 * scale);
  ctx.lineTo(s.x - 1 * scale, s.y + 7.5 * scale);
  ctx.moveTo(s.x - 3.5 * scale, s.y + 5 * scale);
  ctx.lineTo(s.x + 1.5 * scale, s.y + 5 * scale);
  ctx.stroke();

  // Polar Plumes in instrument slate
  ctx.strokeStyle = '#8b949e';
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = a * 0.35;
  ctx.beginPath();
  ctx.moveTo(s.x - 9 * scale, s.y - 15 * scale);
  ctx.quadraticCurveTo(s.x, s.y - 13 * scale, s.x + 9 * scale, s.y - 15 * scale);
  ctx.moveTo(s.x - 9 * scale, s.y + 15 * scale);
  ctx.quadraticCurveTo(s.x, s.y + 13 * scale, s.x + 9 * scale, s.y + 15 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawSaturn(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  planetColor: string,
  a: number,
  r: number,
): void {
  const colour = isHovered ? accent : planetColor;
  const ringX = r * 1.55;
  const ringY = r * 0.47;
  const bodyR = r * SATURN_BODY_FRAC;

  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(-0.38);

  // 1. REAR RINGS (passing behind the globe)
  // Outer A Ring
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.2, r * 0.16);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX, ringY, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Inner B Ring (brighter)
  ctx.globalAlpha = a * 0.95;
  ctx.lineWidth = Math.max(1.5, r * 0.24);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX * 0.83, ringY * 0.83, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Crepe C Ring (faint)
  ctx.globalAlpha = a * 0.35;
  ctx.lineWidth = Math.max(0.8, r * 0.1);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX * 0.68, ringY * 0.68, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Globe Shadow cast onto rear ring
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = '#0b0f14';
  ctx.beginPath();
  ctx.ellipse(-bodyR * 0.25, -bodyR * 0.2, bodyR * 0.9, bodyR * 0.9, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // 2. GLOBE
  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#121820';
  ctx.beginPath();
  ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.15, r * 0.09);
  ctx.stroke();

  // Atmospheric cloud belts on globe
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, bodyR - 0.5, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = a * 0.6;
  ctx.lineWidth = Math.max(0.8, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(-bodyR, bodyR * 0.12);
  ctx.quadraticCurveTo(0, bodyR * 0.25, bodyR, bodyR * 0.12);
  ctx.stroke();
  ctx.globalAlpha = a * 0.4;
  ctx.beginPath();
  ctx.moveTo(-bodyR * 0.85, -bodyR * 0.25);
  ctx.quadraticCurveTo(0, -bodyR * 0.12, bodyR * 0.85, -bodyR * 0.25);
  ctx.stroke();
  ctx.restore();

  // 3. FRONT RINGS (passing in front of the globe)
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.2, r * 0.16);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX, ringY, 0, 0, Math.PI);
  ctx.stroke();

  ctx.globalAlpha = a * 0.95;
  ctx.lineWidth = Math.max(1.5, r * 0.24);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX * 0.83, ringY * 0.83, 0, 0, Math.PI);
  ctx.stroke();

  ctx.globalAlpha = a * 0.35;
  ctx.lineWidth = Math.max(0.8, r * 0.1);
  ctx.beginPath();
  ctx.ellipse(0, 0, ringX * 0.68, ringY * 0.68, 0, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawJupiter(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  planetColor: string,
  a: number,
  r: number,
): void {
  const colour = isHovered ? accent : planetColor;
  const globeR = r * 0.9;
  const scale = globeR / 18;

  // 1. Four Galilean Moons aligned along equator
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 3]);
  ctx.globalAlpha = a * 0.3;
  ctx.beginPath();
  ctx.moveTo(s.x - 58 * scale, s.y - 3.5 * scale);
  ctx.lineTo(s.x + 52 * scale, s.y + 3 * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Callisto
  ctx.globalAlpha = a * 0.75;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(s.x - 54 * scale, s.y - 3 * scale, 1.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Ganymede
  ctx.globalAlpha = a * 0.95;
  ctx.beginPath();
  ctx.arc(s.x - 34 * scale, s.y - 2 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Io (warm sulfur gold)
  ctx.fillStyle = '#e5c07b';
  ctx.beginPath();
  ctx.arc(s.x + 28 * scale, s.y + 1.5 * scale, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Europa (brilliant ice silver)
  ctx.fillStyle = '#e6edf3';
  ctx.globalAlpha = a * 0.85;
  ctx.beginPath();
  ctx.arc(s.x + 48 * scale, s.y + 2.5 * scale, 1.6 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 2. Jupiter Globe
  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#121820';
  ctx.beginPath();
  ctx.arc(s.x, s.y, globeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.15, r * 0.09);
  ctx.stroke();

  // Clip inside globe for atmospheric wave belts & Great Red Spot
  ctx.beginPath();
  ctx.arc(s.x, s.y, globeR - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // North Equatorial Belt (NEB) with wave
  ctx.fillStyle = colour;
  ctx.globalAlpha = a * 0.35;
  ctx.beginPath();
  ctx.moveTo(s.x - globeR, s.y - 4 * scale);
  ctx.quadraticCurveTo(s.x - 8 * scale, s.y - 2 * scale, s.x, s.y - 5 * scale);
  ctx.quadraticCurveTo(s.x + 8 * scale, s.y - 8 * scale, s.x + globeR, s.y - 4 * scale);
  ctx.lineTo(s.x + globeR, s.y - 8 * scale);
  ctx.lineTo(s.x - globeR, s.y - 8 * scale);
  ctx.closePath();
  ctx.fill();

  // South Equatorial Belt (SEB) with Red Spot notch
  ctx.beginPath();
  ctx.moveTo(s.x - globeR, s.y + 3 * scale);
  ctx.quadraticCurveTo(s.x - 6 * scale, s.y + 5 * scale, s.x + 2 * scale, s.y + 2 * scale);
  ctx.quadraticCurveTo(s.x + 10 * scale, s.y + 5 * scale, s.x + globeR, s.y + 3 * scale);
  ctx.lineTo(s.x + globeR, s.y + 8 * scale);
  ctx.lineTo(s.x - globeR, s.y + 8 * scale);
  ctx.closePath();
  ctx.fill();

  // Great Red Spot Storm Oval
  ctx.fillStyle = '#e06c75';
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = a * 0.95;
  ctx.beginPath();
  ctx.ellipse(s.x + 6 * scale, s.y + 5 * scale, 3.5 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Polar Shading
  ctx.fillStyle = colour;
  ctx.globalAlpha = a * 0.2;
  ctx.beginPath();
  ctx.arc(s.x, s.y - globeR, globeR * 0.5, 0, Math.PI * 2);
  ctx.arc(s.x, s.y + globeR, globeR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMars(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  a: number,
  r: number,
): void {
  const colour = isHovered ? accent : '#e06c75';
  const scale = r / 12;

  ctx.save();
  // Outer guide reticle ring
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.75;
  ctx.setLineDash([3 * scale, 4 * scale]);
  ctx.globalAlpha = a * 0.45;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Globe
  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#181318';
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.15, r * 0.1);
  ctx.stroke();

  // Clip inside globe for surface features
  ctx.beginPath();
  ctx.arc(s.x, s.y, r - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // North Polar Ice Cap (brilliant white #f5f4ef)
  ctx.fillStyle = '#f5f4ef';
  ctx.globalAlpha = a * 0.95;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y - r * 0.92, 5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Syrtis Major Planum (triangular dark albedo feature)
  ctx.fillStyle = colour;
  ctx.globalAlpha = a * 0.55;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y - 2 * scale);
  ctx.lineTo(s.x + 5 * scale, s.y + 4 * scale);
  ctx.lineTo(s.x - 3 * scale, s.y + 5 * scale);
  ctx.closePath();
  ctx.fill();

  // Southern terrain
  ctx.globalAlpha = a * 0.3;
  ctx.beginPath();
  ctx.moveTo(s.x - r, s.y + 7 * scale);
  ctx.quadraticCurveTo(s.x, s.y + 4 * scale, s.x + r, s.y + 8 * scale);
  ctx.lineTo(s.x + r, s.y + r);
  ctx.lineTo(s.x - r, s.y + r);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawVenus(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  planetColor: string,
  a: number,
  r: number,
): void {
  const colour = isHovered ? accent : planetColor;
  const k = s.illum ?? 0.7;
  const br = r * 0.9;
  const scale = br / 14;
  const bRad = br * Math.abs(1 - 2 * k);

  ctx.save();
  // 1. Brilliant 4-Point Optical Diffraction Diamond Glint (The Morning Star)
  ctx.strokeStyle = '#e6edf3';
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = a * 0.6;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y - 28 * scale);
  ctx.lineTo(s.x, s.y + 28 * scale);
  ctx.moveTo(s.x - 28 * scale, s.y);
  ctx.lineTo(s.x + 28 * scale, s.y);
  ctx.stroke();

  // Diagonal glint hairlines
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = a * 0.35;
  ctx.beginPath();
  ctx.moveTo(s.x - 12 * scale, s.y - 12 * scale);
  ctx.lineTo(s.x + 12 * scale, s.y + 12 * scale);
  ctx.moveTo(s.x + 12 * scale, s.y - 12 * scale);
  ctx.lineTo(s.x - 12 * scale, s.y + 12 * scale);
  ctx.stroke();

  // 2. Unlit Globe Outline
  ctx.globalAlpha = a * 0.4;
  ctx.fillStyle = 'rgba(240, 245, 255, 0.05)';
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(s.x, s.y, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Illuminated Cloud Deck with UV Chevron curves (Crescent Phase)
  ctx.beginPath();
  ctx.arc(s.x, s.y, br, -Math.PI / 2, Math.PI / 2);
  ctx.ellipse(s.x, s.y, bRad, br, 0, Math.PI / 2, -Math.PI / 2, k > 0.5);
  ctx.closePath();
  ctx.clip(); // Clip to illuminated phase!

  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#f0f4f8';
  ctx.beginPath();
  ctx.arc(s.x, s.y, br, 0, Math.PI * 2);
  ctx.fill();

  // UV chevron cloud curves
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.beginPath();
  ctx.moveTo(s.x - 8 * scale, s.y - 6 * scale);
  ctx.quadraticCurveTo(s.x, s.y - 3 * scale, s.x + 8 * scale, s.y - 6 * scale);
  ctx.moveTo(s.x - 10 * scale, s.y);
  ctx.quadraticCurveTo(s.x, s.y + 3 * scale, s.x + 10 * scale, s.y);
  ctx.moveTo(s.x - 8 * scale, s.y + 6 * scale);
  ctx.quadraticCurveTo(s.x, s.y + 9 * scale, s.x + 8 * scale, s.y + 6 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawMercury(
  ctx: CanvasRenderingContext2D,
  s: BodyPos,
  isHovered: boolean,
  accent: string,
  a: number,
  r: number,
): void {
  const colour = isHovered ? accent : '#9aa5b1';
  const scale = r / 8;

  ctx.save();
  // Outer guide ring
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.6;
  ctx.setLineDash([2 * scale, 3 * scale]);
  ctx.globalAlpha = a * 0.4;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Globe
  ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
  ctx.fillStyle = '#121820';
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.15, r * 0.12);
  ctx.stroke();

  // Caloris Basin concentric impact shock rings
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = a * 0.8;
  ctx.beginPath();
  ctx.arc(s.x - 2 * scale, s.y - 1 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 0.6;
  ctx.setLineDash([1.5 * scale, 1.5 * scale]);
  ctx.globalAlpha = a * 0.6;
  ctx.beginPath();
  ctx.arc(s.x - 2 * scale, s.y - 1 * scale, 4.2 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Micro-cratered limb ticks
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = a * 0.8;
  ctx.beginPath();
  ctx.moveTo(s.x + 6 * scale, s.y - 2 * scale);
  ctx.lineTo(s.x + 8 * scale, s.y - 2 * scale);
  ctx.moveTo(s.x + 5 * scale, s.y + 4 * scale);
  ctx.lineTo(s.x + 7.5 * scale, s.y + 4 * scale);
  ctx.stroke();

  ctx.restore();
}

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
    if (s.suppressed) continue;
    const below = s.alt < 0 ? 0.3 : 1;
    const a = Math.min(BODY_ALPHA_CAP, starAlpha(s.mag)) * below;
    const r = s.vr; // single source of truth for the painted radius
    const isHovered = i === hoverIndex;

    if (s.isMoon) {
      drawMoon(ctx, s, moonPhase, isHovered, accent, moonLit, a, r);
    } else if (s.isSun) {
      drawSun(ctx, s, isHovered, accent, colors.sun, a, r);
    } else if (s.name === 'Saturn') {
      drawSaturn(ctx, s, isHovered, accent, planet, a, r);
    } else if (s.name === 'Jupiter') {
      drawJupiter(ctx, s, isHovered, accent, planet, a, r);
    } else if (s.name === 'Mars') {
      drawMars(ctx, s, isHovered, accent, a, r);
    } else if (s.isPlanet && s.illum !== undefined && s.illum < 0.92 && r >= TERMINATOR_MIN_VR) {
      drawVenus(ctx, s, isHovered, accent, planet, a, r);
    } else if (s.name === 'Mercury') {
      drawMercury(ctx, s, isHovered, accent, a, r);
    } else {
      // General catalogue stars and fallback
      const colour = isHovered ? accent : s.mag < 1.0 ? bright : muted;
      if (colors.engraved && !s.isPlanet) {
        markStar(ctx, s.x, s.y, r, colour, a * (isHovered ? 1 : 0.95), true);
      } else {
        ctx.globalAlpha = a * (isHovered ? 1 : 0.95);
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (s.isPlanet) {
        ctx.globalAlpha = Math.min(0.65, a * 0.65);
        ctx.strokeStyle = planet;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // persistent label for planets, the Moon, and the Sun — they earn a name without hover.
    if ((s.isPlanet || s.isMoon || s.isSun) && s.alt > 0 && !isHovered) {
      ctx.globalAlpha = Math.min(0.85, 0.65 + 0.2 * (s.alt / 90));
      ctx.fillStyle = colors.label ?? planet;
      ctx.font = '600 11px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name.toUpperCase(), Math.round(s.x), Math.round(s.y + r + 11));
      ctx.textAlign = 'start';
    }
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
      ctx.strokeStyle = lit ? accent : (colors.idleConstellation ?? accent);
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
