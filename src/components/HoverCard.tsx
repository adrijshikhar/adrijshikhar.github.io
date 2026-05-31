import type { ReactNode } from 'react';

/**
 * Flat Swiss-terminal list block. Hairline left rule + index-style ticks.
 * The whole list dims siblings on hover (group/list), the active card stays lit.
 * No glow, no shadow, no rounding — borders do the work.
 */
export default function HoverCard({ children }: { children: ReactNode }) {
  return (
    <li className="group relative border-t border-border transition-opacity duration-[120ms] ease-out last:border-b lg:group-hover/list:opacity-40 lg:hover:!opacity-100">
      {/* accent edge that grows in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-px scale-y-0 bg-accent transition-transform duration-[120ms] ease-out group-hover:scale-y-100"
      />
      <div className="relative py-6 pl-5 pr-2 transition-colors duration-[120ms] ease-out group-hover:bg-surface lg:py-7">
        {children}
      </div>
    </li>
  );
}
