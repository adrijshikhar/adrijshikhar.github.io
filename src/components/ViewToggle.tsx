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
  // Init 'human' to match SSR (the static build has no URL param) — avoids a hydration
  // mismatch on ?machine=true. The mount effect below flips to 'machine' right after
  // hydration; the view DOM itself is set to the machine end-state instantly there.
  const [mode, setMode] = useState<'human' | 'machine'>('human');
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

    if (!humanView || !machineView) {
      setTransitioning(false);
      return;
    }

    // Load machine content on first switch into machine view.
    if (next === 'machine' && !machineLoadedRef.current) {
      machineView.innerHTML = buildMachineHtml();
      machineLoadedRef.current = true;
    }

    // Pin scroll to top ONCE, up front — no mid-animation jump.
    window.scrollTo({ top: 0, behavior: 'auto' });

    setMode(next);

    const incoming = next === 'machine' ? machineView : humanView;
    const outgoing = next === 'machine' ? humanView : machineView;

    // parallel.ai technique (ported from G) — NO geometry animation:
    //   1. Lift the OUTGOING view OUT of flow (.view-overlay = position:absolute) so the
    //      INCOMING view immediately occupies the space at its natural height. Zero reflow.
    //   2. Both views render at full natural height (clear any prior height:0 / overflow).
    //   3. Crossfade OPACITY of both on ONE 0.4s power1.inOut timeline.
    // The machine canvas is token-driven (== the active mode), so the toggle never recolors
    // the background — pure opacity crossfade, identical in light and dark.
    outgoing.classList.add('view-overlay');
    outgoing.style.height = 'auto';
    outgoing.style.minHeight = '';
    outgoing.style.overflow = 'visible';
    outgoing.style.pointerEvents = 'none';

    incoming.style.height = 'auto';
    incoming.style.minHeight = '';
    incoming.style.overflow = 'visible';
    incoming.style.display = '';

    // .machine-mode only hides the spotlight overlay now (canvas follows the mode token).
    if (next === 'machine') {
      document.documentElement.classList.add('machine-mode');
      document.body.classList.add('machine-mode');
    } else {
      document.documentElement.classList.remove('machine-mode');
      document.body.classList.remove('machine-mode');
    }

    // ONE clock: outgoing 1→0 and incoming 0→1, identical duration/ease — perfectly in sync.
    const DURATION = 0.4;
    const tl = gsap.timeline({
      onComplete: () => {
        outgoing.classList.remove('view-overlay');
        outgoing.style.display = 'none';
        outgoing.style.pointerEvents = 'none';
        gsap.set(outgoing, { clearProps: 'transform' });

        incoming.style.display = '';
        incoming.style.pointerEvents = 'auto';
        // Keep opacity:1 inline so the active view stays visible (the .machine-view
        // stylesheet default is opacity:0 — clearing it would re-hide the terminal).
        gsap.set(incoming, { opacity: 1, clearProps: 'transform' });

        setTransitioning(false);
      },
    });

    tl.to(outgoing, { opacity: 0, duration: DURATION, ease: 'power1.inOut' }, 0);
    tl.fromTo(
      incoming,
      { opacity: 0 },
      { opacity: 1, duration: DURATION, ease: 'power1.inOut' },
      0,
    );
  };

  // On mount: when starting in machine view (?machine=true), apply the SAME final
  // DOM/GSAP end-state INSTANTLY (gsap.set, no animation) so the first paint is
  // already machine view — no human-content flash/FOUC, no height tween.
  useEffect(() => {
    if (!startsInMachine()) return;

    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;
    if (!humanView || !machineView) return;

    // Reflect machine in the toggle indicator (post-hydration, so no SSR mismatch).
    setMode('machine');

    if (!machineLoadedRef.current) {
      machineView.innerHTML = buildMachineHtml();
      machineLoadedRef.current = true;
    }

    // Human view: out of flow, hidden.
    humanView.style.display = 'none';
    humanView.style.pointerEvents = 'none';
    gsap.set(humanView, { opacity: 0 });

    // Canvas end-state: machine-mode on html + body (hides the spotlight overlay).
    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');

    // Machine view: in flow at natural height, visible.
    machineView.style.display = '';
    machineView.style.pointerEvents = 'auto';
    machineView.style.height = 'auto';
    machineView.style.overflow = 'visible';
    gsap.set(machineView, { opacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="flex gap-4 border-[3px] border-ink bg-[#f6e7df] px-4 py-2.5 font-mono text-sm shadow-[5px_5px_0_0_var(--ink)] backdrop-blur-xl"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'human') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[7px] inline-block transition-all duration-300 ${
            mode === 'human' ? 'bg-accent outline outline-1 outline-offset-1 outline-ink' : 'outline outline-1 outline-offset-1 outline-muted'
          }`} />
          <span className={`bh-label transition-colors duration-300 ${
            mode === 'human' ? 'text-heading' : 'text-muted'
          }`}>Human</span>
        </Toggle>
        <Toggle
          pressed={mode === 'machine'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'machine') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[7px] inline-block transition-all duration-300 ${
            mode === 'machine' ? 'bg-accent outline outline-1 outline-offset-1 outline-ink' : 'outline outline-1 outline-offset-1 outline-muted'
          }`} />
          <span className={`bh-label transition-colors duration-300 ${
            mode === 'machine' ? 'text-heading' : 'text-muted'
          }`}>Machine</span>
        </Toggle>
      </div>
    </div>
  );
}
