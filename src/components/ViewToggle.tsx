import { useState, useRef, useEffect } from 'react';
import { createTimeline, utils } from '../lib/motion';
import { Toggle } from './ui/toggle';

const startsInMachine = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('machine') === 'true';

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
  // spectral ramp as the rest of the site instead of one flat grey. The design
  // frame (11 - MACHINE VIEW) assigns: # to F, ## to G, ### to A, list markers
  // to muted, everything else to ink.
  //
  // This runs LINE-WISE on already-escaped text, after links and bold, so the
  // spans it adds cannot be re-escaped and cannot swallow an <a> or <strong>.
  // Matching is anchored to the start of a line, so a '#' inside prose is not a
  // heading. KNOWN LIMITATION: there is no fence tracking here, so a '#' comment
  // on its own line inside a fenced block IS styled as a heading. Harmless in
  // the current posts; if it starts mattering, track fences rather than widening
  // this regex.
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
    // the toggle — no recolor, no shimmer.
    // Pure opacity crossfade does the rest (same in light and dark).
    if (next === 'machine') {
      root.classList.add('machine-mode');
      document.body.classList.add('machine-mode');
    } else {
      root.classList.remove('machine-mode');
      document.body.classList.remove('machine-mode');
    }

    // ONE clock: outgoing 1→0 and incoming 0→1, identical duration/ease — perfectly in sync.
    const DURATION = 400;
    const tl = createTimeline({
      onComplete: () => {
        // Finalize cleanly: inactive view out of flow + hidden; active view sits normally in flow.
        outgoing.classList.remove('view-overlay');
        outgoing.style.display = 'none';
        outgoing.style.pointerEvents = 'none';
        outgoing.style.transform = '';

        incoming.style.display = '';
        incoming.style.pointerEvents = 'auto';
        // Keep opacity:1 inline so the active view stays visible (the .machine-view stylesheet
        // default is opacity:0 — clearing it would re-hide the terminal). Only clear transform.
        utils.set(incoming, { opacity: 1 });
        incoming.style.transform = '';

        setTransitioning(false);
      },
    });

    tl.add(outgoing, { opacity: 0, duration: DURATION, ease: 'inOutQuad' }, 0);
    tl.add(incoming, { opacity: [0, 1], duration: DURATION, ease: 'inOutQuad' }, 0);
  };

  // After hydration: when starting in machine view (?machine=true), lock in the
  // machine end-state via utils.set (no animation) so it matches the pre-hydration
  // paint (handled by machine.css initial states + the no-FOUC head script) and
  // no human-content flash appears as motion takes over.
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
    utils.set(humanView, { opacity: 0 });

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
    utils.set(machineView, { opacity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="chrome-panel"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'human') toggle(); }}
          className="chrome-seg tap-44 flex h-auto min-w-0 items-center gap-1 rounded-none bg-transparent px-3 py-1.5 text-[0.5625rem] font-normal hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent"
        >
          <span className="chrome-bracket" aria-hidden="true">[</span>
          <span>Human</span>
          <span className="chrome-bracket" aria-hidden="true">]</span>
        </Toggle>
        <Toggle
          pressed={mode === 'machine'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'machine') toggle(); }}
          className="chrome-seg tap-44 flex h-auto min-w-0 items-center gap-1 rounded-none bg-transparent px-3 py-1.5 text-[0.5625rem] font-normal hover:bg-transparent aria-pressed:bg-transparent data-[state=on]:bg-transparent"
        >
          <span className="chrome-bracket" aria-hidden="true">[</span>
          <span>Machine</span>
          <span className="chrome-bracket" aria-hidden="true">]</span>
        </Toggle>
      </div>
    </div>
  );
}
