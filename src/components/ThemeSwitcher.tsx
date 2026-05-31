import { useEffect, useState } from 'react';

type ThemeId = 'red' | 'parallel' | 'blue' | 'teal' | 'violet' | 'signal';

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'red', label: 'Bauhaus Red', swatch: '#c22d1a' },
  { id: 'parallel', label: 'Parallel Orange', swatch: '#c2410c' },
  { id: 'blue', label: 'Klein Blue', swatch: '#1d3fb5' },
  { id: 'teal', label: 'Teal', swatch: '#0c6f5c' },
  { id: 'violet', label: 'Violet', swatch: '#5241d4' },
  { id: 'signal', label: 'Signal', swatch: '#c41616' },
];

const isTheme = (v: string | null): v is ThemeId =>
  !!v && THEMES.some((t) => t.id === v);

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>('red');

  // Sync from the no-FOUC value the inline head script already applied.
  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    if (isTheme(applied ?? null)) setTheme(applied as ThemeId);
  }, []);

  const pick = (id: ThemeId) => {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem('theme', id);
    } catch {
      /* storage may be unavailable; ignore */
    }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[1100] flex -translate-x-1/2 translate-y-[-3.25rem] items-center gap-2 border-[3px] border-white/85 bg-[#111111]/95 px-3 py-2 font-mono backdrop-blur-xl sm:translate-x-[calc(-50%+9.5rem)] sm:translate-y-0"
      role="radiogroup"
      aria-label="Accent color theme"
    >
      <span className="mr-1 select-none text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/55">
        Hue
      </span>
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.label}
            title={t.label}
            onClick={() => pick(t.id)}
            className={`relative h-4 w-4 shrink-0 transition-transform duration-150 ${
              active ? 'rotate-45 scale-110' : 'hover:scale-110'
            }`}
            style={{
              background: t.swatch,
              boxShadow: active
                ? '0 0 0 2px #111, 0 0 0 4px #fff'
                : '0 0 0 1.5px rgba(255,255,255,0.55)',
            }}
          />
        );
      })}
    </div>
  );
}
