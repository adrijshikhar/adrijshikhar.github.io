import { useState, useRef, useEffect } from 'react';
import { animate } from '../lib/motion';
import { Toggle } from './ui/toggle';

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
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const transitioningRef = useRef(false);
  const machineLoadedRef = useRef(false);
  const islandRef = useRef<HTMLDivElement>(null);

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

  const switchMode = (nextMode: 'human' | 'machine') => {
    if (transitioningRef.current || nextMode === mode) return;
    transitioningRef.current = true;

    // Synchronize URL query parameter without navigation
    const params = new URLSearchParams(window.location.search);
    if (nextMode === 'machine') {
      params.set('machine', 'true');
    } else {
      params.delete('machine');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);

    const { humanPlane, machinePlane, skyEl } = getPlanes();
    if (!humanPlane || !machinePlane) {
      setMode(nextMode);
      transitioningRef.current = false;
      return;
    }

    ensureMachineLoaded(machinePlane);

    // Pin scroll to top once up front
    window.scrollTo({ top: 0, behavior: 'auto' });
    setMode(nextMode);

    const startP = nextMode === 'machine' ? 0.0 : 1.0;
    const targetP = nextMode === 'machine' ? 1.0 : 0.0;

    // Reduced motion fallback: instant application
    if (prefersReduced()) {
      applyOpticalProgress(targetP, humanPlane, machinePlane, skyEl);
      transitioningRef.current = false;
      return;
    }

    // Optical focus rack animation via Anime.js v4
    const proxy = { p: startP };
    animate(proxy, {
      p: targetP,
      duration: 380,
      ease: 'inOutQuad',
      onUpdate: () => {
        applyOpticalProgress(proxy.p, humanPlane, machinePlane, skyEl);
      },
      onComplete: () => {
        applyOpticalProgress(targetP, humanPlane, machinePlane, skyEl);
        transitioningRef.current = false;
      },
    });
  };

  // Direct ?machine=true initial mount handling
  useEffect(() => {
    if (!startsInMachine()) return;

    const { humanPlane, machinePlane, skyEl } = getPlanes();
    if (!humanPlane || !machinePlane) return;

    setMode('machine');
    ensureMachineLoaded(machinePlane);

    applyOpticalProgress(1.0, humanPlane, machinePlane, skyEl);

    // Drop the no-FOUC boot class once state is active
    document.documentElement.classList.remove('machine-boot');
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="chrome-panel"
        role="group"
        aria-label="View mode"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => {
            if (pressed && mode !== 'human') switchMode('human');
          }}
          className="chrome-seg tap-44 flex h-auto min-w-0 items-center gap-1 rounded-none bg-transparent px-3 py-1.5 text-[0.6875rem] font-normal hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent"
        >
          <span className="chrome-bracket" aria-hidden="true">[</span>
          <span>Human</span>
          <span className="chrome-bracket" aria-hidden="true">]</span>
        </Toggle>
        <Toggle
          pressed={mode === 'machine'}
          onPressedChange={(pressed) => {
            if (pressed && mode !== 'machine') switchMode('machine');
          }}
          className="chrome-seg tap-44 flex h-auto min-w-0 items-center gap-1 rounded-none bg-transparent px-3 py-1.5 text-[0.6875rem] font-normal hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent"
        >
          <span className="chrome-bracket" aria-hidden="true">[</span>
          <span>Machine</span>
          <span className="chrome-bracket" aria-hidden="true">]</span>
        </Toggle>
      </div>
    </div>
  );
}
