#!/usr/bin/env node
/**
 * Soulgather v6.9.1 economy smoke test (AZR-176).
 * Loads the real shipped js/game.js under Node (boot deferred) and asserts
 * against the live SoulgatherEconomy exports.  No regex over source text.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

// ─── Sandbox: load real game.js (boot deferred) ────────────────────────────────
function createStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(k); },
    clear() { map.clear(); },
    _map: map
  };
}

function makeEl(id) {
  return {
    id, value: "", disabled: false,
    classList: {
      _set: new Set(id === "load-fail-notice" ? ["is-hidden"] : []),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    style: {}, dataset: {}, textContent: "", innerHTML: "", open: false,
    focus() {}, select() {},
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; }
  };
}

const elsById = {};
[
  "load-fail-notice", "load-fail-raw", "load-fail-export",
  "load-fail-restore", "load-fail-fresh", "toast",
  "memory-panel", "memory-text", "memory-export", "memory-import",
  "reset-btn", "gather-btn", "souls-count", "souls-rate",
  "hollow-status", "souls-ash", "souls-favor", "souls-hymn",
  "souls-wake", "souls-knell", "next-goal", "buy-mode",
  "buy-mode-hint", "buy-mode-hint-dismiss", "chronicle-list",
  "names-bound", "names-bound-list", "vow-status"
].forEach((id) => { elsById[id] = makeEl(id); });

const storage = createStorage();

const documentMock = {
  readyState: "loading",
  hidden: false,
  body: makeEl("body"),
  documentElement: makeEl("html"),
  getElementById(id) {
    if (!elsById[id]) elsById[id] = makeEl(id);
    return elsById[id];
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  removeEventListener() {},
  createElement() { return makeEl("anon"); },
  execCommand() { return false; }
};

const sandbox = {
  console, Date, Math, JSON, Number, String, Boolean, Array, Object,
  Error, TypeError, RegExp, parseInt, parseFloat, isFinite, isNaN,
  Infinity, NaN, undefined,
  localStorage: storage,
  document: documentMock,
  navigator: {},
  confirm() { return false; },
  prompt() { return null; },
  setTimeout() { return 0; },
  clearTimeout() {},
  setInterval() { return 0; },
  clearInterval() {},
  requestAnimationFrame() { return 0; },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() { return {}; }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function loadScript(rel) {
  const code = fs.readFileSync(path.join(root, rel), "utf8");
  vm.runInContext(code, sandbox, { filename: rel });
}

loadScript("js/num.js");
loadScript("js/format.js");
loadScript("js/config.js");
loadScript("js/economy.js");
loadScript("js/game.js");

const N = sandbox.SoulgatherNum;
const F = sandbox.SoulgatherFormat;
const G = sandbox.SoulgatherEconomy;

// Format function that mirrors old test behaviour (plain numbers, no abbreviation)
function fmtPlain(n) {
  if (n && typeof n === "object" && typeof n.m === "number") {
    const v = N.toNumber(n);
    if (isFinite(v)) return String(Math.round(v));
    return String(v);
  }
  return String(n);
}

// ─── Test helpers ───────────────────────────────────────────────────────────────
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

// Helper: reset game state to fresh for behavioural tests
function resetState(partial) {
  const fresh = G.freshState();
  const keys = Object.keys(fresh);
  const st = G.getState();
  for (let i = 0; i < keys.length; i++) st[keys[i]] = fresh[keys[i]];
  G.setLoadFailed(false);
  G.setLoadFailedRaw(null);
  if (partial) G.__setStateForTest(partial);
}

// ─── Basic export sanity ────────────────────────────────────────────────────────
assertTrue("SoulgatherEconomy exported", !!G);
assertTrue("exports shadeCost", typeof G.shadeCost === "function");
assertTrue("exports __setStateForTest", typeof G.__setStateForTest === "function");
assertTrue("exports freshState", typeof G.freshState === "function");
assertTrue("exports applyDt", typeof G.applyDt === "function");
assertTrue("exports harvest", typeof G.harvest === "function");
assertTrue("exports tryAutobind", typeof G.tryAutobind === "function");
assertTrue("exports buyShade", typeof G.buyShade === "function");
assertTrue("exports serializeState", typeof G.serializeState === "function");
assertTrue("exports applySaveData", typeof G.applySaveData === "function");
assertTrue("exports layTribute", typeof G.layTribute === "function");
assertTrue("exports save", typeof G.save === "function");
assertTrue("exports flushSave", typeof G.flushSave === "function");

// ─── Cost function asserts (using real exports) ─────────────────────────────────
assertEqual("shadeCost(0)", G.shadeCost(0), 10);
assertEqual("shadeCost(1)", G.shadeCost(1), 11);
assertEqual("shadeCost(10)", G.shadeCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("spiritCost(0)", G.spiritCost(0), 10);
assertEqual("spiritCost(1)", G.spiritCost(1), 11);
assertEqual("spiritCost(10)", G.spiritCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("vesselCost(0)", G.vesselCost(0), 10);
assertEqual("vesselCost(1)", G.vesselCost(1), 11);
assertEqual("vesselCost(10)", G.vesselCost(10), 40);

assertEqual("wellCost(0)", G.wellCost(0), 25);
assertEqual("wellCost(1)", G.wellCost(1), 33);
assertTrue("wellCost(1) softer than old 37", unwrap(G.wellCost(1)) < 37);
assertTrue("wellCost(5) softer than old 189", unwrap(G.wellCost(5)) < 189);
assertEqual("wellCost(5)", G.wellCost(5), Math.floor(25 * Math.pow(1.35, 5)));
assertEqual("wellCost(6) original 1.5 curve", G.wellCost(6), Math.floor(25 * Math.pow(1.5, 6)));
{
  const late = unwrap(G.wellCost(10));
  const ref = Math.floor(25 * Math.pow(1.5, 10));
  assertTrue("wellCost(10) within ±5% of floor(25*1.5^10)", Math.abs(late - ref) <= ref * 0.05);
  assertEqual("wellCost(10) equals late curve", late, ref);
}

assertEqual("favorGain(24999)", G.favorGain(24999), 0);
assertEqual("favorGain(25000)", G.favorGain(25000), 1);
assertEqual("favorGain(100000)", G.favorGain(100000), 2);
assertEqual("favorGain(225000)", G.favorGain(225000), 3);
assertEqual("FAVOR_SOULS_BASE === 25000", G.FAVOR_SOULS_BASE, 25000);

for (let n = 1; n <= 50; n++) {
  const need = G.soulsForFavor(n);
  assertEqual("favorGain(soulsForFavor(" + n + "))", G.favorGain(need), n);
  const justUnder = N.sub(need, 1);
  assertEqual("favorGain(soulsForFavor(" + n + ")-1)", G.favorGain(justUnder), n - 1);
}

{
  const copy = G.nextGoal({
    unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true,
    favorEarned: 4, aspect: "harvest", lifetimeSouls: 412000
  }, fmtPlain);
  assertTrue("nextGoal favorEarned=4 names 625k threshold", /625/.test(copy));
  assertTrue("nextGoal favorEarned=4 does not lie with 25000", !/\b25000\b/.test(copy));
  assertTrue("nextGoal favorEarned=4 leads with Lay Tribute", /^Lay Tribute\./.test(copy));
  assertTrue("nextGoal favorEarned=4 says 4 Favor waits", /4 Favor waits/.test(copy));
}

assertEqual("prestigeMult(0)", G.prestigeMult(0), 1);
assertEqual("prestigeMult(2)", G.prestigeMult(2), 2);

assertEqual("shadeCost(2)", G.shadeCost(2), Math.floor(10 * Math.pow(1.15, 2)));
assertEqual("spiritCost matches shadeCost for n=7", unwrap(G.spiritCost(7)), unwrap(G.shadeCost(7)));
assertEqual("fractional owned floors", unwrap(G.shadeCost(1.9)), unwrap(G.shadeCost(1)));
assertEqual("vesselCost matches producerCost n=10", unwrap(G.vesselCost(10)), unwrap(G.producerCost(10)));
assertEqual("wellCost(2)", G.wellCost(2), Math.floor(25 * Math.pow(1.35, 2)));
{
  const softBulk = unwrap(G.wellBulkCost(0, 3));
  const oldBulk = unwrap(N.add(N.add(N.cost(25, 1.5, 0), N.cost(25, 1.5, 1)), N.cost(25, 1.5, 2)));
  assertTrue("wellBulkCost early softer than flat 1.5", softBulk < oldBulk);
}

assertEqual("throneCost(0)", G.throneCost(0), 10);
assertEqual("throneCost(1)", G.throneCost(1), 11);
assertEqual("throneCost(10)", G.throneCost(10), 40);

assertEqual("bulkCost(10,0,1)", G.bulkCost(10, 0, 1), 10);
assertEqual("bulkCost(10,0,2)", G.bulkCost(10, 0, 2), 21);

assertEqual("prestigeMult(favorEarned=2)", G.prestigeMult(2), 2);
assertEqual("prodMult(2,1,1)", G.prodMult(2, 1, 1), 2.75);

assertEqual("edictCost(0)", G.edictCost(0), 1);
assertEqual("edictCost(1)", G.edictCost(1), 2);
assertEqual("edictCost(3)", G.edictCost(3), 8);

assertEqual("memoryCost(0)", G.memoryCost(0), 2);
assertEqual("memoryCost(1)", G.memoryCost(1), 4);

assertEqual("echoCost(0)", G.echoCost(0), 3);
assertEqual("echoCost(1)", G.echoCost(1), Infinity);
assertEqual("seatCost(0)", G.seatCost(0), 5);
assertEqual("seatCost(1)", G.seatCost(1), 10);
assertEqual("seatCost(2)", G.seatCost(2), 20);

assertEqual("siphonCost(0)", G.siphonCost(0), 65);
assertEqual("siphonCost(1)", G.siphonCost(1), 195);
assertEqual("levyCost(0)", G.levyCost(0), 22);
assertEqual("levyCost(1)", G.levyCost(1), 66);
assertEqual("siphonMult(0)", G.siphonMult(0), 1);
assertEqual("siphonMult(1)", G.siphonMult(1), Math.pow(1.55, 1));
assertEqual("siphonMult(2)", G.siphonMult(2), Math.pow(1.55, 2));
assertEqual("siphonMult(3)", G.siphonMult(3), Math.pow(1.55, 3));
assertEqual("cinderMult(0)", G.cinderMult(0), 1);
assertEqual("cinderMult(1)", G.cinderMult(1), Math.pow(1.55, 1));
assertEqual("cinderMult(2)", G.cinderMult(2), Math.pow(1.55, 2));
assertEqual("urnRiteMult(0)", G.urnRiteMult(0), 1);
assertEqual("urnRiteMult(1)", G.urnRiteMult(1), Math.pow(1.55, 1));
assertEqual("urnRiteMult(2)", G.urnRiteMult(2), Math.pow(1.55, 2));
assertEqual("hearthRiteMult(0)", G.hearthRiteMult(0), 1);
assertEqual("hearthRiteMult(1)", G.hearthRiteMult(1), Math.pow(1.55, 1));
assertEqual("hearthRiteMult(2)", G.hearthRiteMult(2), Math.pow(1.55, 2));
assertEqual("HEARTH_RITE_COST_BASE", G.HEARTH_RITE_COST_BASE, 20);
assertEqual("HEARTH_RITE_COST", G.HEARTH_RITE_COST, 20);
assertEqual("beaconRiteMult(0)", G.beaconRiteMult(0), 1);
assertEqual("beaconRiteMult(1)", G.beaconRiteMult(1), Math.pow(1.55, 1));
assertEqual("beaconRiteMult(2)", G.beaconRiteMult(2), Math.pow(1.55, 2));
assertEqual("BEACON_RITE_COST_BASE", G.BEACON_RITE_COST_BASE, 24);
assertEqual("BEACON_RITE_COST", G.BEACON_RITE_COST, 24);
assertEqual("spireRiteMult(0)", G.spireRiteMult(0), 1);
assertEqual("spireRiteMult(1)", G.spireRiteMult(1), Math.pow(1.55, 1));
assertEqual("spireRiteMult(2)", G.spireRiteMult(2), Math.pow(1.55, 2));
assertEqual("SPIRE_RITE_COST_BASE", G.SPIRE_RITE_COST_BASE, 26);
assertEqual("SPIRE_RITE_COST", G.SPIRE_RITE_COST, 26);
assertEqual("CINDER_COST_BASE", G.CINDER_COST_BASE, 22);
assertEqual("CINDER_COST", G.CINDER_COST, 22);
assertEqual("URN_RITE_COST_BASE", G.URN_RITE_COST_BASE, 18);
assertEqual("URN_RITE_COST", G.URN_RITE_COST, 18);
assertEqual("RITE_MULT_BASE", G.RITE_MULT_BASE, 1.55);
assertEqual("CINDER_COST_MULT", G.CINDER_COST_MULT, 2.6);
assertEqual("URN_RITE_COST_MULT", G.URN_RITE_COST_MULT, 2.6);
assertEqual("HEARTH_RITE_COST_MULT", G.HEARTH_RITE_COST_MULT, 2.6);
assertEqual("BEACON_RITE_COST_MULT", G.BEACON_RITE_COST_MULT, 2.6);
assertEqual("SPIRE_RITE_COST_MULT", G.SPIRE_RITE_COST_MULT, 2.6);

// AZR-162: geometric ash-rite costs (mult 2.6)
assertEqual("cinderCost(0)", G.cinderCost(0), 22);
assertEqual("urnRiteCost(0)", G.urnRiteCost(0), 18);
assertEqual("hearthRiteCost(0)", G.hearthRiteCost(0), 20);
assertEqual("beaconRiteCost(0)", G.beaconRiteCost(0), 24);
assertEqual("spireRiteCost(0)", G.spireRiteCost(0), 26);

const ashRiteCostFns = [
  ["cinderCost", G.cinderCost, G.cinderMult],
  ["urnRiteCost", G.urnRiteCost, G.urnRiteMult],
  ["hearthRiteCost", G.hearthRiteCost, G.hearthRiteMult],
  ["beaconRiteCost", G.beaconRiteCost, G.beaconRiteMult],
  ["spireRiteCost", G.spireRiteCost, G.spireRiteMult],
];
for (const [name, costFn, multFn] of ashRiteCostFns) {
  let prev = costFn(0);
  for (let n = 0; n <= 50; n++) {
    const cur = costFn(n);
    const nxt = costFn(n + 1);
    assertTrue(name + "(" + (n + 1) + ") > " + name + "(" + n + ")", N.cmp(nxt, cur) > 0);
    if (n >= 1) {
      const cNum = N.toNumber(cur);
      const mNum = N.toNumber(multFn(n));
      const pNum = N.toNumber(prev);
      const pm = N.toNumber(multFn(n - 1));
      if (isFinite(cNum) && isFinite(mNum) && isFinite(pNum) && isFinite(pm) && mNum > 0 && pm > 0) {
        assertTrue(name + "/" + "mult ratio increases at n=" + n, cNum / mNum > pNum / pm - 1e-9);
      } else {
        const ratio = N.div(cur, multFn(n));
        const prevRatio = N.div(prev, multFn(n - 1));
        assertTrue(name + "/" + "mult Num ratio increases at n=" + n, N.cmp(ratio, prevRatio) > 0);
      }
    }
    prev = cur;
  }
}

// Greedy sim: geometric ash-rite costs bound levels
(function azr162GreedyAshRiteSim() {
  const incomePerStep = N.fromNumber(50);
  const rites = [
    ["cinder", G.cinderCost], ["urn", G.urnRiteCost],
    ["hearth", G.hearthRiteCost], ["beacon", G.beaconRiteCost],
    ["spire", G.spireRiteCost],
  ];
  for (const [label, costFn] of rites) {
    let ash = N.fromNumber(100);
    let level = 0;
    for (let step = 0; step < 500; step++) {
      ash = N.add(ash, incomePerStep);
      const cost = costFn(level);
      if (N.cmp(ash, cost) >= 0) { ash = N.sub(ash, cost); level += 1; }
    }
    assertTrue("AZR-162 " + label + " ash finite end", N.isFinite(ash));
    assertTrue("AZR-162 " + label + " level < 30 (got " + level + ")", level < 30);
    assertTrue("AZR-162 " + label + " bought at least once", level >= 1);
  }
})();
assertTrue("siphonMult(5) finite", N.isFinite(N.from(G.siphonMult(5))));
assertTrue("siphonMult(5) ≈ 1.55^5", Math.abs(N.toNumber(N.from(G.siphonMult(5))) - Math.pow(1.55, 5)) < 1e-9);
assertTrue("siphonMult(20) finite no NaN", N.isFinite(N.from(G.siphonMult(20))));
assertEqual("cinderEdictCost(0)", G.cinderEdictCost(0), 8);
assertTrue("cinderEdictStartsPyreAutobind(0) is false", !G.cinderEdictStartsPyreAutobind(0));
assertTrue("cinderEdictStartsPyreAutobind(1) is true", G.cinderEdictStartsPyreAutobind(1));
assertEqual("cutEdictCost(0)", G.cutEdictCost(0), 11);
assertTrue("cutEdictStartsUrnAutobind(0) is false", !G.cutEdictStartsUrnAutobind(0));
assertTrue("cutEdictStartsUrnAutobind(1) is true", G.cutEdictStartsUrnAutobind(1));
assertEqual("tendingEdictCost(0)", G.tendingEdictCost(0), 12);
assertEqual("tendingEdictCost(1)", G.tendingEdictCost(1), 24);
assertTrue("tendingEdictStartsHearthAutobind(0) is false", !G.tendingEdictStartsHearthAutobind(0));
assertTrue("tendingEdictStartsHearthAutobind(1) is true", G.tendingEdictStartsHearthAutobind(1));
assertEqual("gleamEdictCost(0)", G.gleamEdictCost(0), 13);
assertEqual("gleamEdictCost(1)", G.gleamEdictCost(1), 26);
assertTrue("gleamEdictStartsBeaconAutobind(0) is false", !G.gleamEdictStartsBeaconAutobind(0));
assertTrue("gleamEdictStartsBeaconAutobind(1) is true", G.gleamEdictStartsBeaconAutobind(1));
assertEqual("riseEdictCost(0)", G.riseEdictCost(0), 14);
assertEqual("riseEdictCost(1)", G.riseEdictCost(1), 28);
assertTrue("riseEdictStartsSpireAutobind(0) is false", !G.riseEdictStartsSpireAutobind(0));
assertTrue("riseEdictStartsSpireAutobind(1) is true", G.riseEdictStartsSpireAutobind(1));
assertEqual("chaliceMult(0)", G.chaliceMult(0), 1);
assertEqual("chaliceMult(1)", G.chaliceMult(1), 1.08);
assertEqual("chaliceCost(0)", G.chaliceCost(0), 32);
assertEqual("cupEdictCost(0)", G.cupEdictCost(0), 9);
assertEqual("cupStartsChalices(0)", G.cupStartsChalices(0), 0);
assertEqual("cupStartsChalices(2)", G.cupStartsChalices(2), 2);
assertEqual("cupStartsChalices(20)", G.cupStartsChalices(20), 12);
assertEqual("chaliceMult(12) full cup", G.chaliceMult(12), 1.96);

assertEqual("nextGoal fresh", G.nextGoal({ shades: 0 }, fmtPlain), "Bind a Shade to wake the well.");
assertEqual("nextGoal 3 shades", G.nextGoal({ shades: 3 }, fmtPlain),
  "The well thickens. Bound Spirits at 10 Shades. 3 / 10 Shades");
assertEqual("nextGoal spirits unlocked",
  G.nextGoal({ shades: 10, spirits: 2, unlockedSpirits: true }, fmtPlain),
  "Vessels at 5 Bound Spirits. 2 / 5");
assertEqual("nextGoal vessels unlocked",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true }, fmtPlain),
  "A throne at 1 Vessel.");
assertEqual("nextGoal thrones before tribute",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 412 }, fmtPlain),
  "Tribute when the GodKing will remember. 412 / 25000 lifetime Souls.");
assertEqual("nextGoal tribute ready",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 25000 }, fmtPlain),
  "Lay Tribute. The GodKing will remember.");
assertEqual("nextGoal after tribute",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 0, favorEarned: 1, aspect: "harvest", vow: "stillness" }, fmtPlain),
  "The well gathers. Next Favor at 25000 — 0 / 25000.");
assertEqual("nextGoal swear aspect",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 0, favorEarned: 1 }, fmtPlain),
  "Swear an Aspect. The GodKing waits.");

assertEqual("harvestMult(true)", G.harvestMult(true), 1.5);
assertEqual("harvestMult(false)", G.harvestMult(false), 1);
assertEqual("bindingMult(true)", G.bindingMult(true), 1.5);
assertEqual("bindingMult(false)", G.bindingMult(false), 1);
assertEqual("throneWeight(true)", G.throneWeight(true), 0.15);
assertEqual("throneWeight(false)", G.throneWeight(false), 0.1);
assertEqual("prodMult(0,2,0) no dominion", G.prodMult(0, 2, 0, G.throneWeight(false)), 1.2);
assertEqual("prodMult(0,2,0) dominion", G.prodMult(0, 2, 0, G.throneWeight(true)), 1.3);

assertEqual("nextGoal null aspect", G.nextGoal({ favorEarned: 1, aspect: null }, fmtPlain), "Swear an Aspect. The GodKing waits.");
assertEqual("nextGoal empty aspect", G.nextGoal({ favorEarned: 1, aspect: "" }, fmtPlain), "Swear an Aspect. The GodKing waits.");

assertEqual("bulkCost fractional owned floors", unwrap(G.bulkCost(10, 1.9, 1)), unwrap(G.bulkCost(10, 1, 1)));

assertEqual("titheCost(100)", G.titheCost(100), 25);
assertEqual("titheCost(400)", G.titheCost(400), 40);
assertEqual("titheCost(10)", G.titheCost(10), 25);
assertEqual("titheMult(true)", G.titheMult(true), 2);
assertEqual("titheMult(false)", G.titheMult(false), 1);

// Num safety
assertEqual("fromNumber(10)", unwrap(N.fromNumber(10)), 10);
assertEqual("cost(10,1.15,0)", N.cost(10, 1.15, 0), 10);
assertEqual("cost(10,1.15,1)", N.cost(10, 1.15, 1), 11);
assertEqual("cost(10,1.15,10)", N.cost(10, 1.15, 10), 40);

const siphon80 = G.siphonCost(80);
assertTrue("siphonCost(80) is finite", N.isFinite(siphon80) && isFinite(N.toNumber(siphon80)) && N.toNumber(siphon80) !== Infinity);
const siphon700 = G.siphonCost(700);
assertTrue("siphonCost(700) is finite Num", N.isFinite(siphon700) && N.cmp(siphon700, 0) > 0);

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
} catch (err) { formatThrew = true; console.error("format threw", err); }
assertTrue("format doesn't throw", !formatThrew);

assertEqual("lanternCost(0)", G.lanternCost(0), 30);
assertEqual("lanternCost(1)", G.lanternCost(1), 36);
assertEqual("producerCost(0) censer base", G.producerCost(0), 10);
assertEqual("censerCost(0)", G.censerCost(0), 10);
assertEqual("censerCost matches producerCost", unwrap(G.censerCost(3)), unwrap(G.producerCost(3)));

assertEqual("markCost(0)", G.markCost(0), 8);
assertEqual("markCost(1)", G.markCost(1), 16);
assertEqual("lanternMult(2)", G.lanternMult(2), 1.1);
assertEqual("emberMult(2)", G.emberMult(2), 1.5625);

assertEqual("dump/load number", unwrap(N.load(12)), 12);
assertEqual("dump/load {m,e}", unwrap(N.load({ m: 1.2, e: 1 })), 12);
assertEqual("dump round-trip 40", unwrap(N.load(N.dump(N.cost(10, 1.15, 10)))), 40);

function assertLoadSafe(label, v) {
  const x = N.load(v);
  assertTrue(label, !!(x && N.isFinite(x) && N.cmp(x, 0) >= 0));
}
assertLoadSafe("AZR-168 N.load(NaN) finite >=0", NaN);
assertLoadSafe("AZR-168 N.load(Infinity) finite >=0", Infinity);
assertLoadSafe("AZR-168 N.load(-Infinity) finite >=0", -Infinity);
assertLoadSafe("AZR-168 N.load({m:NaN}) finite >=0", { m: NaN, e: 0 });
assertLoadSafe("AZR-168 N.load({m:Infinity}) finite >=0", { m: Infinity, e: 0 });
assertLoadSafe("AZR-168 N.load('abc') finite >=0", "abc");
assertLoadSafe("AZR-168 N.load(null) finite >=0", null);
assertLoadSafe("AZR-168 N.load(undefined) finite >=0", undefined);
assertLoadSafe("AZR-168 N.load(-1) finite >=0", -1);
assertTrue("AZR-168 fromNumber(-1) still exists internally", N.cmp(N.fromNumber(-1), 0) < 0);
assertTrue("50*3^80 not Infinity", N.isFinite(siphon80) && N.toNumber(siphon80) !== Infinity);

assertEqual("nextGoal lantern half-step", G.nextGoal({ shades: 3, unlockedLanterns: true, lanterns: 0 }, fmtPlain),
  "Kindle a Lantern. A light for the echoes.");
assertEqual("nextGoal does not steal tribute",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, unlockedLanterns: true, lanterns: 0, lifetimeSouls: 25000 }, fmtPlain),
  "Lay Tribute. The GodKing will remember.");
assertEqual("nextGoal does not steal aspect",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, unlockedLanterns: true, lanterns: 0, favorEarned: 1 }, fmtPlain),
  "Swear an Aspect. The GodKing waits.");

assertEqual("fetterCost(0)", G.fetterCost(0), 20);
assertEqual("fetterCost(1)", G.fetterCost(1), 24);
assertEqual("kindleCost(0)", G.kindleCost(0), 4);
assertEqual("ashenCost(0)", G.ashenCost(0), 3);
assertEqual("depthCost(0)", G.depthCost(0), 4);
assertEqual("depthCost(1)", G.depthCost(1), 8);
assertEqual("quietCourtCost(0)", G.quietCourtCost(0), 8);
assertEqual("quietCourtCost(1)", G.quietCourtCost(1), 16);
assertEqual("vowExtraFavor stillness", G.vowExtraFavor("stillness"), 1);
assertEqual("vowExtraFavor none", G.vowExtraFavor(""), 0);
assertEqual("vowExtraFavor ember", G.vowExtraFavor("ember"), 1);
assertEqual("vowsKnownCount empty", G.vowsKnownCount({}), 0);
assertEqual("vowsKnownCount all four", G.vowsKnownCount({ stillness: true, poverty: true, hunger: true, ember: true }), 4);
assertEqual("fetterMult(2)", G.fetterMult(2), 1.1);

assertEqual("crownCost(0)", G.crownCost(0), 6);
assertEqual("crownCost(1)", G.crownCost(1), 12);
assertEqual("longMemCost(0)", G.longMemCost(0), 5);
assertEqual("prodMult(0,0,0,false,0)", G.prodMult(0, 0, 0, false, 0), 1);
assertEqual("prodMult(0,0,0,false,2)", G.prodMult(0, 0, 0, false, 2), 1.2);
assertEqual("prodMult crownWeight 2 other factors 1", G.prodMult(0, 0, 0, 0.1, 2), 1.2);

assertEqual("nextGoal fetter half-step",
  G.nextGoal({ shades: 10, spirits: 3, unlockedSpirits: true, unlockedFetters: true, fetters: 0 }, fmtPlain),
  "Bind a Fetter. A chain that teaches the will to pull.");

assertEqual("nextGoal vow hint after aspect",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 0, favorEarned: 1, aspect: "harvest", vow: "" }, fmtPlain),
  "A vow may be sworn.");
assertEqual("nextGoal sworn vow",
  G.nextGoal({ unlockedSpirits: true, unlockedVessels: true, unlockedThrones: true, lifetimeSouls: 0, favorEarned: 1, aspect: "harvest", vow: "stillness" }, fmtPlain),
  "The well gathers. Next Favor at 25000 \u2014 0 / 25000.");

assertEqual("remembranceCostFavor", G.remembranceCostFavor(), 3);
assertEqual("remembranceFavorCost", G.remembranceFavorCost(), 3);
assertEqual("deeperNightCost(0)", G.deeperNightCost(0), 1);
assertEqual("deeperNightCost(1)", G.deeperNightCost(1), 2);
assertEqual("longerProcessionCost(0)", G.longerProcessionCost(0), 1);
assertEqual("paidProcessionSecs(0)", G.paidProcessionSecs(0), 45);
assertEqual("paidProcessionSecs(2)", G.paidProcessionSecs(2), 65);
assertEqual("deeperTollCost(0)", G.deeperTollCost(0), 1);
assertEqual("paidTollSecs(0)", G.paidTollSecs(0), 25);
assertEqual("paidTollSecs(2)", G.paidTollSecs(2), 45);
assertEqual("longerWakeCost(0)", G.longerWakeCost(0), 1);
assertEqual("paidWakeSecs(0)", G.paidWakeSecs(0), 40);
assertEqual("paidWakeSecs(2)", G.paidWakeSecs(2), 60);
assertEqual("longerTitheCost(0)", G.longerTitheCost(0), 1);
assertEqual("paidTitheSecs(0)", G.paidTitheSecs(0), 60);
assertEqual("paidTitheSecs(2)", G.paidTitheSecs(2), 80);
assertEqual("longerVeilCost(0)", G.longerVeilCost(0), 1);
assertEqual("paidVeilSecs(0)", G.paidVeilSecs(0), 20);
assertEqual("paidVeilSecs(2)", G.paidVeilSecs(2), 40);
assertEqual("ashenTideCost(0)", G.ashenTideCost(0), 1);
assertEqual("ashenTideCost(1)", G.ashenTideCost(1), 2);
assertEqual("namesCompleteMult true", G.namesCompleteMult(true), 1.05);
assertEqual("namesCompleteMult false", G.namesCompleteMult(false), 1);
assertEqual("nightTitheSecs(0)", G.nightTitheSecs(0), 30);
assertEqual("nightTitheSecs(1)", G.nightTitheSecs(1), 40);
assertEqual("nightSecs(0)", G.nightSecs(0), 30);
assertEqual("nightSecs(2)", G.nightSecs(2), 50);
assertEqual("prodMult namesComplete", G.prodMult(0, 0, 0, 0.1, 0, true), 1.05);

assertEqual("choirAshRate base", G.choirAshRate(0), 0.01);
assertEqual("choirAshRate choir 2 no tide", G.choirAshRate(2), 0.02);
assertEqual("formatBlessing(1.05)", F.formatBlessing(1.05), "\u00d71.05");
assertEqual("formatBlessing(1.5)", F.formatBlessing(1.5), "\u00d71.5");
assertTrue("formatBlessing(1.05) is not x1.1", F.formatBlessing(1.05) !== "\u00d71.1");

assertEqual("hymnMult(true)", G.hymnMult(true), 1.25);
assertEqual("hymnMult(false)", G.hymnMult(false), 1);
assertEqual("choirEdictCost(0)", G.choirEdictCost(0), 5);
assertEqual("choirEdictCost(1)", G.choirEdictCost(1), 10);
assertEqual("hymnLeftAfterTribute", G.hymnLeftAfterTribute(), 45);
assertEqual("hymnSecs(0)", G.hymnSecs(0), 45);
assertEqual("hymnSecs(2)", G.hymnSecs(2), 75);
assertEqual("hymnEdictCost(0)", G.hymnEdictCost(0), 4);
assertEqual("hymnEdictCost(1)", G.hymnEdictCost(1), 8);
assertEqual("longerHymnCost(0)", G.longerHymnCost(0), 1);
assertEqual("longerKnellCost(0)", G.longerKnellCost(0), 1);
assertEqual("paidKnellSecs(0)", G.paidKnellSecs(0), 20);
assertEqual("paidKnellSecs(2)", G.paidKnellSecs(2), 40);
assertEqual("hymnBonusSecs(0)", G.hymnBonusSecs(0), 0);
assertEqual("hymnBonusSecs(2)", G.hymnBonusSecs(2), 20);
assertEqual("hymnLeftAfterTribute(0, 0)", G.hymnLeftAfterTribute(0, 0), 45);
assertEqual("hymnLeftAfterTribute(0, 2)", G.hymnLeftAfterTribute(0, 2), 65);
assertEqual("hymnLeftAfterTribute(2, 0)", G.hymnLeftAfterTribute(2, 0), 75);
assertEqual("hymnLeftAfterTribute(1, 2)", G.hymnLeftAfterTribute(1, 2), 80);

assertEqual("veilMult(true)", G.veilMult(true), 2);
assertEqual("veilMult(false)", G.veilMult(false), 1);
assertEqual("tollMult(false)", G.tollMult(false), 1);
assertEqual("tollMult(true)", G.tollMult(true), 2);
assertEqual("knellMult(true)", G.knellMult(true), 2);
assertEqual("knellMult(false)", G.knellMult(false), 1);
assertEqual("KNELL_COST", G.KNELL_COST, 1);
assertEqual("KNELL_SECS", G.KNELL_SECS, 20);
assertEqual("knellEdictCost(0)", G.knellEdictCost(0), 8);
assertEqual("knellSecs(0)", G.knellSecs(0), 20);
assertEqual("knellSecs(1)", G.knellSecs(1), 30);
assertTrue("knellEdictStartsKnell(0) is false", !G.knellEdictStartsKnell(0));
assertTrue("knellEdictStartsKnell(1) is true", G.knellEdictStartsKnell(1));
assertEqual("knellLeftAfterTribute(0)", G.knellLeftAfterTribute(0), 0);
assertEqual("knellLeftAfterTribute(1)", G.knellLeftAfterTribute(1), 30);
assertEqual("tollEdictCost(0)", G.tollEdictCost(0), 6);
assertEqual("tollSecs(0)", G.tollSecs(0), 25);
assertEqual("tollSecs(1)", G.tollSecs(1), 35);
assertTrue("tollEdictStartsToll(0) is false", !G.tollEdictStartsToll(0));
assertTrue("tollEdictStartsToll(1) is true", G.tollEdictStartsToll(1));
assertEqual("tollLeftAfterTribute(0)", G.tollLeftAfterTribute(0), 0);
assertEqual("tollLeftAfterTribute(1)", G.tollLeftAfterTribute(1), 35);
assertEqual("veilEdictCost(0)", G.veilEdictCost(0), 7);
assertEqual("veilSecs(0)", G.veilSecs(0), 20);
assertEqual("veilSecs(1)", G.veilSecs(1), 30);
assertTrue("veilEdictStartsVeil(0) is false", !G.veilEdictStartsVeil(0));
assertTrue("veilEdictStartsVeil(1) is true", G.veilEdictStartsVeil(1));
assertEqual("veilLeftAfterTribute(0)", G.veilLeftAfterTribute(0), 0);
assertEqual("veilLeftAfterTribute(1)", G.veilLeftAfterTribute(1), 30);
assertEqual("nightEdictCost(0)", G.nightEdictCost(0), 5);
assertEqual("nightEdictSecs(0)", G.nightEdictSecs(0), 30);
assertEqual("nightEdictSecs(1)", G.nightEdictSecs(1), 45);
assertTrue("nightEdictStartsNight(0) is false", !G.nightEdictStartsNight(0));
assertTrue("nightEdictStartsNight(1) is true", G.nightEdictStartsNight(1));
assertEqual("nightLeftAfterTribute(0)", G.nightLeftAfterTribute(0), 0);
assertEqual("nightLeftAfterTribute(1)", G.nightLeftAfterTribute(1), 45);
assertEqual("wakeMult(false)", G.wakeMult(false), 1);
assertEqual("wakeMult(true)", G.wakeMult(true), 2);
assertEqual("processionMult(false)", G.processionMult(false), 1);
assertEqual("processionMult(true)", G.processionMult(true), 1.2);
assertEqual("WAKE_COST", G.WAKE_COST, 30);
assertEqual("WAKE_SECS", G.WAKE_SECS, 40);
assertEqual("wakeEdictCost(0)", G.wakeEdictCost(0), 8);
assertEqual("wakeSecs(0)", G.wakeSecs(0), 40);
assertEqual("wakeSecs(1)", G.wakeSecs(1), 55);
assertTrue("wakeEdictStartsWake(0) is false", !G.wakeEdictStartsWake(0));
assertTrue("wakeEdictStartsWake(1) is true", G.wakeEdictStartsWake(1));
assertEqual("wakeLeftAfterTribute(0)", G.wakeLeftAfterTribute(0), 0);
assertEqual("wakeLeftAfterTribute(1)", G.wakeLeftAfterTribute(1), 55);
assertEqual("processionEdictCost(0)", G.processionEdictCost(0), 9);
assertEqual("processionSecs(0)", G.processionSecs(0), 45);
assertEqual("processionSecs(1)", G.processionSecs(1), 60);
assertTrue("processionEdictStartsProcession(0) is false", !G.processionEdictStartsProcession(0));
assertTrue("processionEdictStartsProcession(1) is true", G.processionEdictStartsProcession(1));
assertEqual("processionLeftAfterTribute(0)", G.processionLeftAfterTribute(0), 0);
assertEqual("processionLeftAfterTribute(1)", G.processionLeftAfterTribute(1), 60);
assertEqual("veilCost(20)", G.veilCost(20), 20);
assertEqual("veilCost(200)", G.veilCost(200), 30);

assertTrue("quietCourtStartsLanternAutobind(0) is false", !G.quietCourtStartsLanternAutobind(0));
assertTrue("quietCourtStartsLanternAutobind(1) is true", G.quietCourtStartsLanternAutobind(1));
assertTrue("quietCourtStartsFetterAutobind(0) is false", !G.quietCourtStartsFetterAutobind(0));
assertTrue("quietCourtStartsFetterAutobind(1) is true", G.quietCourtStartsFetterAutobind(1));
assertTrue("quietCourtStartsPyreAutobind(0) is false", !G.quietCourtStartsPyreAutobind(0));
assertTrue("quietCourtStartsPyreAutobind(1) is true", G.quietCourtStartsPyreAutobind(1));
assertTrue("quietCourtStartsChaliceAutobind(0) is false", !G.quietCourtStartsChaliceAutobind(0));
assertTrue("quietCourtStartsChaliceAutobind(1) is true", G.quietCourtStartsChaliceAutobind(1));
assertTrue("quietCourtStartsUrnAutobind(0) is false", !G.quietCourtStartsUrnAutobind(0));
assertTrue("quietCourtStartsUrnAutobind(1) is true", G.quietCourtStartsUrnAutobind(1));
assertTrue("quietCourtStartsHearthAutobind(0) is false", !G.quietCourtStartsHearthAutobind(0));
assertTrue("quietCourtStartsHearthAutobind(1) is true", G.quietCourtStartsHearthAutobind(1));
assertTrue("quietCourtStartsBeaconAutobind(0) is false", !G.quietCourtStartsBeaconAutobind(0));
assertTrue("quietCourtStartsBeaconAutobind(1) is true", G.quietCourtStartsBeaconAutobind(1));
assertTrue("quietCourtStartsSpireAutobind(0) is false", !G.quietCourtStartsSpireAutobind(0));
assertTrue("quietCourtStartsSpireAutobind(1) is true", G.quietCourtStartsSpireAutobind(1));
assertTrue("quietCourtStartsObeliskAutobind(0) is false", !G.quietCourtStartsObeliskAutobind(0));
assertTrue("quietCourtStartsObeliskAutobind(1) is true", G.quietCourtStartsObeliskAutobind(1));

assertEqual("draughtEdictCost(0)", G.draughtEdictCost(0), 10);
assertTrue("draughtStartsChaliceAutobind(0) is false", !G.draughtStartsChaliceAutobind(0));
assertTrue("draughtStartsChaliceAutobind(1) is true", G.draughtStartsChaliceAutobind(1));

assertEqual("ossuaryMult(0)", G.ossuaryMult(0), 1);
assertEqual("ossuaryMult(1)", G.ossuaryMult(1), 1.05);
assertEqual("ossuaryMult(8)", G.ossuaryMult(8), 1.40);
assertEqual("prodMult ossuary 8 fold", G.prodMult(0, 0, 0, 0.1, 0, false, 0, 8), 1.40);
assertEqual("ossuaryCost(0)", G.ossuaryCost(0), 1);

assertEqual("smokeEdictCost(0)", G.smokeEdictCost(0), 6);
assertTrue("smokeStartsCenserAutobind(0) is false", !G.smokeStartsCenserAutobind(0));
assertTrue("smokeStartsCenserAutobind(1) is true", G.smokeStartsCenserAutobind(1));

assertEqual("pyreCost(0)", G.pyreCost(0), 2);
assertEqual("embersEdictCost(0)", G.embersEdictCost(0), 7);
assertEqual("embersStartsPyres(0)", G.embersStartsPyres(0), 0);
assertEqual("embersStartsPyres(2)", G.embersStartsPyres(2), 2);
assertEqual("urnCost(0)", G.urnCost(0), 3);
assertEqual("urnEdictCost(0)", G.urnEdictCost(0), 8);
assertEqual("urnEdictStartsUrns(0)", G.urnEdictStartsUrns(0), 0);
assertEqual("hearthCost(0)", G.hearthCost(0), 4);
assertEqual("hearthEdictCost(0)", G.hearthEdictCost(0), 9);
assertEqual("hearthEdictStartsHearths(0)", G.hearthEdictStartsHearths(0), 0);
assertEqual("beaconCost(0)", G.beaconCost(0), 4);
assertEqual("beaconEdictCost(0)", G.beaconEdictCost(0), 10);
assertEqual("beaconEdictStartsBeacons(0)", G.beaconEdictStartsBeacons(0), 0);
assertEqual("spireCost(0)", G.spireCost(0), 5);
assertEqual("spireEdictCost(0)", G.spireEdictCost(0), 11);
assertEqual("spireEdictStartsSpires(0)", G.spireEdictStartsSpires(0), 0);
assertEqual("obeliskCost(0)", G.obeliskCost(0), 6);
assertEqual("obeliskEdictCost(0)", G.obeliskEdictCost(0), 12);
assertEqual("obeliskEdictStartsObelisks(0)", G.obeliskEdictStartsObelisks(0), 0);

assertEqual("WELL_COST_MULT", G.WELL_COST_MULT, 1.5);
assertEqual("WELL_EARLY_MULT", G.WELL_EARLY_MULT, 1.35);
assertEqual("WELL_COST_BASE", G.WELL_COST_BASE, 25);

assertEqual("UNLOCK_AUTOBIND_URNS", G.UNLOCK_AUTOBIND_URNS, 3);
assertEqual("UNLOCK_AUTOBIND_HEARTHS", G.UNLOCK_AUTOBIND_HEARTHS, 3);
assertEqual("UNLOCK_AUTOBIND_BEACONS", G.UNLOCK_AUTOBIND_BEACONS, 3);
assertEqual("UNLOCK_AUTOBIND_SPIRES", G.UNLOCK_AUTOBIND_SPIRES, 3);
assertEqual("UNLOCK_AUTOBIND_OBELISKS", G.UNLOCK_AUTOBIND_OBELISKS, 3);

// ─── AZR-112 Autobind ×1 / ignores buyMode (behavioural) ───────────────────────
{
  resetState({
    souls: N.fromNumber(100000),
    unlockedAutobind: true,
    autobind: true,
    buyMode: "max"
  });
  const shadesBefore = unwrap(G.getState().shades);
  G.tryAutobind();
  assertEqual("AZR-112 tryAutobind bought exactly 1", unwrap(G.getState().shades), shadesBefore + 1);

  resetState({
    shades: N.fromNumber(100000),
    unlockedSpirits: true,
    unlockedAutobindSpirits: true,
    autobindSpirits: true,
    buyMode: "max"
  });
  G.tryAutobindSpirits();
  assertEqual("AZR-112 tryAutobindSpirits bought exactly 1", unwrap(G.getState().spirits), 1);

  resetState({
    spirits: N.fromNumber(100000),
    unlockedVessels: true,
    unlockedAutobindVessels: true,
    autobindVessels: true,
    buyMode: "max"
  });
  G.tryAutobindVessels();
  assertEqual("AZR-112 tryAutobindVessels bought exactly 1", unwrap(G.getState().vessels), 1);
}

// ─── AZR-119 Binding Toll (behavioural) ─────────────────────────────────────────
assertEqual("bindingTollCost(0)", G.bindingTollCost(0), 40);
assertEqual("bindingTollCost(1)", G.bindingTollCost(1), Math.floor(40 * 1.45));
assertEqual("bindingTollRateMult(0)", G.bindingTollRateMult(0), 1);
assertEqual("bindingTollRateMult(1)", G.bindingTollRateMult(1), 1.12);
assertTrue("bindingTollRateMult(2) ≈ 1.2544", Math.abs(G.bindingTollRateMult(2) - Math.pow(1.12, 2)) < 1e-12);
assertEqual("bindingTollCostMult(1)", G.bindingTollCostMult(1), 1.15);
assertEqual("bindingTollCostMult(4)", G.bindingTollCostMult(4), 1.6);
assertEqual("BINDING_TOLL_MAX", G.BINDING_TOLL_MAX, 4);
assertEqual("BINDING_TOLL_RATE", G.BINDING_TOLL_RATE, 1.12);
assertEqual("BINDING_TOLL_COST_BONUS", G.BINDING_TOLL_COST_BONUS, 0.15);

// buyBindingToll ignores buyMode: set buyMode max and buy once, level goes to 1
{
  resetState({
    ash: N.fromNumber(1e9),
    unlockedBindingToll: true,
    unlockedPyres: true,
    favorEarned: 2,
    fetters: N.fromNumber(10),
    buyMode: "max"
  });
  G.buyBindingToll();
  assertEqual("AZR-119 buyBindingToll ignores buyMode: level 1", G.getState().bindingTollLevel, 1);
  G.buyBindingToll();
  assertEqual("AZR-119 buyBindingToll level 2", G.getState().bindingTollLevel, 2);
  G.buyBindingToll();
  G.buyBindingToll();
  assertEqual("AZR-119 buyBindingToll level 4 (max)", G.getState().bindingTollLevel, 4);
  G.buyBindingToll();
  assertEqual("AZR-119 buyBindingToll capped at 4", G.getState().bindingTollLevel, 4);
}

// Tribute wipes bindingTollLevel: freshState has it at 0
{
  const fs = G.freshState();
  assertEqual("AZR-119 freshState bindingTollLevel is 0", fs.bindingTollLevel, 0);
}

// ─── AZR-121 Hollow Hunger (behavioural) ────────────────────────────────────────
assertEqual("hollowMult(0)", G.hollowMult(0), 1);
assertEqual("hollowMult(1)", G.hollowMult(1), 0.96);
assertEqual("hollowMult(5)", G.hollowMult(5), 0.8);
assertEqual("stacksWantedFromIdle(89)", G.stacksWantedFromIdle(89), 0);
assertEqual("stacksWantedFromIdle(90)", G.stacksWantedFromIdle(90), 1);
assertEqual("stacksWantedFromIdle(90+45)", G.stacksWantedFromIdle(90 + 45), 2);
assertEqual("stacksWantedFromIdle(90+45*4)", G.stacksWantedFromIdle(90 + 45 * 4), 5);
assertEqual("stacksWantedFromIdle(90+45*10)", G.stacksWantedFromIdle(90 + 45 * 10), 5);
assertEqual("hollow gate favor2 + pyres active", G.hollowHungerActive({ favorEarned: 2, unlockedPyres: true }), true);
assertEqual("hollow gate favor1 + pyres inactive", G.hollowHungerActive({ favorEarned: 1, unlockedPyres: true }), false);
assertEqual("hollow gate favor2 without pyres inactive", G.hollowHungerActive({ favorEarned: 2, unlockedPyres: false }), false);
assertEqual("HOLLOW_GRACE", G.HOLLOW_GRACE, 90);
assertEqual("HOLLOW_INTERVAL", G.HOLLOW_INTERVAL, 45);
assertEqual("HOLLOW_MAX", G.HOLLOW_MAX, 5);
assertEqual("HOLLOW_SOUL_CLEAR_CAP", G.HOLLOW_SOUL_CLEAR_CAP, 500);
assertEqual("HOLLOW_PENALTY", G.HOLLOW_PENALTY, 0.04);

assertEqual("hollowClearNeed souls tiny", G.hollowClearNeed("souls", 0), 25);
assertEqual("hollowClearNeed souls 20000", G.hollowClearNeed("souls", 20000), 400);
assertEqual("hollowClearNeed souls 100000 cap", G.hollowClearNeed("souls", 100000), 500);
assertEqual("hollowClearNeed ash 100", G.hollowClearNeed("ash", 100), 5);
assertEqual("hollowClearNeed ash 1000", G.hollowClearNeed("ash", 1000), 20);
assertEqual("hollowClearNeed shades 100", G.hollowClearNeed("shades", 100), 3);
assertEqual("hollowClearNeed shades 500", G.hollowClearNeed("shades", 500), 10);
assertEqual("hollowSpendClears souls 10 vs need 25", G.hollowSpendClears("souls", 10, 1000), false);
assertEqual("hollowSpendClears souls 25 vs need 25", G.hollowSpendClears("souls", 25, 1000), true);
assertEqual("hollowSpendClears favor always", G.hollowSpendClears("favor", 1, 1), true);

// AZR-121: Hollow stacks survive autobind (autobind never calls noteHollowManualSpend)
{
  resetState({
    souls: N.fromNumber(100000),
    unlockedAutobind: true,
    autobind: true,
    hollowStacks: 3,
    hollowIdle: 200
  });
  G.tryAutobind();
  assertEqual("AZR-121 tryAutobind preserves hollowStacks", G.getState().hollowStacks, 3);
  assertEqual("AZR-121 tryAutobind preserves hollowIdle", G.getState().hollowIdle, 200);
}

// AZR-121: buyShade with enough spend clears hollow stacks
{
  resetState({
    souls: N.fromNumber(100000),
    hollowStacks: 3,
    hollowIdle: 200,
    buyMode: "max"
  });
  G.buyShade();
  const st = G.getState();
  assertTrue("AZR-121 buyShade(max) bought shades", unwrap(st.shades) > 0);
  assertEqual("AZR-121 buyShade(max) clears hollowStacks", st.hollowStacks, 0);
}

// ─── AZR-163 simulatedUntil (behavioural) ───────────────────────────────────────
assertEqual("MAX_DT exported", G.MAX_DT, 8 * 60 * 60);
{
  resetState({});
  const before = G.getState().simulatedUntil;
  assertTrue("simulatedUntil is numeric", typeof before === "number" && before > 0);
  G.applyDt(10, false);
  const after = G.getState().simulatedUntil;
  assertTrue("applyDt(10) advances simulatedUntil ~10000ms", Math.abs((after - before) - 10000) < 100);
}

// ─── AZR-164 LIVE_FRAME_MAX (behavioural) ───────────────────────────────────────
assertEqual("LIVE_FRAME_MAX exported", G.LIVE_FRAME_MAX, 1);
assertEqual("AWAY_SUMMARY_DT exported", G.AWAY_SUMMARY_DT, 60);

// ─── AZR-166 Render throttle / closed-form max buys ─────────────────────────────
assertTrue("RENDER_HZ in 10-15", G.RENDER_HZ >= 10 && G.RENDER_HZ <= 15);
assertEqual("RENDER_MS matches RENDER_HZ", G.RENDER_MS, 1000 / G.RENDER_HZ);
assertEqual("BULK_CAP is 10000", G.BULK_CAP, 10000);
assertEqual("COST_BASE is 10", G.COST_BASE, 10);
assertEqual("COST_MULT is 1.15", G.COST_MULT, 1.15);

// Closed-form maxAffordable matches loop on a small grid
{
  const bases = [8, 10, 20, 25, 30, 32];
  const mults = [1.15, 1.2, 1.28, 1.5, 1.65];
  let cfOk = true;
  let cfFails = 0;
  for (const b of bases) {
    for (const m of mults) {
      for (const o of [0, 1, 5, 10, 50, 100]) {
        for (const cur of [100, 1e6, 1e20]) {
          const curN = N.fromNumber(cur);
          const kCF = G.maxAffordable(b, o, curN, m);
          const kLoop = G.maxAffordableLoop(b, o, curN, m);
          if (Math.abs(kCF - kLoop) > 1) {
            cfOk = false;
            cfFails++;
            if (cfFails <= 5) console.error("  maxAffordable mismatch b=" + b + " m=" + m + " o=" + o + " cur=" + cur + " cf=" + kCF + " loop=" + kLoop);
          }
        }
      }
    }
  }
  assertTrue("AZR-166 maxAffordable matches maxAffordableLoop (" + cfFails + " mismatches)", cfOk);
}

// Well piecewise: wellMaxAffordable matches wellMaxAffordableLoop
{
  let wellOk = true;
  let wellFails = 0;
  for (const o of [0, 1, 3, 5, 6, 7, 10]) {
    for (const cur of [1, 25, 100, 1e6, 1e20]) {
      const curN = N.fromNumber(cur);
      const kCF = G.wellMaxAffordable(o, curN);
      const kLoop = G.wellMaxAffordableLoop(o, curN);
      if (kCF !== kLoop) {
        wellOk = false;
        wellFails++;
        if (wellFails <= 5) console.error("  wellMaxAffordable mismatch o=" + o + " cur=" + cur + " cf=" + kCF + " loop=" + kLoop);
      }
    }
  }
  assertTrue("AZR-166 wellMaxAffordable matches wellMaxAffordableLoop (" + wellFails + " mismatches)", wellOk);
}

// setText export: function
assertTrue("AZR-166 setText is function", typeof G.setText === "function");
assertTrue("AZR-166 setTextWriteCount is function", typeof G.setTextWriteCount === "function");

// ─── AZR-167 Debounce save (behavioural) ────────────────────────────────────────
// harvest does not call save() / localStorage.setItem
{
  resetState({ souls: N.fromNumber(100) });
  storage.clear();
  const lsSetCalls = [];
  const origSetItem = storage.setItem.bind(storage);
  storage.setItem = function (k, v) { lsSetCalls.push(k); origSetItem(k, v); };
  G.harvest();
  storage.setItem = origSetItem;
  assertTrue("AZR-167 harvest does not call localStorage.setItem", lsSetCalls.length === 0);
}
// markSaveDirty + flushSave pattern
{
  resetState({});
  G.markSaveDirty();
  assertTrue("AZR-167 saveDirty after markSaveDirty", G.getSaveDirty());
  G.flushSave();
  assertTrue("AZR-167 saveDirty cleared after flushSave", !G.getSaveDirty());
  G.flushSave();
  assertTrue("AZR-167 second flushSave is no-op", !G.getSaveDirty());
}

// ─── AZR-174 Toast (behavioural) ────────────────────────────────────────────────
assertEqual("TOAST_QUEUE_MAX", G.TOAST_QUEUE_MAX, 5);
assertEqual("TOAST_MS", G.TOAST_MS, 5200);
assertEqual("TOAST_FAST_MS", G.TOAST_FAST_MS, 1800);
assertTrue("capEnqueueToast is function", typeof G.capEnqueueToast === "function");
assertTrue("formatGiftBatchSummary is function", typeof G.formatGiftBatchSummary === "function");
{
  let q = [];
  for (let i = 0; i < 20; i++) q = G.capEnqueueToast(q, "toast-" + i, G.TOAST_QUEUE_MAX);
  assertTrue("AZR-174 enqueue 20 → length <= 5", q.length <= 5);
  assertTrue("AZR-174 last is …and N more", /^\u2026and \d+ more\.$/.test(q[q.length - 1]));
}
assertEqual("AZR-174 summary with amounts",
  G.formatGiftBatchSummary(3, { names: 3, ash: 26, souls: 250 }),
  "The well was generous: +3 names, +26 ash, +250 souls.");
assertEqual("AZR-174 summary fallback count",
  G.formatGiftBatchSummary(7, {}),
  "The well was generous. 7 gifts.");

// ─── AZR-172 Hotkeys (behavioural) ──────────────────────────────────────────────
assertTrue("HOTKEYS exported", Array.isArray(G.HOTKEYS));
assertTrue("HOTKEYS length 16", G.HOTKEYS.length === 16);
assertTrue("hotkeyDefaultGuard is function", typeof G.hotkeyDefaultGuard === "function");
assertTrue("resolveHotkey is function", typeof G.resolveHotkey === "function");
assertTrue("hotkeyDefaultGuard blocks otherButton", G.hotkeyDefaultGuard({ otherButton: true }) === false);
assertTrue("hotkeyDefaultGuard allows no otherButton", G.hotkeyDefaultGuard({ otherButton: false }) === true);
{
  const hk = G.resolveHotkey("3", { otherButton: true });
  assertEqual("AZR-172 resolveHotkey 3 + otherButton is null", hk, null);
}
{
  const hk = G.resolveHotkey("1", { otherButton: false });
  assertTrue("AZR-172 resolveHotkey 1 found", !!hk);
}

// ─── AZR-175 Stillness (behavioural) ────────────────────────────────────────────
{
  resetState({ vow: "stillness" });
  const soulsBefore = unwrap(G.getState().souls);
  G.harvest();
  assertEqual("AZR-175 stillness blocks harvest", unwrap(G.getState().souls), soulsBefore);
}

// ─── AZR-165/168 save safety (behavioural) ──────────────────────────────────────
assertTrue("isSaveShape is function", typeof G.isSaveShape === "function");
assertEqual("isSaveShape false for null", G.isSaveShape(null), false);
assertEqual("isSaveShape false for {}", G.isSaveShape({}), false);
assertEqual("isSaveShape true minimal", G.isSaveShape({ souls: 0, lifetimeSouls: 0 }), true);
assertEqual("isSaveShape true Num", G.isSaveShape({ souls: { m: 1, e: 0 }, lifetimeSouls: { m: 2, e: 1 } }), true);
assertEqual("isSaveShape false NaN souls", G.isSaveShape({ souls: NaN, lifetimeSouls: 0 }), false);
assertEqual("isSaveShape false Inf favorEarned", G.isSaveShape({ souls: 0, lifetimeSouls: 0, favorEarned: Infinity }), false);
assertTrue("tripwireSanity is function", typeof G.tripwireSanity === "function");
assertTrue("loadCount is function", typeof G.loadCount === "function");
assertEqual("loadCount(-5)", G.loadCount(-5), 0);
assertEqual("loadCount(3, 2)", G.loadCount(3, 2), 2);

// ─── AZR-171 Tribute restore: applyEdictStartingStock then applyAutobindStarts ──
{
  resetState({
    quietCourtLevel: 1,
    urnEdictLevel: 3,
    hearthEdictLevel: 3,
    beaconEdictLevel: 3,
    spireEdictLevel: 3,
    obeliskEdictLevel: 3
  });
  const st = G.getState();
  G.applyEdictStartingStock(st);
  G.applyAutobindStarts(st);
  assertTrue("AZR-171 QC+edict sets autobindUrns", !!st.autobindUrns);
  assertTrue("AZR-171 QC+edict sets unlockedAutobindUrns", !!st.unlockedAutobindUrns);
  assertTrue("AZR-171 QC+edict sets autobindHearths", !!st.autobindHearths);
  assertTrue("AZR-171 QC+edict sets unlockedAutobindHearths", !!st.unlockedAutobindHearths);
  assertTrue("AZR-171 QC+edict sets autobindBeacons", !!st.autobindBeacons);
  assertTrue("AZR-171 QC+edict sets unlockedAutobindBeacons", !!st.unlockedAutobindBeacons);
  assertTrue("AZR-171 QC+edict sets autobindSpires", !!st.autobindSpires);
  assertTrue("AZR-171 QC+edict sets unlockedAutobindSpires", !!st.unlockedAutobindSpires);
  assertTrue("AZR-171 QC+edict sets autobindObelisks", !!st.autobindObelisks);
  assertTrue("AZR-171 QC+edict sets unlockedAutobindObelisks", !!st.unlockedAutobindObelisks);
  assertEqual("AZR-171 QC+edict urn stock", unwrap(st.urns), 3);
}
{
  resetState({ quietCourtLevel: 1 });
  const st = G.getState();
  G.applyEdictStartingStock(st);
  G.applyAutobindStarts(st);
  assertTrue("AZR-171 QC-only sets autobindUrns", !!st.autobindUrns);
  assertTrue("AZR-171 QC-only does not unlock AutobindUrns", !st.unlockedAutobindUrns);
  assertEqual("AZR-171 QC-only urn stock", unwrap(st.urns), 0);
  assertTrue("AZR-171 QC-only still starts shade autobind", !!st.autobind && !!st.unlockedAutobind);
}
assertTrue("TRIBUTE_AUTOBIND_STARTS exported", Array.isArray(G.TRIBUTE_AUTOBIND_STARTS));
assertEqual("TRIBUTE_AUTOBIND_STARTS length 16", G.TRIBUTE_AUTOBIND_STARTS.length, 16);

// ─── NEW: Curve invariants (AZR-176) ────────────────────────────────────────────
// Every exported cost(owned/level) must be strictly increasing over a useful range
{
  const costChecks = [
    ["shadeCost", G.shadeCost, 20],
    ["spiritCost", G.spiritCost, 20],
    ["vesselCost", G.vesselCost, 20],
    ["throneCost", G.throneCost, 20],
    ["wellCost", G.wellCost, 20],
    ["lanternCost", G.lanternCost, 20],
    ["fetterCost", G.fetterCost, 20],
    ["censerCost", G.censerCost, 20],
    ["pyreCost", G.pyreCost, 20, 6],
    ["urnCost", G.urnCost, 20, 2],
    ["hearthCost", G.hearthCost, 20],
    ["beaconCost", G.beaconCost, 20],
    ["spireCost", G.spireCost, 20],
    ["obeliskCost", G.obeliskCost, 20],
    ["chaliceCost", G.chaliceCost, 11],
    ["markCost", G.markCost, 10],
    ["siphonCost", G.siphonCost, 20],
    ["levyCost", G.levyCost, 20],
    ["cinderCost", G.cinderCost, 20],
    ["urnRiteCost", G.urnRiteCost, 20],
    ["hearthRiteCost", G.hearthRiteCost, 20],
    ["beaconRiteCost", G.beaconRiteCost, 20],
    ["spireRiteCost", G.spireRiteCost, 20],
    ["bindingTollCost", G.bindingTollCost, 3],
    ["edictCost", G.edictCost, 10],
    ["memoryCost", G.memoryCost, 10],
    ["seatCost", G.seatCost, 10],
    ["kindleCost", G.kindleCost, 10],
    ["ashenCost", G.ashenCost, 10],
    ["depthCost", G.depthCost, 10],
    ["crownCost", G.crownCost, 10],
    ["longMemCost", G.longMemCost, 10],
    ["quietCourtCost", G.quietCourtCost, 10],
  ];
  for (const [name, fn, range, startAt] of costChecks) {
    const s = startAt || 0;
    for (let n = s; n < range; n++) {
      assertTrue(name + "(" + (n + 1) + ") > " + name + "(" + n + ")",
        N.cmp(fn(n + 1), fn(n)) > 0);
    }
  }
}

// Geometric ash-rite invariants: cost(n+1)/cost(n) ≈ mult (catches flat-cost regression)
{
  const geoChecks = [
    ["cinderCost", G.cinderCost, G.CINDER_COST_MULT],
    ["urnRiteCost", G.urnRiteCost, G.URN_RITE_COST_MULT],
    ["hearthRiteCost", G.hearthRiteCost, G.HEARTH_RITE_COST_MULT],
    ["beaconRiteCost", G.beaconRiteCost, G.BEACON_RITE_COST_MULT],
    ["spireRiteCost", G.spireRiteCost, G.SPIRE_RITE_COST_MULT],
  ];
  for (const [name, fn, mult] of geoChecks) {
    for (let n = 1; n <= 10; n++) {
      const ratio = N.toNumber(fn(n)) / N.toNumber(fn(n - 1));
      assertTrue(name + " ratio at n=" + n + " ≈ " + mult + " (got " + ratio.toFixed(4) + ")",
        Math.abs(ratio - mult) < 0.15);
    }
  }
}

// ─── NEW: Binding Toll levels 0–4 cost mult (AZR-176) ──────────────────────────
{
  for (let tollLevel = 0; tollLevel <= 4; tollLevel++) {
    const mult = G.bindingTollCostMult(tollLevel);
    const expected = 1 + 0.15 * tollLevel;
    assertTrue("bindingTollCostMult(" + tollLevel + ") = " + expected,
      Math.abs(mult - expected) < 1e-12);

    const costNoToll = unwrap(G.producerCost(0));
    const costWithToll = unwrap(G.bulkCost(G.COST_BASE, 0, 1, G.COST_MULT, mult));
    if (tollLevel === 0) {
      assertEqual("BT0 cost = base", costNoToll, costWithToll);
    } else {
      assertTrue("BT" + tollLevel + " inflated cost > base (" + costWithToll + " > " + costNoToll + ")", costWithToll > costNoToll);
    }
  }
}

// Binding Toll shadeCost/spiritCost include bindingTollCostMult (buyShade uses it)
{
  resetState({
    souls: N.fromNumber(1e9),
    bindingTollLevel: 2,
    buyMode: "1"
  });
  const costBT2 = unwrap(G.bulkCost(G.COST_BASE, 0, 1, G.COST_MULT, G.bindingTollCostMult(2)));
  const soulsBefore = N.toNumber(G.getState().souls);
  G.buyShade();
  const soulsAfter = N.toNumber(G.getState().souls);
  const spent = Math.round(soulsBefore - soulsAfter);
  assertEqual("BT2 buyShade spends inflated cost", spent, costBT2);
}

// ─── NEW: Tribute restore order (AZR-176) ───────────────────────────────────────
{
  resetState({
    souls: N.fromNumber(0),
    lifetimeSouls: N.fromNumber(100000),
    allTimeSouls: N.fromNumber(100000),
    favorEarned: 2,
    favor: 2,
    edictLevel: 1,
    quietCourtLevel: 1,
    urnEdictLevel: 3,
    hearthEdictLevel: 3,
    beaconEdictLevel: 3,
    spireEdictLevel: 3,
    obeliskEdictLevel: 3,
    hymnEdictLevel: 1,
    longerHymnLevel: 0,
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    aspect: "harvest",
    bonusFirstTribute: true,
    chronicle: ["tribute"]
  });
  sandbox.confirm = function () { return true; };
  G.layTribute();
  sandbox.confirm = function () { return false; };
  const st = G.getState();
  assertTrue("tribute restore: autobindUrns on", !!st.autobindUrns);
  assertTrue("tribute restore: hymn timer running", st.hymnLeft > 0);
  assertEqual("tribute restore: bindingTollLevel wiped", st.bindingTollLevel, 0);
  assertEqual("tribute restore: shades reset to 0", unwrap(st.shades), 0);
  assertTrue("tribute restore: favor increased", st.favor >= 3);
}

// ─── NEW: Save/load round-trip (AZR-176) ────────────────────────────────────────
{
  resetState({
    souls: N.fromNumber(12345),
    lifetimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(50),
    wellDepth: 7,
    favor: 5,
    favorEarned: 5,
    vow: "stillness",
    bindingTollLevel: 3,
    buyMode: "10"
  });
  const serialized = G.serializeState();
  const json = JSON.stringify(serialized);
  const parsed = JSON.parse(json);
  assertTrue("round-trip isSaveShape", G.isSaveShape(parsed));
  G.applySaveData(parsed);
  const st = G.getState();
  assertEqual("round-trip souls", unwrap(st.souls), 12345);
  assertEqual("round-trip lifetimeSouls", unwrap(st.lifetimeSouls), 99999);
  assertEqual("round-trip shades", unwrap(st.shades), 50);
  assertEqual("round-trip wellDepth", st.wellDepth, 7);
  assertEqual("round-trip favor", st.favor, 5);
  assertEqual("round-trip favorEarned", st.favorEarned, 5);
  assertEqual("round-trip vow", G.normalizeVow(st.vow), "stillness");
  assertEqual("round-trip bindingTollLevel", st.bindingTollLevel, 3);
  assertEqual("round-trip buyMode", st.buyMode, "10");
}

// Save/load via mock localStorage
{
  resetState({
    souls: N.fromNumber(777),
    lifetimeSouls: N.fromNumber(777),
    favor: 2,
    favorEarned: 2
  });
  storage.clear();
  G.save();
  const raw = storage.getItem(G.SAVE_KEY);
  assertTrue("save writes to SAVE_KEY", !!raw);
  const data = JSON.parse(raw);
  assertTrue("save data isSaveShape", G.isSaveShape(data));

  resetState({});
  G.applySaveData(data);
  assertEqual("load restores souls", unwrap(G.getState().souls), 777);
  assertEqual("load restores favor", G.getState().favor, 2);
}

// ─── NEW: applyDt across buff expiry (AZR-176) ─────────────────────────────────
{
  resetState({
    souls: N.fromNumber(10000),
    shades: N.fromNumber(10),
    titheLeft: 0.4
  });
  G.applyDt(1, true);
  const st = G.getState();
  assertEqual("applyDt buff expiry: titheLeft is 0", st.titheLeft, 0);
  assertTrue("applyDt buff expiry: souls changed (production happened)", unwrap(st.souls) !== 10000);
  assertTrue("applyDt buff expiry: no NaN souls", isFinite(N.toNumber(st.souls)));
}

{
  resetState({
    souls: N.fromNumber(10000),
    shades: N.fromNumber(10),
    nightLeft: 0.4
  });
  G.applyDt(1, true);
  const st = G.getState();
  assertEqual("applyDt night expiry: nightLeft is 0", st.nightLeft, 0);
  assertTrue("applyDt night expiry: no NaN souls", isFinite(N.toNumber(st.souls)));
}

// ─── Confirmation ───────────────────────────────────────────────────────────────
if (failed > 0) {
  console.error(failed + " assertion(s) failed");
  process.exit(1);
}

console.log("all economy assertions passed");
process.exit(0);
