import { useEffect, useState } from 'react';

type ThemeKey = 'parallel' | 'teal' | 'rausch' | 'violet' | 'hyperlink' | 'signal';

const THEMES: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: 'parallel', label: 'Parallel orange', swatch: '#fb631b' },
  { key: 'teal', label: 'Teal', swatch: '#64ffda' },
  { key: 'rausch', label: 'Rausch', swatch: '#ff385c' },
  { key: 'violet', label: 'Violet', swatch: '#8b7dff' },
  { key: 'hyperlink', label: 'Hyperlink blue', swatch: '#6f8cff' },
  { key: 'signal', label: 'Signal red', swatch: '#ff5247' },
];

const STORAGE_KEY = 'theme';
const DEFAULT: ThemeKey = 'parallel';

function readTheme(): ThemeKey {
  if (typeof document !== 'undefined') {
    const fromDom = document.documentElement.dataset.theme as ThemeKey | undefined;
    if (fromDom && THEMES.some((t) => t.key === fromDom)) return fromDom;
  }
  return DEFAULT;
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeKey>(DEFAULT);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActive(readTheme());
  }, []);

  const apply = (key: ThemeKey) => {
    document.documentElement.dataset.theme = key;
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* ignore quota / privacy mode */
    }
    setActive(key);
  };

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:inline">
        accent
      </span>
      <div
        role="radiogroup"
        aria-label="Accent theme"
        className="flex items-center gap-2"
      >
        {THEMES.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={t.label}
              title={t.label}
              onClick={() => apply(t.key)}
              className="group relative grid size-[14px] place-items-center transition-transform duration-[120ms] ease-out hover:scale-110"
            >
              <span
                className="block size-[8px] transition-all duration-[120ms] ease-out"
                style={{
                  backgroundColor: t.swatch,
                  outline: isActive ? `1px solid ${t.swatch}` : '1px solid transparent',
                  outlineOffset: '2px',
                  opacity: isActive ? 1 : 0.55,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
