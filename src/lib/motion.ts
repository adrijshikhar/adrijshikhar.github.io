import { animate, createTimeline, onScroll, stagger, utils, createSpring } from 'animejs';

/** Single source of truth for motion. If a duration is not in D, it does not ship.
 *  Interaction stays under 200ms (Emil Kowalski: UI animation should stay under
 *  300ms; interaction under 200 feels instant). Entry may go to 400. */
export const D = { fast: 180, entry: 380 } as const;

/** Converged independently with Karl Koch's record-shelf hover: 200/24 is the
 *  point where stiffer reads harsh and softer reads mushy. */
export const SPRING = createSpring({ stiffness: 200, damping: 24 });

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { animate, createTimeline, onScroll, stagger, utils, createSpring };
