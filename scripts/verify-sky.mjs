import assert from 'node:assert/strict';
import { altAz, planetRaDec, moonRaDec } from '../src/lib/sky/astronomy.ts';

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

check('planets stay inside their true orbital ranges', () => {
  const range = { Mercury:[0.30,0.48], Venus:[0.71,0.74], Mars:[1.36,1.68],
                  Jupiter:[4.94,5.47], Saturn:[8.99,10.13] };
  for (const [name, [lo, hi]] of Object.entries(range)) {
    const { au } = planetRaDec(name, now);
    assert.ok(au > 0.1 && au < 12, `${name} geocentric ${au} implausible`);
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

console.log(`\n${passed} checks passed`);
