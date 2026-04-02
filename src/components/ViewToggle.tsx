import { useState } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const [transitioning, setTransitioning] = useState(false);

  const toggle = () => {
    if (transitioning) return;
    setTransitioning(true);

    const next = mode === 'human' ? 'machine' : 'human';
    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;

    if (next === 'machine') {
      // Load machine content on first toggle
      if (machineView && !machineView.getAttribute('data-loaded')) {
        const raw: string = (window as any).__RAW_MARKDOWN__ || '';
        const withLinks = raw.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
        );
        const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        machineView.innerHTML = `<pre class="machine-pre">${withBold}</pre>`;
        machineView.setAttribute('data-loaded', 'true');
      }

      // Phase 1: fade out human
      humanView?.classList.add('fade-out');

      setTimeout(() => {
        // Phase 2: swap views
        humanView?.classList.add('view-hidden');
        document.body.classList.add('machine-mode');
        machineView?.classList.remove('view-hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Phase 3: fade in machine (next frame)
        requestAnimationFrame(() => {
          machineView?.classList.add('fade-in');
          setMode(next);
          setTimeout(() => setTransitioning(false), 600);
        });
      }, 500);
    } else {
      // Phase 1: fade out machine
      machineView?.classList.remove('fade-in');

      setTimeout(() => {
        // Phase 2: swap views
        machineView?.classList.add('view-hidden');
        document.body.classList.remove('machine-mode');
        humanView?.classList.remove('view-hidden');
        humanView?.classList.remove('fade-out');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Phase 3: human fades back in via CSS transition
        setMode(next);
        setTimeout(() => setTransitioning(false), 600);
      }, 500);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={transitioning}
      className={`fixed top-4 right-4 z-[1100] flex items-center gap-2 bg-[#112240]/90 border border-[#233554] rounded-full px-4 py-2 cursor-pointer backdrop-blur-md font-mono text-sm transition-opacity ${transitioning ? 'opacity-50 cursor-wait' : ''}`}
      aria-label="Toggle human/machine view"
    >
      <span className={`transition-colors duration-300 ${mode === 'human' ? 'text-[#ccd6f6] font-bold' : 'text-[#8892b0]/50'}`}>
        human
      </span>
      <span className="relative w-10 h-5 bg-[#233554] rounded-full">
        <span
          className={`absolute top-0.5 w-4 h-4 bg-[#64ffda] rounded-full transition-all duration-500 ease-in-out ${
            mode === 'machine' ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
      <span className={`transition-colors duration-300 ${mode === 'machine' ? 'text-[#ccd6f6] font-bold' : 'text-[#8892b0]/50'}`}>
        machine
      </span>
    </button>
  );
}
