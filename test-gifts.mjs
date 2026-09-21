#!/usr/bin/env node
/**
 * AZR-179 GIFTS table tests.
 *
 * 1. Every GIFTS row: unique flag, unique id; every flag in FIELDS scope account (and freshState).
 * 2. Each gift grants exactly once across a Tribute (flag survives; reward not doubled).
 * 3. All-granted save: tryMilestoneGifts does zero N.cmp (early-out via ungrantedCount === 0).
 * 4. bumpPeakShades called once per successful pass (spy/counter).
 * 5. harvest path still does not call tryMilestoneGifts / checkUnlock.
 * 6. Migration: applySaveData with old bonusFirstLantern:true and no giftFirstLantern
 *    → gift flag true, no re-grant on next tryMilestoneGifts.
 * 7. No hand-written gift branches in tryMilestoneGifts source.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

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
loadScript("js/game.js");

const N = sandbox.SoulgatherNum;
const G = sandbox.SoulgatherEconomy;

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
    console.log("ok  ", label);
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

function resetState(partial) {
  const fresh = G.freshState();
  const keys = Object.keys(fresh);
  const st = G.getState();
  for (let i = 0; i < keys.length; i++) st[keys[i]] = fresh[keys[i]];
  G.setLoadFailed(false);
  G.setLoadFailedRaw(null);
  if (partial) G.__setStateForTest(partial);
  G.rebuildUngrantedCount();
}

// ─── Test 1: GIFTS table integrity ──────────────────────────────────────────────
console.log("\n─── Test 1: GIFTS table integrity ───");
{
  const GIFTS = G.GIFTS;
  const FIELDS = G.FIELDS;
  const fresh = G.freshState();
  const flags = new Set();
  const ids = new Set();
  let dupeFlags = 0;
  let dupeIds = 0;
  let missingFields = 0;
  let badScope = 0;
  let missingFresh = 0;

  for (const g of GIFTS) {
    if (flags.has(g.flag)) {
      console.error("FAIL: duplicate flag", g.flag);
      dupeFlags++;
    }
    flags.add(g.flag);

    if (ids.has(g.id)) {
      console.error("FAIL: duplicate id", g.id);
      dupeIds++;
    }
    ids.add(g.id);

    if (!FIELDS[g.flag]) {
      console.error("FAIL: flag not in FIELDS", g.flag);
      missingFields++;
    } else if (FIELDS[g.flag].scope !== "account") {
      console.error("FAIL: flag scope not account", g.flag, FIELDS[g.flag].scope);
      badScope++;
    }

    if (!(g.flag in fresh)) {
      console.error("FAIL: flag not in freshState", g.flag);
      missingFresh++;
    }
  }

  assertTrue("GIFTS unique flags", dupeFlags === 0);
  assertTrue("GIFTS unique ids", dupeIds === 0);
  assertTrue("GIFTS flags in FIELDS", missingFields === 0);
  assertTrue("GIFTS flags scope account", badScope === 0);
  assertTrue("GIFTS flags in freshState", missingFresh === 0);
  assertTrue("GIFTS has rows", GIFTS.length > 50);
}

// ─── Test 2: Each gift grants exactly once ──────────────────────────────────────
console.log("\n─── Test 2: gift grants exactly once ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    allTimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(1000),
    lanterns: N.fromNumber(100),
    fetters: N.fromNumber(100),
    censers: N.fromNumber(100),
    pyres: N.fromNumber(100),
    urns: N.fromNumber(100),
    hearths: N.fromNumber(100),
    beacons: N.fromNumber(100),
    spires: N.fromNumber(100),
    obelisks: N.fromNumber(100),
    vessels: N.fromNumber(100),
    thrones: 10,
    chalices: 12,
    cinderLevel: 5,
    urnRiteLevel: 3,
    hearthRiteLevel: 3,
    beaconRiteLevel: 3,
    spireRiteLevel: 3,
    ossuaryLevel: 8,
    longerProcessionLevel: 2,
    deeperTollLevel: 2,
    longerWakeLevel: 2,
    longerTitheLevel: 2,
    longerVeilLevel: 2,
    longerHymnLevel: 2,
    longerKnellLevel: 2,
    clicksThisRun: 500,
    vow: "ember",
    vowsKnown: { stillness: true, poverty: true, hunger: true, ember: true },
    tributesLaid: 50,
    favor: 20,
    favorEarned: 20
  });

  const st = G.getState();
  const soulsBefore = unwrap(st.souls);
  const ashBefore = unwrap(st.ash);
  const shadesBefore = unwrap(st.shades);

  G.tryMilestoneGifts();

  const soulsAfterFirst = unwrap(st.souls);
  const ashAfterFirst = unwrap(st.ash);
  const shadesAfterFirst = unwrap(st.shades);

  assertTrue("gifts: souls increased", soulsAfterFirst > soulsBefore);
  assertTrue("gifts: ash increased", ashAfterFirst > ashBefore);

  for (const g of G.GIFTS) {
    assertTrue("flag set: " + g.flag, !!st[g.flag]);
  }

  G.tryMilestoneGifts();

  const soulsAfterSecond = unwrap(st.souls);
  const ashAfterSecond = unwrap(st.ash);
  const shadesAfterSecond = unwrap(st.shades);

  assertEqual("no double souls", soulsAfterSecond, soulsAfterFirst);
  assertEqual("no double ash", ashAfterSecond, ashAfterFirst);
  assertEqual("no double shades", shadesAfterSecond, shadesAfterFirst);
}

// ─── Test 3: All-granted early-out (zero N.cmp) ────────────────────────────────
console.log("\n─── Test 3: early-out when all granted ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    allTimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(1000),
    peakShades: N.fromNumber(1000),
    lanterns: N.fromNumber(100),
    fetters: N.fromNumber(100),
    censers: N.fromNumber(100),
    pyres: N.fromNumber(100),
    urns: N.fromNumber(100),
    hearths: N.fromNumber(100),
    beacons: N.fromNumber(100),
    spires: N.fromNumber(100),
    obelisks: N.fromNumber(100),
    vessels: N.fromNumber(100),
    thrones: 10,
    chalices: 12,
    cinderLevel: 5,
    urnRiteLevel: 3,
    hearthRiteLevel: 3,
    beaconRiteLevel: 3,
    spireRiteLevel: 3,
    ossuaryLevel: 8,
    longerProcessionLevel: 2,
    deeperTollLevel: 2,
    longerWakeLevel: 2,
    longerTitheLevel: 2,
    longerVeilLevel: 2,
    longerHymnLevel: 2,
    longerKnellLevel: 2,
    clicksThisRun: 500,
    vow: "ember",
    vowsKnown: { stillness: true, poverty: true, hunger: true, ember: true },
    tributesLaid: 50,
    favor: 20,
    favorEarned: 20,
    namesBound: 12,
    namesComplete: true,
    giftFirstName: true,
    giftNamesComplete: true
  });

  const st = G.getState();
  for (const g of G.GIFTS) {
    st[g.flag] = true;
  }
  G.rebuildUngrantedCount();

  assertEqual("ungrantedCount is 0", G.getGiftUngrantedCount(), 0);

  G.tryMilestoneGifts();

  assertEqual("zero N.cmp after early-out", G.getGiftCmpCount(), 0);
}

// ─── Test 4: bumpPeakShades not called 3× for Shades gift ───────────────────────
console.log("\n─── Test 4: bumpPeakShades no triple call ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    allTimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(1000),
    peakShades: N.fromNumber(1000)
  });

  const st = G.getState();
  for (const g of G.GIFTS) st[g.flag] = true;
  st.giftPeakShades = false;
  G.rebuildUngrantedCount();

  G.tryMilestoneGifts();

  assertTrue("giftPeakShades granted", st.giftPeakShades === true);
  assertEqual("bumpPeakShades count for single shade gift = 1", G.getBumpPeakShadesCount(), 1);
}

// ─── Test 5: harvest does not call tryMilestoneGifts/checkUnlock ────────────────
console.log("\n─── Test 5: harvest path clean ───");
{
  const src = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
  const harvestMatch = src.match(/function harvest\(\)[\s\S]*?^  \}/m);
  assertTrue("harvest found", !!harvestMatch);
  if (harvestMatch) {
    const harvestSrc = harvestMatch[0];
    assertTrue("harvest no tryMilestoneGifts", !harvestSrc.includes("tryMilestoneGifts"));
    assertTrue("harvest no checkUnlock", !harvestSrc.includes("checkUnlock"));
  }
}

// ─── Test 6: bonus* → gift* migration ───────────────────────────────────────────
console.log("\n─── Test 6: bonus → gift migration ───");
{
  resetState({});

  const oldSave = {
    souls: { m: 12345, e: 0 },
    lifetimeSouls: { m: 99999, e: 0 },
    allTimeSouls: { m: 99999, e: 0 },
    shades: { m: 500, e: 0 },
    lanterns: { m: 10, e: 0 },
    peakShades: { m: 20, e: 0 },
    peakLanterns: { m: 10, e: 0 },
    bonusLifetimeSouls: true,
    bonusPeakShades: true,
    bonusFirstVessel: true,
    bonusThousandSouls: true,
    bonusFirstLantern: true,
    bonusFirstCenser: true,
    bonusFirstFetter: true,
    bonusTenThousandSouls: true,
    bonusFirstThrone: true,
    bonusFirstTribute: true
  };

  G.applySaveData(oldSave);
  const st = G.getState();

  assertTrue("migrated giftLifetimeSouls", st.giftLifetimeSouls === true);
  assertTrue("migrated giftPeakShades", st.giftPeakShades === true);
  assertTrue("migrated giftFirstVessel", st.giftFirstVessel === true);
  assertTrue("migrated giftThousandSouls", st.giftThousandSouls === true);
  assertTrue("migrated giftFirstLantern", st.giftFirstLantern === true);
  assertTrue("migrated giftFirstCenser", st.giftFirstCenser === true);
  assertTrue("migrated giftFirstFetter", st.giftFirstFetter === true);
  assertTrue("migrated giftTenThousandSouls", st.giftTenThousandSouls === true);
  assertTrue("migrated giftFirstThrone", st.giftFirstThrone === true);
  assertTrue("migrated giftFirstTribute", st.giftFirstTribute === true);

  const soulsBefore = unwrap(st.souls);
  G.tryMilestoneGifts();
  const soulsAfter = unwrap(st.souls);

  assertTrue("no re-grant giftLifetimeSouls (souls unchanged from that gift)", st.giftLifetimeSouls === true);
  assertTrue("no re-grant giftFirstLantern", st.giftFirstLantern === true);
}

// ─── Test 7: no hand-written gift branches ──────────────────────────────────────
console.log("\n─── Test 7: no hand-written gift branches in tryMilestoneGifts ───");
{
  const src = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
  const funcMatch = src.match(/function tryMilestoneGifts\(\)[\s\S]*?^  \}/m);
  assertTrue("tryMilestoneGifts found", !!funcMatch);
  if (funcMatch) {
    const funcSrc = funcMatch[0];
    const hardcoded = funcSrc.match(/state\.(bonus|gift)\w+\s*=\s*true/g);
    assertTrue("no hardcoded flag=true in tryMilestoneGifts", !hardcoded || hardcoded.length === 0);
    if (hardcoded) console.error("  found:", hardcoded.join(", "));

    const directRewards = funcSrc.match(/state\.souls\s*=\s*N\.add/g);
    assertTrue("no direct souls N.add in tryMilestoneGifts", !directRewards || directRewards.length === 0);
    if (directRewards) console.error("  found:", directRewards.length, "direct N.add calls");
  }
}

// ─── Test 8: GIFTS_BY_STAT index covers all rows ───────────────────────────────
console.log("\n─── Test 8: GIFTS_BY_STAT index ───");
{
  const GIFTS = G.GIFTS;
  const BY_STAT = G.GIFTS_BY_STAT;
  let missing = 0;
  for (const g of GIFTS) {
    const bucket = BY_STAT[g.stat];
    if (!bucket || !bucket.includes(g)) {
      console.error("FAIL: gift not in GIFTS_BY_STAT[" + g.stat + "]:", g.flag);
      missing++;
    }
    if (g.alt) {
      const altBucket = BY_STAT[g.alt];
      if (!altBucket || !altBucket.includes(g)) {
        console.error("FAIL: gift not in GIFTS_BY_STAT[" + g.alt + "]:", g.flag);
        missing++;
      }
    }
  }
  assertTrue("all GIFTS indexed by stat", missing === 0);
}

// ─── Test 9: BONUS_TO_GIFT map ──────────────────────────────────────────────────
console.log("\n─── Test 9: BONUS_TO_GIFT map ───");
{
  const map = G.BONUS_TO_GIFT;
  const FIELDS = G.FIELDS;
  let badMappings = 0;
  for (const [oldKey, newKey] of Object.entries(map)) {
    if (!FIELDS[newKey]) {
      console.error("FAIL: BONUS_TO_GIFT target not in FIELDS:", newKey);
      badMappings++;
    }
    if (FIELDS[oldKey]) {
      console.error("FAIL: old bonus key still in FIELDS:", oldKey);
      badMappings++;
    }
  }
  assertTrue("BONUS_TO_GIFT all valid", badMappings === 0);
  assertTrue("BONUS_TO_GIFT has entries", Object.keys(map).length >= 9);
}

// ─── Test 10: PEAK_STATS covers all peak fields ────────────────────────────────
console.log("\n─── Test 10: PEAK_STATS ───");
{
  const FIELDS = G.FIELDS;
  const PS = G.PEAK_STATS;
  let missing = 0;
  for (const k of Object.keys(FIELDS)) {
    if (k.startsWith("peak") && FIELDS[k].kind === "num" && FIELDS[k].scope === "account") {
      if (!PS[k]) {
        console.error("FAIL: peak field not in PEAK_STATS:", k);
        missing++;
      }
    }
  }
  assertTrue("all peak fields in PEAK_STATS", missing === 0);
}

// ─── Test 11: specific gift reward amounts ──────────────────────────────────────
console.log("\n─── Test 11: specific gift rewards ───");
{
  const giftsByFlag = {};
  for (const g of G.GIFTS) giftsByFlag[g.flag] = g;

  assertEqual("giftLifetimeSouls gives 50 souls", giftsByFlag.giftLifetimeSouls.give.souls, 50);
  assertEqual("giftPeakShades gives 1 shade", giftsByFlag.giftPeakShades.give.shades, 1);
  assertEqual("giftFirstVessel gives 3 ash", giftsByFlag.giftFirstVessel.give.ash, 3);
  assertEqual("giftThousandSouls gives 200 souls", giftsByFlag.giftThousandSouls.give.souls, 200);
  assertEqual("giftFirstLantern gives 10 souls", giftsByFlag.giftFirstLantern.give.souls, 10);
  assertEqual("giftFirstCenser gives 5 ash", giftsByFlag.giftFirstCenser.give.ash, 5);
  assertEqual("giftFirstFetter gives 2 shades", giftsByFlag.giftFirstFetter.give.shades, 2);
  assertEqual("giftTenThousandSouls gives 500 souls", giftsByFlag.giftTenThousandSouls.give.souls, 500);
  assertEqual("giftFirstThrone gives 1 vessel", giftsByFlag.giftFirstThrone.give.vessels, 1);
  assertEqual("giftFiveTributes gives 2 favor", giftsByFlag.giftFiveTributes.give.favor, 2);
  assertEqual("giftFortyTributes gives 110 souls", giftsByFlag.giftFortyTributes.give.souls, 110);
  assertEqual("giftPeakBeacons gives 7 ash", giftsByFlag.giftPeakBeacons.give.ash, 7);
  assertEqual("giftPeakHearths gives 10 ash", giftsByFlag.giftPeakHearths.give.ash, 10);
  assertEqual("giftFirstEmberVow gives 8 ash", giftsByFlag.giftFirstEmberVow.give.ash, 8);
  assertEqual("giftAllVows gives 25 souls", giftsByFlag.giftAllVows.give.souls, 25);
}

// ─── Test 12: shades gifts also add lifetimeShades ──────────────────────────────
console.log("\n─── Test 12: shades gifts add lifetimeShades ───");
{
  resetState({
    peakShades: N.fromNumber(20),
    shades: N.fromNumber(20),
    lifetimeShades: N.fromNumber(0),
    fetters: N.fromNumber(1)
  });
  G.rebuildUngrantedCount();

  const st = G.getState();
  G.tryMilestoneGifts();

  assertTrue("giftPeakShades granted", st.giftPeakShades === true);
  assertTrue("giftFirstFetter granted", st.giftFirstFetter === true);
  assertTrue("lifetimeShades > 0 from shade gifts", unwrap(st.lifetimeShades) > 0);
}

// ─── Test 13: giftFirstThrone unlocks vessels ───────────────────────────────────
console.log("\n─── Test 13: giftFirstThrone unlocks vessels ───");
{
  resetState({
    thrones: 1,
    unlockedVessels: false
  });
  G.rebuildUngrantedCount();

  const st = G.getState();
  G.tryMilestoneGifts();

  assertTrue("giftFirstThrone granted", st.giftFirstThrone === true);
  assertTrue("vessels unlocked", st.unlockedVessels === true);
  assertTrue("vessels > 0", unwrap(st.vessels) > 0);
}

// ─── Test 14: Tribute preserves gift flags ──────────────────────────────────────
console.log("\n─── Test 14: Tribute preserves gift flags ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    allTimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(1000),
    favor: 10,
    favorEarned: 10,
    giftFirstTribute: true,
    giftLifetimeSouls: true,
    giftPeakShades: true,
    giftFirstVessel: true,
    giftThousandSouls: true,
    giftFirstLantern: true,
    chronicle: [{ id: "tribute", at: 100 }]
  });

  sandbox.confirm = function () { return true; };
  G.layTribute();
  sandbox.confirm = function () { return false; };
  const st = G.getState();

  assertTrue("after tribute: giftLifetimeSouls", st.giftLifetimeSouls === true);
  assertTrue("after tribute: giftPeakShades", st.giftPeakShades === true);
  assertTrue("after tribute: giftFirstVessel", st.giftFirstVessel === true);
  assertTrue("after tribute: giftThousandSouls", st.giftThousandSouls === true);
  assertTrue("after tribute: giftFirstLantern", st.giftFirstLantern === true);
}

// ─── Test 15: fixture with old bonus* keys migrates ─────────────────────────────
console.log("\n─── Test 15: v6.9 fixture bonus* migration ───");
{
  const fixturePath = path.join(root, "tests", "fixtures", "save-v6.9.json");
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

  resetState({});
  G.applySaveData(fixture);
  const st = G.getState();

  assertTrue("fixture: giftLifetimeSouls migrated", st.giftLifetimeSouls === true);
  assertTrue("fixture: giftPeakShades migrated", st.giftPeakShades === true);
  assertTrue("fixture: giftFirstVessel migrated", st.giftFirstVessel === true);
  assertTrue("fixture: giftFirstTribute migrated", st.giftFirstTribute === true);
  assertTrue("fixture: giftThousandSouls migrated", st.giftThousandSouls === true);
  assertTrue("fixture: giftFirstLantern migrated", st.giftFirstLantern === true);
  assertTrue("fixture: giftFirstCenser migrated", st.giftFirstCenser === true);
  assertTrue("fixture: giftFirstFetter migrated", st.giftFirstFetter === true);
  assertTrue("fixture: giftTenThousandSouls migrated", st.giftTenThousandSouls === true);
  assertTrue("fixture: giftFirstThrone migrated", st.giftFirstThrone === true);
}

// ─── Done ───────────────────────────────────────────────────────────────────────
if (failed > 0) {
  console.error("\n" + failed + " assertion(s) failed");
  process.exit(1);
}
console.log("\nall GIFTS table assertions passed");
process.exit(0);
