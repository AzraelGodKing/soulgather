#!/usr/bin/env node
/**
 * AZR-178 FIELDS guardrail tests.
 *
 * 1. serialize → applySaveData identity for a fully populated state.
 * 2. After layTribute, every scope:"account" field equals the post-mutation
 *    pre-reset value (modulo documented checkUnlock side effects).
 * 3. After layTribute, every scope:"run" field equals freshState() default OR
 *    documented derived-phase / checkUnlock overrides.
 * 4. Object.keys(FIELDS) matches keys on a live state object.
 * 5. Captured v6.9 save fixture loads identically.
 * 6. grep: no `var kept` / `kept[A-Z]` in layTribute.
 * 7. FIELDS kind/scope coverage.
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
loadScript("js/config.js");
loadScript("js/economy.js");
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
}

function deepEq(a, b) {
  if (a === b) return true;
  if (a && typeof a === "object" && typeof a.m === "number" &&
      b && typeof b === "object" && typeof b.m === "number") {
    return N.toNumber(a) === N.toNumber(b);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) { if (!deepEq(a[i], b[i])) return false; }
    return true;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) { if (!deepEq(a[k], b[k])) return false; }
    return true;
  }
  return false;
}

// ─── Test 1: serialize → applySaveData identity ─────────────────────────────────
console.log("\n─── Test 1: serialize → deserialize identity ───");
{
  resetState({
    souls: N.fromNumber(12345),
    lifetimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(500),
    spirits: N.fromNumber(80),
    vessels: N.fromNumber(12),
    thrones: 3,
    chalices: 2,
    wellDepth: 5,
    lanterns: N.fromNumber(7),
    ash: N.fromNumber(44444),
    favor: 15,
    favorEarned: 20,
    edictLevel: 3,
    memoryLevel: 2,
    echoLevel: 1,
    buyMode: "10",
    buyModeHintDismissed: true,
    chronicle: [{ id: "tribute", at: 99999 }],
    giftFirstTribute: true,
    giftCrown: true,
    giftFirstVeil: true,
    vow: "stillness",
    vowsKnown: { ember: true, stillness: true, hunger: false, harvest: false },
    peakShades: N.fromNumber(600),
    peakLanterns: N.fromNumber(8),
    allTimeSouls: N.fromNumber(200000),
    tributesLaid: 5,
    choirEdictLevel: 2,
    hymnEdictLevel: 1,
    quietCourtLevel: 1,
    namesBound: 6,
    ossuaryLevel: 2,
    bindingTollLevel: 2,
    hollowStacks: 3,
    titheLeft: 30,
    nightLeft: 20,
    hymnLeft: 120,
    aspect: "harvest"
  });
  const serialized = G.serializeState();
  const json = JSON.stringify(serialized);
  const parsed = JSON.parse(json);
  assertTrue("round-trip isSaveShape", G.isSaveShape(parsed));
  resetState({});
  G.applySaveData(parsed);
  const st = G.getState();
  assertEqual("rt souls", unwrap(st.souls), 12345);
  assertEqual("rt shades", unwrap(st.shades), 500);
  assertEqual("rt thrones", st.thrones, 3);
  assertEqual("rt chalices", st.chalices, 2);
  assertEqual("rt favor", st.favor, 15);
  assertEqual("rt favorEarned", st.favorEarned, 20);
  assertEqual("rt edictLevel", st.edictLevel, 3);
  assertEqual("rt echoLevel", st.echoLevel, 1);
  assertEqual("rt buyMode", st.buyMode, "10");
  assertTrue("rt buyModeHintDismissed", st.buyModeHintDismissed);
  assertTrue("rt giftFirstTribute", st.giftFirstTribute);
  assertTrue("rt giftCrown", st.giftCrown);
  assertTrue("rt giftFirstVeil", st.giftFirstVeil);
  assertEqual("rt vow", st.vow, "stillness");
  assertEqual("rt peakShades", unwrap(st.peakShades), 600);
  assertEqual("rt allTimeSouls", unwrap(st.allTimeSouls), 200000);
  assertEqual("rt tributesLaid", st.tributesLaid, 5);
  assertEqual("rt choirEdictLevel", st.choirEdictLevel, 2);
  assertEqual("rt bindingTollLevel", st.bindingTollLevel, 2);
  assertEqual("rt titheLeft", st.titheLeft, 30);
  assertEqual("rt aspect", st.aspect, "harvest");
  assertTrue("rt chronicle length", st.chronicle.length === 1);
  assertEqual("rt chronicle[0].id", st.chronicle[0].id, "tribute");
}

// ─── Test 2: Tribute account-field survival ─────────────────────────────────────
console.log("\n─── Test 2: Tribute account survival ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(1000),
    lanterns: N.fromNumber(10),
    fetters: N.fromNumber(5),
    censers: N.fromNumber(3),
    pyres: N.fromNumber(2),
    favor: 10,
    favorEarned: 10,
    edictLevel: 2,
    memoryLevel: 1,
    echoLevel: 1,
    seatLevel: 1,
    kindleLevel: 1,
    ashenLevel: 1,
    depthLevel: 1,
    buyMode: "max",
    buyModeHintDismissed: true,
    chronicle: [{ id: "tribute", at: 50000 }],
    allTimeSouls: N.fromNumber(500000),
    peakShades: N.fromNumber(800),
    peakLanterns: N.fromNumber(9),
    giftFirstTribute: true,
    giftCrown: true,
    giftFirstVeil: true,
    choirEdictLevel: 2,
    hymnEdictLevel: 2,
    nightEdictLevel: 1,
    wakeEdictLevel: 1,
    veilEdictLevel: 1,
    tollEdictLevel: 1,
    crownWeight: 1,
    longMemoryLevel: 1,
    quietCourtLevel: 2,
    namesBound: 3,
    remembrance: 2,
    deeperNightLevel: 1,
    ashenTideLevel: 2,
    ossuaryLevel: 1,
    longerHymnLevel: 1,
    tributesLaid: 8,
    aspect: "harvest"
  });

  sandbox.confirm = function () { return true; };
  G.layTribute();
  sandbox.confirm = function () { return false; };
  const st = G.getState();

  // Core account fields must survive
  assertTrue("tribute: favor increased", st.favor > 10);
  assertTrue("tribute: favorEarned increased", st.favorEarned > 10);
  assertEqual("tribute: edictLevel", st.edictLevel, 2);
  assertEqual("tribute: memoryLevel", st.memoryLevel, 1);
  assertEqual("tribute: echoLevel", st.echoLevel, 1);
  assertEqual("tribute: seatLevel", st.seatLevel, 1);
  assertEqual("tribute: kindleLevel", st.kindleLevel, 1);
  assertEqual("tribute: ashenLevel", st.ashenLevel, 1);
  assertEqual("tribute: depthLevel", st.depthLevel, 1);
  assertEqual("tribute: buyMode", st.buyMode, "max");
  assertTrue("tribute: buyModeHintDismissed", st.buyModeHintDismissed);
  assertEqual("tribute: crownWeight", st.crownWeight, 1);
  assertEqual("tribute: longMemoryLevel", st.longMemoryLevel, 1);
  assertEqual("tribute: quietCourtLevel", st.quietCourtLevel, 2);
  assertTrue("tribute: namesBound survives (may increase from gifts)", st.namesBound >= 3);
  assertEqual("tribute: remembrance", st.remembrance, 2);
  assertEqual("tribute: deeperNightLevel", st.deeperNightLevel, 1);
  assertEqual("tribute: ashenTideLevel", st.ashenTideLevel, 2);
  assertEqual("tribute: ossuaryLevel", st.ossuaryLevel, 1);
  assertEqual("tribute: longerHymnLevel", st.longerHymnLevel, 1);
  assertEqual("tribute: tributesLaid", st.tributesLaid, 9);
  assertEqual("tribute: choirEdictLevel", st.choirEdictLevel, 2);
  assertEqual("tribute: hymnEdictLevel", st.hymnEdictLevel, 2);
  assertEqual("tribute: nightEdictLevel", st.nightEdictLevel, 1);
  assertTrue("tribute: chronicle survives", st.chronicle.length >= 1);
  assertTrue("tribute: peakShades >= pre", N.cmp(st.peakShades, 800) >= 0);
  assertTrue("tribute: peakLanterns >= pre", N.cmp(st.peakLanterns, 9) >= 0);
  assertTrue("tribute: allTimeSouls survives", N.cmp(st.allTimeSouls, 500000) >= 0);
  assertTrue("tribute: giftFirstTribute", st.giftFirstTribute);
  assertTrue("tribute: giftCrown survives", st.giftCrown);
  assertTrue("tribute: giftFirstVeil survives", st.giftFirstVeil);

  // Derived timer assertions
  assertTrue("tribute: hymnLeft > 0 (hymnEdictLevel=2)", st.hymnLeft > 0);
}

// ─── Test 3: Tribute run-field reset ────────────────────────────────────────────
console.log("\n─── Test 3: Tribute run-field reset ───");
{
  resetState({
    souls: N.fromNumber(99999),
    lifetimeSouls: N.fromNumber(99999),
    shades: N.fromNumber(500),
    spirits: N.fromNumber(50),
    vessels: N.fromNumber(5),
    thrones: 2,
    favor: 5,
    favorEarned: 5,
    edictLevel: 1,
    giftFirstTribute: true,
    chronicle: [{ id: "tribute", at: 50000 }],
    hymnEdictLevel: 1,
    siphonLevel: 3,
    levyLevel: 2,
    bindingTollLevel: 4,
    hollowStacks: 5,
    clicksThisRun: 100,
    vow: "hunger",
    vowHungerPaid: true,
    aspect: "harvest",
    titheLeft: 60,
    tithePaid: true,
    cinderLevel: 2,
    urnRiteLevel: 1,
    hearthRiteLevel: 1,
    emberLevel: 3,
    chainLevel: 2,
    hollowLevel: 1
  });

  sandbox.confirm = function () { return true; };
  G.layTribute();
  sandbox.confirm = function () { return false; };
  const st = G.getState();

  assertEqual("run reset: siphonLevel", st.siphonLevel, 0);
  assertEqual("run reset: levyLevel", st.levyLevel, 0);
  assertEqual("run reset: bindingTollLevel", st.bindingTollLevel, 0);
  assertEqual("run reset: hollowStacks", st.hollowStacks, 0);
  assertEqual("run reset: clicksThisRun", st.clicksThisRun, 0);
  assertEqual("run reset: vow", st.vow, "");
  assertEqual("run reset: vowHungerPaid", st.vowHungerPaid, false);
  assertEqual("run reset: aspect", st.aspect, "");
  assertEqual("run reset: tithePaid", st.tithePaid, false);
  assertEqual("run reset: titheLeft", st.titheLeft, 0);
  assertEqual("run reset: cinderLevel", st.cinderLevel, 0);
  assertEqual("run reset: urnRiteLevel", st.urnRiteLevel, 0);
  assertEqual("run reset: hearthRiteLevel", st.hearthRiteLevel, 0);
  assertEqual("run reset: emberLevel", st.emberLevel, 0);
  assertEqual("run reset: chainLevel", st.chainLevel, 0);
  assertEqual("run reset: hollowLevel", st.hollowLevel, 0);
  assertEqual("run reset: hollowIdle", st.hollowIdle, 0);
  assertEqual("run reset: hollowWarned", st.hollowWarned, false);
  assertTrue("run reset: lifetimeShades near 0 (gifts may add 1-2)", unwrap(st.lifetimeShades) <= 2);
  assertEqual("run reset: lifetimeSpirits", unwrap(st.lifetimeSpirits), 0);
  assertEqual("run reset: spirits", unwrap(st.spirits), 0);
}

// ─── Test 4: FIELDS keys match live state keys ─────────────────────────────────
console.log("\n─── Test 4: FIELDS keys match live state ───");
{
  const fieldKeys = new Set(G.FIELDS_KEYS);
  const freshKeys = new Set(Object.keys(G.freshState()));

  let missing = [];
  for (const k of freshKeys) {
    if (!fieldKeys.has(k)) missing.push(k);
  }
  let extra = [];
  for (const k of fieldKeys) {
    if (!freshKeys.has(k)) extra.push(k);
  }
  assertTrue("FIELDS keys === freshState keys (no missing)", missing.length === 0);
  if (missing.length > 0) console.error("  missing from FIELDS:", missing.join(", "));
  assertTrue("FIELDS keys === freshState keys (no extra)", extra.length === 0);
  if (extra.length > 0) console.error("  extra in FIELDS:", extra.join(", "));

  resetState({
    souls: N.fromNumber(100),
    lifetimeSouls: N.fromNumber(99999),
    favor: 5,
    favorEarned: 5,
    giftFirstTribute: true,
    chronicle: [{ id: "tribute", at: 100 }]
  });
  sandbox.confirm = function () { return true; };
  G.layTribute();
  sandbox.confirm = function () { return false; };
  const postTributeKeys = new Set(Object.keys(G.getState()));
  let postMissing = [];
  for (const k of postTributeKeys) {
    if (!fieldKeys.has(k)) postMissing.push(k);
  }
  assertTrue("FIELDS keys match state after Tribute", postMissing.length === 0);
  if (postMissing.length > 0) console.error("  post-tribute missing:", postMissing.join(", "));
}

// ─── Test 5: v6.9 save fixture loads identically ────────────────────────────────
console.log("\n─── Test 5: v6.9 fixture compatibility ───");
{
  const fixturePath = path.join(root, "tests", "fixtures", "save-v6.9.json");
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  assertTrue("fixture isSaveShape", G.isSaveShape(fixture));

  resetState({});
  G.applySaveData(fixture);
  const st = G.getState();

  assertEqual("fixture souls", unwrap(st.souls), 123456);
  assertEqual("fixture lifetimeSouls", unwrap(st.lifetimeSouls), 999999);
  assertEqual("fixture shades", unwrap(st.shades), 500);
  assertEqual("fixture thrones", st.thrones, 3);
  assertEqual("fixture chalices", st.chalices, 2);
  assertEqual("fixture wellDepth", st.wellDepth, 5);
  assertEqual("fixture favor", st.favor, 15);
  assertEqual("fixture favorEarned", st.favorEarned, 20);
  assertEqual("fixture edictLevel", st.edictLevel, 3);
  assertEqual("fixture echoLevel", st.echoLevel, 1);
  assertEqual("fixture buyMode", st.buyMode, "10");
  assertTrue("fixture buyModeHintDismissed", st.buyModeHintDismissed);
  assertEqual("fixture vow", st.vow, "stillness");
  assertTrue("fixture giftFirstTribute", st.giftFirstTribute);
  assertTrue("fixture giftCrown", st.giftCrown);
  assertTrue("fixture giftFirstVeil", st.giftFirstVeil);
  assertTrue("fixture giftFirstPyre", st.giftFirstPyre);
  assertTrue("fixture giftFirstOssuary", st.giftFirstOssuary);
  assertEqual("fixture choirEdictLevel", st.choirEdictLevel, 3);
  assertEqual("fixture choirLevel", st.choirLevel, 3);
  assertTrue("fixture unlockedChoir", st.unlockedChoir);
  assertEqual("fixture bindingTollLevel", st.bindingTollLevel, 2);
  assertTrue("fixture unlockedBindingToll", st.unlockedBindingToll);
  assertEqual("fixture tributesLaid", st.tributesLaid, 10);
  assertEqual("fixture allTimeSouls", unwrap(st.allTimeSouls), 1500000);
  assertEqual("fixture peakShades", unwrap(st.peakShades), 600);
  assertEqual("fixture ossuaryLevel", st.ossuaryLevel, 3);
  assertEqual("fixture quietCourtLevel", st.quietCourtLevel, 2);
  assertTrue("fixture chronicle length", st.chronicle.length === 7);
  assertEqual("fixture chronicle[0].id", st.chronicle[0].id, "tribute");
  assertTrue("fixture vowsKnown.ember", st.vowsKnown.ember === true);
  assertTrue("fixture vowsKnown.stillness", st.vowsKnown.stillness === true);

  // Round-trip: serialize then reload
  const reserialized = G.serializeState();
  resetState({});
  G.applySaveData(reserialized);
  const st2 = G.getState();
  assertEqual("fixture rt souls", unwrap(st2.souls), 123456);
  assertEqual("fixture rt favor", st2.favor, 15);
  assertEqual("fixture rt tributesLaid", st2.tributesLaid, 10);
  assertEqual("fixture rt buyMode", st2.buyMode, "10");
}

// ─── Test 6: no keptX in layTribute source ──────────────────────────────────────
console.log("\n─── Test 6: no keptX in layTribute source ───");
{
  const src = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
  const tributeMatch = src.match(/function layTribute\(\)[\s\S]*?^  \}/m);
  if (tributeMatch) {
    const tributeSrc = tributeMatch[0];
    const keptMatches = tributeSrc.match(/\bvar\s+kept[A-Z]/g);
    assertTrue("no 'var keptX' in layTribute", !keptMatches || keptMatches.length === 0);
    if (keptMatches) console.error("  found:", keptMatches.join(", "));
    const keptAssign = tributeSrc.match(/\bkept[A-Z]\w*\s*=/g);
    assertTrue("no 'keptX =' in layTribute", !keptAssign || keptAssign.length === 0);
    if (keptAssign) console.error("  found:", keptAssign.join(", "));
  } else {
    console.error("FAIL: could not locate layTribute in source");
    failed++;
  }
}

// ─── Test 7: FIELDS coverage ────────────────────────────────────────────────────
console.log("\n─── Test 7: FIELDS kind/scope coverage ───");
{
  const FIELDS = G.FIELDS;
  const validKinds = new Set(["num", "count", "flag", "str", "list", "time", "obj"]);
  const validScopes = new Set(["run", "account"]);
  let badEntries = 0;
  for (const k of Object.keys(FIELDS)) {
    const f = FIELDS[k];
    if (!validKinds.has(f.kind)) {
      console.error("FAIL: FIELDS[" + k + "].kind = " + f.kind);
      badEntries++;
    }
    if (!validScopes.has(f.scope)) {
      console.error("FAIL: FIELDS[" + k + "].scope = " + f.scope);
      badEntries++;
    }
  }
  if (badEntries > 0) failed += badEntries;
  else console.log("ok   all FIELDS entries have valid kind and scope");
}

// ─── Done ───────────────────────────────────────────────────────────────────────
if (failed > 0) {
  console.error("\n" + failed + " assertion(s) failed");
  process.exit(1);
}
console.log("\nall FIELDS guardrail assertions passed");
process.exit(0);
