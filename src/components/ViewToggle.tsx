import { useState, useRef, useEffect, useCallback } from 'react';
import { animate, utils } from '../lib/motion';

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

const KNOB_LINE_INDICES = Array.from({ length: 30 }, (_, i) => i - 10);

interface ObservatoryElements {
  skyEl: HTMLElement | null;
  sideRail: HTMLElement | null;
  brackets: HTMLElement[];
  instTL: HTMLElement | null;
  instBL: HTMLElement | null;
  instBR: HTMLElement | null;
  eggHint: HTMLElement | null;
  telemetry: HTMLElement | null;
  otherInstruments: HTMLElement[];
}

const resetPlaneHidden = (plane: HTMLElement) => {
  plane.style.display = 'none';
  plane.style.position = '';
  plane.style.top = '';
  plane.style.left = '';
  plane.style.width = '';
  plane.style.height = '';
  plane.style.overflow = '';
  plane.style.opacity = '0';
  plane.style.filter = '';
  plane.style.transform = '';
  plane.style.willChange = '';
  plane.style.pointerEvents = 'none';
};

const resetPlaneVisible = (plane: HTMLElement) => {
  plane.style.display = 'block';
  plane.style.position = '';
  plane.style.top = '';
  plane.style.left = '';
  plane.style.width = '';
  plane.style.height = 'auto';
  plane.style.overflow = 'visible';
  plane.style.opacity = '1';
  plane.style.filter = '';
  plane.style.transform = '';
  plane.style.willChange = '';
  plane.style.pointerEvents = 'auto';
};

function applyOpticalProgress(
  p: number,
  humanPlane: HTMLElement,
  machinePlane: HTMLElement,
  obs: ObservatoryElements,
) {
  p = clampP(p);

  const isMachine = p >= 0.75;
  document.documentElement.classList.toggle('machine-mode', isMachine);
  document.body.classList.toggle('machine-mode', isMachine);

  const reduced = prefersReduced();

  // Opacity curves: Smooth sine/cosine crossfade with generous optical overlap across p ∈ [0.15, 0.85]
  let humanOpacity = 1.0;
  if (p <= 0.15) {
    humanOpacity = 1.0;
  } else if (p >= 0.75) {
    humanOpacity = 0.0;
  } else {
    const t = (p - 0.15) / 0.60;
    humanOpacity = Math.max(0, Math.cos(t * Math.PI * 0.5));
  }

  let machineOpacity = 0.0;
  if (p <= 0.25) {
    machineOpacity = 0.0;
  } else if (p >= 0.85) {
    machineOpacity = 1.0;
  } else {
    const u = (p - 0.25) / 0.60;
    machineOpacity = Math.min(1, Math.sin(u * Math.PI * 0.5));
  }

  // Optical Blur Math:
  // Human starts at 0px blur at p=0, racks up to 14px by p=0.5, stays soft until it dissolves
  // Machine starts at 14px bokeh blur when appearing, tightens down to 0px at p=1.0
  const humanBlur = reduced ? 0 : Number((Math.min(1, p / 0.5) * 14).toFixed(1));
  const machineBlur = reduced ? 0 : Number((Math.min(1, (1 - p) / 0.5) * 14).toFixed(1));

  // Focal Zoom Shift: Outward expansion of corners and margins as focal length increases (24mm -> 48mm)
  const shift = !reduced && p > 0 ? Number((p * 24).toFixed(1)) : 0;

  // Apply optical blur, opacity, and radial outward shift to observatory background elements
  const applyObservatory = (opacityStr: string, blurPx: number, isSettled: boolean) => {
    const filterVal = !reduced && blurPx > 0 && !isSettled ? `blur(${blurPx}px)` : '';

    if (isSettled) {
      if (obs.skyEl) {
        obs.skyEl.style.filter = '';
        obs.skyEl.style.transform = '';
        obs.skyEl.style.opacity = opacityStr;
      }
      if (obs.sideRail) {
        obs.sideRail.style.filter = '';
        obs.sideRail.style.transform = '';
        obs.sideRail.style.opacity = opacityStr;
        obs.sideRail.style.pointerEvents = p === 0 ? '' : 'none';
      }
      if (obs.brackets.length >= 4) {
        obs.brackets.forEach((b) => {
          b.style.filter = '';
          b.style.transform = '';
          b.style.opacity = opacityStr;
        });
      }
      [obs.instTL, obs.instBL, obs.instBR, obs.eggHint].forEach((inst) => {
        if (inst) {
          inst.style.filter = '';
          inst.style.transform = '';
          inst.style.opacity = opacityStr;
          inst.style.pointerEvents = p === 0 ? '' : 'none';
        }
      });
      if (obs.telemetry) {
        obs.telemetry.style.filter = '';
        obs.telemetry.style.transform = '';
        obs.telemetry.style.opacity = opacityStr;
      }
      obs.otherInstruments.forEach((inst) => {
        inst.style.filter = '';
        inst.style.transform = '';
        inst.style.opacity = opacityStr;
        inst.style.pointerEvents = p === 0 ? '' : 'none';
      });
      return;
    }

    // In transit (0 < p < 1):
    if (obs.skyEl) {
      obs.skyEl.style.filter = filterVal;
      utils.set(obs.skyEl, {
        opacity: opacityStr,
        scale: 1 + p * 0.08,
      });
    }

    // Side navigation rail: stays pinned vertically centered at top: 50% without horizontal drift or vertical jumps
    if (obs.sideRail) {
      obs.sideRail.style.filter = filterVal;
      obs.sideRail.style.transform = '';
      utils.set(obs.sideRail, {
        opacity: opacityStr,
      });
      obs.sideRail.style.pointerEvents = p < 0.2 ? '' : 'none';
    }

    if (obs.brackets.length >= 4) {
      const [bTL, bTR, bBL, bBR] = obs.brackets;
      [bTL, bTR, bBL, bBR].forEach((b) => {
        b.style.filter = filterVal;
      });
      utils.set(bTL, {
        opacity: opacityStr,
        translateX: -shift,
        translateY: -shift,
      });
      utils.set(bTR, {
        opacity: opacityStr,
        translateX: shift,
        translateY: -shift,
      });
      utils.set(bBL, {
        opacity: opacityStr,
        translateX: -shift,
        translateY: shift,
      });
      utils.set(bBR, {
        opacity: opacityStr,
        translateX: shift,
        translateY: shift,
      });
    }

    // Corner instruments & telemetry: stationary in place without position drift
    if (obs.instTL) {
      obs.instTL.style.filter = filterVal;
      obs.instTL.style.transform = '';
      utils.set(obs.instTL, {
        opacity: opacityStr,
      });
      obs.instTL.style.pointerEvents = p < 0.2 ? '' : 'none';
    }

    if (obs.instBL) {
      obs.instBL.style.filter = filterVal;
      obs.instBL.style.transform = '';
      utils.set(obs.instBL, {
        opacity: opacityStr,
      });
      obs.instBL.style.pointerEvents = p < 0.2 ? '' : 'none';
    }

    if (obs.instBR) {
      obs.instBR.style.filter = filterVal;
      obs.instBR.style.transform = '';
      utils.set(obs.instBR, {
        opacity: opacityStr,
      });
      obs.instBR.style.pointerEvents = p < 0.2 ? '' : 'none';
    }

    if (obs.eggHint) {
      obs.eggHint.style.filter = filterVal;
      obs.eggHint.style.transform = '';
      utils.set(obs.eggHint, {
        opacity: opacityStr,
      });
      obs.eggHint.style.pointerEvents = p < 0.2 ? '' : 'none';
    }

    if (obs.telemetry) {
      obs.telemetry.style.filter = filterVal;
      obs.telemetry.style.transform = '';
      utils.set(obs.telemetry, {
        opacity: opacityStr,
      });
    }

    obs.otherInstruments.forEach((inst) => {
      inst.style.filter = filterVal;
      inst.style.transform = '';
      utils.set(inst, {
        opacity: opacityStr,
      });
      inst.style.pointerEvents = p < 0.2 ? '' : 'none';
    });
  };

  // State 1: Pin-sharp Human (settled at p=0)
  if (p === 0) {
    resetPlaneVisible(humanPlane);
    resetPlaneHidden(machinePlane);
    applyObservatory('1', 0, true);
  }
  // State 2: Pin-sharp Machine (settled at p=1)
  else if (p === 1) {
    resetPlaneHidden(humanPlane);
    resetPlaneVisible(machinePlane);
    applyObservatory('0', 0, true);
  }
  // State 3: Active Continuous Optical Transit (0 < p < 1)
  else {
    // Both planes are active and displayed simultaneously with optical overlap
    if (humanOpacity > 0) {
      humanPlane.style.display = 'block';
      humanPlane.style.position = '';
      humanPlane.style.transformOrigin = '50% 30vh';
      humanPlane.style.filter = humanBlur > 0 ? `blur(${humanBlur}px)` : '';
      humanPlane.style.pointerEvents = p < 0.3 ? 'auto' : 'none';
      utils.set(humanPlane, {
        opacity: humanOpacity,
        scale: !reduced && p > 0 ? 1 + p * 0.035 : 1,
      });
    } else {
      resetPlaneHidden(humanPlane);
    }

    if (machineOpacity > 0) {
      machinePlane.style.display = 'block';
      machinePlane.style.position = 'absolute';
      machinePlane.style.top = '0';
      machinePlane.style.left = '0';
      machinePlane.style.width = '100%';
      machinePlane.style.height = 'auto';
      machinePlane.style.overflow = 'visible';
      machinePlane.style.transformOrigin = '50% 30vh';
      machinePlane.style.filter = machineBlur > 0 ? `blur(${machineBlur}px)` : '';
      machinePlane.style.pointerEvents = p > 0.7 ? 'auto' : 'none';
      utils.set(machinePlane, {
        opacity: machineOpacity,
        scale: !reduced && p < 1 ? 0.965 + p * 0.035 : 1,
      });
    } else {
      resetPlaneHidden(machinePlane);
    }

    applyObservatory(humanOpacity.toFixed(3), humanBlur, false);
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
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const desktopLinesRef = useRef<HTMLDivElement>(null);
  const mobileLinesRef = useRef<HTMLDivElement>(null);
  const labelColRef = useRef<HTMLDivElement>(null);
  const compactHumanRef = useRef<HTMLButtonElement>(null);
  const compactMachineRef = useRef<HTMLButtonElement>(null);
  const fullHumanRef = useRef<HTMLButtonElement>(null);
  const fullMachineRef = useRef<HTMLButtonElement>(null);
  const expandAnimRef = useRef<any>(null);
  const isHoveredRef = useRef(false);
  const animRef = useRef<any>(null);
  const settleTimerRef = useRef<number | null>(null);

  const setExpanded = useCallback((expanded: boolean) => {
    const compactEls = [compactHumanRef.current, compactMachineRef.current].filter(Boolean) as HTMLElement[];
    const fullEls = [fullHumanRef.current, fullMachineRef.current].filter(Boolean) as HTMLElement[];

    if (prefersReduced()) {
      if (labelColRef.current) labelColRef.current.style.width = expanded ? '84px' : '20px';
      compactEls.forEach((el) => {
        el.style.opacity = expanded ? '0' : '1';
        el.style.transform = expanded ? 'translateX(-6px)' : '';
        el.style.pointerEvents = expanded ? 'none' : 'auto';
        el.setAttribute('aria-hidden', expanded ? 'true' : 'false');
        el.tabIndex = expanded ? -1 : 0;
      });
      fullEls.forEach((el) => {
        el.style.opacity = expanded ? '1' : '0';
        el.style.transform = expanded ? '' : 'translateX(8px)';
        el.style.pointerEvents = expanded ? 'auto' : 'none';
        el.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        el.tabIndex = expanded ? 0 : -1;
      });
      return;
    }

    if (expandAnimRef.current) {
      expandAnimRef.current.pause?.();
      expandAnimRef.current = null;
    }

    if (expanded) {
      compactEls.forEach((el) => {
        el.style.pointerEvents = 'none';
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
      });
      fullEls.forEach((el) => {
        el.style.pointerEvents = 'auto';
        el.setAttribute('aria-hidden', 'false');
        el.tabIndex = 0;
      });
    } else {
      compactEls.forEach((el) => {
        el.style.pointerEvents = 'auto';
        el.setAttribute('aria-hidden', 'false');
        el.tabIndex = 0;
      });
      fullEls.forEach((el) => {
        el.style.pointerEvents = 'none';
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
      });
    }

    if (labelColRef.current) {
      animate(labelColRef.current, {
        width: expanded ? '84px' : '20px',
        duration: expanded ? 260 : 200,
        ease: 'outCubic',
      });
    }
    if (compactEls.length > 0) {
      animate(compactEls, {
        opacity: expanded ? 0 : 1,
        translateX: expanded ? -6 : 0,
        duration: expanded ? 180 : 200,
        ease: 'outCubic',
      });
    }
    if (fullEls.length > 0) {
      animate(fullEls, {
        opacity: expanded ? 1 : 0,
        translateX: expanded ? 0 : 8,
        duration: expanded ? 260 : 180,
        ease: 'outCubic',
      });
    }
  }, []);

  const getPlanes = () => {
    const humanPlane = document.querySelector('.human-view') as HTMLElement | null;
    const machinePlane = document.querySelector('.machine-view') as HTMLElement | null;
    const skyEl = document.getElementById('sky');
    const sideRail = document.querySelector('.side-rail') as HTMLElement | null;
    const brackets = Array.from(
      document.querySelectorAll('.viewfinder i'),
    ) as HTMLElement[];
    const instTL = document.querySelector('.instrument-tl') as HTMLElement | null;
    const instBL = document.querySelector('.instrument-l') as HTMLElement | null;
    const instBR = document.querySelector('.instrument-r') as HTMLElement | null;
    const eggHint = document.querySelector('.egg-hint') as HTMLElement | null;
    const telemetry = document.querySelector('.sky-telemetry') as HTMLElement | null;
    const otherInstruments = Array.from(
      document.querySelectorAll('.chrome-panel, .mass-note'),
    ) as HTMLElement[];

    return {
      humanPlane,
      machinePlane,
      obs: {
        skyEl,
        sideRail,
        brackets,
        instTL,
        instBL,
        instBR,
        eggHint,
        telemetry,
        otherInstruments,
      },
    };
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
      utils.set(desktopLinesRef.current, { translateY: offset });
    }
    if (mobileLinesRef.current) {
      utils.set(mobileLinesRef.current, { translateX: offset });
    }

    const { humanPlane, machinePlane, obs } = getPlanes();
    if (humanPlane && machinePlane) {
      ensureMachineLoaded(machinePlane);
      applyOpticalProgress(clamped, humanPlane, machinePlane, obs);
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
    const dist = Math.abs(targetP - startP);
    // Faster, responsive settlement: scale duration by remaining distance (~140-160ms when left midway)
    const duration = Math.max(140, Math.round(dist * 240));
    const proxy = { p: startP };
    animRef.current = animate(proxy, {
      p: targetP,
      duration,
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
        setExpanded(true);
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
          if (!isHoveredRef.current && !isDraggingRef.current) {
            setExpanded(false);
          }
        }, 90);
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        el.removeEventListener('wheel', onWheel);
        if (wheelRaf !== null) cancelAnimationFrame(wheelRaf);
      };
    };

    const cleanupDesktop = attachWheel(desktopContainerRef.current, true);
    const cleanupMobile = attachWheel(mobileContainerRef.current, false);
    return () => {
      cleanupDesktop();
      cleanupMobile();
    };
  }, [updateProgress, setExpanded]);

  // Window-level safety cleanup for dragging and cursor states
  useEffect(() => {
    const onGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.classList.remove('cur-focal-dragging');
        if (!isHoveredRef.current) {
          setExpanded(false);
        }
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
  }, [setExpanded]);

  const handlePointerDown = (e: React.PointerEvent, isVert: boolean) => {
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    document.body.classList.add('cur-focal-dragging');
    setExpanded(true);
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
    if (!isHoveredRef.current) {
      setExpanded(false);
    }
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

  // Initial alignment and expansion on mount
  useEffect(() => {
    updateProgress(currentProgressRef.current);
    setExpanded(false);
  }, [updateProgress, setExpanded]);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-9 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 z-[1100] select-none pointer-events-auto"
      onPointerEnter={() => {
        isHoveredRef.current = true;
        document.body.classList.add('cur-focal');
        setExpanded(true);
      }}
      onPointerLeave={() => {
        isHoveredRef.current = false;
        if (!isDraggingRef.current) {
          document.body.classList.remove('cur-focal');
          setExpanded(false);
        }
      }}
      onFocus={() => {
        setExpanded(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          if (!isHoveredRef.current && !isDraggingRef.current) {
            setExpanded(false);
          }
        }
      }}
    >
      {/* Desktop Layout: Stacked Labels on the LEFT, Bar on the RIGHT */}
      <div
        ref={desktopContainerRef}
        className="hidden lg:flex items-center gap-2.5"
      >
        {/* Desktop Labels Column: Expands to the left on hover */}
        <div
          ref={labelColRef}
          className="relative h-[144px] w-[20px] select-none pointer-events-auto"
        >
          {/* Compact Monogram: H */}
          <button
            ref={compactHumanRef}
            type="button"
            onClick={() => snapTo(0.0)}
            className="absolute top-[36px] -translate-y-1/2 right-0 flex items-center justify-end cursor-pointer group text-right focus:outline-none whitespace-nowrap p-0 m-0 bg-transparent border-0"
            aria-label="24mm Human view"
          >
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'human'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              H
            </span>
          </button>

          {/* Compact Monogram: M */}
          <button
            ref={compactMachineRef}
            type="button"
            onClick={() => snapTo(1.0)}
            className="absolute top-[108px] -translate-y-1/2 right-0 flex items-center justify-end cursor-pointer group text-right focus:outline-none whitespace-nowrap p-0 m-0 bg-transparent border-0"
            aria-label="48mm Machine view"
          >
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'machine'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              M
            </span>
          </button>

          {/* Full Stacked Label: 24MM HUMAN */}
          <button
            ref={fullHumanRef}
            type="button"
            onClick={() => snapTo(0.0)}
            className="absolute top-[36px] -translate-y-1/2 right-0 flex flex-col items-end cursor-pointer group text-right focus:outline-none whitespace-nowrap p-0 m-0 bg-transparent border-0 opacity-0 pointer-events-none"
            aria-label="24mm Human view"
          >
            <span
              className={`font-mono text-[9px] tracking-[0.18em] uppercase whitespace-nowrap leading-none mb-1.5 transition-colors text-right ${
                activeMode === 'human'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              24MM
            </span>
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'human'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              HUMAN
            </span>
          </button>

          {/* Full Stacked Label: 48MM MACHINE */}
          <button
            ref={fullMachineRef}
            type="button"
            onClick={() => snapTo(1.0)}
            className="absolute top-[108px] -translate-y-1/2 right-0 flex flex-col items-end cursor-pointer group text-right focus:outline-none whitespace-nowrap p-0 m-0 bg-transparent border-0 opacity-0 pointer-events-none"
            aria-label="48mm Machine view"
          >
            <span
              className={`font-mono text-[9px] tracking-[0.18em] uppercase whitespace-nowrap leading-none mb-1.5 transition-colors text-right ${
                activeMode === 'machine'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              48MM
            </span>
            <span
              className={`font-mono text-[11px] tracking-[0.14em] uppercase whitespace-nowrap leading-none transition-colors text-right ${
                activeMode === 'machine'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}
            >
              MACHINE
            </span>
          </button>
        </div>

        {/* Desktop Vertical Textured Knob Track */}
        <div
          ref={desktopTrackRef}
          className="focal-track-vert touch-none relative w-4 h-[144px] overflow-hidden cursor-ns-resize select-none shrink-0"
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
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 16 144"
              className="w-full h-[144px] overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {KNOB_LINE_INDICES.map((k) => {
                const y = k * 12;
                const isHighlighter = k === 3;
                return (
                  <line
                    key={k}
                    x1="2"
                    y1={y}
                    x2="14"
                    y2={y}
                    stroke={isHighlighter ? 'var(--primary)' : 'var(--input)'}
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
      <div
        ref={mobileContainerRef}
        className="flex lg:hidden items-center gap-2 sm:gap-3"
      >
        <button
          type="button"
          onClick={() => snapTo(0.0)}
          className="flex flex-col items-center cursor-pointer text-center select-none focus:outline-none whitespace-nowrap"
          aria-label="24mm Human view"
        >
          <span
            className={`font-mono text-[9px] tracking-wider uppercase whitespace-nowrap leading-none mb-1 transition-colors ${
              activeMode === 'human' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            24MM
          </span>
          <span
            className={`font-mono text-[10px] tracking-wider uppercase whitespace-nowrap leading-none transition-colors ${
              activeMode === 'human' ? 'text-foreground font-semibold' : 'text-muted-foreground'
            }`}
          >
            HUMAN
          </span>
        </button>

        <div
          ref={mobileTrackRef}
          className="focal-track-horiz touch-none relative w-[144px] h-4 overflow-hidden cursor-ew-resize select-none shrink-0"
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
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 144 16"
              className="w-[144px] h-full overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {KNOB_LINE_INDICES.map((k) => {
                const x = k * 12;
                const isHighlighter = k === 3;
                return (
                  <line
                    key={k}
                    x1={x}
                    y1="2"
                    x2={x}
                    y2="14"
                    stroke={isHighlighter ? 'var(--primary)' : 'var(--input)'}
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
              activeMode === 'machine' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            48MM
          </span>
          <span
            className={`font-mono text-[10px] tracking-wider uppercase whitespace-nowrap leading-none transition-colors ${
              activeMode === 'machine' ? 'text-foreground font-semibold' : 'text-muted-foreground'
            }`}
          >
            MACHINE
          </span>
        </button>
      </div>
    </div>
  );
}
