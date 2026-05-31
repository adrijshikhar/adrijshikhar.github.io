import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

const STORAGE_KEY = 'mode';
const DEFAULT: Mode = 'dark';

function readMode(): Mode {
  if (typeof document !== 'undefined') {
    const fromDom = document.documentElement.dataset.mode;
    if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  }
  return DEFAULT;
}

export default function ModeToggle() {
  const [mode, setMode] = useState<Mode>(DEFAULT);

  useEffect(() => {
    setMode(readMode());
  }, []);

  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    // Atomic swap: kill transitions for this frame so the canvas, text, and the gradient
    // name all flip in the SAME frame — no lagging background and no one-frame name flash.
    root.classList.add('mode-switching');
    root.dataset.mode = next;
    // Force a style flush, then restore transitions on the next frame.
    void root.offsetWidth;
    requestAnimationFrame(() => root.classList.remove('mode-switching'));
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / privacy mode */
    }
    setMode(next);
  };

  const isLight = mode === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className="grid size-[18px] place-items-center text-muted transition-colors duration-[120ms] ease-out hover:text-heading"
    >
      {isLight ? (
        // Sun — currently light, click for dark
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        // Moon — currently dark, click for light
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
