import type { ReactNode } from 'react';

/**
 * Terminal Atelier card — A's hairline precision + C's soft premium feel.
 * Medium-soft (~10px) rounded surface, accent-derived tint wash, soft shadow +
 * top-edge highlight, springy lift on hover. Alternating tint by index.
 */
export default function HoverCard({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <li className="group/list-item mb-4 break-inside-avoid last:mb-0 sm:mb-5">
      <div className={`atelier-card relative px-5 py-6 lg:px-6 lg:py-7 ${index % 2 === 1 ? 'is-alt' : ''}`}>
        {/* accent left-edge that brightens on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-3 bottom-3 w-px scale-y-0 bg-accent opacity-0 transition-all duration-300 group-hover/list-item:scale-y-100 group-hover/list-item:opacity-100"
          style={{ borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }}
        />
        {children}
      </div>
    </li>
  );
}
