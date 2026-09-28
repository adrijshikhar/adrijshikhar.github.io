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

export default function ViewToggle() {
  const [progress, setProgress] = useState(0.0);
  const currentProgressRef = useRef(0.0);
  const isDraggingRef = useRef(false);
  const dragStartCoordRef = useRef(0);
  const dragStartPRef = useRef(0);
  const machineLoadedRef = useRef(false);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const desktopLinesRef = useRef<HTMLDivElement>(null);
  const mobileLinesRef = useRef<HTMLDivElement>(null);
  const humanBtnRef = useRef<HTMLButtonElement>(null);
  const machineBtnRef = useRef<HTMLButtonElement>(null);
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

    // Rotate the cylindrical knob: the entire set of lines translates together
    // At p = 0.0: offset = 0px (line k=1 is at y=12px, aligned with 24mm)
    // At p = 1.0: offset = 72px (line k=1 is at y=84px, aligned with 48mm)
    const offset = clamped * 72;
    if (desktopLinesRef.current) {
      desktopLinesRef.current.style.transform = `translateY(${offset}px)`;
    }
    if (mobileLinesRef.current) {
      mobileLinesRef.current.style.transform = `translateX(${offset}px)`;
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

  // Wheel scrubbing on both desktop and mobile tracks
  useEffect(() => {
    const attachWheel = (el: HTMLElement | null, isVert: boolean) => {
      if (!el) return () => {};
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = isVert
          ? e.deltaY
          : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
        const nextP = clampP(currentProgressRef.current + delta * 0.003);
        updateProgress(nextP);

        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = window.setTimeout(() => {
          const nearest = nextP < 0.5 ? 0.0 : 1.0;
          snapTo(nearest);
        }, 260);
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    };

    const cleanupDesktop = attachWheel(desktopTrackRef.current, true);
    const cleanupMobile = attachWheel(mobileTrackRef.current, false);
    return () => {
      cleanupDesktop();
      cleanupMobile();
    };
  }, [updateProgress]);

  const handlePointerDown = (e: React.PointerEvent, isVert: boolean) => {
    const target = e.currentTarget as HTMLElement;
    isDraggingRef.current = true;
    dragStartCoordRef.current = isVert ? e.clientY : e.clientX;
    dragStartPRef.current = currentProgressRef.current;
    target.setPointerCapture(e.pointerId);
    if (animRef.current) {
      animRef.current.pause?.();
      animRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent, isVert: boolean) => {
    if (!isDraggingRef.current) return;
    const delta = isVert
      ? (e.clientY - dragStartCoordRef.current)
      : (e.clientX - dragStartCoordRef.current);
    const rawP = dragStartPRef.current + delta / 72;
    updateProgress(clampP(rawP));
  };

  const handlePointerUp = (e: React.PointerEvent, isVert: boolean) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const target = e.currentTarget as HTMLElement;
    try {
      target.releasePointerCapture(e.pointerId);
    } catch {}

    const delta = isVert
      ? Math.abs(e.clientY - dragStartCoordRef.current)
      : Math.abs(e.clientX - dragStartCoordRef.current);
    if (delta < 5) {
      const rect = target.getBoundingClientRect();
      if (isVert) {
        const clickY = e.clientY - rect.top;
        snapTo(clickY < rect.height / 2 ? 0.0 : 1.0);
      } else {
        const clickX = e.clientX - rect.left;
        snapTo(clickX < rect.width / 2 ? 0.0 : 1.0);
      }
      return;
    }

    const nearest = currentProgressRef.current < 0.5 ? 0.0 : 1.0;
    snapTo(nearest);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      snapTo(0.0);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
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

    const { humanPlane, machinePlane } = getPlanes();
    if (!humanPlane || !machinePlane) return;

    ensureMachineLoaded(machinePlane);
    updateProgress(1.0);
    finalizeSettle(1.0);

    // Drop the no-FOUC boot class once state is active
    document.documentElement.classList.remove('machine-boot');
  }, [updateProgress]);

  // Initial alignment on mount
  useEffect(() => {
    updateProgress(currentProgressRef.current);
  }, [updateProgress]);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-9 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 z-[1100] select-none pointer-events-auto"
    >
      {/* Desktop Layout: Labels on the LEFT, Bar on the RIGHT */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Desktop Labels Column */}
        <div className="flex flex-col justify-between h-[96px] text-right font-mono text-[11px] tracking-[0.14em] uppercase">
          <button
            ref={humanBtnRef}
            type="button"
            onClick={() => snapTo(0.0)}
            className={`h-6 flex items-center justify-end transition-colors cursor-pointer ${
              progress < 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="24mm Human view"
          >
            <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
            <span className="px-1 whitespace-nowrap">24mm · HUMAN</span>
            <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
          </button>

          <button
            ref={machineBtnRef}
            type="button"
            onClick={() => snapTo(1.0)}
            className={`h-6 flex items-center justify-end transition-colors cursor-pointer ${
              progress >= 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="48mm Machine view"
          >
            <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
            <span className="px-1 whitespace-nowrap">48mm · MACHINE</span>
            <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
          </button>
        </div>

        {/* Desktop Vertical Textured Knob Track */}
        <div
          ref={desktopTrackRef}
          className="relative w-4 h-[96px] overflow-hidden cursor-ns-resize select-none shrink-0"
          style={{
            touchAction: 'none',
            maskImage: 'linear-gradient(180deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
          }}
          role="slider"
          tabIndex={0}
          aria-label="Optical focal length"
          aria-valuemin={24}
          aria-valuemax={48}
          aria-valuenow={Math.round(24 + progress * 24)}
          aria-valuetext={progress < 0.5 ? '24mm Human' : '48mm Machine'}
          onPointerDown={(e) => handlePointerDown(e, true)}
          onPointerMove={(e) => handlePointerMove(e, true)}
          onPointerUp={(e) => handlePointerUp(e, true)}
          onPointerCancel={(e) => handlePointerUp(e, true)}
          onKeyDown={handleKeyDown}
        >
          {/* Rotating Cylindrical Knob: The entire set of lines moves up and down together */}
          <div
            ref={desktopLinesRef}
            className="absolute top-0 left-0 w-full will-change-transform pointer-events-none"
            style={{ transform: 'translateY(0px)' }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 16 96"
              className="w-full h-[96px] overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: 25 }, (_, i) => i - 12).map((k) => {
                const y = k * 12;
                const isHighlighter = k === 1;
                return (
                  <line
                    key={k}
                    x1="2"
                    y1={y}
                    x2="14"
                    y2={y}
                    stroke={isHighlighter ? 'var(--primary)' : 'var(--muted-foreground)'}
                    strokeOpacity={isHighlighter ? 1 : 0.4}
                    strokeWidth={1}
                    shapeRendering="crispEdges"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Layout: Horizontal bar in center, 24mm on left, 48mm on right */}
      <div className="flex lg:hidden items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => snapTo(0.0)}
          className={`tap-44 flex items-center transition-colors cursor-pointer text-[11px] font-mono tracking-wider ${
            progress < 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="24mm Human view"
        >
          <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
          <span className="px-1 whitespace-nowrap">24mm · HUMAN</span>
          <span className={`text-primary transition-opacity ${progress < 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
        </button>

        <div
          ref={mobileTrackRef}
          className="relative w-[96px] h-4 overflow-hidden cursor-ew-resize select-none shrink-0"
          style={{
            touchAction: 'none',
            maskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
          }}
          role="slider"
          tabIndex={0}
          aria-label="Optical focal length"
          aria-valuemin={24}
          aria-valuemax={48}
          aria-valuenow={Math.round(24 + progress * 24)}
          aria-valuetext={progress < 0.5 ? '24mm Human' : '48mm Machine'}
          onPointerDown={(e) => handlePointerDown(e, false)}
          onPointerMove={(e) => handlePointerMove(e, false)}
          onPointerUp={(e) => handlePointerUp(e, false)}
          onPointerCancel={(e) => handlePointerUp(e, false)}
          onKeyDown={handleKeyDown}
        >
          {/* Rotating Cylindrical Knob: The entire set of lines moves left and right together */}
          <div
            ref={mobileLinesRef}
            className="absolute top-0 left-0 h-full will-change-transform pointer-events-none"
            style={{ transform: 'translateX(0px)' }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 96 16"
              className="w-[96px] h-full overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: 25 }, (_, i) => i - 12).map((k) => {
                const x = k * 12;
                const isHighlighter = k === 1;
                return (
                  <line
                    key={k}
                    x1={x}
                    y1="2"
                    x2={x}
                    y2="14"
                    stroke={isHighlighter ? 'var(--primary)' : 'var(--muted-foreground)'}
                    strokeOpacity={isHighlighter ? 1 : 0.4}
                    strokeWidth={1}
                    shapeRendering="crispEdges"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={() => snapTo(1.0)}
          className={`tap-44 flex items-center transition-colors cursor-pointer text-[11px] font-mono tracking-wider ${
            progress >= 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="48mm Machine view"
        >
          <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>[</span>
          <span className="px-1 whitespace-nowrap">48mm · MACHINE</span>
          <span className={`text-primary transition-opacity ${progress >= 0.5 ? 'opacity-100' : 'opacity-0'}`}>]</span>
        </button>
      </div>
    </div>
  );
}
