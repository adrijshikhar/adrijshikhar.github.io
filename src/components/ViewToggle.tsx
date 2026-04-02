import { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const [transitioning, setTransitioning] = useState(false);
  const machineLoadedRef = useRef(false);

  const toMachine = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);

    const humanView = document.querySelector('.human-view') as HTMLElement;
    const machineView = document.querySelector('.machine-view') as HTMLElement;
    const header = document.querySelector('header') as HTMLElement;
    if (!humanView || !machineView) return;

    // Load machine content once
    if (!machineLoadedRef.current) {
      const raw: string = (window as any).__RAW_MARKDOWN__ || '';
      const processed = raw
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^(### .+)$/gm, '<span class="machine-h3">$1</span>')
        .replace(/^(## .+)$/gm, '<span class="machine-h2">$1</span>')
        .replace(/^(# .+)$/gm, '<span class="machine-h1">$1</span>');
      machineView.innerHTML = `<div class="machine-content-wrapper"><pre class="machine-pre">${processed}</pre></div>`;
      machineLoadedRef.current = true;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    const tl = gsap.timeline({
      onComplete: () => {
        humanView.style.position = 'absolute';
        humanView.style.inset = '0';
        humanView.style.pointerEvents = 'none';
        setMode('machine');
        setTransitioning(false);
      },
    });

    // Fade out sidebar
    if (header) {
      tl.to(header, { opacity: 0, x: -30, duration: 0.3, ease: 'power2.in' }, 0);
    }

    // Fade out human, bg color change, fade in machine — all overlapping
    tl.to(humanView, { opacity: 0, scale: 0.98, duration: 0.4, ease: 'power2.in' }, 0.1);
    tl.to(document.body, { backgroundColor: '#101010', duration: 0.5, ease: 'power1.inOut' }, 0.1);
    tl.set(machineView, { position: 'relative', pointerEvents: 'auto' }, 0.3);
    tl.to(machineView, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
  }, [transitioning]);

  const toHuman = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);

    const humanView = document.querySelector('.human-view') as HTMLElement;
    const machineView = document.querySelector('.machine-view') as HTMLElement;
    const header = document.querySelector('header') as HTMLElement;
    if (!humanView || !machineView) return;

    window.scrollTo({ top: 0, behavior: 'instant' });

    const tl = gsap.timeline({
      onComplete: () => {
        machineView.style.position = 'absolute';
        machineView.style.inset = '0';
        machineView.style.pointerEvents = 'none';
        setMode('human');
        setTransitioning(false);
      },
    });

    // Fade out machine, bg color change, fade in human — all overlapping
    tl.to(machineView, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    tl.to(document.body, { backgroundColor: '#0f172a', duration: 0.5, ease: 'power1.inOut' }, 0.1);
    tl.set(humanView, { position: 'relative', pointerEvents: 'auto', clearProps: 'inset' }, 0.2);
    tl.to(humanView, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, 0.2);

    // Fade sidebar back
    if (header) {
      tl.to(header, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 0.3);
    }
  }, [transitioning]);

  return (
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
      <div className={`flex gap-4 px-3 py-2 rounded-sm backdrop-blur-md font-mono text-sm transition-all duration-500 ${
        mode === 'machine'
          ? 'bg-[#181818]/90 border border-[#434343]'
          : 'bg-[#112240]/90 border border-[#233554]'
      }`}>
        <button
          onClick={mode === 'human' ? undefined : toHuman}
          disabled={transitioning}
          className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
            transitioning ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'human' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-[#858483]/30'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'human' ? 'text-white' : 'text-[#858483]/50'
          }`}>Human</span>
        </button>
        <button
          onClick={mode === 'machine' ? undefined : toMachine}
          disabled={transitioning}
          className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
            transitioning ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'machine' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-[#858483]/30'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'machine' ? 'text-white' : 'text-[#858483]/50'
          }`}>Machine</span>
        </button>
      </div>
    </div>
  );
}
