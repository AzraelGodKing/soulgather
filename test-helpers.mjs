/**
 * Shared DOM-sandbox helpers for Soulgather test suites and tooling scripts.
 * Extracted from the identical setup blocks in test-*.mjs / sim-firstrun.mjs /
 * generate-fixture.mjs.  Only truly common code lives here; per-file
 * differences stay in the consuming files.
 */

import fs from "fs";
import path from "path";
import vm from "vm";

export function createStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(k); },
    clear() { map.clear(); },
    _map: map
  };
}

export function makeEl(id) {
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

export const DEFAULT_EL_IDS = [
  "load-fail-notice", "load-fail-raw", "load-fail-export",
  "load-fail-restore", "load-fail-fresh", "toast",
  "memory-panel", "memory-text", "memory-export", "memory-import",
  "reset-btn", "gather-btn", "souls-count", "souls-rate",
  "hollow-status", "souls-ash", "souls-favor", "souls-hymn",
  "souls-wake", "souls-knell", "next-goal", "buy-mode",
  "buy-mode-hint", "buy-mode-hint-dismiss", "chronicle-list",
  "names-bound", "names-bound-list", "vow-status"
];

export function createTestSandbox(root, opts) {
  const o = opts || {};
  const storage = createStorage(o.storageInit);

  const elsById = {};
  (o.elIds || DEFAULT_EL_IDS).forEach(function (id) { elsById[id] = makeEl(id); });

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
  if (o.sandboxOverrides) Object.assign(sandbox, o.sandboxOverrides);
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  function loadScript(rel) {
    var code = fs.readFileSync(path.join(root, rel), "utf8");
    vm.runInContext(code, sandbox, { filename: rel });
  }

  return { sandbox: sandbox, elsById: elsById, storage: storage, documentMock: documentMock, loadScript: loadScript };
}
