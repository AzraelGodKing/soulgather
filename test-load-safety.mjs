#!/usr/bin/env node
/**
 * Soulgather v6.10.0 AZR-165 + AZR-168 load-failure / save-sanitise tests.
 * Source contracts + unit tests with mocked localStorage (boot deferred).
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
let failed = 0;

function assertTrue(label, cond) {
  if (!cond) {
    failed += 1;
    console.error("FAIL:", label);
  } else {
    console.log("ok:", label);
  }
}

function assertEqual(label, a, b) {
  if (a !== b) {
    failed += 1;
    console.error("FAIL:", label, "got", a, "expected", b);
  } else {
    console.log("ok:", label);
  }
}

const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");

// --- Source contracts ---
assertTrue(
  "AZR-165 save() early-returns if loadFailed",
  /function save\s*\(\s*\)\s*\{[\s\S]*?if\s*\(\s*loadFailed\s*\)\s*return\s*;/.test(gameSrc)
);
assertTrue(
  "AZR-165 load catch calls beginLoadFailure (no freshState+save wipe)",
  /catch\s*\(\s*err\s*\)\s*\{\s*beginLoadFailure\s*\(\s*raw\s*\)\s*;\s*\}/.test(gameSrc)
);
assertTrue(
  "AZR-165 load catch does not call save()",
  !/catch\s*\(\s*err\s*\)\s*\{[^}]*save\s*\(/.test(gameSrc)
);
assertTrue(
  "AZR-165 SAVE_BAK1_KEY exists",
  /SAVE_BAK1_KEY\s*=\s*"soulgather-v0\.bak1"/.test(gameSrc)
);
assertTrue(
  "AZR-165 SAVE_BAK2_KEY exists",
  /SAVE_BAK2_KEY\s*=\s*"soulgather-v0\.bak2"/.test(gameSrc)
);
assertTrue(
  "AZR-165 BAK1_MS = 60s",
  /BAK1_MS\s*=\s*60\s*\*\s*1000/.test(gameSrc)
);
assertTrue(
  "AZR-165 BAK2_MS = 1h",
  /BAK2_MS\s*=\s*60\s*\*\s*60\s*\*\s*1000/.test(gameSrc)
);
assertTrue(
  "AZR-165 beginLoadFailure helper exists",
  /function beginLoadFailure\s*\(/.test(gameSrc)
);
assertTrue(
  "AZR-165 rotateBackups helper exists",
  /function rotateBackups\s*\(/.test(gameSrc)
);
assertTrue(
  "AZR-165 load-fail notice id in game.js",
  /load-fail-notice/.test(gameSrc)
);
assertTrue(
  "AZR-165 no mid-load save before known-good comment/path",
  /Known-good only:[\s\S]*?save\s*\(\s*\)/.test(gameSrc)
);

// HTML notice present
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
assertTrue("AZR-165 #load-fail-notice in index.html", /id="load-fail-notice"/.test(html));
assertTrue("AZR-165 alertdialog role", /role="alertdialog"/.test(html));
assertTrue(
  "AZR-165 notice title copy",
  /The well's memory could not be read\./.test(html)
);
assertTrue(
  "AZR-165 notice body keeps raw",
  /Your save has not been overwritten/.test(html)
);

// --- Unit: load game with mocks ---
function createStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(k);
    },
    clear() {
      map.clear();
    },
    _map: map
  };
}

function makeEl(id) {
  return {
    id,
    value: "",
    disabled: false,
    classList: {
      _set: new Set(id === "load-fail-notice" ? ["is-hidden"] : []),
      add(c) {
        this._set.add(c);
      },
      remove(c) {
        this._set.delete(c);
      },
      contains(c) {
        return this._set.has(c);
      }
    },
    style: {},
    dataset: {},
    textContent: "",
    innerHTML: "",
    open: false,
    focus() {},
    select() {},
    setAttribute() {},
    getAttribute() {
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
    closest() {
      return null;
    }
  };
}

const elsById = {};
[
  "load-fail-notice",
  "load-fail-raw",
  "load-fail-export",
  "load-fail-restore",
  "load-fail-fresh",
  "toast",
  "memory-panel",
  "memory-text",
  "memory-export",
  "memory-import",
  "reset-btn",
  "gather-btn",
  "souls-count",
  "souls-rate",
  "hollow-status",
  "souls-ash",
  "souls-favor",
  "souls-hymn",
  "souls-wake",
  "souls-knell",
  "next-goal",
  "buy-mode",
  "buy-mode-hint",
  "buy-mode-hint-dismiss",
  "chronicle-list",
  "names-bound",
  "names-bound-list"
].forEach((id) => {
  elsById[id] = makeEl(id);
});

const storage = createStorage({ "soulgather-v0": "KEEP" });

const documentMock = {
  readyState: "loading",
  hidden: false,
  body: makeEl("body"),
  documentElement: makeEl("html"),
  getElementById(id) {
    if (!elsById[id]) elsById[id] = makeEl(id);
    return elsById[id];
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {},
  removeEventListener() {},
  createElement() {
    return makeEl("anon");
  },
  execCommand() {
    return false;
  }
};

const sandbox = {
  console,
  Date,
  Math,
  JSON,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Error,
  TypeError,
  RegExp,
  parseInt,
  parseFloat,
  isFinite,
  isNaN,
  Infinity,
  NaN,
  undefined,
  localStorage: storage,
  document: documentMock,
  navigator: {},
  confirm() {
    return false;
  },
  prompt() {
    return null;
  },
  setTimeout() {
    return 0;
  },
  clearTimeout() {},
  setInterval() {
    return 0;
  },
  clearInterval() {},
  requestAnimationFrame() {
    return 0;
  },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() {
    return {};
  }
};
// num.js/format.js attach to window; game.js reads globalThis — keep them identical.
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

const Eco = sandbox.SoulgatherEconomy;
assertTrue("AZR-165 SoulgatherEconomy exported", !!Eco);
assertTrue("AZR-165 exports isSaveShape", typeof Eco.isSaveShape === "function");
assertTrue("AZR-165 exports SAVE_BAK1_KEY", Eco.SAVE_BAK1_KEY === "soulgather-v0.bak1");
assertTrue("AZR-165 exports SAVE_BAK2_KEY", Eco.SAVE_BAK2_KEY === "soulgather-v0.bak2");
assertTrue("AZR-165 exports SAVE_KEY", Eco.SAVE_KEY === "soulgather-v0");

assertEqual(
  "AZR-165 isSaveShape false for non-object",
  Eco.isSaveShape(null),
  false
);
assertEqual(
  "AZR-165 isSaveShape false for truncated {}",
  Eco.isSaveShape({}),
  false
);
assertEqual(
  "AZR-165 isSaveShape false for souls {m:'not a number'}",
  Eco.isSaveShape({ souls: { m: "not a number", e: 0 }, lifetimeSouls: 0 }),
  false
);
assertEqual(
  "AZR-165 isSaveShape false for NaN souls",
  Eco.isSaveShape({ souls: NaN, lifetimeSouls: 0 }),
  false
);
assertEqual(
  "AZR-165 isSaveShape false for Infinity souls",
  Eco.isSaveShape({ souls: Infinity, lifetimeSouls: 0 }),
  false
);
assertEqual(
  "AZR-165 isSaveShape true minimal number stocks",
  Eco.isSaveShape({ souls: 0, lifetimeSouls: 0 }),
  true
);
assertEqual(
  "AZR-165 isSaveShape true Num shape",
  Eco.isSaveShape({ souls: { m: 1, e: 0 }, lifetimeSouls: { m: 2, e: 1 } }),
  true
);
assertEqual(
  "AZR-165 isSaveShape false non-finite favorEarned",
  Eco.isSaveShape({ souls: 0, lifetimeSouls: 0, favorEarned: Infinity }),
  false
);
assertEqual(
  "AZR-165 isSaveShape true missing favorEarned",
  Eco.isSaveShape({ souls: 1, lifetimeSouls: 2 }),
  true
);

// Unit: save() gated by loadFailed leaves primary byte-identical
Eco.setLoadFailed(true);
Eco.setLoadFailedRaw("BROKEN");
const before = storage.getItem("soulgather-v0");
assertEqual("AZR-165 mock primary before save", before, "KEEP");
Eco.save();
assertEqual(
  "AZR-165 save() while loadFailed leaves primary identical",
  storage.getItem("soulgather-v0"),
  "KEEP"
);

// Unit: beginLoadFailure does not write SAVE_KEY
storage.setItem("soulgather-v0", "KEEP-RAW");
Eco.setLoadFailed(false);
Eco.beginLoadFailure("KEEP-RAW");
assertEqual(
  "AZR-165 beginLoadFailure sets loadFailed",
  Eco.getLoadFailed(),
  true
);
assertEqual(
  "AZR-165 beginLoadFailure does not write SAVE_KEY",
  storage.getItem("soulgather-v0"),
  "KEEP-RAW"
);
assertEqual(
  "AZR-165 beginLoadFailure keeps raw",
  Eco.getLoadFailedRaw(),
  "KEEP-RAW"
);

// AZR-168: isSaveShape rejects malformed souls.m even with extra fields
assertEqual(
  "AZR-168 isSaveShape false for souls.m null payload",
  Eco.isSaveShape({ souls: { m: null, e: 0 }, wellDepth: -5, thrones: -20 }),
  false
);
assertEqual(
  "AZR-168 isSaveShape false souls.m null with lifetimeSouls",
  Eco.isSaveShape({
    souls: { m: null, e: 0 },
    lifetimeSouls: 0,
    wellDepth: -5,
    thrones: -20
  }),
  false
);
assertEqual(
  "AZR-168 isSaveShape false negative favorEarned if present",
  Eco.isSaveShape({ souls: 0, lifetimeSouls: 0, favorEarned: -1 }),
  false
);
assertEqual(
  "AZR-168 isSaveShape true missing favorEarned",
  Eco.isSaveShape({ souls: 1, lifetimeSouls: 2 }),
  true
);

// Import reject must not touch LS (isSaveShape false → importMemory returns before adoptSave)
const importPayload = { souls: { m: null, e: 0 }, wellDepth: -5, thrones: -20 };
storage.setItem("soulgather-v0", "KEEP-IMPORT");
assertEqual("AZR-168 import payload rejected by isSaveShape", Eco.isSaveShape(importPayload), false);
assertEqual(
  "AZR-168 rejected import leaves current save untouched",
  storage.getItem("soulgather-v0"),
  "KEEP-IMPORT"
);

// applySaveData / loadCount sanitise (valid souls; negative counts → 0)
Eco.setLoadFailed(false);
Eco.applySaveData({
  souls: 10,
  lifetimeSouls: 10,
  wellDepth: -5,
  thrones: -20
});
assertEqual("AZR-168 loadCount wellDepth -5 → 0", Eco.getState().wellDepth, 0);
assertEqual("AZR-168 loadCount thrones -20 → 0", Eco.getState().thrones, 0);
assertEqual("AZR-168 loadCount(-5)", Eco.loadCount(-5), 0);
assertEqual("AZR-168 loadCount(-20)", Eco.loadCount(-20), 0);
assertEqual("AZR-168 loadCount(3, 2) caps", Eco.loadCount(3, 2), 2);

// Source: no Number(data. leftover in applySaveData
{
  const applyStart = gameSrc.indexOf("function applySaveData");
  const applyEnd = gameSrc.indexOf("function adoptSave");
  const applyFn = gameSrc.slice(applyStart, applyEnd);
  assertTrue(
    "AZR-168 source: no Number(data. in applySaveData",
    !/Number\(data\./.test(applyFn)
  );
  assertTrue("AZR-168 source: tripwireSanity exists", /function tripwireSanity\s*\(/.test(gameSrc));
  assertTrue(
    "AZR-168 source: save() still gated on loadFailed",
    /function save\s*\(\s*\)\s*\{[\s\S]*?if\s*\(\s*loadFailed\s*\)\s*return\s*;/.test(gameSrc)
  );
  assertTrue("AZR-168 source: sanityAcc 1s tripwire", /sanityAcc\s*\+=\s*dt/.test(gameSrc));
}

// Tripwire: NaN core currency freezes autosave, does not wipe LS
storage.setItem("soulgather-v0", "KEEP-TRIP");
Eco.setLoadFailed(false);
Eco.setLoadFailedRaw(null);
Eco.getState().souls = { m: NaN, e: 0 };
Eco.tripwireSanity();
assertEqual("AZR-168 tripwire sets loadFailed", Eco.getLoadFailed(), true);
assertEqual(
  "AZR-168 tripwire does not wipe LS",
  storage.getItem("soulgather-v0"),
  "KEEP-TRIP"
);
Eco.save();
assertEqual(
  "AZR-168 save() after tripwire leaves LS identical",
  storage.getItem("soulgather-v0"),
  "KEEP-TRIP"
);

if (failed > 0) {
  console.error(failed + " assertion(s) failed");
  process.exit(1);
}
console.log("all load-safety assertions passed");
process.exit(0);
