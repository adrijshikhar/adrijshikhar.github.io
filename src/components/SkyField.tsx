import { useEffect, useRef, useState } from 'react';
import {
  computeSky,
  computeFullSky,
  drawQuiet,
  drawFull,
  nearestBody,
  figureAt,
  bodyIndex,
  fade,
  type Observer,
  type SkyColors,
} from '../lib/sky/render';
import { gmstDeg } from '../lib/sky/astronomy';
import { SkyGame, drawGame, type Tool } from '../lib/sky/game';
import { animate, onScroll } from '../lib/motion';

interface SkyFieldProps {
  /** 'quiet' (every page): faint field + named stars, no interaction. 'full'
   *  (home page only): adds the alt/az graticule, planets, the Moon with a
   *  real phase, persistent labels, hover naming, the scroll-driven
   *  constellation reveal — and the orbital-mechanics easter egg (a discreet
   *  hook, bottom-right, that opens a slingshot/constellation-drawing mode). */
  mode: 'full' | 'quiet';
}

const DEFAULT_OBS: Observer = { lat: 12.9716, lon: 77.5946 }; // Bengaluru

/** Every game primitive already clamps its own `globalAlpha` to 0.5 (`capA`
 *  in game.ts), but overlapping draws in the SAME pass still composite —
 *  two 0.5 layers reach 0.75, four reach 0.94 — and a collision stacks a
 *  burst disc, its radiation jets, and the struck star's bloom in the same
 *  few pixels. A per-primitive cap cannot bound that composite, so the whole
 *  overlay is rendered to an offscreen canvas and blitted onto the main
 *  canvas ONCE at this alpha — four overlapping layers become one layer
 *  reaching the page. Value picked by measurement: a stacked burst drives the
 *  offscreen layer itself to near-opaque (measured ~0.95) in its hottest
 *  pixel, and the ambient sky underneath sits up to ~0.6 (152/255) at its own
 *  ceiling — composited (over-operator: src + dst·(1-src)) that bounds the
 *  page to `GAME_BLIT_ALPHA + 0.6·(1-GAME_BLIT_ALPHA)`, which only clears
 *  169/255 (~0.663) below about 0.16; this sits with margin under that. */
const GAME_BLIT_ALPHA = 0.12;

/** Every UI-visible piece of game state SkyField exposes to its JSX buttons,
 *  assigned once by the effect and invoked from onClick handlers outside it.
 *  Physics itself lives entirely inside the effect's closure (the `SkyGame`
 *  instance in `gameRef`) so 60fps updates never wait on a React re-render —
 *  only the handful of state changes the UI needs to reflect (playing/tool/
 *  struck) go through `setState`. */
interface GameControls {
  enter: () => void;
  reset: () => void;
  exit: () => void;
  setTool: (t: Tool) => void;
  home: () => void;
}

export default function SkyField({ mode }: SkyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<GameControls | null>(null);

  // The orbital-mechanics easter egg only exists on the full-instrument page.
  // Lazily created once per mount so both the effect's rAF loop and the JSX
  // buttons below share the exact same instance.
  const gameRef = useRef<SkyGame | null>(null);
  const [playing, setPlaying] = useState(false);
  const [tool, setTool] = useState<Tool>('sling');
  const [struck, setStruck] = useState(0);
  // The machine view is the raw-markdown surface; the sky and everything that
  // belongs to it are suppressed there. `#sky` is hidden in CSS, but the hook
  // and tool bar are separate nodes outside `.human-view`, so they need their
  // own gate — without it the hook stayed clickable over the machine view and
  // opened a game whose canvas was invisible, while `.playing` set
  // `user-select: none` and made the markdown uncopyable.
  const [machine, setMachine] = useState(false);
  // Observer coordinates, surfaced as the bottom-left instrument readout. Held
  // in React state (not read off `obs`) so the corner updates when the geo
  // lookup lands, without the canvas loop having to drive a DOM write.
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  // Kept separate from `coords` on purpose. `coords` is wherever the observer
  // currently IS; this is how we came to be there. Travelling the sky moves the
  // observer without a lookup ever succeeding, so conflating the two made the
  // readout claim 'geo' for a position the user had dragged to by hand - a lie
  // in the one element whose entire value is that it reports what is true.
  const [obsSource, setObsSource] = useState<'default' | 'geo' | 'travel'>('default');
  // Local sidereal time — the angle of sky currently overhead. This is the
  // number an observatory actually reads, and unlike a wall clock it is
  // genuinely tied to what the canvas is drawing: LST is what decides which
  // right ascension sits on the meridian. Ticked once a second, not per frame.
  const [lst, setLst] = useState<string>('--:--:--');
  if (mode === 'full' && !gameRef.current) {
    gameRef.current = new SkyGame(() => setStruck((n) => n + 1));
  }

  // Sidereal clock. Separate from the render effect so it survives mode
  // changes and never couples a 1Hz timer to the animation loop.
  useEffect(() => {
    if (mode !== 'full') return;
    let id = 0;
    const tick = () => {
      const lon = coords?.lon ?? DEFAULT_OBS.lon;
      // gmstDeg + longitude = local sidereal angle; /15 turns degrees into hours.
      const h = (((gmstDeg(new Date()) + lon) % 360) + 360) % 360 / 15;
      const hh = Math.floor(h);
      const mm = Math.floor((h - hh) * 60);
      const ss = Math.floor((((h - hh) * 60) - mm) * 60);
      const p = (n: number) => String(n).padStart(2, '0');
      setLst(`${p(hh)}:${p(mm)}:${p(ss)}`);
      id = window.setTimeout(tick, 1000);
    };
    tick();
    return () => window.clearTimeout(id);
  }, [mode, coords]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const obs: Observer = { ...DEFAULT_OBS };
    const home: Observer = { ...DEFAULT_OBS }; // the REAL observer — "home" travels back here
    const game = gameRef.current; // null in 'quiet' mode
    let W = 0;
    let H = 0;

    // Offscreen buffer the game overlay draws into instead of the main
    // canvas — see GAME_BLIT_ALPHA above for why. Created once (not
    // 'quiet' mode, which has no game) and resized alongside the main
    // canvas in `resize()`, never per frame.
    let gameCanvas: HTMLCanvasElement | null = null;
    let gameCtx: CanvasRenderingContext2D | null = null;
    if (mode === 'full' && game) {
      gameCanvas = document.createElement('canvas');
      gameCtx = gameCanvas.getContext('2d');
    }

    // Full mode only: hover is read at render time from the last known pointer
    // position rather than recomputed on every pointermove — bodies are
    // already recomputed every frame, so this avoids doing the hit-test twice.
    const mouse = { x: -1000, y: -1000 };
    // The readout claims to show the observer the sky is computed for, so it has
    // to follow sky travel, not just the initial geo lookup. Travel fires on
    // pointermove, though, and a setState per move would re-render the tree on
    // every frame of a drag - so publish at ~8Hz while dragging and settle on
    // the exact value when it ends.
    let coordsPublishedAt = 0;
    let homeSource: 'default' | 'geo' = 'default';
    const publishCoords = (
      lat: number, lon: number,
      source: 'default' | 'geo' | 'travel',
      force = false,
    ) => {
      const t = performance.now();
      if (!force && t - coordsPublishedAt < 120) return;
      coordsPublishedAt = t;
      setCoords({ lat, lon });
      setObsSource(source);
    };
    let hoverIndex = -1;
    let hoverFig: string | null = null;
    // Reduced motion: constellations render fully formed (no scroll-driven reveal).
    const scrollP = { t: reduced ? 1 : 0 };
    let scrollAnim: ReturnType<typeof animate> | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (gameCanvas && gameCtx) {
        // Same backing-store size and DPR transform as the main canvas, so
        // the single blit in renderFrame() is pixel-for-pixel, not a scale.
        gameCanvas.width = W * dpr;
        gameCanvas.height = H * dpr;
        gameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const renderFrame = () => {
      const cs = getComputedStyle(document.documentElement);
      // Read mode fresh every frame (and on the MutationObserver's forced
      // repaint below) rather than caching it — this is the one thing that
      // must be re-derived on every draw, not memoised across the effect's
      // lifetime, so toggling never leaves the canvas painting a stale mode.
      const light = document.documentElement.dataset.mode === 'light';
      const ink = cs.getPropertyValue('--sky-ink').trim(); // only defined under [data-mode="light"]
      const colors: SkyColors = {
        accent: cs.getPropertyValue('--accent').trim(),
        muted: cs.getPropertyValue('--muted').trim(),
        bright: light ? ink : '#fff',
        moonLit: light ? ink : '#fff8ec',
        moonGlow: light ? fade(ink, 0.1) : 'rgba(255,246,232,0.10)',
        planet: light ? ink : '#ffe9c4',
        // Faint field is dimmer still in light mode: dark marks compete with
        // dark text far more than light marks compete with a dark page, so
        // the base colour itself carries a low alpha on top of the per-star
        // magnitude alpha already applied where this is used.
        faint: light ? fade(ink, 0.3) : cs.getPropertyValue('--muted').trim(),
        // Light mode isn't dark mode with the colours swapped — a filled disc
        // that reads as a glowing star on black reads as a dirt speck on cream.
        // This tells the renderer to switch glyph shape, not just palette.
        engraved: light,
      };
      if (mode === 'full') {
        const { bodies, faint, moonPhase } = computeFullSky(obs, new Date(), W, H);
        if (game) {
          // Merge the real sky into the persistent game star list, then splice
          // the game's live positions back into `bodies` — `bodies` is a fresh
          // array `computeFullSky` builds every frame and throws away after
          // this draw, so overwriting it here is the one place physics reaches
          // the ambient renderer without `render.ts` having to know a game
          // exists. Integration itself lives in `loop()`, NOT here: renderFrame
          // is also called from resize, the mode observer, pointermove and the
          // geo callback, and stepping physics from each of those would tie the
          // simulation rate to the event rate (dragging the mouse literally ran
          // it at ~2x, worst under reduced motion where pointermove is the only
          // other driver).
          game.sync(bodies);
          for (let i = 0; i < bodies.length; i++) {
            bodies[i].x = game.stars[i].x;
            bodies[i].y = game.stars[i].y;
          }
        }
        // Constellation figures step aside during play: their vertices are the
        // very bodies physics is flinging around, so at scroll-bottom (t≈1) all
        // 47 segments would whip across the page chasing them.
        const figureT = game?.playing ? 0 : scrollP.t;
        const byName = bodyIndex(bodies); // built once, shared by figureAt and drawFull
        hoverIndex = nearestBody(bodies, mouse.x, mouse.y);
        // star hover wins over a constellation hover when both are under the cursor
        hoverFig = hoverIndex >= 0 ? null : figureAt(byName, figureT, mouse.x, mouse.y);
        drawFull(ctx, W, H, bodies, byName, faint, moonPhase, figureT, hoverIndex, hoverFig, mouse, colors);
        if (game && game.playing && gameCanvas && gameCtx) {
          // Ambient sky stays a direct draw (above); only the game overlay
          // goes through the offscreen buffer + single capped-alpha blit.
          gameCtx.clearRect(0, 0, W, H);
          drawGame(gameCtx, W, H, game, mouse, colors);
          ctx.globalAlpha = GAME_BLIT_ALPHA;
          ctx.drawImage(gameCanvas, 0, 0, W, H);
          ctx.globalAlpha = 1;
        }
        updateCursor();
      } else {
        const { pts, faint } = computeSky(obs, new Date(), W, H);
        drawQuiet(ctx, W, H, pts, faint, colors);
      }
    };

    // Custom cursor: dot snaps to the pointer, ring eases behind it. Only
    // relevant while playing — outside the game the page must look and
    // behave exactly as it does everywhere else, so this never runs then.
    let ringX = -100;
    let ringY = -100;
    const updateCursor = () => {
      if (!game?.playing) return;
      const ring = cursorRingRef.current;
      const dot = cursorDotRef.current;
      if (!ring || !dot) return; // one-frame gap before React mounts them
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      ringX += (mouse.x - ringX) * 0.22; // lag gives it weight
      ringY += (mouse.y - ringY) * 0.22;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
    };

    resize();
    renderFrame();

    // Respect prefers-reduced-motion: one static frame, no rAF loop — unless
    // the visitor explicitly opts in by clicking the egg (see `enter` below),
    // since that click, not page load, is the thing driving the motion.
    let rafId = 0;
    const loop = () => {
      // One integration step per displayed frame — the only place physics
      // advances, so the sim runs on the frame clock and nothing else.
      game?.tick(mouse.x, mouse.y);
      renderFrame();
      rafId = requestAnimationFrame(loop);
    };
    if (!reduced) {
      rafId = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      renderFrame();
    };
    window.addEventListener('resize', onResize);

    // ModeToggle flips data-mode live (no reload). renderFrame already
    // re-reads dataset.mode + getComputedStyle on every call, so the rAF loop
    // picks the swap up on its own next frame — but under reduced motion
    // there's no loop, so the toggle would otherwise sit stale until some
    // other listener (resize, pointermove) happened to fire one.
    const modeObserver = new MutationObserver(() => renderFrame());
    modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

    // ViewToggle flips `.machine-mode` on <body> to cross into the raw-markdown
    // view. Mirror it into React so the game UI unmounts, and bail out of a
    // game already in progress — otherwise `.playing` / `.cursor-custom` would
    // be stranded on a view that must stay plain and selectable.
    const syncMachine = () => {
      const on = document.body.classList.contains('machine-mode');
      setMachine(on);
      if (on && gameRef.current?.playing) controlsRef.current?.exit();
    };
    syncMachine();
    const machineObserver = new MutationObserver(syncMachine);
    machineObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Hover tracking — full mode only. Look-only outside the game: hover
    // names a body or a drawn constellation segment, nothing is draggable.
    const overUI = (e: PointerEvent): boolean => {
      const target = e.target as HTMLElement | null;
      return !!(target && typeof target.closest === 'function' && target.closest('a,button,input,textarea,select'));
    };

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (reduced) renderFrame(); // no rAF loop running to pick this up otherwise

      if (!game) return;
      if (game.spin) {
        const next = game.updateSpin(e.clientX, e.clientY);
        if (next) {
          obs.lat = next.lat;
          obs.lon = next.lon;
          publishCoords(next.lat, next.lon, 'travel');
          if (reduced) renderFrame();
        }
        return;
      }
      if (!game.playing) return;
      // custom-cursor state classes: over real UI, over a grabbable star
      const ui = overUI(e);
      document.body.classList.toggle('cur-ui', ui);
      document.body.classList.toggle('cur-star', !ui && game.nearest(e.clientX, e.clientY, 22) >= 0);
    };
    if (mode === 'full') {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    // --- orbital-mechanics interaction: sling / draw / travel -------------
    // Outside the game the sky is LOOK-ONLY: hover names things, nothing is
    // draggable, so reading the page can never accidentally grab a star.
    // Every listener below is a no-op unless `game.playing` (or, for the
    // travel-drag, unless a drag it started is in progress) — that's what
    // keeps normal browsing behaviour untouched when the egg is unfound.
    const onPointerDown = (e: PointerEvent) => {
      if (!game || !game.playing || overUI(e)) return;
      // Suppress the native drag-select for ANY press in the play area, not
      // just ones that land on a star — a miss must not start highlighting
      // the page. Must run BEFORE the hit-test below.
      e.preventDefault();
      const i = game.nearest(e.clientX, e.clientY, 28);
      if (game.tool === 'draw' && i < 0) {
        // CHART MODE: a drag that misses every star turns the sky (browsing
        // normally never hijacks a drag — this only runs in the draw tool).
        game.startSpin(e.clientX, e.clientY, obs);
        document.body.classList.add('spinning');
        return;
      }
      if (i < 0) return;
      // A star in flight is NOT stopped when grabbed — see `game.onPointerUp`.
      game.grab(i, e.clientX, e.clientY);
      document.body.classList.add('grabbing');
    };

    const onPointerUp = (e: PointerEvent) => {
      document.body.classList.remove('grabbing');
      if (game?.spin) {
        game.endSpin();
        publishCoords(obs.lat, obs.lon, 'travel', true); // settle on the exact final position
        document.body.classList.remove('spinning');
      }
      if (!game || !game.playing) return;
      game.onPointerUp(e.clientX, e.clientY);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && game?.playing) controlsRef.current?.exit();
    };

    const onWindowPointerLeave = () => {
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
    };
    const onWindowPointerEnter = () => {
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = '1';
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
    };

    if (mode === 'full' && game) {
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('pointerleave', onWindowPointerLeave);
      window.addEventListener('pointerenter', onWindowPointerEnter);

      controlsRef.current = {
        enter: () => {
          game.enter();
          ringX = mouse.x;
          ringY = mouse.y;
          setPlaying(true);
          setStruck(0);
          document.body.classList.add('playing');
          document.documentElement.classList.add('cursor-custom');
          // Explicit opt-in: this click, not page load, starts motion — the
          // one case where the game must run even under reduced motion, or
          // clicking the egg would silently do nothing.
          if (reduced && !rafId) rafId = requestAnimationFrame(loop);
        },
        reset: () => {
          game.reset();
          setStruck(0);
        },
        exit: () => {
          game.exit();
          setPlaying(false);
          setTool('sling');
          document.body.classList.remove('playing', 'grabbing', 'spinning', 'cur-ui', 'cur-star');
          document.documentElement.classList.remove('cursor-custom');
          if (reduced) {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = 0;
            }
            renderFrame(); // paint the restored, static frame
          }
        },
        setTool: (t) => {
          game.setTool(t);
          setTool(t);
          document.body.classList.remove('spinning');
        },
        home: () => {
          obs.lat = home.lat;
          obs.lon = home.lon;
          publishCoords(home.lat, home.lon, homeSource, true);
          if (reduced) renderFrame();
        },
      };
    }

    // Scroll-driven constellation reveal — every one of the 47 segments draws
    // over the WHOLE scroll range simultaneously (see drawFull/figureAt),
    // eased toward the scroll position (sync: 0.14) rather than tracking the
    // scrollbar 1:1, which is what makes the reveal feel fluid rather than
    // jerky. Skipped entirely under reduced motion.
    if (mode === 'full' && !reduced) {
      scrollAnim = animate(scrollP, {
        t: [0, 1],
        ease: 'linear',
        autoplay: onScroll({ target: document.body, enter: 'top top', leave: 'bottom bottom', sync: 0.14 }),
      });
    }

    // Real location, best-effort — never block first paint on the network.
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 1200);
    fetch('/api/geo', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.latitude === 'number' && typeof j.longitude === 'number') {
          obs.lat = j.latitude;
          obs.lon = j.longitude;
          home.lat = j.latitude;
          home.lon = j.longitude;
          homeSource = 'geo';
          publishCoords(j.latitude, j.longitude, 'geo', true);
          if (reduced) renderFrame(); // no loop running to pick this up on its own
        }
      })
      .catch(() => {
        /* keep the Bengaluru fallback — geo is a nicety, not a dependency */
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      modeObserver.disconnect();
      machineObserver.disconnect();
      if (mode === 'full') window.removeEventListener('pointermove', onPointerMove);
      if (mode === 'full' && game) {
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('pointerleave', onWindowPointerLeave);
        window.removeEventListener('pointerenter', onWindowPointerEnter);
        controlsRef.current = null;
      }
      scrollAnim?.revert(); // tears down the linked anime.js ScrollObserver too
      window.clearTimeout(timeoutId);
      controller.abort();
      gameCanvas = null;
      gameCtx = null;
      // Leaving the game must restore the page completely, even on an
      // unmount mid-play (route change) rather than an explicit Exit click.
      document.body.classList.remove('playing', 'grabbing', 'spinning', 'cur-ui', 'cur-star');
      document.documentElement.classList.remove('cursor-custom');
    };
  }, [mode]);

  return (
    <>
      <canvas ref={canvasRef} id="sky" aria-hidden="true" className="fixed inset-0 -z-[1] pointer-events-none" />

      {/* Bottom-left instrument readout — the observer this sky is actually
          computed for. Not an atmospheric locale strip: the coordinates ARE
          the input to every star position on screen, so the page is telling
          you what it is showing you. Falls back to Bengaluru silently when the
          geo lookup 404s, and says so rather than implying a real fix. */}
      {mode === 'full' && !machine && (
        <div className="instrument instrument-l">
          <div>
            <span className="k">Observer</span>
            <b>
              {Math.abs((coords?.lat ?? DEFAULT_OBS.lat)).toFixed(2)}&deg;
              {(coords?.lat ?? DEFAULT_OBS.lat) >= 0 ? 'N' : 'S'}{' '}
              {Math.abs((coords?.lon ?? DEFAULT_OBS.lon)).toFixed(2)}&deg;
              {(coords?.lon ?? DEFAULT_OBS.lon) >= 0 ? 'E' : 'W'}
            </b>
          </div>
          <div>
            <span className="k">Sidereal</span>
            <b>{lst}</b>
          </div>
          <div>
            <span className="k">Source</span>
            <b>{obsSource}</b>
          </div>
        </div>
      )}

      {/* Bottom-right hint — the prototype's `.hint`. Tells you the instrument
          responds before you have touched it, which is the whole reason the
          sky is interactive at all. Sits above the easter-egg hook rather than
          replacing it: two instruments, one corner, stacked. */}
      {mode === 'full' && !machine && !playing && (
        <div className="instrument instrument-r">
          move &middot; stars bend
          <br />
          hover &middot; name it
        </div>
      )}

      {mode === 'full' && !machine && (
        <>
          {/* The hook — an easter egg, not a call to action. Nearly invisible
              until hovered; no label hints at what it opens. */}
          <button
            type="button"
            title="something else lives here"
            onClick={() => controlsRef.current?.enter()}
            aria-hidden={playing}
            tabIndex={playing ? -1 : 0}
            className={`fixed right-6 bottom-24 z-[45] font-mono text-[0.625rem] tracking-[0.18em] uppercase text-muted transition-opacity duration-500 hover:text-accent ${
              playing ? 'pointer-events-none opacity-0' : 'opacity-30 hover:opacity-100'
            }`}
          >
            ✦ orbital mechanics
          </button>

          {/* bottom-20, not bottom-6: ViewToggle (the human/machine pill) already
              owns fixed bottom-6 left-1/2, z-[1100] — sharing that spot would
              have it permanently paint over half the tool bar. */}
          {playing && (
            <div className="fixed left-1/2 bottom-20 z-[45] flex -translate-x-1/2 items-center gap-4 rounded-full border border-[color:var(--rule)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-2 font-mono text-[0.625rem] tracking-[0.14em] uppercase text-muted backdrop-blur-xl">
              <button
                type="button"
                aria-pressed={tool === 'sling'}
                onClick={() => controlsRef.current?.setTool('sling')}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  tool === 'sling' ? 'text-accent border-accent' : 'text-muted border-[color:var(--rule)]'
                }`}
              >
                sling
              </button>
              <button
                type="button"
                aria-pressed={tool === 'draw'}
                onClick={() => controlsRef.current?.setTool('draw')}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  tool === 'draw' ? 'text-accent border-accent' : 'text-muted border-[color:var(--rule)]'
                }`}
              >
                draw
              </button>
              {tool === 'draw' && (
                <button
                  type="button"
                  title="return to your own sky"
                  onClick={() => controlsRef.current?.home()}
                  className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-muted transition-colors hover:text-accent"
                >
                  home
                </button>
              )}
              {tool === 'sling' ? (
                <span>
                  <b className="text-heading font-medium">{struck}</b> struck
                </span>
              ) : (
                <span>drag star→star — link · drag sky — travel</span>
              )}
              <button
                type="button"
                onClick={() => controlsRef.current?.reset()}
                className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-muted transition-colors hover:text-accent"
              >
                reset
              </button>
              <button
                type="button"
                onClick={() => controlsRef.current?.exit()}
                className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-muted transition-colors hover:text-accent"
              >
                exit
              </button>
            </div>
          )}

          {playing && (
            <>
              <div ref={cursorRingRef} id="sky-cursor-ring" aria-hidden="true" />
              <div ref={cursorDotRef} id="sky-cursor-dot" aria-hidden="true" />
            </>
          )}
        </>
      )}
    </>
  );
}
