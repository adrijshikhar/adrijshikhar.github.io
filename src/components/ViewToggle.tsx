import { useState, useRef } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');
  const machineLoadedRef = useRef(false);

  const toggle = () => {
    const next = mode === 'human' ? 'machine' : 'human';
    const humanView = document.querySelector('.human-view') as HTMLElement | null;
    const machineView = document.querySelector('.machine-view') as HTMLElement | null;
    if (!humanView || !machineView) return;

    // Load machine content once
    if (next === 'machine' && !machineLoadedRef.current) {
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

    if (next === 'machine') {
      document.body.classList.add('machine-mode');
      machineView.classList.add('active');
      humanView.classList.add('inactive');
    } else {
      document.body.classList.remove('machine-mode');
      machineView.classList.remove('active');
      humanView.classList.remove('inactive');
    }

    setMode(next);
  };

  return (
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
      <div className={`flex gap-4 px-3 py-2 rounded-sm backdrop-blur-md font-mono text-sm transition-all duration-500 ${
        mode === 'machine'
          ? 'bg-[#181818]/90 border border-[#434343]'
          : 'bg-[#112240]/90 border border-[#233554]'
      }`}>
        <button
          onClick={mode === 'human' ? undefined : toggle}
          className="flex items-center gap-2 cursor-pointer transition-colors duration-300"
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
          className="flex items-center gap-2 cursor-pointer transition-colors duration-300"
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
