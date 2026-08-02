import assert from 'node:assert/strict';
import { altAz, planetRaDec, moonRaDec, gmstDeg, sunRaDec, planetIllum, separation } from '../src/lib/sky/astronomy.ts';
import { STARS, DIST_LY } from '../src/lib/sky/catalogue.ts';
import { computeFullSky } from '../src/lib/sky/render.ts';

const now = new Date();
let passed = 0;
const check = (name, fn) => { fn(); console.log(`  ✓ ${name}`); passed++; };

// Polaris altitude equals observer latitude — the classic navigational identity.
// Holds at every latitude; 1.2° tolerance because Polaris sits 0.7° off the pole.
check('Polaris altitude tracks latitude', () => {
  for (const lat of [12.97, 45, 60]) {
    const { alt } = altAz(2.5303, 89.264, lat, 77.59, now);
    assert.ok(Math.abs(alt - lat) < 1.2, `lat ${lat} gave alt ${alt}`);
  }
});

check('Polaris is below the horizon from the southern hemisphere', () => {
  const { alt } = altAz(2.5303, 89.264, -33.87, 151.21, now);
  assert.ok(alt < 0, `expected below horizon, got ${alt}`);
});

// `planetRaDec().au` is GEOCENTRIC (Earth-to-planet, see astronomy.ts's own
// comment: "live geocentric range"). The brief's original per-planet numbers
// (Mercury 0.30-0.48 etc.) are each planet's HELIOCENTRIC perihelion/aphelion —
// distance from the SUN, not Earth — so asserting au against them fails for a
// correct port (e.g. Mercury's real geocentric distance ranges ~0.51-1.48 AU,
// well outside its 0.30-0.48 solar range). Bounds below are each planet's real,
// well-known geocentric distance envelope (NASA planetary fact sheets), with
// margin. They still catch an elements swap: Mars's range [0.36,2.7] and
// Jupiter's [3.9,6.5] don't overlap, so putting Mars's elements under the
// Jupiter key fails the Jupiter assertion.
check('planets stay inside their true geocentric distance ranges', () => {
  const range = { Mercury:[0.5,1.5], Venus:[0.25,1.75], Mars:[0.36,2.7],
                  Jupiter:[3.9,6.5], Saturn:[7.9,11.2] };
  for (const [name, [lo, hi]] of Object.entries(range)) {
    const { au } = planetRaDec(name, now);
    assert.ok(au > lo && au < hi, `${name} geocentric ${au} outside [${lo}, ${hi}]`);
  }
});

// Azimuth is the brief's risk #1: South-then-rotate is easy to get backwards
// and every other check here only reads `alt`. Pin it from first principles by
// forcing the hour angle (H) to specific values and checking where az must land.
// H is solved from H = lst - raH*15, so raH = (lst - H)/15 puts the body exactly there.
check('azimuth pins the South-then-rotate convention', () => {
  const lonDeg = 0;
  const lst = (gmstDeg(now) + lonDeg + 360) % 360;
  const raHForHA = (haDeg) => (((lst - haDeg) % 360 + 360) % 360) / 15;

  // H=0 (upper culmination) with dec(0) below the observer's zenith (lat 45):
  // the body crosses the meridian SOUTH of straight up -> az must be 180.
  {
    const { az } = altAz(raHForHA(0), 0, 45, lonDeg, now);
    assert.ok(Math.abs(az - 180) < 0.05, `south transit gave az ${az}, expected 180`);
  }
  // H=0 with dec(89.264) above the observer's zenith (lat 12.97, i.e. Polaris-like):
  // crosses the meridian NORTH of straight up -> az must be 0 (== 360).
  {
    const { az } = altAz(raHForHA(0), 89.264, 12.97, lonDeg, now);
    assert.ok(az < 0.05 || az > 359.95, `north transit gave az ${az}, expected 0`);
  }
  // H=-90 (east of the meridian, i.e. rising) at the equator with dec=0: due east, az=90.
  {
    const { az } = altAz(raHForHA(-90), 0, 0, lonDeg, now);
    assert.ok(Math.abs(az - 90) < 0.05, `rising body gave az ${az}, expected east (90)`);
  }
  // H=+90 (west of the meridian, i.e. setting) at the equator with dec=0: due west, az=270.
  {
    const { az } = altAz(raHForHA(90), 0, 0, lonDeg, now);
    assert.ok(Math.abs(az - 270) < 0.05, `setting body gave az ${az}, expected west (270)`);
  }
});

check('Moon declination stays within ±28.7°', () => {
  const { dec } = moonRaDec(now);
  assert.ok(Math.abs(dec) <= 28.7, `dec ${dec} outside lunar range`);
});

check('Moon illumination sweeps a full synodic cycle', () => {
  let lo = 1, hi = 0;
  for (let i = 0; i < 30; i++) {
    const { illum } = moonRaDec(new Date(now.getTime() + i * 86400000));
    lo = Math.min(lo, illum); hi = Math.max(hi, illum);
  }
  assert.ok(lo < 0.05 && hi > 0.95, `cycle ${lo}..${hi} is not a full sweep`);
});

// km is the brief's risk #2. Check it stays inside the real perigee/apogee
// envelope AND that it actually moves over a month — a constant would pass a
// bare range check, so also require a real spread across the anomalistic cycle.
check('Moon distance stays within the perigee/apogee envelope and actually varies', () => {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < 30; i++) {
    const { km } = moonRaDec(new Date(now.getTime() + i * 86400000));
    assert.ok(km > 356500 && km < 406700, `km ${km} outside perigee/apogee envelope`);
    lo = Math.min(lo, km); hi = Math.max(hi, km);
  }
  assert.ok(hi - lo > 20000, `range ${lo}..${hi} barely varies — km may be constant`);
});

// The Sun's declination is the cleanest invariant in the whole file: it is the
// obliquity of the ecliptic at the solstices and zero at the equinoxes, by
// definition. If the ecliptic-to-equatorial rotation is wrong, this moves.
check('Sun declination hits the solstices and equinoxes', () => {
  const dec = (m, d) => sunRaDec(new Date(Date.UTC(2026, m, d, 12))).dec;
  assert.ok(Math.abs(dec(5, 21) - 23.44) < 0.3, `Jun solstice dec ${dec(5, 21)}, expected +23.44`);
  assert.ok(Math.abs(dec(11, 21) + 23.44) < 0.3, `Dec solstice dec ${dec(11, 21)}, expected -23.44`);
  assert.ok(Math.abs(dec(8, 22)) < 0.6, `Sep equinox dec ${dec(8, 22)}, expected ~0`);
});

// And it has to be up in the day and down at night, or the whole projection is
// mirrored somewhere.
check('Sun is above the horizon at local noon, below at local midnight', () => {
  const at = (utcH) => {
    const d = new Date(Date.UTC(2026, 7, 2, Math.floor(utcH), (utcH % 1) * 60));
    const { ra, dec } = sunRaDec(d);
    return altAz(ra, dec, 12.97, 77.59, d).alt;
  };
  assert.ok(at(6.5) > 60, `noon IST alt ${at(6.5)}, expected well above the horizon`);
  assert.ok(at(18.5) < -30, `midnight IST alt ${at(18.5)}, expected well below`);
});

// Phase is what decides whether a planet draws a terminator, so the inner/outer
// split has to hold: only Mercury and Venus ever go crescent. If an outer planet
// starts reporting a partial phase, the distance triangle is wrong.
check('only the inner planets show phases', () => {
  const now2 = new Date();
  for (const p of ['Jupiter', 'Saturn']) {
    const k = planetIllum(p, planetRaDec(p, now2).au);
    assert.ok(k > 0.99, `${p} illum ${k}, outer planets are always ~full from Earth`);
  }
  const mars = planetIllum('Mars', planetRaDec('Mars', now2).au);
  assert.ok(mars > 0.83 && mars <= 1, `Mars illum ${mars}, never crescent, never under ~0.84`);
  // Venus must swing through a real crescent somewhere in its cycle.
  let lo = 1;
  for (let d = 0; d < 600; d += 10) {
    const t = new Date(now2.getTime() + d * 86400000);
    lo = Math.min(lo, planetIllum('Venus', planetRaDec('Venus', t).au));
  }
  assert.ok(lo < 0.2, `Venus min illum ${lo} over 600d, expected a real crescent`);
});

// The one the previous phase check missed. That assertion tested the ASTRONOMY
// (Mars stays above 0.83 illuminated - true, and useless) while the bug lived
// in the RENDER DECISION derived from it. The gate is now phase AND size, so
// this asserts the OUTCOME of that gate over a full synodic sweep: which
// bodies actually end up drawing a crescent.
check('only bodies large enough to show a crescent ever draw one', () => {
  const MIN_VR = 7;                       // mirrors TERMINATOR_MIN_VR in render.ts
  const draws = (b) => b.isPlanet && b.illum !== undefined && b.illum < 0.92 && b.vr >= MIN_VR;
  const drew = new Set();
  let marsMinVr = Infinity;
  for (let d = 0; d < 800; d += 10) {
    const when = new Date(now.getTime() + d * 86400000);
    for (const b of computeFullSky({ lat: 12.97, lon: 77.59 }, when, 1440, 900).bodies) {
      if (!b.isPlanet) continue;
      if (b.name === 'Mars') marsMinVr = Math.min(marsMinVr, b.vr);
      if (draws(b)) drew.add(b.name);
    }
  }
  // Mars is the regression: it dips under the phase gate ~42% of the time but
  // never exceeds ~6.6px, so it must never draw a terminator on its 4px disc.
  assert.ok(!drew.has('Mars'),
    `Mars drew a terminator (min vr over the sweep ${marsMinVr.toFixed(1)}px) - the size gate is not holding`);
  // Venus must still get its crescent, or the gate has been tightened too far
  // and Galileo's observation is gone.
  assert.ok(drew.has('Venus'), `Venus never drew a crescent over 800 days: ${[...drew].join(', ') || 'none'}`);
});

// A distance table is exactly the kind of data eyes cannot audit — a wrong
// entry produces a plausible-looking number on a link label and nothing else.
check('every catalogue star carries a distance', () => {
  const missing = STARS.map(([n]) => n).filter((n) => DIST_LY[n] == null);
  assert.equal(missing.length, 0, `stars with no distance: ${missing.join(', ')}`);
  const orphan = Object.keys(DIST_LY).filter((n) => !STARS.some(([s]) => s === n));
  assert.equal(orphan.length, 0, `distances with no star: ${orphan.join(', ')}`);
  const bad = Object.entries(DIST_LY).filter(([, v]) => !(v > 0) || v > 5000);
  assert.equal(bad.length, 0, `implausible distances: ${bad.map(([n, v]) => `${n}=${v}`).join(', ')}`);
});

check('separation is symmetric, zero to self, and never below the radial gap', () => {
  const by = Object.fromEntries(STARS.map(([n, ra, dec]) => [n, { ra, dec, distLy: DIST_LY[n] }]));
  const names = Object.keys(by);
  for (let i = 0; i < names.length; i += 7) {
    for (let j = i + 1; j < names.length; j += 11) {
      const a = by[names[i]], b = by[names[j]];
      const ab = separation(a, b), ba = separation(b, a);
      assert.ok(Math.abs(ab - ba) < 1e-9, `asymmetric: ${names[i]}/${names[j]}`);
      // two bodies can never be closer than the difference in their distances
      const radial = Math.abs(a.distLy - b.distLy);
      assert.ok(ab >= radial - 1e-6,
        `${names[i]}-${names[j]} separation ${ab.toFixed(2)} < radial gap ${radial.toFixed(2)}`);
      // ...nor further apart than the two distances summed
      assert.ok(ab <= a.distLy + b.distLy + 1e-6, `${names[i]}-${names[j]} exceeds the sum of distances`);
    }
  }
  assert.equal(separation(by.Sirius, by.Sirius), 0, 'a star is not zero light years from itself');
});

check('separation reproduces published star-to-star distances', () => {
  const by = Object.fromEntries(STARS.map(([n, ra, dec]) => [n, { ra, dec, distLy: DIST_LY[n] }]));
  // published values, tolerance covers the rounding in the distance table
  for (const [a, b, expect, tol] of [
    ['Sirius', 'Procyon', 5.24, 0.4],
    ['Rigil Kent.', 'Sirius', 9.5, 0.5],
  ]) {
    const got = separation(by[a], by[b]);
    assert.ok(Math.abs(got - expect) <= tol,
      `${a}-${b}: got ${got.toFixed(2)} ly, expected ~${expect} ly`);
  }
});

check('planet oppositions and conjunctions land on their published dates', () => {
  // The strongest end-to-end check available: an opposition date is the product
  // of the orbital elements, the Sun's position and the Earth-Sun geometry all
  // being right at once. A single wrong element moves it by days.
  const sep = (a, b) => {
    const rad = Math.PI / 180;
    const r1 = a.ra * 15 * rad, d1 = a.dec * rad, r2 = b.ra * 15 * rad, d2 = b.dec * rad;
    return Math.acos(Math.min(1, Math.sin(d1) * Math.sin(d2) +
      Math.cos(d1) * Math.cos(d2) * Math.cos(r1 - r2))) / rad;
  };
  const extreme = (planet, want) => {
    let best = { s: want === 'max' ? -1 : 1e9, d: null };
    for (let k = 0; k < 730; k++) {
      const d = new Date(Date.UTC(2025, 11, 1) + k * 864e5);
      const s = sep(sunRaDec(d), planetRaDec(planet, d));
      if (want === 'max' ? s > best.s : s < best.s) best = { s, d };
    }
    return best;
  };
  // published opposition dates, +/- 2 days for the model's simplifications
  for (const [planet, iso] of [['Jupiter', '2026-01-10'], ['Saturn', '2026-10-04']]) {
    const got = extreme(planet, 'max');
    const drift = Math.abs(got.d - new Date(iso + 'T00:00:00Z')) / 864e5;
    assert.ok(drift <= 2,
      `${planet} opposition: got ${got.d.toISOString().slice(0, 10)}, expected ~${iso}`);
    assert.ok(got.s > 165, `${planet} opposition elongation only ${got.s.toFixed(1)} deg`);
  }
  // Inferior planets never reach opposition — that is what makes them inferior.
  for (const [planet, maxElong] of [['Venus', 48], ['Mercury', 29]]) {
    const got = extreme(planet, 'max');
    assert.ok(got.s < maxElong,
      `${planet} reached ${got.s.toFixed(1)} deg elongation, impossible for an inferior planet`);
  }
  // Every planet must pass close to the Sun once in two years (conjunction).
  for (const planet of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
    assert.ok(extreme(planet, 'min').s < 6, `${planet} never reaches conjunction`);
  }
});

check("the Sun's own track matches the almanac", () => {
  // Solstice declination IS the obliquity, and the equinox crossing IS zero.
  // These are definitional, so they catch a broken solar position immediately.
  const dec = (iso) => sunRaDec(new Date(iso + 'T12:00:00Z')).dec;
  assert.ok(Math.abs(dec('2026-06-21') - 23.44) < 0.1, `June solstice dec ${dec('2026-06-21')}`);
  assert.ok(Math.abs(dec('2026-12-21') + 23.44) < 0.1, `Dec solstice dec ${dec('2026-12-21')}`);
  assert.ok(Math.abs(dec('2026-03-20')) < 0.5, `March equinox dec ${dec('2026-03-20')}`);
  assert.ok(Math.abs(dec('2026-09-23')) < 0.5, `Sept equinox dec ${dec('2026-09-23')}`);
  // RA advances a full 24h over the year, monotonically modulo the wrap.
  const ra = (iso) => sunRaDec(new Date(iso + 'T12:00:00Z')).ra;
  assert.ok(Math.abs(ra('2026-03-20') % 24) < 0.1 || Math.abs(ra('2026-03-20') - 24) < 0.1,
    `March equinox RA should be ~0h, got ${ra('2026-03-20')}`);
  assert.ok(Math.abs(ra('2026-09-23') - 12) < 0.2, `Sept equinox RA ${ra('2026-09-23')}`);
});

console.log(`\n${passed} checks passed`);
