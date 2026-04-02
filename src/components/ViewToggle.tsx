import { useState, useRef, useCallback } from 'react';
import { gsap } from '../lib/gsap';

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

    gsap.set(machineView, { position: 'relative', opacity: 0, pointerEvents: 'none', y: 20 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        gsap.set(humanView, { display: 'none' });
        setMode('machine');
        setTransitioning(false);
      },
    });

    // Left column (header/sidebar) slides RIGHT and fades
    if (header) {
      tl.to(header, { x: 150, opacity: 0, duration: 0.8 }, 0);
    }

    // Right column (main content) slides LEFT and fades — slight delay so it trails the sidebar
    if (main) {
      tl.to(main, { x: -150, opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 0.05);
    }

    // Background darkens simultaneously
    tl.to(document.body, { backgroundColor: '#101010', duration: 1, ease: 'power1.inOut' }, 0);

    // Machine fades in from center after columns converge
    tl.set(humanView, { pointerEvents: 'none' }, 0.6);
    tl.to(machineView, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.6);
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
    gsap.set(humanView, { display: '', pointerEvents: 'none' });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        gsap.set(machineView, { position: 'absolute', inset: 0, pointerEvents: 'none' });
        gsap.set(humanView, { pointerEvents: 'auto' });
        setMode('human');
        setTransitioning(false);
      },
    });

    // Machine fades out
    tl.to(machineView, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.in' }, 0);
    tl.to(document.body, { backgroundColor: '#0f172a', duration: 1, ease: 'power1.inOut' }, 0);

    // Columns expand back out
    if (header) {
      tl.to(header, { x: 0, opacity: 1, duration: 0.7 }, 0.3);
    }
    if (main) {
      tl.to(main, { x: 0, opacity: 1, duration: 0.7 }, 0.3);
    }

    tl.set(humanView, { pointerEvents: 'auto' }, 0.4);
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
