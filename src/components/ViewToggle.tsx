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
        // Brighten heading lines but keep raw markdown syntax visible
        const withHeadings = withBold
          .replace(/^(### .+)$/gm, '<span class="machine-h3">$1</span>')
          .replace(/^(## .+)$/gm, '<span class="machine-h2">$1</span>')
          .replace(/^(# .+)$/gm, '<span class="machine-h1">$1</span>');
        machineView.innerHTML = `<div class="machine-content-wrapper"><pre class="machine-pre">${withHeadings}</pre></div>`;
        machineLoadedRef.current = true;
      }

      // Capture current heights for smooth animation
      const humanHeight = humanView.scrollHeight;
      humanView.style.height = `${humanHeight}px`;

      // Force reflow
      humanView.offsetHeight;

      // Start background transition
      document.body.classList.add('machine-mode');

      // Collapse human view
      requestAnimationFrame(() => {
        humanView.classList.add('collapsed');
        humanView.style.height = '0px';

        // After human collapses, expand machine
        setTimeout(() => {
          machineView.classList.add('expanded');
          window.scrollTo({ top: 0, behavior: 'instant' });
          setMode(next);
          setTimeout(() => setTransitioning(false), 300);
        }, 250);
      });
    } else {
      // Collapse machine view
      machineView.classList.remove('expanded');

      setTimeout(() => {
        // Restore background
        document.body.classList.remove('machine-mode');

        // Expand human view
        humanView.classList.remove('collapsed');
        humanView.style.height = '';
        window.scrollTo({ top: 0, behavior: 'instant' });

        setMode(next);
        setTimeout(() => setTransitioning(false), 300);
      }, 250);
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
