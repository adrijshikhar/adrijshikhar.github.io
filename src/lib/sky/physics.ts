/**
 * Slingshot game physics, ported from the `stars.html` prototype's
 * `physics()` / `gamePhysics()` / `predictHit()`. Pure numeric functions — no
 * DOM, no globals, no React. Deliberately mutates the star/burst arrays it's
 * given, matching the prototype: a 60fps integrator re-allocating fresh
 * objects every frame is both slower and a materially different (untested)
 * diff from the one that survived many rounds of interactive debugging. This
 * is a physics engine's hot path, not application state — the project's
 * usual immutable-update convention doesn't apply here.
 */

export interface GameStar {
  name: string;
  /** Live position — what's actually drawn. */
  x: number;
  y: number;
  /** Home — the true sky position for `name` this frame. The gravity
   *  spring's target is measured from here, never from `x`/`y`. */
  hx: number;
  hy: number;
  /** This frame's spring target (`hx`/`hy`, nudged by `gravityWell`). Reset
   *  to home at the top of every frame by the caller before the spring runs. */
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  /** Painted radius — single source of truth, shared with `r`. */
  vr: number;
  /** Collision radius: `vr + 3`. A flat radius once made Sirius bounce at
   *  17.6px while drawing at 3.7px — colliding with apparently empty space. */
  r: number;
  /** Mass, scaled by brightness — a bright star barely deflects on impact. */
  m: number;
  /** False for stars below the field floor: invisible, and must not act as
   *  phantom colliders. */
  playable: boolean;
  /** Carried through from the sky body so a drawn link can be labelled with
   *  the true 3-D separation, which needs the direction vector and distance —
   *  not the on-screen endpoints. */
  ra: number;
  dec: number;
  distLy?: number;
  au?: number;
}

export interface Burst {
  x: number;
  y: number;
  rot: number;
  /** Departure velocity of each star in the collision, for the radiation jets. */
  ax: number;
  ay: number;
  bx: number;
  by: number;
  age: number;
  ia: number;
  ib: number;
  /** Normalised impulse (0..1) — everything about the flare scales with this. */
  e: number;
  seed: number;
}

export interface HitResult {
  i: number;
  t: number;
  nx: number;
  ny: number;
  /** 1 = dead centre, 0 = pure tangent. Also what scales the collision's impulse. */
  directness: number;
}

const RADIUS = 150; // gravity well influence radius
const MAX_PULL = 6; // max px a star is ever displaced from home
/** Wobble amplitude scale. Applied to the whole displacement term rather than to
 *  MAX_PULL alone: for a star close to the cursor the `d * 0.9` branch is under
 *  the cap, so lowering only MAX_PULL would leave those stars moving exactly as
 *  far as before and the reduction would not be uniform. */
const WOBBLE_SCALE = 0.75;
/** Spring stiffness toward the target. Lowering this does not shrink the
 *  displacement — the star still converges on the same target — it slows the
 *  approach, so the sky lags further behind the cursor and the bend reads softer.
 *  Amplitude is WOBBLE_SCALE's job; this is the feel. */
const K = 0.105;
const DAMP = 0.78; // velocity retained per frame
/** Near-frictionless space, sling mode. Coast distance is v0 * DRAG/(1-DRAG),
 *  so this — not LAUNCH_SPEED — is the travel knob: 0.994 gave ~165x the launch
 *  speed (~1490px), 0.997 gives ~332x (~2990px). Raised here rather than
 *  raising LAUNCH_SPEED, which would buy the same distance by making stars
 *  faster, and 100%-power shots already read as too fast. */
const DRAG = 0.997;
export const MAX_PULL_PX = 110; // drag distance that reaches 100% power
/** Launch speed at 100% power for a mass-1 star, in px/frame. At 60fps:
 *  9px/frame ~= 540px/s ~= 2.2s to cross a 1200px viewport. */
const LAUNCH_SPEED = 9;
export const RESTITUTION = 0.94;
export const BURST_LIFE = 34; // frames

export const launchMag = (power: number, m: number): number => (power * LAUNCH_SPEED) / Math.sqrt(m);

/** Displacement-based, not force-based. The pull is measured from the star's
 *  HOME position, never its current one — measuring from the current
 *  position means moving closer increases the pull, which is a feedback loop
 *  and makes the whole field oscillate. Displacement is also clamped to
 *  min(MAX_PULL, d) so a star can never travel past the cursor and flip the
 *  force direction. */
export function gravityWell(stars: GameStar[], mouseX: number, mouseY: number): void {
  for (const s of stars) {
    let tx = s.tx;
    let ty = s.ty;
    const dx = mouseX - s.tx;
    const dy = mouseY - s.ty;
    const d = Math.hypot(dx, dy);
    if (d < RADIUS && d > 0.001) {
      const f = 1 - d / RADIUS;
      const amt = Math.min(MAX_PULL, d * 0.9) * f * f * WOBBLE_SCALE; // bounded, can't overshoot
      tx += (dx / d) * amt;
      ty += (dy / d) * amt;
    }
    s.vx = (s.vx + (tx - s.x) * K) * DAMP;
    s.vy = (s.vy + (ty - s.y) * K) * DAMP;
    s.x += s.vx;
    s.y += s.vy;
  }
}

/** Free bodies. Stars sit still at v=0 until something hits them.
 *  Impulse-based elastic collision, mass scaled by brightness, so slinging a
 *  bright star into a faint one sends the faint one flying and barely
 *  deflects the bright one. Off-field (non-`playable`) stars are excluded
 *  entirely — invisible, and were acting as phantom obstacles. `onStrike`
 *  fires once per star that wakes from rest, so the caller can bump a
 *  struck counter without this module knowing about one. */
export function gamePhysics(stars: GameStar[], bursts: Burst[], onStrike: () => void): void {
  for (const s of stars) {
    if (!s.playable) continue;
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= DRAG;
    s.vy *= DRAG;
    if (Math.abs(s.vx) < 0.004) s.vx = 0;
    if (Math.abs(s.vy) < 0.004) s.vy = 0;
  }

  // pairwise collisions — only between stars that are actually on screen
  for (let i = 0; i < stars.length; i++) {
    if (!stars[i].playable) continue;
    for (let j = i + 1; j < stars.length; j++) {
      const a = stars[i];
      const b = stars[j];
      if (!b.playable) continue;
      if (a.vx === 0 && a.vy === 0 && b.vx === 0 && b.vy === 0) continue; // both asleep
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const rr = a.r + b.r;
      const d2 = dx * dx + dy * dy;
      if (d2 > rr * rr || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      // push apart so they don't stick
      const overlap = (rr - d) / 2;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
      // impulse along the collision normal
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (vn > 0) continue; // already separating
      const e = RESTITUTION;
      const imp = (-(1 + e) * vn) / (1 / a.m + 1 / b.m);
      const wasAsleep = (b.vx === 0 && b.vy === 0) || (a.vx === 0 && a.vy === 0);
      a.vx -= (imp * nx) / a.m;
      a.vy -= (imp * ny) / a.m;
      b.vx += (imp * nx) / b.m;
      b.vy += (imp * ny) / b.m;
      if (wasAsleep) onStrike();

      // FLARE at the contact point. Captures the collision geometry so the
      // shape can express it: the impact orientation and where each star
      // actually departs to. (The normal/tangent pair itself is not stored —
      // `rot` is the only part of it the flare draws from.)
      bursts.push({
        x: a.x + nx * a.r,
        y: a.y + ny * a.r,
        rot: Math.atan2(ny, nx),
        ax: a.vx,
        ay: a.vy,
        bx: b.vx,
        by: b.vy, // departure vectors
        age: 0,
        ia: i,
        ib: j,
        e: Math.min(1, imp / 26),
        seed: ((i * 73856093) ^ (j * 19349663)) >>> 0,
      });
    }
  }
}

/** Ray-cast the launch to find the FIRST star the shot will actually strike —
 *  "does the swept path overlap the target", not "does the centre line cross
 *  it". Treats the moving star as a circle of radius `from.r`. */
export function predictHit(
  stars: GameStar[],
  from: GameStar,
  dx: number,
  dy: number,
  selfIdx: number,
): HitResult | null {
  let best: HitResult | null = null;
  for (let k = 0; k < stars.length; k++) {
    if (k === selfIdx) continue;
    const o = stars[k];
    if (!o.playable) continue;
    const ox = o.x - from.x;
    const oy = o.y - from.y;
    const tc = ox * dx + oy * dy; // closest approach along the ray
    if (tc <= 0) continue; // behind the shot
    const R = o.r + from.r; // Minkowski radius
    const perp = Math.abs(ox * dy - oy * dx);
    if (perp > R) continue; // swept circle misses it entirely
    // FIRST CONTACT, not closest approach — the moving circle touches here.
    const back = Math.sqrt(Math.max(0, R * R - perp * perp));
    const t = tc - back;
    if (t < 0) continue; // already overlapping
    if (best && t >= best.t) continue;
    // contact geometry: centre of the moving star at the moment of touch
    const cx = from.x + dx * t;
    const cy = from.y + dy * t;
    let nx = o.x - cx;
    let ny = o.y - cy;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl; // collision normal
    // how head-on is it? |n.d| = 1 dead centre, 0 pure tangent. This is
    // exactly the factor that scales the impulse in the collision solver.
    const directness = Math.abs(nx * dx + ny * dy);
    best = { i: k, t, nx, ny, directness };
  }
  return best;
}
