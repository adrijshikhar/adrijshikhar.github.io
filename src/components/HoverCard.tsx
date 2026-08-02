import type { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
}

/**
 * Observatory card — a single plane: hairline edge over an opaque fill (see
 * .atelier-card in globals.css). This component only supplies padding and
 * spacing.
 *
 * The fill is opaque on purpose and must stay that way: it is what keeps the
 * sky from reading through the entries people actually read.
 */
export default function HoverCard({ children }: HoverCardProps) {
  return (
    <li className="group/list-item mb-6 break-inside-avoid last:mb-0 sm:mb-8">
      <div className="atelier-card relative px-6 py-6 lg:px-7 lg:py-7">
        {children}
      </div>
    </li>
  );
}
