import { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from '../lib/motion';

type FocalMode = 'human' | 'mid' | 'machine';

const DETENTS = {
  human: 0.0,
  mid: 0.5,
  machine: 1.0,
} as const;

// Clamps progress strictly to [0, 1]
const clampP = (p: number): number => Math.max(0, Math.min(1, p));

const startsInMachine = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('machine') === 'true';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  brackets: NodeListOf<HTMLElement> | null = null,
) {
  p = clampP(p);

  // Both planes must be visible during transit
  humanPlane.style.display = p === 1 ? 'none' : 'block';
  machinePlane.style.display = p === 0 ? 'none' : 'block';

  // 1. Focus Breathing (counter-scale anchored at 50% 15vh)
  const humanScale = (1 + p * 0.035).toFixed(4);
  const machineScale = (0.965 + p * 0.035).toFixed(4);

  // 2. Optical Blur Math
  const humanBlur = (p * 11).toFixed(1);
  const machineBlur = ((1 - p) * 11).toFixed(1);

  // 3. Opacity crossfade
  const humanOpacity = Math.max(0, 1 - p * 1.45).toFixed(3);
  const machineOpacity = Math.max(0, (p - 0.22) * 1.3).toFixed(3);

  // 4. Composed Photonic Bloom
  const midIntensity = Math.sin(p * Math.PI);
  const bloomDrop = midIntensity > 0.35 ? ' drop-shadow(0 0 10px rgba(127, 168, 245, 0.45))' : '';

  humanPlane.style.transformOrigin = '50% 15vh';
  humanPlane.style.transform = p === 0 ? '' : `scale(${humanScale})`;
  humanPlane.style.filter = p === 0 ? 'none' : `blur(${humanBlur}px)${bloomDrop}`;
  humanPlane.style.opacity = p === 0 ? '1' : humanOpacity;
  humanPlane.style.pointerEvents = p < 0.35 ? 'auto' : 'none';

  machinePlane.style.transformOrigin = '50% 15vh';
  machinePlane.style.transform = p === 1 ? '' : `scale(${machineScale})`;
  machinePlane.style.filter = p === 1 ? 'none' : `blur(${machineBlur}px)${bloomDrop}`;
  machinePlane.style.opacity = p === 1 ? '1' : machineOpacity;
  machinePlane.style.pointerEvents = p > 0.65 ? 'auto' : 'none';

  // In-flow overlay coordination: machine-view is .view-overlay while p < 1
  if (p < 1) {
    machinePlane.classList.add('view-overlay');
  } else {
    machinePlane.classList.remove('view-overlay');
  }

  // 5. Astronomy Sky Canvas FOV Reactivity & Alpha
  if (skyEl) {
    const skyScale = (1 + p * 0.08).toFixed(3);
    skyEl.style.transform = p === 0 ? '' : `scale(${skyScale})`;
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

  if (p > 0) {
    machinePlane.style.height = 'auto';
    machinePlane.style.overflow = 'visible';
  }

  if (p === 0 || p === 1) {
    humanPlane.style.willChange = '';
    machinePlane.style.willChange = '';
  } else {
    humanPlane.style.willChange = 'transform, filter, opacity';
    machinePlane.style.willChange = 'transform, filter, opacity';
  }
}

function triggerDetentBounce(needleEl: HTMLElement | null) {
  const brackets = document.querySelectorAll<HTMLElement>('.viewfinder i');
  if (brackets.length > 0) {
    animate(brackets, {
      scale: [1.12, 1],
      borderColor: ['#7FA8F5', '#8B949E'],
      duration: 180,
      ease: 'outBack(2)',
    });
  }
  if (needleEl) {
    animate(needleEl, {
      scaleY: [1.3, 1],
      duration: 160,
      ease: 'outBack(2)',
    });
  }
}

const getNearestDetent = (p: number): number => {
  if (p < 0.25) return 0.0;
  if (p > 0.75) return 1.0;
  return 0.5;
};

export default function ViewToggle() {
  const [progress, setProgress] = useState(0.0);
  const currentProgressRef = useRef(0.0);
  const isDraggingRef = useRef(false);
  const machineLoadedRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
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

    const { humanPlane, machinePlane, skyEl } = getPlanes();
    if (machinePlane && !machineLoadedRef.current && clamped > 0) {
      ensureMachineLoaded(machinePlane);
    }
    if (humanPlane && machinePlane) {
      applyOpticalProgress(clamped, humanPlane, machinePlane, skyEl, null);
    }
  }, []);

  const updateUrl = (p: number) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (p === 1.0) {
      params.set('machine', 'true');
    } else {
      params.delete('machine');
    }
    const qs = params.toString();
    const nextUrl = qs ? `?${qs}` : window.location.pathname;
    const currentUrl = window.location.search
      ? `?${window.location.search.slice(1)}`
      : window.location.pathname;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const snapProgress = useCallback(
    (targetP: number) => {
      if (animRef.current) {
        try {
          animRef.current.pause();
        } catch (_) {}
        animRef.current = null;
      }
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }

      const { machinePlane } = getPlanes();
      if (machinePlane && !machineLoadedRef.current && targetP > 0) {
        ensureMachineLoaded(machinePlane);
      }

      const reduced = prefersReduced();
      if (reduced) {
        updateProgress(targetP);
        triggerDetentBounce(needleRef.current);
        updateUrl(targetP);
        return;
      }

      const currentP = currentProgressRef.current;
      if (Math.abs(currentP - targetP) < 0.001) {
        updateProgress(targetP);
        triggerDetentBounce(needleRef.current);
        updateUrl(targetP);
        return;
      }

      const animObj = { p: currentP };
      animRef.current = animate(animObj, {
        p: targetP,
        duration: 420,
        ease: 'outQuad',
        onUpdate: () => {
          updateProgress(animObj.p);
        },
        onComplete: () => {
          animRef.current = null;
          updateProgress(targetP);
          triggerDetentBounce(needleRef.current);
          updateUrl(targetP);
        },
      });
    },
    [updateProgress],
  );

  const snapTo = useCallback(
    (targetP: number) => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      snapProgress(targetP);
    },
    [snapProgress],
  );

  // Mount effect: direct ?machine=true initialization or initial HTML pre-warm
  useEffect(() => {
    const { humanPlane, machinePlane, skyEl } = getPlanes();

    if (machinePlane) {
      machinePlane.innerHTML = buildMachineHtml();
      if ((window as any).__RAW_MARKDOWN__) {
        machineLoadedRef.current = true;
      }
    }

    if (startsInMachine()) {
      currentProgressRef.current = 1.0;
      setProgress(1.0);
      if (humanPlane && machinePlane) {
        applyOpticalProgress(1.0, humanPlane, machinePlane, skyEl, null);
      }
      document.documentElement.classList.remove('machine-boot');
    }
  }, []);

  // Track wheel listener with { passive: false } and e.preventDefault()
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (animRef.current) {
        try {
          animRef.current.pause();
        } catch (_) {}
        animRef.current = null;
      }
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const step = delta * 0.002;
      const nextP = clampP(currentProgressRef.current + step);
      updateProgress(nextP);

      settleTimerRef.current = window.setTimeout(() => {
        const target = getNearestDetent(currentProgressRef.current);
        snapProgress(target);
      }, 280);
    };

    track.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      track.removeEventListener('wheel', handleWheel);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [updateProgress, snapProgress]);

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    if (animRef.current) {
      try {
        animRef.current.pause();
      } catch (_) {}
      animRef.current = null;
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = e.currentTarget.getBoundingClientRect();
    const p = clampP((e.clientX - rect.left) / rect.width);
    updateProgress(p);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = clampP((e.clientX - rect.left) / rect.width);
    updateProgress(p);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const target = getNearestDetent(currentProgressRef.current);
    snapProgress(target);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const target = getNearestDetent(currentProgressRef.current);
    snapProgress(target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = currentProgressRef.current;
      const target = current > 0.6 ? 0.5 : 0.0;
      snapProgress(target);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const current = currentProgressRef.current;
      const target = current < 0.4 ? 0.5 : 1.0;
      snapProgress(target);
    } else if (e.key === 'Home') {
      e.preventDefault();
      snapTo(0.0);
    } else if (e.key === 'End') {
      e.preventDefault();
      snapTo(1.0);
    }
  };

  const needlePercent = (progress * 100).toFixed(2);

  return (
    <div className="fixed top-3.5 left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center">
      <div
        ref={trackRef}
        className="focal-scale-track w-[min(calc(100vw-24px),460px)] h-[46px] rounded border border-border bg-[#0D1117]/90 backdrop-blur-md px-4 flex flex-col justify-center select-none cursor-ew-resize transition-colors hover:border-primary shadow-lg"
        role="slider"
        tabIndex={0}
        aria-label="Optical focal length"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={
          progress < 0.25
            ? '24mm Human'
            : progress > 0.75
              ? '48mm Machine'
              : '35mm Mid-Focus'
        }
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        {/* Vernier Ticks Track */}
        <div className="relative w-full h-[8px] bg-[repeating-linear-gradient(90deg,rgba(139,148,158,0.4)_0_1px,transparent_1px_100%)] bg-[length:14px_100%]">
          <div
            ref={needleRef}
            className="absolute top-[-3px] w-[3px] h-[14px] bg-primary rounded-sm shadow-[0_0_6px_var(--primary)] pointer-events-none"
            style={{ left: `${needlePercent}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* 3 Detent Endpoint Buttons */}
        <div
          className="flex justify-between items-center mt-1 text-[0.625rem] font-mono"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => snapTo(0.0)}
            className={`tap-44 text-left transition-colors ${progress < 0.25 ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span>◄ 24mm [HUMAN]</span>
          </button>
          <button
            type="button"
            onClick={() => snapTo(0.5)}
            className={`tap-44 text-center transition-colors ${progress >= 0.35 && progress <= 0.65 ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span>35mm [MID]</span>
          </button>
          <button
            type="button"
            onClick={() => snapTo(1.0)}
            className={`tap-44 text-right transition-colors ${progress > 0.75 ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span>48mm [MACHINE] ►</span>
          </button>
        </div>
      </div>

      {/* Affordance Badge */}
      <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-[#0D1117]/80 text-[0.5625rem] font-mono text-muted-foreground shadow-sm">
        <span className="text-primary font-bold">⟳</span>
        <span>SCROLL / DRAG TO FOCUS · CLICK LABELS TO SNAP</span>
      </div>
    </div>
  );
}
