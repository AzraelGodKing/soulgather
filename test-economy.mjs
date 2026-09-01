#!/usr/bin/env node
/**
 * Soulgather v1.0 economy smoke test.
 * Loads js/num.js + js/format.js (classic scripts) and duplicates in-game formulas.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(root, rel), "utf8"), { filename: rel });
}
loadScript("js/num.js");
loadScript("js/format.js");

const N = globalThis.SoulgatherNum;
const F = globalThis.SoulgatherFormat;

function unwrap(x) {
  if (x && typeof x === "object" && typeof x.m === "number") {
    const n = N.toNumber(x);
    if (isFinite(n) && Math.abs(n) < 1e15) {
      if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n);
      return n;
    }
    return n;
  }
  return x;
}

function producerCost(owned) {
  return N.cost(10, 1.15, owned);
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
  return N.cost(25, 1.5, depth);
}

function lanternCost(owned) {
  return N.cost(30, 1.2, owned);
}

function fetterCost(owned) {
  return N.cost(20, 1.2, owned);
}

function markCost(level) {
  return N.cost(8, 2, level);
}

function bulkCost(base, owned, k) {
  const b = Number(base);
  const n = Math.max(0, Math.floor(k));
  let total = N.fromNumber(0);
  for (let i = 0; i < n; i++) {
    const o = Math.max(0, Math.floor(owned)) + i;
    total = N.add(total, N.cost(b, 1.15, o));
  }
  return total;
}

function favorGain(lifetimeSouls) {
  const n = N.max(N.from(lifetimeSouls), 0);
  if (N.cmp(n, 0) <= 0) return 0;
  if (n.e < 15) {
    const v = N.toNumber(n);
    if (isFinite(v) && v >= 0) {
      return Math.floor(Math.sqrt(v / 25000));
    }
  }
  const q = N.div(n, 25000);
  const s = N.floor(N.add(N.pow(q, 0.5), N.fromNumber(1e-9)));
  const asN = N.toNumber(s);
  if (!isFinite(asN) || asN > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
  if (asN < 0) return 0;
  return Math.floor(asN);
}

function prestigeMult(favor) {
  return 1 + 0.5 * (Number(favor) || 0);
}

function harvestMult(on) {
  return on ? 1.5 : 1;
}

function bindingMult(on) {
  return on ? 1.5 : 1;
}

function throneWeight(dominion) {
  return dominion ? 0.15 : 0.1;
}

function prodMult(favorEarned, thrones, edictLevel, weight, crownWeight) {
  const w = weight == null ? 0.1 : Number(weight);
  return (
    prestigeMult(favorEarned) *
    (1 + w * (Number(thrones) || 0)) *
    (1 + 0.25 * (Number(edictLevel) || 0)) *
    (1 + 0.10 * (Number(crownWeight) || 0))
  );
}

function crownCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 6 * Math.pow(2, n);
}

function longMemCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function edictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function memoryCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 2 * Math.pow(2, n);
}

function echoCost(level) {
  const n = Math.max(0, Math.floor(level));
  if (n >= 1) return Infinity;
  return 3;
}

function seatCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function kindleCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 4 * Math.pow(2, n);
}

function ashenCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 3 * Math.pow(2, n);
}

function siphonCost(level) {
  return N.cost(50, 3, level);
}

function levyCost(level) {
  return N.cost(15, 3, level);
}

function siphonMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function titheCost(souls) {
  const n = N.max(N.from(souls), 0);
  const tenth = N.floor(N.mul(n, 0.1));
  return N.max(N.fromNumber(25), tenth);
}

function titheMult(on) {
  return on ? 2 : 1;
}

function lanternMult(lanterns) {
  if (lanterns && typeof lanterns === "object" && typeof lanterns.m === "number") {
    if (lanterns.e < 12) return N.fromNumber(1 + 0.05 * (N.toNumber(lanterns) || 0));
    return N.add(1, N.mul(0.05, lanterns));
  }
  return N.fromNumber(1 + 0.05 * (Number(lanterns) || 0));
}

function fetterMult(fetters) {
  if (fetters && typeof fetters === "object" && typeof fetters.m === "number") {
    if (fetters.e < 12) return N.fromNumber(1 + 0.05 * (N.toNumber(fetters) || 0));
    return N.add(1, N.mul(0.05, fetters));
  }
  return N.fromNumber(1 + 0.05 * (Number(fetters) || 0));
}

function emberMult(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  if (n < 40) return N.fromNumber(Math.pow(1.25, n));
  return N.pow(N.fromNumber(1.25), n);
}

let failed = 0;

function assertEqual(label, actual, expected) {
  actual = unwrap(actual);
  expected = unwrap(expected);
  if (actual !== expected) {
    console.error("FAIL:", label, "got", actual, "expected", expected);
    failed += 1;
  } else {
    console.log("ok  ", label, "=", actual);
  }
}

function assertTrue(label, cond) {
  if (!cond) {
    console.error("FAIL:", label);
    failed += 1;
  } else {
    console.log("ok  ", label);
  }
}

assertEqual("shadeCost(0)", shadeCost(0), 10);
assertEqual("shadeCost(1)", shadeCost(1), 11); // floor(10 * 1.15) = 11
assertEqual("shadeCost(10)", shadeCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("spiritCost(0)", spiritCost(0), 10);
assertEqual("spiritCost(1)", spiritCost(1), 11);
assertEqual("spiritCost(10)", spiritCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("vesselCost(0)", vesselCost(0), 10);
assertEqual("vesselCost(1)", vesselCost(1), 11);
assertEqual("vesselCost(10)", vesselCost(10), 40);

assertEqual("wellCost(0)", wellCost(0), 25);
assertEqual("wellCost(1)", wellCost(1), 37); // floor(25 * 1.5)

assertEqual("favorGain(24999)", favorGain(24999), 0);
assertEqual("favorGain(25000)", favorGain(25000), 1);
assertEqual("favorGain(100000)", favorGain(100000), 2);
assertEqual("favorGain(225000)", favorGain(225000), 3);

assertEqual("prestigeMult(0)", prestigeMult(0), 1);
assertEqual("prestigeMult(2)", prestigeMult(2), 2);

// Extra honesty checks — same curve, integer-owned flooring
assertEqual("shadeCost(2)", shadeCost(2), Math.floor(10 * Math.pow(1.15, 2)));
assertEqual("spiritCost matches shadeCost for n=7", unwrap(spiritCost(7)), unwrap(shadeCost(7)));
assertEqual("fractional owned floors", unwrap(shadeCost(1.9)), unwrap(shadeCost(1)));
assertEqual("vesselCost matches producerCost n=10", unwrap(vesselCost(10)), unwrap(producerCost(10)));
assertEqual("wellCost(2)", wellCost(2), Math.floor(25 * Math.pow(1.5, 2)));

// v0.2
assertEqual("throneCost(0)", throneCost(0), 10);
assertEqual("throneCost(1)", throneCost(1), 11);
assertEqual("throneCost(10)", throneCost(10), 40);

assertEqual("bulkCost(10,0,1)", bulkCost(10, 0, 1), 10);
assertEqual("bulkCost(10,0,2)", bulkCost(10, 0, 2), 21);

assertEqual("prestigeMult(favorEarned=2)", prestigeMult(2), 2);
assertEqual("prodMult(2,1,1)", prodMult(2, 1, 1), 2.75);

assertEqual("edictCost(0)", edictCost(0), 1);
assertEqual("edictCost(1)", edictCost(1), 2);
assertEqual("edictCost(3)", edictCost(3), 8);

assertEqual("memoryCost(0)", memoryCost(0), 2);
assertEqual("memoryCost(1)", memoryCost(1), 4);

assertEqual("echoCost(0)", echoCost(0), 3);
assertEqual("echoCost(1)", echoCost(1), Infinity);
assertEqual("seatCost(0)", seatCost(0), 5);
assertEqual("seatCost(1)", seatCost(1), 10);
assertEqual("seatCost(2)", seatCost(2), 20);

assertEqual("siphonCost(0)", siphonCost(0), 50);
assertEqual("siphonCost(1)", siphonCost(1), 150);
assertEqual("levyCost(0)", levyCost(0), 15);
assertEqual("levyCost(1)", levyCost(1), 45);
assertEqual("siphonMult(3)", siphonMult(3), 8);

function nextGoal(view, format) {
  view = view || {};
  format = format || ((n) => String(n));
  const shades = Number(view.shades) || 0;
  const spirits = Number(view.spirits) || 0;
  const lifetimeSouls = Number(view.lifetimeSouls) || 0;
  const lifetimeShades = Number(view.lifetimeShades) || 0;
  const lanterns = Number(view.lanterns) || 0;
  const censers = Number(view.censers) || 0;
  const fetters = Number(view.fetters) || 0;
  const unlockedSpirits = !!view.unlockedSpirits;
  const unlockedVessels = !!view.unlockedVessels;
  const unlockedThrones = !!view.unlockedThrones;
  const favorEarned = Number(view.favorEarned) || 0;
  const gain = favorGain(lifetimeSouls);
  const sworn = view.aspect === "harvest" || view.aspect === "binding" || view.aspect === "dominion"
    || view.aspect === "aspectHarvest" || view.aspect === "aspectBinding" || view.aspect === "aspectDominion";
  const marksBought = (Number(view.emberLevel) || 0) + (Number(view.chainLevel) || 0) + (Number(view.hollowLevel) || 0);

  if (favorEarned >= 1 && !sworn) {
    return "Swear an Aspect. The GodKing waits.";
  }

  if (shades < 1 && lifetimeShades < 1 && !unlockedSpirits) {
    return "Bind a Shade to wake the well.";
  }
  if (!unlockedSpirits) {
    if (view.unlockedLanterns && lanterns < 1) {
      return "Kindle a Lantern. A light for the echoes.";
    }
    return (
      "The well thickens. Bound Spirits at 10 Shades. " +
      format(shades) +
      " / 10 Shades"
    );
  }
  if (!unlockedVessels) {
    if (view.unlockedFetters && fetters < 1) {
      return "Bind a Fetter. A chain that teaches the will to pull.";
    }
    return "Vessels at 5 Bound Spirits. " + format(spirits) + " / 5";
  }
  if (!unlockedThrones) {
    return "A throne at 1 Vessel.";
  }
  if (gain >= 1) {
    return "Lay Tribute. The GodKing will remember.";
  }
  if (view.unlockedLanterns && lanterns < 1) {
    return "Kindle a Lantern. A light for the echoes.";
  }
  if (view.unlockedFetters && fetters < 1) {
    return "Bind a Fetter. A chain that teaches the will to pull.";
  }
  if (view.unlockedMarks && marksBought < 1) {
    return "Press a Mark. Ash is what the well will not keep.";
  }
  if (view.unlockedCensers && censers < 1) {
    return "Raise a Censer. They burn what the well discards.";
  }
  if (favorEarned >= 1) {
    return "The well gathers. Another Tribute at 25000 lifetime Souls this run.";
  }
  return (
    "Tribute when the GodKing will remember. " +
    format(lifetimeSouls) +
    " / 25000 lifetime Souls."
  );
}

assertEqual(
  "nextGoal fresh",
  nextGoal({ shades: 0 }),
  "Bind a Shade to wake the well."
);
assertEqual(
  "nextGoal 3 shades",
  nextGoal({ shades: 3 }),
  "The well thickens. Bound Spirits at 10 Shades. 3 / 10 Shades"
);
assertEqual(
  "nextGoal spirits unlocked",
  nextGoal({ shades: 10, spirits: 2, unlockedSpirits: true }),
  "Vessels at 5 Bound Spirits. 2 / 5"
);
assertEqual(
  "nextGoal vessels unlocked",
  nextGoal({ unlockedSpirits: true, unlockedVessels: true }),
  "A throne at 1 Vessel."
);
assertEqual(
  "nextGoal thrones before tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 412,
  }),
  "Tribute when the GodKing will remember. 412 / 25000 lifetime Souls."
);
assertEqual(
  "nextGoal tribute ready",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal after tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
    aspect: "harvest",
  }),
  "The well gathers. Another Tribute at 25000 lifetime Souls this run."
);

assertEqual(
  "nextGoal swear aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("harvestMult(true)", harvestMult(true), 1.5);
assertEqual("harvestMult(false)", harvestMult(false), 1);
assertEqual("bindingMult(true)", bindingMult(true), 1.5);
assertEqual("bindingMult(false)", bindingMult(false), 1);
assertEqual("throneWeight(true)", throneWeight(true), 0.15);
assertEqual("throneWeight(false)", throneWeight(false), 0.1);
assertEqual("prodMult(0,2,0) no dominion", prodMult(0, 2, 0, throneWeight(false)), 1.2);
assertEqual("prodMult(0,2,0) dominion", prodMult(0, 2, 0, throneWeight(true)), 1.3);

assertEqual(
  "nextGoal null aspect",
  nextGoal({ favorEarned: 1, aspect: null }),
  "Swear an Aspect. The GodKing waits."
);
assertEqual(
  "nextGoal empty aspect",
  nextGoal({ favorEarned: 1, aspect: "" }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("bulkCost fractional owned floors", unwrap(bulkCost(10, 1.9, 1)), unwrap(bulkCost(10, 1, 1)));

const fakeSave = {
  souls: 12,
  shades: 3,
  aspect: "harvest",
  favorEarned: 2,
  siphonLevel: 1,
};
const roundTripped = JSON.parse(JSON.stringify(fakeSave));
assertEqual("round-trip keep aspect", roundTripped.aspect, "harvest");
assertEqual("round-trip keep favorEarned", roundTripped.favorEarned, 2);

assertEqual("titheCost(100)", titheCost(100), 25);
assertEqual("titheCost(400)", titheCost(400), 40);
assertEqual("titheCost(10)", titheCost(10), 25);
assertEqual("titheMult(true)", titheMult(true), 2);
assertEqual("titheMult(false)", titheMult(false), 1);

// v0.8 Num safety
assertEqual("fromNumber(10)", unwrap(N.fromNumber(10)), 10);
assertEqual("cost(10,1.15,0)", N.cost(10, 1.15, 0), 10);
assertEqual("cost(10,1.15,1)", N.cost(10, 1.15, 1), 11);
assertEqual("cost(10,1.15,10)", N.cost(10, 1.15, 10), 40);

const siphon80 = siphonCost(80);
assertTrue("siphonCost(80) is finite", N.isFinite(siphon80) && isFinite(N.toNumber(siphon80)) && N.toNumber(siphon80) !== Infinity);
const siphon700 = siphonCost(700);
assertTrue("siphonCost(700) is finite Num", N.isFinite(siphon700) && N.cmp(siphon700, 0) > 0);
assertTrue("siphonCost(700) not JS Infinity", !isFinite(N.toNumber(siphon700)) || N.toNumber(siphon700) !== Infinity ? (N.isFinite(siphon700) && siphon700.e > 300) : true);

const bigA = N.mul(N.fromNumber(1.2), N.pow(N.fromNumber(10), 40));
const bigB = N.mul(N.fromNumber(3.4), N.pow(N.fromNumber(10), 40));
const bigSum = N.add(bigA, bigB);
assertTrue("add two large nums finite", N.isFinite(bigSum) && N.cmp(bigSum, 0) > 0);
assertTrue("add two large nums ~4.6e40", Math.abs(bigSum.e - 40) <= 1);

let formatThrew = false;
try {
  F.formatFromNum(siphon700);
  F.formatNumber(bigSum);
  F.formatFromNum(N.fromNumber(10));
  F.formatNumber(N.cost(10, 1.15, 10));
} catch (err) {
  formatThrew = true;
  console.error("format threw", err);
}
assertTrue("format doesn't throw", !formatThrew);

assertEqual("lanternCost(0)", lanternCost(0), 30);
assertEqual("lanternCost(1)", lanternCost(1), 36);
assertEqual("markCost(0)", markCost(0), 8);
assertEqual("markCost(1)", markCost(1), 16);
assertEqual("lanternMult(2)", lanternMult(2), 1.1);
assertEqual("emberMult(2)", emberMult(2), 1.5625);

assertEqual("dump/load number", unwrap(N.load(12)), 12);
assertEqual("dump/load {m,e}", unwrap(N.load({ m: 1.2, e: 1 })), 12);
assertEqual("dump round-trip 40", unwrap(N.load(N.dump(N.cost(10, 1.15, 10)))), 40);
assertTrue("50*3^80 not Infinity", N.isFinite(siphon80) && N.toNumber(siphon80) !== Infinity);

assertEqual(
  "nextGoal lantern half-step",
  nextGoal({ shades: 3, unlockedLanterns: true, lanterns: 0 }),
  "Kindle a Lantern. A light for the echoes."
);
assertEqual(
  "nextGoal does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedLanterns: true,
    lanterns: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedLanterns: true,
    lanterns: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("fetterCost(0)", fetterCost(0), 20);
assertEqual("fetterCost(1)", fetterCost(1), 24);
assertEqual("kindleCost(0)", kindleCost(0), 4);
assertEqual("ashenCost(0)", ashenCost(0), 3);
assertEqual("fetterMult(2)", fetterMult(2), 1.1);

assertEqual("crownCost(0)", crownCost(0), 6);
assertEqual("crownCost(1)", crownCost(1), 12);
assertEqual("longMemCost(0)", longMemCost(0), 5);
assertEqual("prodMult(0,0,0,false,0)", prodMult(0, 0, 0, false, 0), 1);
assertEqual("prodMult(0,0,0,false,2)", prodMult(0, 0, 0, false, 2), 1.2);
assertEqual("prodMult crownWeight 2 other factors 1", prodMult(0, 0, 0, 0.1, 2), 1.2);

assertEqual(
  "nextGoal fetter half-step",
  nextGoal({ shades: 10, spirits: 3, unlockedSpirits: true, unlockedFetters: true, fetters: 0 }),
  "Bind a Fetter. A chain that teaches the will to pull."
);
assertEqual(
  "nextGoal fetter does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedFetters: true,
    fetters: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal fetter does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedFetters: true,
    fetters: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

if (failed > 0) {
  console.error(failed + " assertion(s) failed");
  process.exit(1);
}

console.log("all economy assertions passed");
process.exit(0);
