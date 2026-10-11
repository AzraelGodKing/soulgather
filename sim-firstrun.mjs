#!/usr/bin/env node
/**
 * Soulgather first-run simulation — drives the REAL game engine.
 * Greedy human-ish strategy from a fresh save (favor=0, edict=0).
 * Asserts checkpoint bands so a broken economy turns CI red.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

// ─── Sandbox: load real game.js (boot deferred) ────────────────────────────────
function createStorage() {
  const map = new Map();
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
  Infinity, NaN, undefined, Map, Set,
  localStorage: createStorage(),
  document: documentMock,
  navigator: {},
  confirm() { return true; },
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

const VERSION = G.GAME_VERSION;

// ─── Helpers ────────────────────────────────────────────────────────────────────
function num(v) {
  if (v && typeof v === "object" && typeof v.m === "number") return N.toNumber(v);
  return Number(v) || 0;
}

function st() { return G.getState(); }

function fmtTime(t) {
  if (t == null) return "NEVER";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  if (m <= 0) return s.toFixed(1) + "s";
  return m + "m " + s.toFixed(1) + "s (" + t.toFixed(1) + "s)";
}

// ─── Sim parameters ─────────────────────────────────────────────────────────────
const DT_FINE   = 0.25;
const DT_COARSE = 2.0;
const COARSE_AFTER = 600;
const T_MAX = 36000;
const CLICKS_PER_SEC = 2;
const CLICKS_IDLE = 0;
const FAVOR_TARGET = 10;

// ─── Init fresh state ───────────────────────────────────────────────────────────
G.__setStateForTest(G.freshState());
st().buyMode = "1";

const checkpoints = {};

function mark(name, t) {
  if (checkpoints[name] == null) checkpoints[name] = t;
}

function favorNow() {
  return G.favorGain(st().lifetimeSouls);
}

// ─── Greedy buy strategy ────────────────────────────────────────────────────────
function greedyBuy(t) {
  const s = st();

  // First shade
  if (num(s.shades) < 1 && num(s.lifetimeShades) < 1) {
    const cost = G.shadeCost(s.shades);
    if (N.cmp(s.souls, cost) >= 0) {
      G.buyShade();
      mark("first_shade", t);
      return;
    }
  }

  // Well Draws (idle-mode souls)
  if (!s.wellDraws) {
    if ((s.unlockedWellDraws || N.cmp(s.shades, 3) >= 0) && N.cmp(s.souls, 50) >= 0) {
      G.buyWellDraws();
      return;
    }
  }

  // Siphon (boost shade→soul rate)
  if (s.siphonLevel < 4 && num(s.shades) >= 3) {
    const cost = G.siphonCost(s.siphonLevel);
    if (N.cmp(s.souls, cost) >= 0) {
      G.buySiphon();
      return;
    }
  }

  // Well Depth early (click power before draws)
  if (!s.wellDraws && s.unlockedWell && s.wellDepth < 2) {
    const cost = G.wellCost(s.wellDepth);
    if (N.cmp(s.souls, cost) >= 0) {
      G.buyWell();
      return;
    }
  }

  // ── Ash chain (spend ash currencies) ──

  // Binding Toll when unlocked (ash → rate boost)
  if (s.unlockedBindingToll && s.bindingTollLevel < (G.BINDING_TOLL_MAX || 4)) {
    const cost = G.bindingTollCost(s.bindingTollLevel);
    if (N.cmp(s.ash, cost) >= 0) {
      G.buyBindingToll();
      mark("first_binding_toll", t);
      return;
    }
  }

  // Chalices (ash → +8% prod each)
  if (s.unlockedChalices && s.chalices < 12) {
    const cost = G.chaliceCost(s.chalices);
    if (N.cmp(s.ash, cost) >= 0) {
      G.buyChalice();
      mark("first_chalice", t);
      return;
    }
  }

  // ── Core vessel→censer→pyre chain ──

  // Pyres (consume censers)
  if (s.unlockedPyres) {
    const cost = G.pyreCost(s.pyres);
    if (N.cmp(s.censers, cost) >= 0) {
      G.buyPyre();
      mark("first_pyre", t);
      return;
    }
  }

  // Censers (consume vessels)
  if (s.unlockedCensers) {
    const cost = G.censerCost(s.censers);
    if (N.cmp(s.vessels, cost) >= 0) {
      G.buyCenser();
      return;
    }
  }

  // ── Extended ash chain ──

  // Obelisks (spire → obelisk)
  if (s.unlockedObelisks) {
    const cost = G.obeliskCost(s.obelisks);
    if (N.cmp(s.spires, cost) >= 0) {
      G.buyObelisk();
      return;
    }
  }
  if (s.unlockedSpires) {
    const cost = G.spireCost(s.spires);
    if (N.cmp(s.beacons, cost) >= 0) { G.buySpire(); return; }
  }
  if (s.unlockedBeacons) {
    const cost = G.beaconCost(s.beacons);
    if (N.cmp(s.hearths, cost) >= 0) { G.buyBeacon(); return; }
  }
  if (s.unlockedHearths) {
    const cost = G.hearthCost(s.hearths);
    if (N.cmp(s.urns, cost) >= 0) { G.buyHearth(); return; }
  }
  if (s.unlockedUrns) {
    const cost = G.urnCost(s.urns);
    if (N.cmp(s.pyres, cost) >= 0) { G.buyUrn(); return; }
  }

  // ── Production chain: vessels → spirits → shades ──

  // Vessels
  if (s.unlockedVessels) {
    const cost = G.vesselCost(s.vessels);
    if (N.cmp(s.spirits, cost) >= 0) {
      G.buyVessel();
      return;
    }
  }

  // Thrones (after enough censers, spend excess vessels on thrones for prod mult)
  if (s.unlockedThrones && num(s.censers) >= 3) {
    const cost = G.throneCost(s.thrones);
    if (N.cmp(s.vessels, cost) >= 0) {
      G.buyThrone();
      return;
    }
  }

  // Levy when cheap (shades→spirits boost)
  if (s.unlockedSpirits && num(s.spirits) >= 1 && s.levyLevel < 3) {
    const cost = G.levyCost(s.levyLevel);
    if (N.cmp(s.shades, cost) >= 0) {
      G.buyLevy();
      return;
    }
  }

  // Spirits (consume shades)
  if (s.unlockedSpirits) {
    const cost = G.spiritCost(s.spirits);
    if (N.cmp(s.shades, cost) >= 0) {
      G.buySpirit();
      return;
    }
  }

  // Fetters (consume shades, boost shades/s — cap early)
  if (s.unlockedFetters && num(s.fetters) < 8) {
    const cost = G.fetterCost(s.fetters);
    if (N.cmp(s.shades, cost) >= 0) {
      G.buyFetter();
      return;
    }
  }

  // Lanterns (consume souls — cap early to not starve shades)
  if (s.unlockedLanterns && num(s.lanterns) < 10) {
    const cost = G.lanternCost(s.lanterns);
    if (N.cmp(s.souls, cost) >= 0) {
      G.buyLantern();
      return;
    }
  }

  // Shades (consume souls)
  const shadeCst = G.shadeCost(s.shades);
  if (N.cmp(s.souls, shadeCst) >= 0) {
    G.buyShade();
  }
}

// ─── Autobind management ────────────────────────────────────────────────────────
function enableAutobinds() {
  const s = st();
  if (s.unlockedAutobind && !s.autobind) s.autobind = true;
  if (s.unlockedAutobindSpirits && !s.autobindSpirits) s.autobindSpirits = true;
  if (s.unlockedAutobindVessels && !s.autobindVessels) s.autobindVessels = true;
  if (s.unlockedAutobindLanterns && !s.autobindLanterns) s.autobindLanterns = true;
  if (s.unlockedAutobindFetters && !s.autobindFetters) s.autobindFetters = true;
  if (s.unlockedAutobindCensers && !s.autobindCensers) s.autobindCensers = true;
  if (s.unlockedAutobindThrones && !s.autobindThrones) s.autobindThrones = true;
  if (s.unlockedAutobindPyres && !s.autobindPyres) s.autobindPyres = true;
  if (s.unlockedAutobindUrns && !s.autobindUrns) s.autobindUrns = true;
  if (s.unlockedAutobindHearths && !s.autobindHearths) s.autobindHearths = true;
  if (s.unlockedAutobindBeacons && !s.autobindBeacons) s.autobindBeacons = true;
  if (s.unlockedAutobindSpires && !s.autobindSpires) s.autobindSpires = true;
  if (s.unlockedAutobindObelisks && !s.autobindObelisks) s.autobindObelisks = true;
  if (s.unlockedAutobindChalices && !s.autobindChalices) s.autobindChalices = true;
}

function runAutobinds() {
  G.tryAutobind();
  G.tryAutobindSpirits();
  G.tryAutobindVessels();
  G.tryAutobindLanterns();
  G.tryAutobindFetters();
  G.tryAutobindCensers();
  G.tryAutobindThrones();
  G.tryAutobindPyres();
  G.tryAutobindUrns();
  G.tryAutobindHearths();
  G.tryAutobindBeacons();
  G.tryAutobindSpires();
  G.tryAutobindObelisks();
  G.tryAutobindChalices();
}

// ─── Tribute + post-tribute Reliquary spending ──────────────────────────────────
function tributeAndSpend(t) {
  const gain = favorNow();
  if (gain < 1) return false;
  mark("first_tribute", t);

  const prevEarned = Number(st().favorEarned) || 0;
  G.layTribute();

  // After layTribute, internal state is a new object — re-fetch
  const s = st();
  s.buyMode = "1";
  const earned = Number(s.favorEarned) || 0;
  // Mark all intermediate favor checkpoints
  for (let f = prevEarned + 1; f <= earned; f++) {
    mark("favor_" + f, t);
  }

  // Spend favor on Reliquary upgrades (prioritized for fast restarts)
  let spent = true;
  while (spent) {
    spent = false;

    // Echo first (well draws at start = massive acceleration)
    if ((Number(s.echoLevel) || 0) < 1) {
      const echCost = G.echoCost(s.echoLevel);
      if (isFinite(echCost) && s.favor >= echCost) {
        s.favor -= echCost;
        s.echoLevel = 1;
        spent = true;
        continue;
      }
    }

    // Edict (prod mult +25% each)
    const eCost = G.edictCost(s.edictLevel);
    if (s.favor >= eCost) {
      s.favor -= eCost;
      s.edictLevel += 1;
      spent = true;
      continue;
    }

    // Memory (starting shades)
    const mCost = G.memoryCost(s.memoryLevel);
    if (isFinite(mCost) && s.favor >= mCost) {
      s.favor -= mCost;
      s.memoryLevel += 1;
      spent = true;
      continue;
    }

    // Kindle (starting lanterns)
    const kCost = G.kindleCost(s.kindleLevel);
    if (isFinite(kCost) && s.favor >= kCost) {
      s.favor -= kCost;
      s.kindleLevel += 1;
      spent = true;
      continue;
    }

    // Ashen (starting ash)
    const aCost = G.ashenCost(s.ashenLevel);
    if (isFinite(aCost) && s.favor >= aCost) {
      s.favor -= aCost;
      s.ashenLevel += 1;
      spent = true;
      continue;
    }

    // Seat (starting thrones)
    const sCost = G.seatCost(s.seatLevel);
    if (isFinite(sCost) && s.favor >= sCost) {
      s.favor -= sCost;
      s.seatLevel += 1;
      spent = true;
      continue;
    }

    // Depth (starting well depth)
    const dCost = G.depthCost(s.depthLevel);
    if (isFinite(dCost) && s.favor >= dCost) {
      s.favor -= dCost;
      s.depthLevel += 1;
      spent = true;
      continue;
    }
  }

  // Apply edict starting stock for the new run
  G.applyEdictStartingStock(s);
  G.applyAutobindStarts(s);
  return true;
}

// ─── Main simulation loop ───────────────────────────────────────────────────────
console.log("=== Soulgather v" + VERSION + " first-run sim ===");
console.log("T_MAX=" + T_MAX + "s  favor_target=" + FAVOR_TARGET);
console.log("");

let t = 0;
let autobindAcc = 0;
let pyreDevRun = false;
const startWall = Date.now();

while (t < T_MAX) {
  const dt = t < COARSE_AFTER ? DT_FINE : DT_COARSE;
  const s = st();
  const clicksPerSec = s.wellDraws ? CLICKS_IDLE : CLICKS_PER_SEC;

  if (clicksPerSec > 0) {
    const clicks = clicksPerSec * dt;
    for (let c = 0; c < clicks; c++) G.harvest();
  }

  G.applyDt(dt, false);

  autobindAcc += dt;
  if (autobindAcc >= 1) {
    autobindAcc -= 1;
    enableAutobinds();
    runAutobinds();
  }

  greedyBuy(t + dt);

  t += dt;
  t = Math.round(t * 1000) / 1000;

  // Track checkpoints
  const sc = st();
  if (checkpoints.first_shade == null && num(sc.shades) >= 1) mark("first_shade", t);
  if (checkpoints.first_ash == null && N.cmp(sc.ash, 1) >= 0) mark("first_ash", t);
  if (checkpoints.first_pyre == null && N.cmp(sc.pyres, 1) >= 0) mark("first_pyre", t);

  // Tribute when ready
  const pendingFavor = favorNow();
  if (pendingFavor >= 1) {
    const sc2 = st();
    const earned = Number(sc2.favorEarned) || 0;

    // After a few tributes, hold ONE long run to develop censers/pyres
    let shouldTribute = true;
    if (checkpoints.first_pyre == null && earned >= 3 && !pyreDevRun) {
      pyreDevRun = true;
      shouldTribute = false;
    } else if (pyreDevRun && checkpoints.first_pyre == null) {
      shouldTribute = false;
    } else if (pyreDevRun) {
      pyreDevRun = false;
    }

    if (shouldTribute) {
      if (!tributeAndSpend(t)) break;
      autobindAcc = 0;
      if ((Number(st().favorEarned) || 0) >= FAVOR_TARGET) break;
    }
  }
}

const wallMs = Date.now() - startWall;

// ─── Print checkpoints ──────────────────────────────────────────────────────────
console.log("Checkpoints:");
const cpNames = [
  "first_shade", "first_ash", "first_pyre", "first_tribute",
  "first_binding_toll", "first_chalice",
  "favor_2", "favor_5", "favor_10"
];
for (const name of cpNames) {
  const val = checkpoints[name];
  console.log("  CHECKPOINT " + name + " " + (val != null ? val.toFixed(1) + "s" : "NEVER"));
}

const fin = st();
console.log("");
console.log("Final state (t=" + fmtTime(t) + "):");
console.log("  favorEarned=" + (Number(fin.favorEarned) || 0));
console.log("  favor=" + (Number(fin.favor) || 0));
console.log("  edictLevel=" + fin.edictLevel + "  memoryLevel=" + fin.memoryLevel);
console.log("  echoLevel=" + (Number(fin.echoLevel) || 0) + "  seatLevel=" + (Number(fin.seatLevel) || 0));
console.log("  kindleLevel=" + (Number(fin.kindleLevel) || 0) + "  ashenLevel=" + (Number(fin.ashenLevel) || 0));
console.log("  depthLevel=" + (Number(fin.depthLevel) || 0));
console.log("  wall time: " + (wallMs / 1000).toFixed(1) + "s");
console.log("");

// ─── Assert bands ───────────────────────────────────────────────────────────────
let failures = 0;

function assertBand(name, lo, hi) {
  const val = checkpoints[name];
  if (val == null) {
    console.error("BAND FAIL: " + name + " never reached (expected " + lo + "–" + hi + "s)");
    failures++;
    return;
  }
  if (val < lo || val > hi) {
    console.error("BAND FAIL: " + name + " = " + val.toFixed(1) + "s (expected " + lo + "–" + hi + "s)");
    failures++;
    return;
  }
  console.log("BAND OK:   " + name + " = " + val.toFixed(1) + "s  [" + lo + ", " + hi + "]");
}

console.log("Band assertions:");

assertBand("first_shade",   1,    30);
assertBand("first_ash",     10,   1200);
assertBand("first_pyre",    60,   7200);
assertBand("first_tribute", 60,   1200);
assertBand("favor_2",       120,  3600);
assertBand("favor_5",       300,  14400);

if (checkpoints.favor_10 != null) {
  assertBand("favor_10", 600, T_MAX);
} else {
  console.error("BAND FAIL: favor_10 never reached within T_MAX=" + T_MAX + "s");
  failures++;
}

console.log("");
if (failures > 0) {
  console.error(failures + " band assertion(s) FAILED.");
  process.exit(1);
} else {
  console.log("All band assertions passed.");
}
