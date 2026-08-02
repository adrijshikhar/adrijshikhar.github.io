/**
 * The orbital-mechanics easter egg: game state + its own draw pass, ported
 * from `stars.html`'s game-mode globals (`playing`, `tool`, `aim`, `links`,
 * `bursts`, `dragFrom`, `spin`) and the aim/flare portions of `draw()`.
 *
 * Kept out of `render.ts` on purpose — that module stays DOM-blind and
 * game-blind, drawing only the ambient/full sky. This module owns everything
 * interactive: it reads `render.ts`'s `BodyPos`/`SkyColors` types but never
 * imports React or touches the DOM itself (SkyField.tsx does that).
 */
import type { BodyPos, SkyColors, Observer } from './render';
import { fade } from './render';
import { FLOOR } from './projection';
import {
  gravityWell,
  gamePhysics,
  predictHit,
  launchMag,
  MAX_PULL_PX,
  BURST_LIFE,
  RESTITUTION,
  type GameStar,
  type Burst,
} from './physics';

export type Tool = 'sling' | 'draw';

export interface AimState {
  i: number;
  x: number;
  y: number;
}

export interface SpinState {
  x: number;
  y: number;
  lat: number;
  lon: number;
}

/** Degrees of travel per pixel dragged, draw-tool sky-travel. Deliberately
 *  slow — one screen-width drag should feel like crossing a region, not half
 *  the planet. */
const LON_PER_PX = 0.075;
const LAT_PER_PX = 0.045;

/** Same ceiling `render.ts` uses for the Moon/Venus/Jupiter (`BODY_ALPHA_CAP`)
 *  — game elements (aim UI, flares) are transient, but the brief calls them
 *  out explicitly, so every non-trivial `globalAlpha` in this module's draw
 *  pass is capped here too rather than assumed safe. */
const CAP = 0.5;
const capA = (v: number): number => Math.min(CAP, v);

/** Everything the easter egg needs to persist across animation frames,
 *  independent of React's render cycle — physics runs at 60fps and can't
 *  wait on a state setter. SkyField holds one instance in a ref and calls
 *  its methods directly; the handful of fields the UI needs (playing/tool/
 *  struck) are mirrored into React state by the caller when they change. */
export class SkyGame {
  playing = false;
  tool: Tool = 'sling';
  struck = 0;
  aim: AimState | null = null;
  dragFrom: number | null = null;
  spin: SpinState | null = null;
  links: Array<[number, number]> = [];
  bursts: Burst[] = [];
  stars: GameStar[] = [];

  private readonly onStrike: () => void;

  constructor(onStrike: () => void) {
    this.onStrike = onStrike;
  }

  /** Merge this frame's real-sky bodies into the persistent star list. The
   *  bodies array is always the same length and order (stars, then planets,
   *  then the Moon), so index `i` is a stable identity across frames — this
   *  is what lets `links`/`aim`/`dragFrom` reference stars by index safely.
   *
   *  A star in FLIGHT owns its own position — it is a free body, not an
   *  offset from the sky. Re-anchoring it here would teleport it mid-
   *  trajectory. Every other star keeps its cursor-spring offset from home,
   *  so browsing in draw mode survives the sky's continuous sidereal drift. */
  sync(bodies: readonly BodyPos[]): void {
    if (this.stars.length !== bodies.length) {
      this.stars = bodies.map((b) => this.toGameStar(b));
      return;
    }
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const s = this.stars[i];
      const inFlight = this.playing && this.tool === 'sling' && (s.vx !== 0 || s.vy !== 0);
      const dx = inFlight ? 0 : s.x - s.hx;
      const dy = inFlight ? 0 : s.y - s.hy;
      s.playable = b.alt >= FLOOR;
      s.hx = b.x;
      s.hy = b.y;
      s.vr = b.vr;
      s.r = b.vr + 3;
      if (!inFlight) {
        s.x = b.x + dx;
        s.y = b.y + dy;
      }
      // reset every frame before the gravity spring runs (see `tick`)
      s.tx = s.hx;
      s.ty = s.hy;
    }
  }

  private toGameStar(b: BodyPos): GameStar {
    return {
      name: b.name,
      x: b.x,
      y: b.y,
      hx: b.x,
      hy: b.y,
      tx: b.x,
      ty: b.y,
      vx: 0,
      vy: 0,
      vr: b.vr,
      r: b.vr + 3,
      m: 1 + Math.max(0, 3 - b.mag) * 0.9,
      playable: b.alt >= FLOOR,
    };
  }

  /** Advance physics one frame — only while playing, so an unfound easter egg
   *  never costs a visitor anything. Sling mode runs the free-body collision
   *  solver; draw mode runs the cursor-gravity spring, so browsing/linking
   *  stars still feels alive. Ages out expired flares either way. */
  tick(mouseX: number, mouseY: number): void {
    if (!this.playing) return;
    if (this.tool === 'sling') {
      gamePhysics(this.stars, this.bursts, () => {
        this.struck++;
        this.onStrike();
      });
    } else {
      gravityWell(this.stars, mouseX, mouseY);
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      this.bursts[i].age++;
      if (this.bursts[i].age > BURST_LIFE) this.bursts.splice(i, 1);
    }
  }

  enter(): void {
    this.playing = true;
    this.struck = 0;
    for (const s of this.stars) {
      s.vx = 0;
      s.vy = 0;
    }
  }

  /** Clears motion AND every drawing — a user-hit requirement, twice over,
   *  in the prototype's session ("reset must clear the drawing too"). */
  reset(): void {
    this.struck = 0;
    this.aim = null;
    this.dragFrom = null;
    this.links = [];
    this.bursts = [];
    for (const s of this.stars) {
      s.x = s.hx;
      s.y = s.hy;
      s.vx = 0;
      s.vy = 0;
    }
  }

  exit(): void {
    this.reset();
    this.playing = false;
    this.spin = null;
  }

  setTool(tool: Tool): void {
    this.tool = tool;
    this.aim = null;
    this.dragFrom = null;
    this.spin = null;
  }

  /** Nearest star within `max` px — no `playable` gate, matching the
   *  prototype: off-field stars project far outside the viewport in
   *  practice, so this never actually reaches one. */
  nearest(mx: number, my: number, max = 28): number {
    let best = -1;
    let bd = max * max;
    this.stars.forEach((s, i) => {
      const dx = s.x - mx;
      const dy = s.y - my;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  /** A press that HIT a star: sling mode grabs it (a star in flight is not
   *  stopped when grabbed — see `onPointerUp`), draw mode starts a link.
   *  The caller must have already resolved `i >= 0` via `nearest()` — a miss
   *  is handled by the caller (either as a no-op or as `startSpin`). */
  grab(i: number, x: number, y: number): void {
    if (this.tool === 'sling') {
      this.aim = { i, x, y };
    } else {
      this.dragFrom = i;
    }
  }

  onPointerUp(x: number, y: number): void {
    if (this.tool === 'sling') {
      if (!this.aim) return;
      const s = this.stars[this.aim.i];
      // Pull = how far the HAND has moved since grabbing, not star-relative
      // — a star already at speed would otherwise outrun the cursor and pin
      // power at 100%.
      const pullX = this.aim.x - x;
      const pullY = this.aim.y - y;
      const len = Math.hypot(pullX, pullY) || 1;
      const power = Math.min(1, len / MAX_PULL_PX);
      const mag = launchMag(power, s.m);
      // ADD the impulse to whatever the star was already doing, so
      // re-slinging a moving star curves it rather than resetting it. At
      // rest this is identical to the old behaviour, since vx/vy are 0.
      s.vx += (pullX / len) * mag;
      s.vy += (pullY / len) * mag;
      this.aim = null;
      return;
    }
    if (this.dragFrom == null) return;
    const j = this.nearest(x, y, 26);
    if (
      j >= 0 &&
      j !== this.dragFrom &&
      !this.links.some(([a, b]) => (a === this.dragFrom && b === j) || (a === j && b === this.dragFrom))
    ) {
      this.links.push([this.dragFrom, j]);
    }
    this.dragFrom = null;
  }

  /** Drag-the-sky travel: draw mode only, and only once the caller has
   *  confirmed the press missed every star (a hit is a link-draw instead). */
  startSpin(x: number, y: number, obs: Observer): void {
    this.spin = { x, y, lat: obs.lat, lon: obs.lon };
  }

  /** Returns the observer coordinates for this drag position, or `null` if
   *  no spin is in progress. One meaning: dragging the sky TRAVELS — east/
   *  west changes longitude, north/south changes latitude, the sky follows
   *  the hand. This changes which way you're FACING; it does not touch the
   *  underlying `sky` module in any way beyond the coordinates passed in. */
  updateSpin(x: number, y: number): Observer | null {
    if (!this.spin) return null;
    const lon = ((this.spin.lon + (x - this.spin.x) * LON_PER_PX + 540) % 360) - 180;
    const lat = Math.max(-90, Math.min(90, this.spin.lat - (y - this.spin.y) * LAT_PER_PX));
    return { lat, lon };
  }

  endSpin(): void {
    this.spin = null;
  }
}

/** Sling-mode aim UI + travel/draw links + collision flares — everything the
 *  ambient `drawFull`/`drawQuiet` passes don't know exists. Call this AFTER
 *  the ambient sky draw so the game overlay sits on top of stars/graticule. */
export function drawGame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  game: SkyGame,
  mouse: { x: number; y: number },
  colors: Pick<SkyColors, 'accent' | 'muted' | 'bright'>,
): void {
  const { accent, muted, bright } = colors;
  const stars = game.stars;

  drawLinks(ctx, game, mouse, accent);
  if (game.tool === 'sling' && game.aim) drawAim(ctx, W, H, game, stars[game.aim.i], mouse, accent, muted);
  drawBursts(ctx, game.bursts, stars, accent, bright);

  ctx.globalAlpha = 1;
}

/** User-drawn constellation links, plus the in-progress drag preview. Hidden
 *  while slinging — flying stars would stretch a link across the whole page. */
function drawLinks(
  ctx: CanvasRenderingContext2D,
  game: SkyGame,
  mouse: { x: number; y: number },
  accent: string,
): void {
  if (game.tool === 'sling') return;
  ctx.globalAlpha = capA(0.85);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.25;
  for (const [i, j] of game.links) {
    const a = game.stars[i];
    const b = game.stars[j];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  if (game.dragFrom != null) {
    const from = game.stars[game.dragFrom];
    if (from) {
      ctx.globalAlpha = capA(0.5);
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

/** Slingshot aim: power is a RING that fills around the star from the
 *  centre outward, direction is a dotted line running to the edge of the
 *  page. No band back to the cursor — that read as "hold and drag to
 *  charge" and pointed the wrong way. */
function drawAim(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  game: SkyGame,
  s: GameStar,
  mouse: { x: number; y: number },
  accent: string,
  muted: string,
): void {
  const aim = game.aim;
  if (!aim || !s) return;
  // identical to the launch: hand displacement since grab, not star-relative
  const pullX = aim.x - mouse.x;
  const pullY = aim.y - mouse.y;
  const len = Math.hypot(pullX, pullY) || 1;
  const power = Math.min(1, len / MAX_PULL_PX);

  // RESULTANT: existing velocity + the impulse about to be applied. For a
  // star at rest this is just the pull direction; for one in flight it's
  // the curve.
  const mag = launchMag(power, s.m);
  const rx = s.vx + (pullX / len) * mag;
  const ry = s.vy + (pullY / len) * mag;
  const rlen = Math.hypot(rx, ry) || 1;
  const dx = rx / rlen;
  const dy = ry / rlen; // unit resultant direction
  const moving = s.vx !== 0 || s.vy !== 0;

  // THE PULL — a solid line from the star to the cursor, anchored to the
  // star and trailing behind it by the drag, so it rides along with a
  // moving star instead of stretching back to a fixed cursor position.
  const bandX = s.x - pullX;
  const bandY = s.y - pullY;
  ctx.globalAlpha = capA(0.09 + 0.07 * power);
  ctx.strokeStyle = muted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(bandX, bandY);
  ctx.stroke();
  ctx.globalAlpha = capA(0.22);
  ctx.fillStyle = muted; // grab handle
  ctx.beginPath();
  ctx.arc(bandX, bandY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // the star's existing heading, so the curve being made is legible
  if (moving) {
    const vlen = Math.hypot(s.vx, s.vy) || 1;
    ctx.globalAlpha = capA(0.22);
    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 5]);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + (s.vx / vlen) * 70, s.y + (s.vy / vlen) * 70);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // trajectory: from the star to wherever it leaves the viewport
  let tEdge = Infinity;
  if (dx > 1e-6) tEdge = Math.min(tEdge, (W - s.x) / dx);
  else if (dx < -1e-6) tEdge = Math.min(tEdge, (0 - s.x) / dx);
  if (dy > 1e-6) tEdge = Math.min(tEdge, (H - s.y) / dy);
  else if (dy < -1e-6) tEdge = Math.min(tEdge, (0 - s.y) / dy);
  if (!isFinite(tEdge)) tEdge = 0;

  // will this shot hit anything? if so, the line is SOLID up to the target
  const hit = predictHit(game.stars, s, dx, dy, aim.i);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;

  if (hit) {
    ctx.globalAlpha = capA(0.3 + 0.55 * power); // confident: solid to the target
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + dx * hit.t, s.y + dy * hit.t);
    ctx.stroke();

    // AFTER THE IMPACT — where the shot itself ends up. Uses the identical
    // impulse maths as the collision solver, so the preview is the real
    // outcome, not an approximation.
    const cxp = s.x + dx * hit.t;
    const cyp = s.y + dy * hit.t;
    const tgt = game.stars[hit.i];
    const spd = rlen;
    const vx0 = dx * spd;
    const vy0 = dy * spd;
    const vn = -(vx0 * hit.nx + vy0 * hit.ny); // target is at rest
    if (vn < 0) {
      const e = RESTITUTION;
      const imp = (-(1 + e) * vn) / (1 / s.m + 1 / tgt.m);
      const ax = vx0 - (imp * hit.nx) / s.m;
      const ay = vy0 - (imp * hit.ny) / s.m; // shooter after
      const al = Math.hypot(ax, ay);
      if (al > 0.01) {
        const seg = Math.min(150, 24 + al * 9); // faster = longer ray
        ctx.globalAlpha = capA(0.22); // lighter than the approach
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cxp, cyp);
        ctx.lineTo(cxp + (ax / al) * seg, cyp + (ay / al) * seg);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Impact marker: NOT a full ring — an arc struck on the side that gets
    // hit, whose angular width and brightness both scale with how head-on
    // the collision is. A near-tangent graze draws a thin faint sliver; a
    // dead-centre hit draws a bright half-circle facing the incoming star.
    const o = game.stars[hit.i];
    const D = hit.directness; // 0 = tangent, 1 = head-on
    const MR = Math.max(7, o.vr + 4);
    const faceAng = Math.atan2(-hit.ny, -hit.nx);
    const span = (0.16 + 0.84 * D) * Math.PI; // sliver -> half circle

    ctx.strokeStyle = accent;
    ctx.globalAlpha = capA(0.1 + 0.3 * D); // faint guide ring
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(o.x, o.y, MR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = capA(0.35 + 0.65 * D); // the struck face
    ctx.lineWidth = 1 + 2 * D;
    ctx.beginPath();
    ctx.arc(o.x, o.y, MR, faceAng - span / 2, faceAng + span / 2);
    ctx.stroke();

    // impact normal: a short tick showing which way the target departs
    ctx.globalAlpha = capA(0.25 + 0.6 * D);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(o.x + hit.nx * MR, o.y + hit.ny * MR);
    ctx.lineTo(o.x + hit.nx * (MR + 6 + 10 * D), o.y + hit.ny * (MR + 6 + 10 * D));
    ctx.stroke();

    ctx.globalAlpha = capA(0.55 + 0.45 * D);
    ctx.fillStyle = accent;
    ctx.font = '500 9px ui-monospace,Menlo,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${o.name.toUpperCase()}  ${Math.round(D * 100)}%`, o.x, o.y - MR - 6);
    ctx.textAlign = 'start';
  } else {
    ctx.globalAlpha = capA(0.16 + 0.26 * power); // a miss: faint dotted only
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + dx * tEdge, s.y + dy * tEdge);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Power fills the DISC outward from the star, reaching the boundary at
  // 100%. No second ring at full charge — the fill touching the outline is
  // the tell. (Halo only on the ACTIVE star, per the user's rejection of a
  // ring on every hover — see nowhere else in this module.)
  const R = Math.max(9, s.vr + 6);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = capA(0.14);
  ctx.lineWidth = 1; // boundary
  ctx.beginPath();
  ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = capA(0.1 + 0.22 * power);
  ctx.fillStyle = accent; // the fill
  ctx.beginPath();
  ctx.arc(s.x, s.y, R * power, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = capA(0.3 + 0.55 * power);
  ctx.lineWidth = 1; // fill edge
  ctx.beginPath();
  ctx.arc(s.x, s.y, R * power, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = capA(0.95);
  ctx.fillStyle = accent;
  ctx.font = '500 9px ui-monospace,Menlo,monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(power * 100)}%`, s.x, s.y - R - 6);
  ctx.textAlign = 'start';
}

/** Not an explosion. What a bright point source does to a telescope: four
 *  DIFFRACTION SPIKES that stab out and retract, a light-echo wavefront that
 *  expands and thins, and radiation jets along each departure vector.
 *  Everything scales with `e`, the normalised impulse the solver actually
 *  applied — no geometry-dependent shaping (anisotropic flares were tried
 *  and rejected). */
function drawBursts(
  ctx: CanvasRenderingContext2D,
  bursts: readonly Burst[],
  stars: readonly GameStar[],
  accent: string,
  bright: string,
): void {
  for (const b of bursts) {
    const p = b.age / BURST_LIFE; // 0..1
    if (p > 1) continue;

    // spikes: snap out fast, retract slowly (envelope peaks at p~=0.12)
    const env = p < 0.12 ? p / 0.12 : Math.pow(1 - (p - 0.12) / 0.88, 1.7);
    const L = (7 + 46 * b.e) * env;
    if (L > 0.6) {
      ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const ang = b.rot + (k * Math.PI) / 2;
        const gx = Math.cos(ang);
        const gy = Math.sin(ang);
        const grad = ctx.createLinearGradient(b.x, b.y, b.x + gx * L, b.y + gy * L);
        grad.addColorStop(0, fade(bright, capA(0.55 * env * (0.4 + 0.6 * b.e))));
        grad.addColorStop(0.4, fade(bright, 0.22 * env));
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.5, (0.9 + 1.1 * b.e) * env);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + gx * L, b.y + gy * L);
        ctx.stroke();
      }
    }

    // light echo — a clean circular wavefront that expands and thins
    const R = 2 + Math.pow(p, 0.55) * (16 + 44 * b.e);
    ctx.globalAlpha = capA((1 - p) * (1 - p) * (0.22 + 0.4 * b.e));
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(0.35, 1.4 * (1 - p));
    ctx.beginPath();
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
    ctx.stroke();
    if (b.e > 0.45) {
      const R2 = 2 + Math.pow(Math.max(0, p - 0.14), 0.55) * (14 + 34 * b.e);
      ctx.globalAlpha = capA((1 - p) * (1 - p) * 0.16 * b.e);
      ctx.lineWidth = Math.max(0.3, 1.0 * (1 - p));
      ctx.beginPath();
      ctx.arc(b.x, b.y, R2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // COSMIC RADIATION — fine rays streaming out along where the momentum
    // actually went. Two cones, one per departing star, opening angle
    // widening as the hit gets more glancing. Deterministic per collision.
    if (p < 0.7) {
      const rf = 1 - p / 0.7;
      let h = b.seed;
      const rnd = (): number => {
        h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
        return (h >>> 8) / 16777216;
      };
      const cone = 0.55; // fixed spray, no geometry bias
      for (const [vx, vy] of [
        [b.ax, b.ay],
        [b.bx, b.by],
      ]) {
        const vl = Math.hypot(vx, vy);
        if (vl < 0.05) continue;
        const base = Math.atan2(vy, vx);
        const n = 3 + Math.round(6 * b.e);
        for (let k = 0; k < n; k++) {
          const a2 = base + (rnd() - 0.5) * cone;
          const speed = 0.5 + rnd();
          const r0 = 4 + p * (30 + 90 * b.e) * speed; // ray head travels out
          const seg = (5 + 22 * b.e) * speed * rf; // and trails behind it
          ctx.globalAlpha = capA(rf * rf * (0.1 + 0.3 * b.e) * (0.4 + 0.6 * speed));
          ctx.strokeStyle = bright;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a2) * r0, b.y + Math.sin(a2) * r0);
          ctx.lineTo(b.x + Math.cos(a2) * (r0 + seg), b.y + Math.sin(a2) * (r0 + seg));
          ctx.stroke();
        }
      }
    }

    // the two stars themselves flare — the energy went into them
    if (p < 0.5) {
      const f = (1 - p / 0.5) * b.e;
      for (const idx of [b.ia, b.ib]) {
        const st = stars[idx];
        if (!st) continue;
        ctx.globalAlpha = capA(f * 0.5);
        ctx.fillStyle = bright;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.vr * (1 + 1.1 * f), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
