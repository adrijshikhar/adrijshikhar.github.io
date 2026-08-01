/**
 * Alt/az -> screen-space projection, ported verbatim from the `stars.html`
 * prototype's `project()`. Pure maths, no DOM — shared by every sky render
 * mode (quiet field now, the graticule/game instrument later).
 */

/** The disc runs from the zenith (+90°) down to FLOOR° BELOW the horizon, so
 *  noticeably more sky is on screen and the field never looks sparse. Stars
 *  under the horizon are drawn dimmer — they are really there, under the earth. */
export const FLOOR = -35;

const D2R = Math.PI / 180;

export function project(alt: number, az: number, W: number, H: number): { x: number; y: number } {
  const r = (90 - alt) / (90 - FLOOR);        // 0 at zenith, 1 at the floor
  const a = (az - 180) * D2R;
  const R = Math.hypot(W, H) * 0.52;          // overscan so the disc fills the frame
  return { x: W / 2 + Math.sin(a) * r * R, y: H / 2 - Math.cos(a) * r * R };
}
