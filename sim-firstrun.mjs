#!/usr/bin/env node
/**
 * Soulgather v0.4 first-run simulation.
 * Formulas duplicated from js/game.js / test-economy.mjs (game files untouched).
 * Greedy human-ish strategy; favor=0, edict=0 (fresh run).
 */

const COST_BASE = 10;
const COST_MULT = 1.15;
const WELL_COST_BASE = 25;
const WELL_COST_MULT = 1.5;
const SHADE_SOULS_PER_SEC = 1;
const SPIRIT_SHADES_PER_SEC = 0.1;
const VESSEL_SPIRITS_PER_SEC = 0.1;
const UNLOCK_SHADES = 10;
const UNLOCK_LIFETIME = 100;
const UNLOCK_SPIRITS_FOR_VESSELS = 5;
const UNLOCK_LIFETIME_SHADES = 50;
const UNLOCK_VESSELS_FOR_THRONES = 1;
const UNLOCK_LIFETIME_SPIRITS = 50;
const UNLOCK_WELL_DRAWS_SHADES = 3;
const WELL_DRAWS_COST = 50;

const DT = 0.25;
const T_MAX = 3600;
const CLICKS_BEFORE_DRAWS = 2;
const CLICKS_AFTER_DRAWS = 0; // 0 extra after Well Draws (idle); lazy alt would be 0.2
const MAX_WELL_DEPTH = 2;
const SIPHON_PAYBACK_S = 45;
const SHADE_BUFFER = 5; // keep some shades for soul income after first spirit

function producerCost(owned) {
  const n = Math.max(0, Math.floor(owned));
  return Math.floor(COST_BASE * Math.pow(COST_MULT, n));
}
function shadeCost(owned) {
  return producerCost(owned);
}
function spiritCost(owned) {
  return producerCost(owned);
}
function vesselCost(owned) {
  return producerCost(owned);
}
function throneCost(owned) {
  return producerCost(owned);
}
function wellCost(depth) {
  const n = Math.max(0, Math.floor(depth));
  return Math.floor(WELL_COST_BASE * Math.pow(WELL_COST_MULT, n));
}
function siphonCost(level) {
  const n = Math.max(0, Math.floor(level));
  return Math.floor(50 * Math.pow(3, n));
}
function levyCost(level) {
  const n = Math.max(0, Math.floor(level));
  return Math.floor(15 * Math.pow(3, n));
}
function siphonMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}
function levyMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}
function prestigeMult(favorEarned) {
  return 1 + 0.5 * (Number(favorEarned) || 0);
}
function prodMult(favorEarned, thrones, edictLevel) {
  return (
    prestigeMult(favorEarned) *
    (1 + 0.1 * (Number(thrones) || 0)) *
    (1 + 0.25 * (Number(edictLevel) || 0))
  );
}
function favorGain(lifetimeSouls) {
  const n = Number(lifetimeSouls) || 0;
  if (n < 0) n = 0;
  return Math.floor(Math.sqrt(n / 25000));
}

function fmtTime(t) {
  if (t == null) return "FAIL";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  if (m <= 0) return s.toFixed(2) + "s";
  return m + "m " + s.toFixed(2) + "s (" + t.toFixed(2) + "s)";
}

function fmtN(n, d) {
  if (!isFinite(n)) return String(n);
  const p = d == null ? 2 : d;
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(p);
}

const s = {
  souls: 0,
  lifetimeSouls: 0,
  lifetimeShades: 0,
  lifetimeSpirits: 0,
  shades: 0,
  spirits: 0,
  vessels: 0,
  thrones: 0,
  wellDepth: 0,
  siphonLevel: 0,
  levyLevel: 0,
  wellDraws: false,
  unlockedWell: false,
  unlockedSpirits: false,
  unlockedVessels: false,
  unlockedThrones: false,
  unlockedWellDraws: false,
  favor: 0,
  favorEarned: 0,
  edictLevel: 0,
};

const marks = {
  firstShade: null,
  firstSiphon: null,
  wellDraws: null,
  firstSpirit: null,
  firstVessel: null,
  firstThrone: null,
  firstTribute: null,
};

const rateAt = {};

function currentMult() {
  return prodMult(s.favorEarned, s.thrones, s.edictLevel);
}
function clickPower() {
  return (1 + s.wellDepth) * currentMult();
}
function shadeSoulsPerSec() {
  return s.shades * SHADE_SOULS_PER_SEC * currentMult() * siphonMult(s.siphonLevel);
}
function soulsPerSec() {
  let rate = shadeSoulsPerSec();
  if (s.wellDraws) rate += clickPower();
  return rate;
}
function shadesPerSec() {
  return s.spirits * SPIRIT_SHADES_PER_SEC * currentMult() * levyMult(s.levyLevel);
}
function spiritsPerSec() {
  return s.vessels * VESSEL_SPIRITS_PER_SEC * currentMult();
}

function checkUnlock() {
  if (!s.unlockedWell && s.shades >= 1) s.unlockedWell = true;
  if (!s.unlockedSpirits) {
    if (s.shades >= UNLOCK_SHADES || s.lifetimeSouls >= UNLOCK_LIFETIME) {
      s.unlockedSpirits = true;
    }
  }
  if (!s.unlockedVessels) {
    if (s.spirits >= UNLOCK_SPIRITS_FOR_VESSELS || s.lifetimeShades >= UNLOCK_LIFETIME_SHADES) {
      s.unlockedVessels = true;
    }
  }
  if (!s.unlockedThrones) {
    if (s.vessels >= UNLOCK_VESSELS_FOR_THRONES || s.lifetimeSpirits >= UNLOCK_LIFETIME_SPIRITS) {
      s.unlockedThrones = true;
    }
  }
  if (!s.unlockedWellDraws && s.shades >= UNLOCK_WELL_DRAWS_SHADES) {
    s.unlockedWellDraws = true;
  }
}

function applyDt(dt) {
  const dSouls = soulsPerSec() * dt;
  s.souls += dSouls;
  s.lifetimeSouls += dSouls;

  const dShades = shadesPerSec() * dt;
  s.shades += dShades;
  s.lifetimeShades += dShades;

  const dSpirits = spiritsPerSec() * dt;
  s.spirits += dSpirits;
  s.lifetimeSpirits += dSpirits;

  checkUnlock();
}

function harvest(n) {
  if (n <= 0) return;
  const power = clickPower() * n;
  s.souls += power;
  s.lifetimeSouls += power;
  checkUnlock();
}

function buyShade() {
  const cost = shadeCost(s.shades);
  if (s.souls < cost) return false;
  s.souls -= cost;
  s.shades += 1;
  s.lifetimeShades += 1;
  checkUnlock();
  return true;
}
function buySpirit() {
  if (!s.unlockedSpirits) return false;
  const cost = spiritCost(s.spirits);
  if (s.shades < cost) return false;
  s.shades -= cost;
  s.spirits += 1;
  s.lifetimeSpirits += 1;
  checkUnlock();
  return true;
}
function buyVessel() {
  if (!s.unlockedVessels) return false;
  const cost = vesselCost(s.vessels);
  if (s.spirits < cost) return false;
  s.spirits -= cost;
  s.vessels += 1;
  checkUnlock();
  return true;
}
function buyThrone() {
  if (!s.unlockedThrones) return false;
  const cost = throneCost(s.thrones);
  if (s.vessels < cost) return false;
  s.vessels -= cost;
  s.thrones += 1;
  return true;
}
function buyWell() {
  if (!s.unlockedWell) return false;
  const cost = wellCost(s.wellDepth);
  if (s.souls < cost) return false;
  s.souls -= cost;
  s.wellDepth += 1;
  return true;
}
function buySiphon() {
  const cost = siphonCost(s.siphonLevel);
  if (s.souls < cost) return false;
  s.souls -= cost;
  s.siphonLevel += 1;
  return true;
}
function buyLevy() {
  if (!s.unlockedSpirits) return false;
  const cost = levyCost(s.levyLevel);
  if (s.shades < cost) return false;
  s.shades -= cost;
  s.levyLevel += 1;
  return true;
}
function buyWellDraws() {
  if (s.wellDraws) return false;
  if (!s.unlockedWellDraws && s.shades < UNLOCK_WELL_DRAWS_SHADES) return false;
  if (s.souls < WELL_DRAWS_COST) return false;
  s.souls -= WELL_DRAWS_COST;
  s.wellDraws = true;
  s.unlockedWellDraws = true;
  return true;
}

function siphonPaysBack() {
  const cost = siphonCost(s.siphonLevel);
  if (s.souls < cost) return false;
  if (s.siphonLevel === 0) return s.shades >= 3;
  const extra = shadeSoulsPerSec();
  if (extra <= 0) return false;
  return cost / extra <= SIPHON_PAYBACK_S;
}

function levyIsCheapVsShades() {
  if (!s.unlockedSpirits) return false;
  if (s.spirits < 1) return false;
  const lCost = levyCost(s.levyLevel);
  if (s.shades < lCost) return false;
  // Keep a soul-income buffer after spending shades on levy.
  if (s.shades - lCost < SHADE_BUFFER && s.spirits < 4) return false;
  const nextSpirit = spiritCost(s.spirits);
  // Levy doubles ALL spirit shade-output. Worth it once it is not
  // wildly more expensive than another Bound Spirit, or we already
  // have several spirits so doubling is huge.
  if (s.spirits >= 3) return lCost <= nextSpirit * 3 || s.shades >= lCost + SHADE_BUFFER;
  return lCost <= nextSpirit * 1.5;
}

function clickStillMatters() {
  return !s.wellDraws;
}

function greedyBuy(t) {
  // 1. First shade as soon as 10 souls.
  if (s.shades < 1 && s.lifetimeShades < 1 && s.souls >= shadeCost(0)) {
    if (buyShade() && marks.firstShade == null) marks.firstShade = t;
    return;
  }

  // 5. Well Draws at 3 shades when 50 souls available (prefer over next shade).
  if (!s.wellDraws && (s.unlockedWellDraws || s.shades >= UNLOCK_WELL_DRAWS_SHADES) && s.souls >= WELL_DRAWS_COST) {
    if (buyWellDraws() && marks.wellDraws == null) marks.wellDraws = t;
    return;
  }

  // 4. Rite of Siphon when it pays back (souls >= cost and shades >= 3 for first).
  if (siphonPaysBack()) {
    const was = s.siphonLevel;
    if (buySiphon() && was === 0 && marks.firstSiphon == null) marks.firstSiphon = t;
    return;
  }

  // 2. Well Depth when affordable if click still matters (cap 1–2).
  if (
    clickStillMatters() &&
    s.unlockedWell &&
    s.wellDepth < MAX_WELL_DEPTH &&
    s.souls >= wellCost(s.wellDepth)
  ) {
    // Do not spend the Well Draws pile if we are already at 3 shades and close.
    const savingForDraws =
      !s.wellDraws &&
      s.shades >= UNLOCK_WELL_DRAWS_SHADES &&
      s.souls + 1 >= WELL_DRAWS_COST * 0.6;
    if (!savingForDraws) {
      buyWell();
      return;
    }
  }

  // 7b. Thrones at 1 vessel (unlock); purchase when throne cost is met.
  if (s.unlockedThrones && s.vessels >= throneCost(s.thrones)) {
    if (buyThrone() && marks.firstThrone == null) marks.firstThrone = t;
    return;
  }

  // 7a. Vessels at 5 spirits.
  if (s.unlockedVessels && s.spirits >= vesselCost(s.vessels)) {
    // First vessel: buy at 5 spirits as instructed.
    // Later: keep a small spirit leftover if production is still thin.
    const cost = vesselCost(s.vessels);
    const first = s.vessels < 1;
    if (first || s.spirits - cost >= 1 || s.vessels >= 3) {
      if (buyVessel() && marks.firstVessel == null) marks.firstVessel = t;
      return;
    }
  }

  // 6. Bound Spirits at 10 shades; Levy when cheap vs buying more shades.
  if (levyIsCheapVsShades()) {
    buyLevy();
    return;
  }
  if (s.unlockedSpirits && s.shades >= spiritCost(s.spirits)) {
    const cost = spiritCost(s.spirits);
    const first = s.spirits < 1 && s.lifetimeSpirits < 1;
    // First spirit at the 10-shade unlock. Later keep a shade buffer
    // so soul income does not dump to zero.
    if (first || s.shades - cost >= SHADE_BUFFER) {
      if (buySpirit() && marks.firstSpirit == null) marks.firstSpirit = t;
      return;
    }
  }

  // 3. Shades 1-by-1 when affordable.
  if (s.souls >= shadeCost(s.shades)) {
    buyShade();
  }
}

function snapshot(t) {
  return {
    t,
    souls: s.souls,
    shades: s.shades,
    spirits: s.spirits,
    vessels: s.vessels,
    thrones: s.thrones,
    wellDepth: s.wellDepth,
    siphonLevel: s.siphonLevel,
    levyLevel: s.levyLevel,
    wellDraws: s.wellDraws,
    lifetimeSouls: s.lifetimeSouls,
    lifetimeShades: s.lifetimeShades,
    lifetimeSpirits: s.lifetimeSpirits,
    soulsPerSec: soulsPerSec(),
    clickPower: clickPower(),
    prodMult: currentMult(),
  };
}

// Fractional clicks per tick (2/s until draws). Equivalent to 0.5 click / 0.25s.
let t = 0;
const wantRate = [60, 300, 600];

while (t < T_MAX && favorGain(s.lifetimeSouls) < 1) {
  const clicksPerSec = s.wellDraws ? CLICKS_AFTER_DRAWS : CLICKS_BEFORE_DRAWS;
  harvest(clicksPerSec * DT);
  applyDt(DT);
  greedyBuy(t + DT);

  t += DT;
  t = Math.round(t * 1000) / 1000;

  for (let i = 0; i < wantRate.length; i++) {
    const sec = wantRate[i];
    if (rateAt[sec] == null && t + 1e-9 >= sec) {
      rateAt[sec] = { soulsPerSec: soulsPerSec(), snap: snapshot(t) };
    }
  }

  if (marks.firstTribute == null && favorGain(s.lifetimeSouls) >= 1) {
    marks.firstTribute = t;
  }
}

const end = snapshot(t);
const tributeOk = marks.firstTribute != null;

function verdict(sec) {
  if (sec == null) return "FAIL (not by 60 min)";
  if (sec <= 20 * 60) {
    if (sec <= 15 * 60) return "good (under ~15 min)";
    return "good (under ~20 min)";
  }
  if (sec <= 40 * 60) return "slow (20–40 min)";
  return "a problem (>40 min)";
}

console.log("=== Soulgather v0.4 first-run sim ===");
console.log("tick=" + DT + "s  clicks=" + CLICKS_BEFORE_DRAWS + "/s until Well Draws, then " + CLICKS_AFTER_DRAWS + "/s");
console.log("favor=0 edict=0  strategy=greedy human  stop=tribute or " + T_MAX + "s");
console.log("");
console.log("Timeline:");
console.log("  first shade   : " + fmtTime(marks.firstShade));
console.log("  first siphon  : " + fmtTime(marks.firstSiphon));
console.log("  well draws    : " + fmtTime(marks.wellDraws));
console.log("  first spirit  : " + fmtTime(marks.firstSpirit));
console.log("  first vessel  : " + fmtTime(marks.firstVessel));
console.log("  first throne  : " + fmtTime(marks.firstThrone));
console.log("  first tribute : " + (tributeOk ? fmtTime(marks.firstTribute) : "FAIL"));
console.log("");
console.log("souls/s (game idle rate, well-draws included, manual clicks not):");
console.log("  t=1 min  : " + (rateAt[60] ? fmtN(rateAt[60].soulsPerSec, 3) : "n/a (run ended earlier)"));
console.log("  t=5 min  : " + (rateAt[300] ? fmtN(rateAt[300].soulsPerSec, 3) : "n/a (run ended earlier)"));
console.log("  t=10 min : " + (rateAt[600] ? fmtN(rateAt[600].soulsPerSec, 3) : "n/a (run ended earlier)"));
if (rateAt[60]) {
  const a = rateAt[60].snap;
  console.log("    at 1m  shades=" + fmtN(a.shades, 2) + " siphon=" + a.siphonLevel + " depth=" + a.wellDepth + " draws=" + a.wellDraws + " spirits=" + fmtN(a.spirits, 2));
}
if (rateAt[300]) {
  const a = rateAt[300].snap;
  console.log("    at 5m  shades=" + fmtN(a.shades, 2) + " siphon=" + a.siphonLevel + " depth=" + a.wellDepth + " draws=" + a.wellDraws + " spirits=" + fmtN(a.spirits, 2) + " vessels=" + fmtN(a.vessels, 2));
}
if (rateAt[600]) {
  const a = rateAt[600].snap;
  console.log("    at 10m shades=" + fmtN(a.shades, 2) + " siphon=" + a.siphonLevel + " depth=" + a.wellDepth + " draws=" + a.wellDraws + " spirits=" + fmtN(a.spirits, 2) + " vessels=" + fmtN(a.vessels, 2) + " thrones=" + a.thrones);
}
console.log("");
console.log("Counts at " + (tributeOk ? "tribute" : "t=" + fmtTime(t)) + ":");
console.log("  souls=" + fmtN(end.souls, 2) + "  lifetimeSouls=" + fmtN(end.lifetimeSouls, 2));
console.log("  shades=" + fmtN(end.shades, 2) + "  lifetimeShades=" + fmtN(end.lifetimeShades, 2));
console.log("  spirits=" + fmtN(end.spirits, 2) + "  lifetimeSpirits=" + fmtN(end.lifetimeSpirits, 2));
console.log("  vessels=" + fmtN(end.vessels, 2) + "  thrones=" + fmtN(end.thrones, 2));
console.log("  wellDepth=" + end.wellDepth + "  siphonLevel=" + end.siphonLevel + "  levyLevel=" + end.levyLevel + "  wellDraws=" + end.wellDraws);
console.log("  souls/s=" + fmtN(end.soulsPerSec, 3) + "  prodMult=" + fmtN(end.prodMult, 3) + "  clickPower=" + fmtN(end.clickPower, 3));
console.log("  favorGain=" + favorGain(end.lifetimeSouls));
console.log("");
console.log("Verdict: first tribute is " + verdict(marks.firstTribute));
if (tributeOk) {
  const mins = marks.firstTribute / 60;
  console.log("  reached in " + mins.toFixed(2) + " min simulated.");
} else {
  console.log("  still at " + fmtN(end.lifetimeSouls, 1) + " / 25000 lifetime souls after 60 min.");
}
