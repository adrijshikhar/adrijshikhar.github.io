import type { ReactNode } from 'react';
import { Card } from './ui/card';

/**
 * Shared card shell used by every list card (Experience, Projects, Writing).
 * Renders the `<li>` + transparent shadcn Card (the `group` for sibling-dim +
 * title hover-accent) and the absolute glassmorphism overlay div. Card-specific
 * content goes in `children` and should use `relative z-10` to sit above the overlay.
 */
export default function HoverCard({ children }: { children: ReactNode }) {
  return (
    <li className="mb-12">
      <Card className="!gap-0 !overflow-visible !rounded-none !py-0 group relative border-0 bg-transparent p-0 shadow-none !ring-0 text-inherit transition-all lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
        {children}
      </Card>
    </li>
  );
}
