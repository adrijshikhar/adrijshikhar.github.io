import { useState } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');

  const toggle = () => {
    const next = mode === 'human' ? 'machine' : 'human';
    setMode(next);
    document.body.classList.toggle('machine-mode', next === 'machine');
    document.querySelector('.human-view')?.classList.toggle('hidden', next === 'machine');
    const mv = document.querySelector('.machine-view');
    if (mv) {
      mv.classList.toggle('hidden', next === 'human');
      if (next === 'machine' && !mv.getAttribute('data-loaded')) {
        const raw: string = (window as any).__RAW_MARKDOWN__ || '';
        const withLinks = raw.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
        );
        const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        mv.innerHTML = `<pre class="machine-pre">${withBold}</pre>`;
        mv.setAttribute('data-loaded', 'true');
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-[1100] flex items-center gap-2 bg-[#112240]/90 border border-[#233554] rounded-full px-4 py-2 cursor-pointer backdrop-blur-md font-mono text-sm"
      aria-label="Toggle human/machine view"
    >
      <span className={`transition-colors ${mode === 'human' ? 'text-[#ccd6f6] font-bold' : 'text-[#8892b0]/50'}`}>
        human
      </span>
      <span className="relative w-10 h-5 bg-[#233554] rounded-full">
        <span
          className={`absolute top-0.5 w-4 h-4 bg-[#64ffda] rounded-full transition-all ${
            mode === 'machine' ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
      <span className={`transition-colors ${mode === 'machine' ? 'text-[#ccd6f6] font-bold' : 'text-[#8892b0]/50'}`}>
        machine
      </span>
    </button>
  );
}
