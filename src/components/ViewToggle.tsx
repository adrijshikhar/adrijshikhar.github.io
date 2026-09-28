import { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from '../lib/motion';

const startsInMachine = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('machine') === 'true';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clampP = (p: number): number => Math.max(0, Math.min(1, p));

// The machine view shows the raw markdown as literal text, so it MUST be HTML-escaped
// before insertion — HTML embedded in the content must never render. Only after escaping
// do we re-introduce the two intended affordances (links, bold), and links only for safe
// URL schemes so an escaped `javascript:`/`data:` URL can't become a clickable sink.
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SAFE_URL = /^(?:https?:|mailto:)/i;

// Build the machine-view inner HTML from the raw markdown payload.
const buildMachineHtml = (): string => {
  const raw: string = (window as any).__RAW_MARKDOWN__ || '';
  const escaped = escapeHtml(raw);
  const withLinks = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match: string, text: string, url: string) =>
      SAFE_URL.test(url)
        ? `<a href="${url}" target="_blank" rel="noreferrer noopener">${text}</a>`
        : match,
  );
  const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Colour the markdown by its own syntax, so the machine view uses the same
  // spectral ramp as the rest of the site instead of one flat grey.
  const coloured = withBold
    .split('\n')
    .map((line: string) => {
      const h = /^(#{1,6})(\s+)(.*)$/.exec(line);
      if (h) {
        const cls = h[1].length === 1 ? 'mk-h1' : h[1].length === 2 ? 'mk-h2' : 'mk-h3';
        return `<span class="${cls}">${h[1]}${h[2]}${h[3]}</span>`;
      }
      const li = /^(\s*)([-*+]|\d+\.)(\s+)(.*)$/.exec(line);
      if (li) return `${li[1]}<span class="mk-mark">${li[2]}</span>${li[3]}${li[4]}`;
      if (/^\s*(---+|===+)\s*$/.test(line)) return `<span class="mk-rule">${line}</span>`;
      return line;
    })
    .join('\n');

  return `<div class="machine-content-wrapper"><pre class="machine-pre">${coloured}</pre></div>`;
};

function applyOpticalProgress(
  p: number,
  humanPlane: HTMLElement,
  machinePlane: HTMLElement,
  skyEl: HTMLElement | null,
) {
  p = clampP(p);

  // Both planes visible during transit
  humanPlane.style.display = p === 1 ? 'none' : 'block';
  machinePlane.style.display = p === 0 ? 'none' : 'block';

  // In-flow overlay coordination: machine-view is .view-overlay while p < 1
  if (p < 1) {
    machinePlane.classList.add('view-overlay');
  } else {
    machinePlane.classList.remove('view-overlay');
  }

  // Final states: restore clean, unblurred in-flow styling
  if (p === 0) {
    humanPlane.style.transformOrigin = '';
    humanPlane.style.transform = '';
    humanPlane.style.filter = 'none';
    humanPlane.style.opacity = '1';
    humanPlane.style.pointerEvents = 'auto';
    humanPlane.style.willChange = '';

    machinePlane.style.transformOrigin = '';
    machinePlane.style.transform = '';
    machinePlane.style.filter = 'none';
    machinePlane.style.opacity = '0';
    machinePlane.style.pointerEvents = 'none';
    machinePlane.style.willChange = '';

    if (skyEl) {
      skyEl.style.transform = '';
      skyEl.style.opacity = '1';
    }

    document.documentElement.classList.remove('machine-mode');
    document.body.classList.remove('machine-mode');
    return;
  }

  if (p === 1) {
    humanPlane.style.transformOrigin = '';
    humanPlane.style.transform = '';
    humanPlane.style.filter = 'none';
    humanPlane.style.opacity = '0';
    humanPlane.style.pointerEvents = 'none';
    humanPlane.style.willChange = '';

    machinePlane.style.transformOrigin = '';
    machinePlane.style.transform = '';
    machinePlane.style.filter = 'none';
    machinePlane.style.opacity = '1';
    machinePlane.style.pointerEvents = 'auto';
    machinePlane.style.height = 'auto';
    machinePlane.style.overflow = 'visible';
    machinePlane.style.willChange = '';

    if (skyEl) {
      skyEl.style.transform = '';
      skyEl.style.opacity = '0';
    }

    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');
    return;
  }

  // Active transit: Focus Breathing (anchored at 50% 15vh)
  const humanScale = (1 + p * 0.035).toFixed(4);
  const machineScale = (0.965 + p * 0.035).toFixed(4);

  // Optical Blur & Photonic Bloom
  const humanBlur = (p * 11).toFixed(1);
  const machineBlur = ((1 - p) * 11).toFixed(1);
  const midIntensity = Math.sin(p * Math.PI);
  const bloomDrop = midIntensity > 0.35 ? ' drop-shadow(0 0 10px rgba(127, 168, 245, 0.45))' : '';

  // Opacity Crossfade
  const humanOpacity = Math.max(0, 1 - p * 1.45).toFixed(3);
  const machineOpacity = Math.max(0, (p - 0.22) * 1.3).toFixed(3);

  humanPlane.style.willChange = 'transform, filter, opacity';
  humanPlane.style.transformOrigin = '50% 15vh';
  humanPlane.style.transform = `scale(${humanScale})`;
  humanPlane.style.filter = `blur(${humanBlur}px)${bloomDrop}`;
  humanPlane.style.opacity = humanOpacity;
  humanPlane.style.pointerEvents = p < 0.35 ? 'auto' : 'none';

  machinePlane.style.willChange = 'transform, filter, opacity';
  machinePlane.style.transformOrigin = '50% 15vh';
  machinePlane.style.transform = `scale(${machineScale})`;
  machinePlane.style.filter = `blur(${machineBlur}px)${bloomDrop}`;
  machinePlane.style.opacity = machineOpacity;
  machinePlane.style.pointerEvents = p > 0.65 ? 'auto' : 'none';
  machinePlane.style.height = 'auto';
  machinePlane.style.overflow = 'visible';

  // Astronomy Sky Canvas FOV Reactivity & Alpha
  if (skyEl) {
    const skyScale = (1 + p * 0.08).toFixed(3);
    skyEl.style.transform = `scale(${skyScale})`;
    skyEl.style.opacity = Math.max(0, 1 - p * 1.25).toFixed(3);
  }

  // Class toggles on html and body (machine-mode when p > 0.5)
  if (p > 0.5) {
    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');
  } else {
    document.documentElement.classList.remove('machine-mode');
    document.body.classList.remove('machine-mode');
  }
}

const BARREL_STEP = 11;
const DETENT_24_X = 264; // step 24
const DETENT_48_X = 440; // step 40
const SPAN_X = DETENT_48_X - DETENT_24_X; // 176px
const TOTAL_STEPS = 64;
const TOTAL_BARREL_WIDTH = TOTAL_STEPS * BARREL_STEP; // 704px

export default function ViewToggle() {
  const [progress, setProgress] = useState(0.0);
  const currentProgressRef = useRef(0.0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPRef = useRef(0);
  const machineLoadedRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const barrelRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);
  const settleTimerRef = useRef<number | null>(null);

  const getPlanes = () => {
    const humanPlane = document.querySelector('.human-view') as HTMLElement | null;
    const machinePlane = document.querySelector('.machine-view') as HTMLElement | null;
    const skyEl = document.getElementById('sky');
    return { humanPlane, machinePlane, skyEl };
  };

  const ensureMachineLoaded = (machinePlane: HTMLElement | null) => {
    if (!machinePlane || machineLoadedRef.current) return;
    const raw = (window as any).__RAW_MARKDOWN__ || '';
    if (raw) {
      machinePlane.innerHTML = buildMachineHtml();
      machineLoadedRef.current = true;
    }
  };

  const updateProgress = useCallback((p: number) => {
    const clamped = clampP(p);
    currentProgressRef.current = clamped;
    setProgress(clamped);

    // Scroll the line between the two ends
    if (barrelRef.current && trackRef.current) {
      const containerW = trackRef.current.clientWidth || 440;
      const center = containerW / 2;
      const currentX = DETENT_24_X + clamped * SPAN_X;
      const offset = center - currentX;
      barrelRef.current.style.transform = `translateX(${offset}px)`;
    }

    const { humanPlane, machinePlane, skyEl } = getPlanes();
    if (humanPlane && machinePlane) {
      ensureMachineLoaded(machinePlane);
      applyOpticalProgress(clamped, humanPlane, machinePlane, skyEl);
    }
  }, []);

  const finalizeSettle = (targetP: number) => {
    updateProgress(targetP);
    const params = new URLSearchParams(window.location.search);
    if (targetP === 1.0) {
      params.set('machine', 'true');
    } else {
      params.delete('machine');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  };

  const snapTo = (targetP: number) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    const { machinePlane } = getPlanes();
    ensureMachineLoaded(machinePlane);

    // Scroll to top up front when entering machine view
    if (targetP === 1.0 && currentProgressRef.current < 0.5) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (prefersReduced()) {
      updateProgress(targetP);
      finalizeSettle(targetP);
      return;
    }

    if (animRef.current) {
      animRef.current.pause?.();
      animRef.current = null;
    }

    const startP = currentProgressRef.current;
    const proxy = { p: startP };
    animRef.current = animate(proxy, {
      p: targetP,
      duration: 380,
      ease: 'inOutQuad',
      onUpdate: () => {
        updateProgress(proxy.p);
      },
      onComplete: () => {
        animRef.current = null;
        finalizeSettle(targetP);
      },
    });
  };

  // Wheel scrubbing on track
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const nextP = clampP(currentProgressRef.current + delta * 0.0025);
      updateProgress(nextP);

      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        const nearest = nextP < 0.5 ? 0.0 : 1.0;
        snapTo(nearest);
      }, 260);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [updateProgress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPRef.current = currentProgressRef.current;
    trackRef.current.setPointerCapture(e.pointerId);
    if (animRef.current) {
      animRef.current.pause?.();
      animRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Moving barrel: dragging left advances progress towards 48mm
    const rawP = dragStartPRef.current - deltaX / SPAN_X;
    updateProgress(clampP(rawP));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    isDraggingRef.current = false;
    try {
      trackRef.current.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) < 5) {
      const rect = trackRef.current.getBoundingClientRect();
      const clickFromCenter = e.clientX - (rect.left + rect.width / 2);
      snapTo(clickFromCenter < 0 ? 0.0 : 1.0);
      return;
    }

    const nearest = currentProgressRef.current < 0.5 ? 0.0 : 1.0;
    snapTo(nearest);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      snapTo(0.0);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      snapTo(1.0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      snapTo(0.0);
    } else if (e.key === 'End') {
      e.preventDefault();
      snapTo(1.0);
    }
  };

  // Direct ?machine=true initial mount handling
  useEffect(() => {
    if (!startsInMachine()) {
      updateProgress(0.0);
      return;
    }

    const { humanPlane, machinePlane, skyEl } = getPlanes();
    if (!humanPlane || !machinePlane) return;

    ensureMachineLoaded(machinePlane);
    updateProgress(1.0);
    finalizeSettle(1.0);

    // Drop the no-FOUC boot class once state is active
    document.documentElement.classList.remove('machine-boot');
  }, [updateProgress]);

  // Initial barrel alignment on mount and window resize
  useEffect(() => {
    const align = () => updateProgress(currentProgressRef.current);
    align();
    window.addEventListener('resize', align);
    return () => window.removeEventListener('resize', align);
  }, [updateProgress]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center select-none w-[min(calc(100vw-32px),440px)]"
      style={{
        background: 'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(10, 13, 18, 0.85) 0%, rgba(10, 13, 18, 0.5) 60%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Endpoints Row: 24mm and 48mm always present at the two ends */}
      <div className="flex justify-between items-center w-full px-5 text-[11px] font-mono tracking-wider">
        <button
          type="button"
          onClick={() => snapTo(0.0)}
          className={`tap-44 flex items-center transition-colors cursor-pointer ${
            progress < 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="24mm Human view"
        >
          <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
          <span className="px-1">24mm · HUMAN</span>
          <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
        </button>

        <button
          type="button"
          onClick={() => snapTo(1.0)}
          className={`tap-44 flex items-center transition-colors cursor-pointer ${
            progress >= 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="48mm Machine view"
        >
          <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
          <span className="px-1">48mm · MACHINE</span>
          <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
        </button>
      </div>

      {/* Reticle Track: Scrolling line of ticks between the two ends */}
      <div
        ref={trackRef}
        className="relative w-full h-7 overflow-hidden cursor-ew-resize mt-0.5"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)',
          touchAction: 'none',
        }}
        role="slider"
        tabIndex={0}
        aria-label="Optical focal length"
        aria-valuemin={24}
        aria-valuemax={48}
        aria-valuenow={Math.round(24 + progress * 24)}
        aria-valuetext={progress < 0.5 ? '24mm Human' : '48mm Machine'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Top Stationary Reticle Hairline Index at center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-primary pointer-events-none z-10" />

        {/* Bottom Stationary Vernier Index Arrow ▲ at center */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px] border-b-primary" />
        </div>

        {/* The Scrolling Line Assembly That Moves Between The Two Ends */}
        <div
          ref={barrelRef}
          className="absolute top-0 left-0 h-full will-change-transform pointer-events-none"
          style={{ width: `${TOTAL_BARREL_WIDTH}px` }}
        >
          <div className="relative w-full h-3.5 pointer-events-none">
            <svg
              viewBox={`0 0 ${TOTAL_BARREL_WIDTH} 14`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {Array.from({ length: TOTAL_STEPS + 1 }).map((_, k) => {
                const x = k * BARREL_STEP;
                const isDetent = k === 24 || k === 40;
                const isMajorGraduation = k % 4 === 0;
                const height = isDetent ? 10 : isMajorGraduation ? 7 : 4;
                const stroke = isDetent
                  ? 'var(--foreground)'
                  : isMajorGraduation
                  ? 'var(--muted-foreground)'
                  : 'var(--muted-foreground)';
                const strokeOpacity = isDetent ? 0.95 : isMajorGraduation ? 0.7 : 0.3;
                const strokeWidth = isDetent ? 1.5 : 1;
                return (
                  <line
                    key={k}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={height}
                    stroke={stroke}
                    strokeOpacity={strokeOpacity}
                    strokeWidth={strokeWidth}
                    strokeLinecap="square"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
