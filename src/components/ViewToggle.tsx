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

      // Phase 1: shrink + fade out human view, start bg color transition
      document.body.classList.add('machine-mode');
      humanView?.classList.add('shrink-out');

      setTimeout(() => {
        // Phase 2: swap views
        humanView?.classList.add('view-hidden');
        machineView?.classList.remove('view-hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Phase 3: fade in machine (next frame)
        requestAnimationFrame(() => {
          machineView?.classList.add('fade-in');
          setMode(next);
          setTimeout(() => setTransitioning(false), 700);
        });
      }, 700);
    } else {
      // Phase 1: fade out machine
      machineView?.classList.remove('fade-in');
      document.body.classList.remove('machine-mode');

      setTimeout(() => {
        // Phase 2: swap views
        machineView?.classList.add('view-hidden');
        humanView?.classList.remove('view-hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Phase 3: expand human view back in
        requestAnimationFrame(() => {
          humanView?.classList.remove('shrink-out');
          setMode(next);
          setTimeout(() => setTransitioning(false), 700);
        });
      }, 600);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={transitioning}
      className={`fixed top-4 right-4 z-[1100] flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer backdrop-blur-md font-mono text-sm transition-all duration-500 ${
        mode === 'machine'
          ? 'bg-[#2a2a3e]/90 border border-[#3a3a52]'
          : 'bg-[#112240]/90 border border-[#233554]'
      } ${transitioning ? 'opacity-50 cursor-wait' : ''}`}
      aria-label="Toggle human/machine view"
    >
      <span className={`transition-colors duration-300 ${mode === 'human' ? 'text-[#ccd6f6] font-bold' : 'text-[#a0a0b8]/50'}`}>
        human
      </span>
      <span className={`relative w-10 h-5 rounded-full transition-colors duration-500 ${
        mode === 'machine' ? 'bg-[#3a3a52]' : 'bg-[#233554]'
      }`}>
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-500 ease-in-out ${
            mode === 'machine' ? 'left-[22px] bg-[#7b68ee]' : 'left-0.5 bg-[#64ffda]'
          }`}
        />
      </span>
      <span className={`transition-colors duration-300 ${mode === 'machine' ? 'text-[#e0e0f0] font-bold' : 'text-[#8892b0]/50'}`}>
        machine
      </span>
    </button>
  );
}
