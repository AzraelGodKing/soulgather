#!/usr/bin/env node
/**
 * Generate a rich v6.9 save fixture from the CURRENT tip serializeState.
 * Run once before the FIELDS refactor; the fixture is a compatibility contract.
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
loadScript("js/game.js");

const N = sandbox.SoulgatherNum;
const G = sandbox.SoulgatherEconomy;

const st = G.getState();
const fresh = G.freshState();

// Populate a rich state: every kind/scope represented
const keys = Object.keys(fresh);
for (let i = 0; i < keys.length; i++) st[keys[i]] = fresh[keys[i]];

// Nums (big numbers)
st.souls = N.fromNumber(123456);
st.lifetimeSouls = N.fromNumber(999999);
st.lifetimeShades = N.fromNumber(55555);
st.lifetimeSpirits = N.fromNumber(3333);
st.shades = N.fromNumber(500);
st.spirits = N.fromNumber(80);
st.vessels = N.fromNumber(12);
st.lanterns = N.fromNumber(7);
st.ash = N.fromNumber(44444);
st.censers = N.fromNumber(5);
st.pyres = N.fromNumber(3);
st.urns = N.fromNumber(2);
st.hearths = N.fromNumber(1);
st.beacons = N.fromNumber(1);
st.spires = N.fromNumber(1);
st.obelisks = N.fromNumber(1);
st.fetters = N.fromNumber(4);
st.allTimeSouls = N.fromNumber(1500000);

// Peaks
st.peakShades = N.fromNumber(600);
st.peakLanterns = N.fromNumber(8);
st.peakFetters = N.fromNumber(5);
st.peakCensers = N.fromNumber(6);
st.peakPyres = N.fromNumber(4);
st.peakUrns = N.fromNumber(3);
st.peakHearths = N.fromNumber(2);
st.peakBeacons = N.fromNumber(2);
st.peakSpires = N.fromNumber(2);
st.peakObelisks = N.fromNumber(2);

// Counts
st.thrones = 3;
st.chalices = 2;
st.wellDepth = 5;
st.emberLevel = 2;
st.chainLevel = 1;
st.hollowLevel = 1;
st.favor = 15;
st.favorEarned = 20;
st.edictLevel = 3;
st.memoryLevel = 2;
st.echoLevel = 1;
st.seatLevel = 1;
st.kindleLevel = 1;
st.ashenLevel = 1;
st.depthLevel = 1;
st.siphonLevel = 1;
st.levyLevel = 1;
st.cinderLevel = 1;
st.urnRiteLevel = 1;
st.hearthRiteLevel = 1;
st.beaconRiteLevel = 1;
st.spireRiteLevel = 1;
st.bindingTollLevel = 2;
st.hollowStacks = 2;
st.hollowIdle = 10;
st.choirLevel = 3;
st.choirEdictLevel = 3;
st.hymnEdictLevel = 2;
st.smokeEdictLevel = 1;
st.embersEdictLevel = 1;
st.urnEdictLevel = 1;
st.hearthEdictLevel = 1;
st.beaconEdictLevel = 1;
st.spireEdictLevel = 1;
st.obeliskEdictLevel = 1;
st.cinderEdictLevel = 1;
st.cutEdictLevel = 1;
st.tendingEdictLevel = 1;
st.gleamEdictLevel = 1;
st.riseEdictLevel = 1;
st.cupEdictLevel = 1;
st.draughtEdictLevel = 1;
st.wakeEdictLevel = 1;
st.processionEdictLevel = 1;
st.tollEdictLevel = 1;
st.veilEdictLevel = 1;
st.knellEdictLevel = 1;
st.nightEdictLevel = 1;
st.crownWeight = 1;
st.longMemoryLevel = 1;
st.quietCourtLevel = 2;
st.namesBound = 6;
st.remembrance = 3;
st.deeperNightLevel = 1;
st.ashenTideLevel = 2;
st.ossuaryLevel = 3;
st.longerProcessionLevel = 2;
st.deeperTollLevel = 1;
st.longerWakeLevel = 1;
st.longerTitheLevel = 1;
st.longerVeilLevel = 1;
st.longerHymnLevel = 2;
st.longerKnellLevel = 1;
st.tributesLaid = 10;
st.clicksThisRun = 50;

// Timers
st.titheLeft = 30;
st.nightLeft = 45;
st.hymnLeft = 120;
st.veilLeft = 60;
st.tollLeft = 30;
st.wakeLeft = 90;
st.processionLeft = 45;
st.knellLeft = 20;

// Flags
st.unlockedSpirits = true;
st.unlockedVessels = true;
st.unlockedWell = true;
st.unlockedThrones = true;
st.unlockedChalices = true;
st.unlockedLanterns = true;
st.unlockedMarks = true;
st.unlockedCensers = true;
st.unlockedPyres = true;
st.unlockedUrns = true;
st.unlockedHearths = true;
st.unlockedBeacons = true;
st.unlockedSpires = true;
st.unlockedObelisks = true;
st.unlockedFetters = true;
st.unlockedAutobind = true;
st.unlockedAutobindSpirits = true;
st.unlockedAutobindVessels = true;
st.unlockedAutobindLanterns = true;
st.unlockedAutobindFetters = true;
st.unlockedAutobindCensers = true;
st.unlockedAutobindThrones = true;
st.unlockedAutobindPyres = true;
st.unlockedAutobindChalices = true;
st.unlockedAutobindUrns = true;
st.unlockedAutobindHearths = true;
st.unlockedAutobindBeacons = true;
st.unlockedAutobindSpires = true;
st.unlockedAutobindObelisks = true;
st.unlockedNightTithe = true;
st.unlockedVeil = true;
st.unlockedWake = true;
st.unlockedToll = true;
st.unlockedChoir = true;
st.unlockedBindingToll = true;
st.unlockedWellDraws = true;
st.toastShown = true;
st.vesselToastShown = true;
st.throneToastShown = true;
st.lanternToastShown = true;
st.censerToastShown = true;
st.hollowWarned = true;
st.wellDraws = true;
st.namesComplete = false;
st.tithePaid = true;
st.autobind = true;
st.autobindSpirits = true;
st.autobindVessels = true;
st.autobindLanterns = true;
st.autobindFetters = true;
st.autobindCensers = true;
st.autobindThrones = true;
st.autobindPyres = true;
st.autobindChalices = true;
st.autobindUrns = true;
st.autobindHearths = true;
st.autobindBeacons = true;
st.autobindSpires = true;
st.autobindObelisks = true;
st.bonusLifetimeSouls = true;
st.bonusPeakShades = true;
st.bonusFirstVessel = true;
st.bonusFirstTribute = true;
st.bonusThousandSouls = true;
st.bonusFirstLantern = true;
st.bonusFirstCenser = true;
st.bonusFirstFetter = true;
st.bonusTenThousandSouls = true;
st.bonusFirstThrone = true;
st.giftCrown = true;
st.giftFirstName = true;
st.giftFiveTributes = true;
st.giftNamesComplete = false;
st.giftFirstVeil = true;
st.giftFirstWake = true;
st.giftPeakLanterns = true;
st.giftPeakFetters = true;
st.giftPeakCensers = true;
st.giftFirstPyre = true;
st.giftFirstUrn = true;
st.giftFirstHearth = true;
st.giftFirstBeacon = true;
st.giftFirstSpire = true;
st.giftFirstObelisk = true;
st.giftEightTributes = true;
st.giftPeakPyres = true;
st.giftPeakUrns = true;
st.giftPeakHearths = true;
st.giftPeakBeacons = true;
st.giftPeakSpires = true;
st.giftPeakObelisks = true;
st.giftFirstCinders = true;
st.giftFirstUrnRite = true;
st.giftFirstHearthRite = true;
st.giftFirstBeaconRite = true;
st.giftFirstSpireRite = true;
st.giftFirstChalice = true;
st.giftTwelveTributes = false;
st.giftSixteenTributes = false;
st.giftTwentyTributes = false;
st.giftTwentyFourTributes = false;
st.giftTwentyEightTributes = false;
st.giftThirtyTwoTributes = false;
st.giftThirtySixTributes = false;
st.giftFortyTributes = false;
st.giftFullCup = false;
st.giftThreeChalices = false;
st.giftFirstOssuary = true;
st.giftFullOssuary = false;
st.giftHundredDraws = false;
st.giftTwoHundredDraws = false;
st.giftThreeHundredDraws = false;
st.giftFirstEmberVow = true;
st.giftTwoVows = false;
st.giftThreeVows = false;
st.giftAllVows = false;
st.giftFirstProcession = true;
st.giftFirstLongerProcession = true;
st.giftFirstDeeperToll = true;
st.giftFirstLongerWake = true;
st.giftFirstLongerTithe = true;
st.giftFirstLongerVeil = true;
st.giftFirstLongerHymn = true;
st.giftFirstLongerKnell = true;
st.giftFirstToll = true;
st.giftFirstKnell = true;

// Strings
st.buyMode = "10";
st.aspect = "harvest";
st.vow = "stillness";
st.vowHungerPaid = false;
st.buyModeHintDismissed = true;

// Chronicle (objects with {id, at} as the engine expects)
st.chronicle = [
  { id: "tribute", at: 99999 },
  { id: "giftTribute", at: 99999 },
  { id: "veil", at: 50000 },
  { id: "wake", at: 40000 },
  { id: "toll", at: 30000 },
  { id: "knell", at: 20000 },
  { id: "procession", at: 10000 }
];

// vowsKnown
st.vowsKnown = { ember: true, stillness: true, hunger: false, harvest: false };

// Timestamps (fixed for reproducibility)
st.lastTick = 1700000000000;
st.simulatedUntil = 1700000000000;
st.bak1At = 1699999000000;
st.bak2At = 1699998000000;
st.runStartedAt = 1699990000000;

const serialized = G.serializeState();
const outPath = path.join(root, "tests", "fixtures", "save-v6.9.json");
fs.writeFileSync(outPath, JSON.stringify(serialized, null, 2) + "\n");
console.log("Fixture written to", outPath);
console.log("Keys:", Object.keys(serialized).length);
