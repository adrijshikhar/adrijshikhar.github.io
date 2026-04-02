import { useState, useRef } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const [transitioning, setTransitioning] = useState(false);
  const machineLoadedRef = useRef(false);

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
        const withHeadings = withBold
          .replace(/^(### .+)$/gm, '<span class="machine-h3">$1</span>')
          .replace(/^(## .+)$/gm, '<span class="machine-h2">$1</span>')
          .replace(/^(# .+)$/gm, '<span class="machine-h1">$1</span>');
        machineView.innerHTML = `<div class="machine-content-wrapper"><pre class="machine-pre">${withHeadings}</pre></div>`;
        machineLoadedRef.current = true;
      }

      // Start bg transition immediately
      document.body.classList.add('machine-mode');
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Show machine view underneath, start fading human out
      machineView.classList.add('visible');
      humanView.classList.add('fade-out');

      // After crossfade completes, hide human fully
      setTimeout(() => {
        humanView.classList.add('hidden-final');
        setMode(next);
        setTransitioning(false);
      }, 500);

    } else {
      // Show human view, start fading machine out
      humanView.classList.remove('hidden-final');
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Small delay to let display:none removal take effect
      requestAnimationFrame(() => {
        humanView.classList.remove('fade-out');
        document.body.classList.remove('machine-mode');

        // After crossfade, hide machine
        setTimeout(() => {
          machineView.classList.remove('visible');
          setMode(next);
          setTransitioning(false);
        }, 500);
      });
    }
  };

  return (
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2">
      <div className={`flex gap-4 px-3 py-2 rounded-sm backdrop-blur-md font-mono text-sm transition-all duration-500 ${
        mode === 'machine'
          ? 'bg-[#181818]/90 border border-[#434343]'
          : 'bg-[#112240]/90 border border-[#233554]'
      }`}>
        <button
          onClick={mode === 'human' ? undefined : toggle}
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
          onClick={mode === 'machine' ? undefined : toggle}
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
