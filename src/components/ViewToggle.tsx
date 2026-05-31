import { useState, useRef, useEffect } from 'react';
import { gsap } from '../lib/gsap';
import { Toggle } from './ui/toggle';

const startsInMachine = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('machine') === 'true';

// Build the machine-view inner HTML from the raw markdown payload.
const buildMachineHtml = () => {
  const raw: string = (window as any).__RAW_MARKDOWN__ || '';
  const withLinks = raw.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
  );
  const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return `<div class="machine-content-wrapper"><pre class="machine-pre">${withBold}</pre></div>`;
};

export default function ViewToggle() {
  // Lazily initialize from the URL so ?machine=true first paints as machine view.
  const [mode, setMode] = useState<'human' | 'machine'>(() =>
    startsInMachine() ? 'machine' : 'human',
  );
  const [transitioning, setTransitioning] = useState(false);
  const machineLoadedRef = useRef(false);
  const islandRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (transitioning) return;
    setTransitioning(true);

    const next = mode === 'human' ? 'machine' : 'human';

    // Sync the URL to reflect the mode we're switching TO, without navigation/reload
    const params = new URLSearchParams(window.location.search);
    if (next === 'machine') params.set('machine', 'true');
    else params.delete('machine');
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);

    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;

    if (!humanView || !machineView) return;

    // Reset scroll ONCE, synchronously, before any height churn (no mid-animation jump).
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (next === 'machine') {
      // Load machine content on first toggle
      if (!machineLoadedRef.current) {
        machineView.innerHTML = buildMachineHtml();
        machineLoadedRef.current = true;
      }

      setMode(next);

      // Snap the WHOLE canvas (html + body) to the dark terminal in one frame with transitions
      // suppressed, so no light html shows through a half-opaque body (the light-mode flicker).
      // GSAP then crossfades the views over the already-dark backdrop.
      const root = document.documentElement;
      root.classList.add('mode-switching');
      root.classList.add('machine-mode');
      document.body.classList.add('machine-mode');
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.remove('mode-switching'));

      const tl = gsap.timeline({ onComplete: () => setTransitioning(false) });

      // SEQUENTIAL "boot-up": canvas is already dark (snapped above). First fade the human
      // content OUT to the dark canvas, then fade the terminal text IN on the black — so the
      // machine view appears smoothly on an already-dark stage instead of crossfading.
      tl.to(humanView, {
        opacity: 0,
        y: -8,
        duration: 0.3,
        ease: 'power2.in',
        onStart: () => {
          humanView.style.overflow = 'hidden';
          gsap.set(humanView, { height: humanView.scrollHeight });
        },
        onComplete: () => {
          gsap.set(humanView, { height: 0 });
          humanView.style.pointerEvents = 'none';
          humanView.style.minHeight = '0';
        },
      }, 0);

      // Terminal fades/rises in on the dark stage, starting just after the human view clears.
      tl.fromTo(machineView,
        { height: 'auto', opacity: 0, y: 10, overflow: 'visible' },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          onStart: () => { machineView.style.pointerEvents = 'auto'; },
          onComplete: () => { gsap.set(machineView, { clearProps: 'transform' }); },
        }, 0.28);

      // (Canvas already snapped dark via the atomic html+body .machine-mode class above.)

    } else {
      setMode(next);

      // Snap the canvas back to the current mode (html + body) in one suppressed frame, then
      // GSAP crossfades the human view in over the already-correct backdrop.
      const root = document.documentElement;
      root.classList.add('mode-switching');
      root.classList.remove('machine-mode');
      document.body.classList.remove('machine-mode');
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.remove('mode-switching'));

      const tl = gsap.timeline({ onComplete: () => setTransitioning(false) });

      // Machine layer fades out FAST so the dark terminal doesn't linger on the restored canvas.
      tl.to(machineView, {
        height: 0,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onStart: () => { machineView.style.overflow = 'hidden'; },
        onComplete: () => { machineView.style.pointerEvents = 'none'; },
      }, 0);

      // Human view expands/fades in over the (now correct-mode) canvas.
      tl.to(humanView, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        onStart: () => {
          humanView.style.overflow = '';
          humanView.style.pointerEvents = '';
          humanView.style.minHeight = '';
        },
      }, 0);
    }
  };

  // On mount: when starting in machine view (?machine=true), apply the SAME
  // final DOM/GSAP end-state INSTANTLY (gsap.set, no animation) so the very
  // first paint is already machine view — no human-content flash/FOUC.
  useEffect(() => {
    if (!startsInMachine()) return;

    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;
    if (!humanView || !machineView) return;

    // Same machine-content load that toggle() performs.
    if (!machineLoadedRef.current) {
      machineView.innerHTML = buildMachineHtml();
      machineLoadedRef.current = true;
    }

    // Island styling is CSS-driven (bg-surface adapts via machine-mode tokens) — no gsap override.

    // Human view collapsed/hidden end-state.
    humanView.style.overflow = 'hidden';
    humanView.style.pointerEvents = 'none';
    humanView.style.minHeight = '0';
    gsap.set(humanView, { height: 0, opacity: 0 });

    // Canvas end-state: machine-mode on html + body so the whole backdrop is dark.
    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');

    // Machine view expanded/visible end-state.
    machineView.style.pointerEvents = 'auto';
    machineView.style.overflow = 'visible';
    gsap.set(machineView, { height: 'auto', opacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="flex gap-4 px-4 py-2.5 rounded-full backdrop-blur-xl font-mono text-sm bg-surface/92 border border-[rgb(var(--border)/0.14)] shadow-[var(--card-shadow)]"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'human') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'human' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-muted/40'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'human' ? 'text-heading' : 'text-muted'
          }`}>Human</span>
        </Toggle>
        <Toggle
          pressed={mode === 'machine'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'machine') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'machine' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-muted/40'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'machine' ? 'text-heading' : 'text-muted'
          }`}>Machine</span>
        </Toggle>
      </div>
    </div>
  );
}
