import { useState, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Toggle } from './ui/toggle';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const [transitioning, setTransitioning] = useState(false);
  const machineLoadedRef = useRef(false);
  const islandRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (transitioning) return;
    setTransitioning(true);

    const next = mode === 'human' ? 'machine' : 'human';
    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;

    if (!humanView || !machineView) return;

    if (next === 'machine') {
      // Load machine content on first toggle
      if (!machineLoadedRef.current) {
        const raw: string = (window as any).__RAW_MARKDOWN__ || '';
        const withLinks = raw.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
        );
        const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        machineView.innerHTML = `<div class="machine-content-wrapper"><pre class="machine-pre">${withBold}</pre></div>`;
        machineLoadedRef.current = true;
      }

      // Update toggle indicator immediately
      setMode(next);

      const tl = gsap.timeline({
        onComplete: () => {
          setTransitioning(false);
        },
      });

      // Island transitions first
      if (islandRef.current) {
        tl.to(islandRef.current, {
          backgroundColor: 'rgba(24, 24, 24, 0.95)',
          borderColor: '#555555',
          duration: 0.15,
          ease: 'power1.inOut',
        }, 0);
      }

      // Collapse human view
      tl.to(humanView, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.inOut',
        onStart: () => {
          humanView.style.overflow = 'hidden';
          gsap.set(humanView, { height: humanView.scrollHeight });
        },
        onComplete: () => {
          humanView.style.pointerEvents = 'none';
          humanView.style.minHeight = '0';
        },
      }, 0);

      // Background transition
      tl.to(document.body, {
        backgroundColor: '#101010',
        duration: 0.2,
        ease: 'power1.inOut',
        onStart: () => {
          document.body.classList.add('machine-mode');
        },
      }, '-=0.1');

      // Expand machine view
      tl.fromTo(machineView, {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
      }, {
        height: 'auto',
        opacity: 1,
        duration: 0.25,
        ease: 'power2.inOut',
        onStart: () => {
          machineView.style.pointerEvents = 'auto';
          machineView.style.overflow = 'visible';
          window.scrollTo({ top: 0, behavior: 'instant' });
        },
      }, '-=0.05');

    } else {
      // Update toggle indicator immediately
      setMode(next);

      const tl = gsap.timeline({
        onComplete: () => {
          setTransitioning(false);
        },
      });

      // Island transitions first
      if (islandRef.current) {
        tl.to(islandRef.current, {
          backgroundColor: 'rgba(10, 25, 47, 0.95)',
          borderColor: 'rgba(100, 116, 139, 0.4)',
          duration: 0.15,
          ease: 'power1.inOut',
        }, 0);
      }

      // Collapse machine view
      tl.to(machineView, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.inOut',
        onStart: () => {
          machineView.style.overflow = 'hidden';
        },
        onComplete: () => {
          machineView.style.pointerEvents = 'none';
        },
      }, 0);

      // Background transition
      tl.to(document.body, {
        backgroundColor: '#0f172a',
        duration: 0.2,
        ease: 'power1.inOut',
        onStart: () => {
          document.body.classList.remove('machine-mode');
        },
      }, '-=0.1');

      // Expand human view
      tl.to(humanView, {
        height: 'auto',
        opacity: 1,
        duration: 0.25,
        ease: 'power2.inOut',
        onStart: () => {
          humanView.style.overflow = '';
          humanView.style.pointerEvents = '';
          humanView.style.minHeight = '';
          window.scrollTo({ top: 0, behavior: 'instant' });
        },
      }, '-=0.05');
    }
  };

  return (
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div
        ref={islandRef}
        className="flex gap-4 px-4 py-2.5 rounded-md backdrop-blur-xl font-mono text-sm bg-[#0a192f]/95 border border-slate-500/40"
      >
        <Toggle
          pressed={mode === 'human'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'human') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'human' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-[#858483]/30'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'human' ? 'text-white' : 'text-[#858483]/50'
          }`}>Human</span>
        </Toggle>
        <Toggle
          pressed={mode === 'machine'}
          onPressedChange={(pressed) => { if (pressed && mode !== 'machine') toggle(); }}
          className="!bg-transparent !h-auto !min-w-0 !px-0 !py-0 !rounded-none flex items-center gap-2 transition-colors duration-300 hover:!bg-transparent data-[state=on]:!bg-transparent"
        >
          <span className={`size-[6px] inline-block rounded-full transition-all duration-500 ${
            mode === 'machine' ? 'bg-current outline outline-1 outline-offset-1 outline-current' : 'outline outline-1 outline-offset-1 outline-[#858483]/30'
          }`} />
          <span className={`uppercase text-xs tracking-wider transition-colors duration-300 ${
            mode === 'machine' ? 'text-white' : 'text-[#858483]/50'
          }`}>Machine</span>
        </Toggle>
      </div>
    </div>
  );
}
