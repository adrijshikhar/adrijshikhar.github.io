import { useEffect, useRef } from 'react';
import {
  computeSky,
  computeFullSky,
  drawQuiet,
  drawFull,
  nearestBody,
  figureAt,
  bodyIndex,
  type Observer,
} from '../lib/sky/render';
import { animate, onScroll } from '../lib/motion';

interface SkyFieldProps {
  /** 'quiet' (every page): faint field + named stars, no interaction. 'full'
   *  (home page only): adds the alt/az graticule, planets, the Moon with a
   *  real phase, persistent labels, hover naming, and a scroll-driven
   *  constellation reveal. The orbital-mechanics game is a separate, later
   *  feature — this mode is look-only. */
  mode: 'full' | 'quiet';
}

const DEFAULT_OBS: Observer = { lat: 12.9716, lon: 77.5946 }; // Bengaluru

export default function SkyField({ mode }: SkyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const obs: Observer = { ...DEFAULT_OBS };
    let W = 0;
    let H = 0;

    // Full mode only: hover is read at render time from the last known pointer
    // position rather than recomputed on every pointermove — bodies are
    // already recomputed every frame, so this avoids doing the hit-test twice.
    const mouse = { x: -1000, y: -1000 };
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
    };

    const renderFrame = () => {
      const cs = getComputedStyle(document.documentElement);
      const colors = {
        accent: cs.getPropertyValue('--accent').trim(),
        muted: cs.getPropertyValue('--muted').trim(),
      };
      if (mode === 'full') {
        const { bodies, faint, moonPhase } = computeFullSky(obs, new Date(), W, H);
        const byName = bodyIndex(bodies); // built once, shared by figureAt and drawFull
        hoverIndex = nearestBody(bodies, mouse.x, mouse.y);
        // star hover wins over a constellation hover when both are under the cursor
        hoverFig = hoverIndex >= 0 ? null : figureAt(byName, scrollP.t, mouse.x, mouse.y);
        drawFull(ctx, W, H, bodies, byName, faint, moonPhase, scrollP.t, hoverIndex, hoverFig, mouse, colors);
      } else {
        const { pts, faint } = computeSky(obs, new Date(), W, H);
        drawQuiet(ctx, W, H, pts, faint, colors);
      }
    };

    resize();
    renderFrame();

    // Respect prefers-reduced-motion: one static frame, no rAF loop.
    let rafId = 0;
    if (!reduced) {
      const loop = () => {
        renderFrame();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      renderFrame();
    };
    window.addEventListener('resize', onResize);

    // Hover tracking — full mode only. Look-only: hover names a body or a
    // drawn constellation segment, nothing is draggable.
    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (reduced) renderFrame(); // no rAF loop running to pick this up otherwise
    };
    if (mode === 'full') {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
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
      if (mode === 'full') window.removeEventListener('pointermove', onPointerMove);
      scrollAnim?.revert(); // tears down the linked anime.js ScrollObserver too
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      id="sky"
      aria-hidden="true"
      className="fixed inset-0 -z-[1] pointer-events-none"
    />
  );
}
