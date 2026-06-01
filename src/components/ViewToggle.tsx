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
  // Init 'human' to match SSR (the static build has no URL param) — avoids a hydration mismatch
  // on ?machine=true. The mount effect below flips to 'machine' right after hydration; the view
  // DOM itself is set to the machine end-state instantly in that same effect (no human flash).
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
    const root = document.documentElement;

    // parallel.ai technique — NO geometry animation:
    //   1. Lift the OUTGOING view OUT of flow (position:absolute via .view-overlay) so the
    //      INCOMING view immediately occupies the space at its natural height. Zero reflow.
    //   2. Both views render at full natural height (clear any prior height:0 / overflow).
    //   3. Crossfade OPACITY of both on ONE timeline (same 0.4s power1.inOut clock).
    //   4. Crossfade the CANVAS (html+body .machine-mode) on the SAME 0.4s ease via .view-fade.

    // Both views fully laid out for the crossfade — full natural height, no clipping. The
    // outgoing view is lifted out of flow (.view-overlay = position:absolute; inset:0) so the
    // incoming view takes the space at its natural height. Explicit auto/visible overrides the
    // stylesheet's collapsed .machine-view default so the outgoing machine view stays visible
    // while it fades (no collapse-then-vanish).
    outgoing.classList.add('view-overlay');
    outgoing.style.height = 'auto';
    outgoing.style.minHeight = '';
    outgoing.style.overflow = 'visible';
    outgoing.style.pointerEvents = 'none';

    // Explicit auto/visible to override the stylesheet's collapsed .machine-view default
    // (height:0; overflow:hidden) so the incoming view sits at full natural height — no tween.
    incoming.style.height = 'auto';
    incoming.style.minHeight = '';
    incoming.style.overflow = 'visible';
    incoming.style.display = '';

    // Machine view follows the active mode (token-driven), so the canvas colour is IDENTICAL across
    // the toggle — no recolor, no shimmer. The only effect of .machine-mode is hiding the aurora.
    // Pure GSAP opacity crossfade does the rest (same in light and dark).
    if (next === 'machine') {
      root.classList.add('machine-mode');
      document.body.classList.add('machine-mode');
    } else {
      root.classList.remove('machine-mode');
      document.body.classList.remove('machine-mode');
    }

    // ONE clock: outgoing 1→0 and incoming 0→1, identical duration/ease — perfectly in sync.
    const DURATION = 0.4;
    const tl = gsap.timeline({
      onComplete: () => {
        // Finalize cleanly: inactive view out of flow + hidden; active view sits normally in flow.
        outgoing.classList.remove('view-overlay');
        outgoing.style.display = 'none';
        outgoing.style.pointerEvents = 'none';
        gsap.set(outgoing, { clearProps: 'transform' });

        incoming.style.display = '';
        incoming.style.pointerEvents = 'auto';
        // Keep opacity:1 inline so the active view stays visible (the .machine-view stylesheet
        // default is opacity:0 — clearing it would re-hide the terminal). Only clear transform.
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

  // After hydration: when starting in machine view (?machine=true), lock in the
  // machine end-state via gsap.set (no animation) so it matches the pre-hydration
  // paint (handled by machine.css initial states + the no-FOUC head script) and
  // no human-content flash appears as GSAP takes over.
  useEffect(() => {
    if (!startsInMachine()) return;

    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;
    if (!humanView || !machineView) return;

    // Reflect machine in the toggle indicator (post-hydration, so no SSR mismatch).
    setMode('machine');

    // Same machine-content load that toggle() performs.
    if (!machineLoadedRef.current) {
      machineView.innerHTML = buildMachineHtml();
      machineLoadedRef.current = true;
    }

    // Apply the SAME final end-state as toggle()'s onComplete — INSTANTLY, no animation,
    // no height tween (parallel.ai: zero geometry). First paint is already machine view.

    // Human view: out of flow, hidden.
    humanView.style.display = 'none';
    humanView.style.pointerEvents = 'none';
    gsap.set(humanView, { opacity: 0 });

    // Canvas end-state: machine-mode on html + body so the whole backdrop is dark.
    document.documentElement.classList.add('machine-mode');
    document.body.classList.add('machine-mode');
    // Drop the no-FOUC boot class now that JS controls the views via inline styles
    // (leaving it would !block toggling back to human via its .human-view rule).
    document.documentElement.classList.remove('machine-boot');

    // Machine view: in flow at natural height, visible.
    machineView.style.display = '';
    machineView.style.pointerEvents = 'auto';
    machineView.style.height = 'auto'; /* override .machine-view{height:0} so the terminal is visible on direct ?machine=true load */
    machineView.style.overflow = 'visible';
    gsap.set(machineView, { opacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="flex gap-4 px-4 py-2.5 rounded-xl backdrop-blur-xl font-mono text-sm bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] border border-[rgb(var(--border)/0.14)] shadow-[var(--card-shadow)]"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'human') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'human' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-muted'
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
            mode === 'machine' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-muted'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'machine' ? 'text-heading' : 'text-muted'
          }`}>Machine</span>
        </Toggle>
      </div>
    </div>
  );
}
