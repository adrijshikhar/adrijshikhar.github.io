import type { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
}

/**
 * Observatory card — a double bezel: an outer shell holding an inner core at
 * concentric radii, like a glass plate seated in a machined tray. The core is a
 * ::before pseudo-element (see .atelier-card in globals.css), so this component
 * only supplies padding and spacing.
 *
 * Padding must clear --card-inset (6px), or content sits on the shell instead of
 * the core.
 *
 * The old `index` prop drove an alternating accent tint. Tints are gone — depth
 * now comes from the bezel — so the prop was dropped rather than left inert.
 */
export default function HoverCard({ children }: HoverCardProps) {
  return (
    <li className="group/list-item mb-4 break-inside-avoid last:mb-0 sm:mb-5">
      <div className="atelier-card relative px-6 py-6 lg:px-7 lg:py-7">
        {children}
      </div>
    </li>
  );
}
