/**
 * Pure astronomy maths ported verbatim from the `stars.html` prototype
 * (validated against real ephemerides during development). No DOM — safe to
 * run anywhere JS runs. See `scripts/verify-sky.mjs` for the invariant checks.
 */
import { PLANETS, EARTH, type OrbitalElements } from './catalogue';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/* --- astronomy: RA/Dec -> altitude/azimuth for an observer --------------- */
export function julianDay(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

export function gmstDeg(d: Date): number {                       // Greenwich mean sidereal time
  const T = (julianDay(d) - 2451545.0) / 36525;
  let g = 280.46061837 + 360.98564736629 * (julianDay(d) - 2451545.0)
        + 0.000387933 * T * T - T * T * T / 38710000;
  return ((g % 360) + 360) % 360;
}

export function altAz(
  raH: number,
  decDeg: number,
  latDeg: number,
  lonDeg: number,
  when: Date
): { alt: number; az: number } {
  const lst = (gmstDeg(when) + lonDeg + 360) % 360;      // local sidereal time (deg)
  const ha  = ((lst - raH * 15) + 540) % 360 - 180;        // hour angle, -180..180
  const H = ha * D2R, dec = decDeg * D2R, lat = latDeg * D2R;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * R2D;
  // azimuth measured from South, then +180 to report from North (0=N, 90=E)
  const azS = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat));
  const az  = ((azS * R2D) + 540) % 360;
  return { alt, az };
}

/* heliocentric ecliptic rectangular coordinates (AU) for one element set */
function helio(el: OrbitalElements, T: number): { x: number; y: number; z: number } {
  const [e0, r0] = el;
  const a = e0[0] + r0[0] * T, e = e0[1] + r0[1] * T, I = (e0[2] + r0[2] * T) * D2R;
  const L = e0[3] + r0[3] * T, wbar = e0[4] + r0[4] * T, Om = (e0[5] + r0[5] * T) * D2R;
  let M = ((L - wbar) % 360 + 540) % 360 - 180;          // mean anomaly, -180..180
  M *= D2R;
  let E = M + e * Math.sin(M);                              // Kepler, Newton-Raphson
  for (let k = 0; k < 6; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE; if (Math.abs(dE) < 1e-9) break;
  }
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const w  = (wbar * D2R) - Om;                             // argument of perihelion
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: (sw * sI) * xp + (cw * sI) * yp,
  };
}

/* geocentric RA (hours) / Dec (deg) for a planet at a given date */
export function planetRaDec(name: string, when: Date): { ra: number; dec: number; au: number } {
  const T = (julianDay(when) - 2451545.0) / 36525;
  const p = helio(PLANETS[name], T), e = helio(EARTH, T);
  const x = p.x - e.x, y = p.y - e.y, z = p.z - e.z;      // geocentric ecliptic
  const eps = 23.43928 * D2R;                             // obliquity
  const yq = y * Math.cos(eps) - z * Math.sin(eps);
  const zq = y * Math.sin(eps) + z * Math.cos(eps);
  const ra = (Math.atan2(yq, x) * R2D + 360) % 360 / 15;    // hours
  const dec = Math.atan2(zq, Math.hypot(x, yq)) * R2D;
  return { ra, dec, au: Math.hypot(x, y, z) };            // live geocentric range
}

/* --- Sun & Moon ------------------------------------------------------------
   Low-precision lunar theory (Meeus ch.47, principal terms only). Longitude is
   good to a few arcminutes — far finer than a pixel here. The Sun is needed
   both for the Moon's phase and for which way its lit limb points. */
function sunEcliptic(when: Date): number {
  const d = julianDay(when) - 2451545.0;
  const M = (357.529 + 0.98560028 * d) * D2R;               // mean anomaly
  const L = 280.459 + 0.98564736 * d;                       // mean longitude
  const lam = L + 1.915 * Math.sin(M) + 0.020 * Math.sin(2 * M);
  return ((lam % 360) + 360) % 360;
}

function eclToRaDec(lam: number, bet: number): { ra: number; dec: number } {
  const eps = 23.43928 * D2R, l = lam * D2R, b = bet * D2R;
  const x = Math.cos(b) * Math.cos(l);
  const y = Math.cos(b) * Math.sin(l) * Math.cos(eps) - Math.sin(b) * Math.sin(eps);
  const z = Math.cos(b) * Math.sin(l) * Math.sin(eps) + Math.sin(b) * Math.cos(eps);
  return { ra: ((Math.atan2(y, x) * R2D + 360) % 360) / 15, dec: Math.asin(z) * R2D };
}

export function moonRaDec(when: Date): { ra: number; dec: number; km: number; illum: number; waxing: boolean } {
  const d  = julianDay(when) - 2451545.0;
  const Lp = 218.316 + 13.176396 * d;                       // mean longitude
  const M  = (134.963 + 13.064993 * d) * D2R;               // mean anomaly
  const F  = ( 93.272 + 13.229350 * d) * D2R;               // argument of latitude
  const lam = Lp + 6.289 * Math.sin(M);
  const bet = 5.128 * Math.sin(F);
  const { ra, dec } = eclToRaDec(((lam % 360) + 360) % 360, bet);
  const km = 385001 - 20905 * Math.cos(M);                    // geocentric range

  // illuminated fraction from elongation against the Sun
  const elong = (((lam - sunEcliptic(when)) % 360) + 360) % 360;
  const illum = (1 - Math.cos(elong * D2R)) / 2;
  const waxing = elong < 180;
  return { ra, dec, km, illum, waxing };
}

/** A body's sky position plus its true distance from Earth (light years), as
 *  used for the 3-D separation readout. `distLy` is `null` when unknown. */
export interface BodyPos {
  ra: number;
  dec: number;
  distLy: number | null;
}

/* True 3-D separation between two bodies. Each sits at distance d along its
   own RA/Dec direction, so the separation is |v₁ − v₂| — NOT the angle between
   them. Two stars that look adjacent can be a thousand light years apart. */
export function separationLy(a: BodyPos, b: BodyPos): number | null {
  if (a.distLy == null || b.distLy == null) return null;
  const vec = (o: BodyPos): [number, number, number] => {
    const ra = o.ra * 15 * D2R, dec = o.dec * D2R, d = o.distLy as number;
    return [d * Math.cos(dec) * Math.cos(ra), d * Math.cos(dec) * Math.sin(ra), d * Math.sin(dec)];
  };
  const [x1, y1, z1] = vec(a), [x2, y2, z2] = vec(b);
  return Math.hypot(x1 - x2, y1 - y2, z1 - z2);          // light years
}
