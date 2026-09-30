import { useEffect, useRef } from 'react';

/**
 * CustomCursor — site-wide precision cursor (ring + dot reticle).
 *
 * Runs its own 60fps rAF loop independent of any astronomy canvas or page mode.
 * Decoupled from SkyField so it works uniformly across all pages (even when
 * skyMode="none", such as /resume/).
 *
 * Gated strictly on fine pointing devices: skipped under coarse pointers (touch)
 * and prefers-reduced-motion: reduce.
 */
export default function CustomCursor() {
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    const ring = cursorRingRef.current;
    const dot = cursorDotRef.current;
    if (!ring || !dot) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let id = 0;
    const INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary';

    // Hide native cursor only once the first coordinates are captured.
    let armed = false;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!armed) {
        armed = true;
        rx = x;
        ry = y;
        document.documentElement.classList.add('cursor-custom');
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const t = e.target as Element | null;
      document.body.classList.toggle('cur-ui', !!t?.closest?.(INTERACTIVE));
      document.body.classList.toggle(
        'cur-focal',
        !!t?.closest?.('[aria-label="View mode"], [role="slider"], [aria-label*="Human view"], [aria-label*="Machine view"]'),
      );
    };

    const onDown = () => {
      ring.style.opacity = '0.7';
    };
    const onUp = () => {
      ring.style.opacity = '1';
    };
    const onLeave = () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    };
    const onEnter = () => {
      ring.style.opacity = '1';
      dot.style.opacity = '1';
    };

    const follow = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) scale(var(--ring-s))`;
      id = requestAnimationFrame(follow);
    };
    id = requestAnimationFrame(follow);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerenter', onEnter);
      document.documentElement.classList.remove('cursor-custom');
      document.body.classList.remove('cur-ui', 'cur-focal');
    };
  }, []);

  return (
    <>
      <div ref={cursorRingRef} id="sky-cursor-ring" aria-hidden="true" />
      <div ref={cursorDotRef} id="sky-cursor-dot" aria-hidden="true" />
    </>
  );
}
