import { useEffect, useRef } from 'react';
import { computeSky, drawQuiet, type Observer } from '../lib/sky/render';

interface SkyFieldProps {
  /** 'quiet' (every page): faint field + named stars, no interaction. 'full'
   *  (home page instrument view — graticule, planets, Moon, labels, the game)
   *  is a later task; for now it renders identically to 'quiet'. */
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
      const { pts, faint } = computeSky(obs, new Date(), W, H);
      drawQuiet(ctx, W, H, pts, faint, colors);
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
