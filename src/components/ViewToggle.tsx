import { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const [transitioning, setTransitioning] = useState(false);
  const machineLoadedRef = useRef(false);

  const loadMachineContent = (machineView: HTMLElement) => {
    if (machineLoadedRef.current) return;
    const raw: string = (window as any).__RAW_MARKDOWN__ || '';
    const processed = raw
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^(### .+)$/gm, '<span class="machine-h3">$1</span>')
      .replace(/^(## .+)$/gm, '<span class="machine-h2">$1</span>')
      .replace(/^(# .+)$/gm, '<span class="machine-h1">$1</span>');
    machineView.innerHTML = `<div class="machine-content-wrapper"><pre class="machine-pre">${processed}</pre></div>`;
    machineLoadedRef.current = true;
  };

  const toMachine = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);

    const humanView = document.querySelector('.human-view') as HTMLElement;
    const machineView = document.querySelector('.machine-view') as HTMLElement;
    const header = document.querySelector('header') as HTMLElement;
    const main = document.querySelector('#content') as HTMLElement;
    if (!humanView || !machineView) return;

    loadMachineContent(machineView);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Prepare machine view
    gsap.set(machineView, { position: 'relative', opacity: 0, pointerEvents: 'none' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(humanView, { display: 'none' });
        setMode('machine');
        setTransitioning(false);
      },
    });

    // Squeeze: sidebar slides right, content slides left — converge to center
    if (header) {
      tl.to(header, { x: '40%', opacity: 0, duration: 0.5, ease: 'power3.in' }, 0);
    }
    if (main) {
      tl.to(main, { x: '-30%', opacity: 0, duration: 0.5, ease: 'power3.in' }, 0);
    }

    // Background darkens as content squeezes
    tl.to(document.body, { backgroundColor: '#101010', duration: 0.6, ease: 'power1.inOut' }, 0);

    // After squeeze, hide human and reveal machine from center
    tl.set(humanView, { pointerEvents: 'none' }, 0.45);
    tl.set(machineView, { pointerEvents: 'auto' }, 0.45);
    tl.to(machineView, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.45);
  }, [transitioning]);

  const toHuman = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);

    const humanView = document.querySelector('.human-view') as HTMLElement;
    const machineView = document.querySelector('.machine-view') as HTMLElement;
    const header = document.querySelector('header') as HTMLElement;
    const main = document.querySelector('#content') as HTMLElement;
    if (!humanView || !machineView) return;

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Restore human view for animation
    gsap.set(humanView, { display: '', pointerEvents: 'none' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(machineView, { position: 'absolute', inset: 0, pointerEvents: 'none' });
        gsap.set(humanView, { pointerEvents: 'auto' });
        setMode('human');
        setTransitioning(false);
      },
    });

    // Fade out machine
    tl.to(machineView, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);

    // Background lightens
    tl.to(document.body, { backgroundColor: '#0f172a', duration: 0.6, ease: 'power1.inOut' }, 0);

    // Expand: sidebar slides back from center-right, content from center-left
    if (header) {
      tl.to(header, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.25);
    }
    if (main) {
      tl.to(main, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.25);
    }

    tl.set(humanView, { pointerEvents: 'auto' }, 0.3);
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
