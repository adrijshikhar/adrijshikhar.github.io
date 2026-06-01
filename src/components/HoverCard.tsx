import type { ReactNode } from 'react';
import { Card } from './ui/card';

/**
 * Shared card shell used by every list card (Experience, Projects, Writing).
 * Neo-Bauhaus framed panel: thick ink border on a paper surface, with a hard
 * (no-blur) offset shadow that snaps tighter on hover — a geometric press.
 */
export default function HoverCard({ children }: { children: ReactNode }) {
  return (
    <li className="mb-7">
      <Card className="group relative !gap-0 !overflow-visible !rounded-none border-2 border-ink bg-surface !py-0 p-0 !ring-0 text-inherit shadow-[3px_3px_0_0_var(--ink)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--accent)] motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0">
        {/* accent corner tab */}
        <span
          aria-hidden="true"
          className="absolute -right-[3px] -top-[3px] h-3 w-3 bg-accent transition-colors duration-150 group-hover:bg-ink"
        />
        <div className="p-6 md:p-8">{children}</div>
      </Card>
    </li>
  );
}
