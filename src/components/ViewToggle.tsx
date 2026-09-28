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

  humanPlane.style.transition = 'none';
  machinePlane.style.transition = 'none';
  if (skyEl) skyEl.style.transition = 'none';

  // Final settled states
  if (p === 0) {
    humanPlane.style.transformOrigin = '';
    humanPlane.style.transform = '';
    humanPlane.style.filter = '';
    humanPlane.style.display = 'block';
    humanPlane.style.opacity = '1';
    humanPlane.style.pointerEvents = 'auto';
    humanPlane.style.willChange = '';

    machinePlane.style.transformOrigin = '';
    machinePlane.style.transform = '';
    machinePlane.style.filter = '';
    machinePlane.style.display = 'none';
    machinePlane.style.opacity = '0';
    machinePlane.style.pointerEvents = 'none';
    machinePlane.style.willChange = '';
    machinePlane.classList.remove('view-overlay');

    if (skyEl) {
      skyEl.style.transform = '';
      skyEl.style.opacity = '1';
      skyEl.style.transition = '';
    }

    document.documentElement.classList.remove('machine-mode');
    document.body.classList.remove('machine-mode');
    return;
  }

  if (p === 1) {
    humanPlane.style.transformOrigin = '';
    humanPlane.style.transform = '';
    humanPlane.style.filter = '';
    humanPlane.style.display = 'none';
    humanPlane.style.opacity = '0';
    humanPlane.style.pointerEvents = 'none';
    humanPlane.style.willChange = '';

    machinePlane.style.transformOrigin = '';
    machinePlane.style.transform = '';
    machinePlane.style.filter = '';
    machinePlane.style.display = 'block';
    machinePlane.style.opacity = '1';
    machinePlane.style.pointerEvents = 'auto';
    machinePlane.style.height = 'auto';
    machinePlane.style.overflow = 'visible';
    machinePlane.style.willChange = '';
    machinePlane.classList.remove('view-overlay');

    if (skyEl) {
      skyEl.style.transform = '';
      skyEl.style.opacity = '0';
      skyEl.style.transition = '';
    }

    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');
    return;
  }

  // Active transit: Clean sequential dissolve — NEVER render both views superimposed!
  // First half (p: 0 -> 0.45): Human view dissolves to 0. Machine view stays hidden.
  // Second half (p: 0.55 -> 1.0): Machine view fades in from 0 to 1. Human view is hidden.
  if (p < 0.45) {
    humanPlane.style.willChange = 'opacity';
    humanPlane.style.display = 'block';
    humanPlane.style.opacity = Math.max(0, 1 - p * 2.22).toFixed(3);
    humanPlane.style.pointerEvents = p < 0.2 ? 'auto' : 'none';

    machinePlane.style.display = 'none';
    machinePlane.style.opacity = '0';
    machinePlane.style.pointerEvents = 'none';
    machinePlane.classList.remove('view-overlay');

    if (skyEl) {
      skyEl.style.opacity = Math.max(0, 1 - p * 2.22).toFixed(3);
    }

    document.documentElement.classList.remove('machine-mode');
    document.body.classList.remove('machine-mode');
  } else if (p > 0.55) {
    humanPlane.style.display = 'none';
    humanPlane.style.opacity = '0';
    humanPlane.style.pointerEvents = 'none';

    machinePlane.style.willChange = 'opacity';
    machinePlane.style.display = 'block';
    machinePlane.style.height = 'auto';
    machinePlane.style.overflow = 'visible';
    machinePlane.style.opacity = Math.min(1, (p - 0.55) * 2.22).toFixed(3);
    machinePlane.style.pointerEvents = p > 0.8 ? 'auto' : 'none';
    machinePlane.classList.remove('view-overlay');

    if (skyEl) {
      skyEl.style.opacity = '0';
    }

    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');
  } else {
    // Narrow clean breath (p: 0.45 -> 0.55): Clean dark ground, zero text bleed
    humanPlane.style.display = 'none';
    humanPlane.style.opacity = '0';
    humanPlane.style.pointerEvents = 'none';

    machinePlane.style.display = 'none';
    machinePlane.style.opacity = '0';
    machinePlane.style.pointerEvents = 'none';
    machinePlane.classList.remove('view-overlay');

    if (skyEl) {
      skyEl.style.opacity = '0';
    }

    if (p >= 0.5) {
      document.documentElement.classList.add('machine-mode');
      document.body.classList.add('machine-mode');
    } else {
      document.documentElement.classList.remove('machine-mode');
      document.body.classList.remove('machine-mode');
    }
  }
}

export default function ViewToggle() {
  const [activeMode, setActiveMode] = useState<'human' | 'machine'>('human');
  const activeModeRef = useRef<'human' | 'machine'>('human');
  const currentProgressRef = useRef(0.0);
  const isDraggingRef = useRef(false);
  const dragStartCoordRef = useRef(0);
  const dragStartPRef = useRef(0);
  const pendingCoordRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
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

    const newMode = clamped < 0.5 ? 'human' : 'machine';
    if (newMode !== activeModeRef.current) {
      activeModeRef.current = newMode;
      setActiveMode(newMode);
    }

    // Cylindrical knob travel: 72px between 24mm (y=36px) and 48mm (y=108px)
    const offset = clamped * 72;
    if (desktopLinesRef.current) {
      desktopLinesRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    if (mobileLinesRef.current) {
      mobileLinesRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
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

    // Scroll to top up front when switching views
    if (
      (targetP === 1.0 && currentProgressRef.current < 0.5) ||
      (targetP === 0.0 && currentProgressRef.current >= 0.5)
    ) {
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
      duration: 360,
      ease: 'outCubic',
      onUpdate: () => {
        updateProgress(proxy.p);
      },
      onComplete: () => {
        animRef.current = null;
        finalizeSettle(targetP);
      },
    });
  };

  // Wheel scrubbing on both desktop and mobile tracks with rAF batching
  useEffect(() => {
    const attachWheel = (el: HTMLElement | null, isVert: boolean) => {
      if (!el) return () => {};
      let wheelRaf: number | null = null;
      let targetP = currentProgressRef.current;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = isVert
          ? e.deltaY
          : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
        targetP = clampP(currentProgressRef.current + delta * 0.003);

        if (wheelRaf === null) {
          wheelRaf = requestAnimationFrame(() => {
            wheelRaf = null;
            updateProgress(targetP);
          });
        }

        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = window.setTimeout(() => {
          const nearest = currentProgressRef.current < 0.5 ? 0.0 : 1.0;
          snapTo(nearest);
        }, 220);
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        el.removeEventListener('wheel', onWheel);
        if (wheelRaf !== null) cancelAnimationFrame(wheelRaf);
      };
    };

    const cleanupDesktop = attachWheel(desktopTrackRef.current, true);
    const cleanupMobile = attachWheel(mobileTrackRef.current, false);
    return () => {
      cleanupDesktop();
      cleanupMobile();
    };
  }, [updateProgress]);

  // Window-level safety cleanup for dragging and cursor states
  useEffect(() => {
    const onGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.classList.remove('cur-focal-dragging');
      }
    };
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
      document.body.classList.remove('cur-focal');
      document.body.classList.remove('cur-focal-dragging');
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent, isVert: boolean) => {
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    document.body.classList.add('cur-focal-dragging');
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
    pendingCoordRef.current = isVert ? e.clientY : e.clientX;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!isDraggingRef.current) return;
        const delta = pendingCoordRef.current - dragStartCoordRef.current;
        const rawP = dragStartPRef.current + delta / 72;
        updateProgress(clampP(rawP));
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent, isVert: boolean) => {
    document.body.classList.remove('cur-focal-dragging');
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
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
      onPointerEnter={() => {
        document.body.classList.add('cur-focal');
      }}
      onPointerLeave={() => {
        if (!isDraggingRef.current) {
          document.body.classList.remove('cur-focal');
        }
      }}
    >
      {/* Desktop Layout: Stacked Labels on the LEFT, Bar on the RIGHT */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* Desktop Labels Column: Compact stacked labels aligned with knob stops */}
        <div className="relative h-[144px] w-[84px] select-none">
          <button
            ref={humanBtnRef}
            type="button"
            onClick={() => snapTo(0.0)}
            className="absolute top-[36px] -translate-y-1/2 right-0 flex flex-col items-end cursor-pointer group text-right focus:outline-none whitespace-nowrap"
            aria-label="24mm Human view"
          >
            <span
              className={`font-mono text-[9px] tracking-[0.18em] uppercase whitespace-nowrap leading-none mb-1.5 transition-colors text-right ${
                activeMode === 'human'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground/50 group-hover:text-muted-foreground'
              }`}
            >
              24MM
            </span>
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'human'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground/40 group-hover:text-muted-foreground'
              }`}
            >
              HUMAN
            </span>
          </button>

          <button
            ref={machineBtnRef}
            type="button"
            onClick={() => snapTo(1.0)}
            className="absolute top-[108px] -translate-y-1/2 right-0 flex flex-col items-end cursor-pointer group text-right focus:outline-none whitespace-nowrap"
            aria-label="48mm Machine view"
          >
            <span
              className={`font-mono text-[9px] tracking-[0.18em] uppercase whitespace-nowrap leading-none mb-1.5 transition-colors text-right ${
                activeMode === 'machine'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground/50 group-hover:text-muted-foreground'
              }`}
            >
              48MM
            </span>
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'machine'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground/40 group-hover:text-muted-foreground'
              }`}
            >
              MACHINE
            </span>
          </button>
        </div>

        {/* Desktop Vertical Textured Knob Track */}
        <div
          ref={desktopTrackRef}
          className="relative w-4 h-[144px] overflow-hidden cursor-ns-resize select-none shrink-0"
          style={{
            touchAction: 'none',
            maskImage:
              'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 10%, #000 24%, #000 76%, rgba(0,0,0,0.4) 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 10%, #000 24%, #000 76%, rgba(0,0,0,0.4) 90%, transparent 100%)',
          }}
          role="slider"
          tabIndex={0}
          aria-label="Optical focal length"
          aria-valuemin={24}
          aria-valuemax={48}
          aria-valuenow={activeMode === 'human' ? 24 : 48}
          aria-valuetext={activeMode === 'human' ? '24mm Human' : '48mm Machine'}
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
            style={{ transform: 'translate3d(0, 0px, 0)' }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 16 144"
              className="w-full h-[144px] overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: 30 }, (_, i) => i - 10).map((k) => {
                const y = k * 12;
                const isHighlighter = k === 3;
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
          className="flex flex-col items-center cursor-pointer text-center select-none focus:outline-none whitespace-nowrap"
          aria-label="24mm Human view"
        >
          <span
            className={`font-mono text-[9px] tracking-wider uppercase whitespace-nowrap leading-none mb-1 transition-colors ${
              activeMode === 'human' ? 'text-primary font-medium' : 'text-muted-foreground/60'
            }`}
          >
            24MM
          </span>
          <span
            className={`font-mono text-[10px] tracking-wider uppercase whitespace-nowrap leading-none transition-colors ${
              activeMode === 'human' ? 'text-foreground font-semibold' : 'text-muted-foreground/50'
            }`}
          >
            HUMAN
          </span>
        </button>

        <div
          ref={mobileTrackRef}
          className="relative w-[144px] h-4 overflow-hidden cursor-ew-resize select-none shrink-0"
          style={{
            touchAction: 'none',
            maskImage:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 10%, #000 24%, #000 76%, rgba(0,0,0,0.4) 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 10%, #000 24%, #000 76%, rgba(0,0,0,0.4) 90%, transparent 100%)',
          }}
          role="slider"
          tabIndex={0}
          aria-label="Optical focal length"
          aria-valuemin={24}
          aria-valuemax={48}
          aria-valuenow={activeMode === 'human' ? 24 : 48}
          aria-valuetext={activeMode === 'human' ? '24mm Human' : '48mm Machine'}
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
            style={{ transform: 'translate3d(0px, 0, 0)' }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 144 16"
              className="w-[144px] h-full overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: 30 }, (_, i) => i - 10).map((k) => {
                const x = k * 12;
                const isHighlighter = k === 3;
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
          className="flex flex-col items-center cursor-pointer text-center select-none focus:outline-none whitespace-nowrap"
          aria-label="48mm Machine view"
        >
          <span
            className={`font-mono text-[9px] tracking-wider uppercase whitespace-nowrap leading-none mb-1 transition-colors ${
              activeMode === 'machine' ? 'text-primary font-medium' : 'text-muted-foreground/60'
            }`}
          >
            48MM
          </span>
          <span
            className={`font-mono text-[10px] tracking-wider uppercase whitespace-nowrap leading-none transition-colors ${
              activeMode === 'machine' ? 'text-foreground font-semibold' : 'text-muted-foreground/50'
            }`}
          >
            MACHINE
          </span>
        </button>
      </div>
    </div>
  );
}
