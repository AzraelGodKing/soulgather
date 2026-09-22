#!/usr/bin/env node
/**
 * Soulgather accessibility tests (AZR-191).
 * Verifies: announcer throttle, reduced-motion ripple skip, aria-live not on souls-display.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

function makeEl(id) {
  return {
    id, value: "", disabled: false,
    _children: [],
    classList: {
      _set: new Set(id === "load-fail-notice" ? ["is-hidden"] : []),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._set.has(c)) { this._set.delete(c); return false; }
          this._set.add(c); return true;
        }
        if (force) { this._set.add(c); } else { this._set.delete(c); }
        return !!force;
      }
    },
    style: {}, dataset: {}, textContent: "", innerHTML: "", open: false,
    focus() {}, select() {},
    setAttribute(k, v) { this["_attr_" + k] = v; },
    getAttribute(k) { return this["_attr_" + k] || null; },
    addEventListener() {}, removeEventListener() {},
    querySelectorAll() { return []; },
    querySelector(sel) {
      if (sel === ".verb") return makeEl("verb");
      if (sel === ".noun") return makeEl("noun");
      return null;
    },
    closest() { return null; },
    appendChild(c) { this._children.push(c); },
    removeChild(c) {
      const i = this._children.indexOf(c);
      if (i >= 0) this._children.splice(i, 1);
    },
    get parentNode() { return null; },
    get offsetWidth() { return 0; }
  };
}

const elsById = {};

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

const storage = createStorage();
let dateNowVal = 1000000;

const documentMock = {
  readyState: "loading",
  hidden: false,
  body: makeEl("body"),
  documentElement: makeEl("html"),
  getElementById(id) {
    if (!elsById[id]) elsById[id] = makeEl(id);
    return elsById[id];
  },
  addEventListener() {},
  removeEventListener() {},
  querySelectorAll() { return []; },
  querySelector() { return null; },
  createElement() { return makeEl("anon"); },
  execCommand() { return false; }
};

const sandbox = {
  console, Math, JSON, Number, String, Boolean, Array, Object,
  Error, TypeError, RegExp, parseInt, parseFloat, isFinite, isNaN,
  Infinity, NaN, undefined,
  Date: { now() { return dateNowVal; } },
  localStorage: storage,
  document: documentMock,
  navigator: {},
  confirm() { return false; },
  prompt() { return null; },
  setTimeout(fn) { const id = setTimeout(fn, 0); return id; },
  clearTimeout: globalThis.clearTimeout,
  setInterval() { return 0; },
  clearInterval() {},
  requestAnimationFrame() { return 0; },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() { return {}; },
  matchMedia() { return { matches: false, addEventListener() {} }; }
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

const E = sandbox.SoulgatherEconomy;

let passed = 0;
let failed = 0;
function ok(cond, msg) {
  if (cond) { console.log("ok   " + msg); passed++; }
  else { console.log("FAIL " + msg); failed++; }
}

// ─── Test 1: aria-live is NOT on .souls-display in index.html ───────────────
console.log("\n─── Test 1: aria-live not on souls-display ───");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const soulsDisplayMatch = html.match(/<section[^>]*class="souls-display"[^>]*>/);
ok(soulsDisplayMatch, "souls-display section found in HTML");
if (soulsDisplayMatch) {
  ok(!soulsDisplayMatch[0].includes("aria-live"), "souls-display has no aria-live attribute");
}

// ─── Test 2: #a11y-announcer exists in HTML ─────────────────────────────────
console.log("\n─── Test 2: a11y-announcer in HTML ───");
ok(html.includes('id="a11y-announcer"'), "a11y-announcer element exists in HTML");
ok(/id="a11y-announcer"[^>]*role="status"/.test(html) ||
   /role="status"[^>]*id="a11y-announcer"/.test(html), "a11y-announcer has role=status");

// ─── Test 3: announcer throttle ─────────────────────────────────────────────
console.log("\n─── Test 3: announcer throttle ───");
E._resetAnnouncer();
const announcer = elsById["a11y-announcer"] || documentMock.getElementById("a11y-announcer");

dateNowVal = 1000000;
E.announce("first");
ok(announcer.textContent === "first", "first announce immediate");

dateNowVal = 1000000 + 500;
E.announce("second");
ok(announcer.textContent === "first", "second announce throttled (still shows first)");
ok(E._getAnnounceQueue().length === 1, "second announce queued");

E._resetAnnouncer();
dateNowVal = 2000000;
E.announce("third");
ok(announcer.textContent === "third", "third announce after reset passes");

// ─── Test 4: reduced-motion flag skips spawnRipple DOM ──────────────────────
console.log("\n─── Test 4: reduced-motion skips spawnRipple ───");

E.setReduceMotion(false);
ok(!E.reduceMotionActive(), "reduceMotionActive() is false when setting off");

E.setReduceMotion(true);
ok(E.reduceMotionActive(), "reduceMotionActive() is true when setting on");

const gameJsSrc = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
ok(gameJsSrc.includes("function spawnRipple"), "spawnRipple function exists");
ok(/function spawnRipple[^{]*\{[\s\n]*if\s*\(reduceMotionActive\(\)\)\s*return/.test(gameJsSrc),
   "spawnRipple guards on reduceMotionActive()");

E.setReduceMotion(false);

// ─── Test 5: invalid role="note" not in HTML ────────────────────────────────
console.log("\n─── Test 5: no invalid role=note ───");
ok(!html.includes('role="note"'), 'no role="note" in index.html');

// ─── Test 6: skip link exists ───────────────────────────────────────────────
console.log("\n─── Test 6: skip link ───");
ok(html.includes('class="skip-link"'), "skip link element exists");
ok(html.includes('href="#chronicle"'), "skip link targets chronicle");
const bodyStart = html.indexOf("<body>");
const skipIdx = html.indexOf('class="skip-link"', bodyStart);
const wrapIdx = html.indexOf('class="wrap"', bodyStart);
ok(skipIdx > bodyStart && skipIdx < wrapIdx, "skip link is first visible element in DOM (before .wrap)");

// ─── Test 7: head metadata ──────────────────────────────────────────────────
console.log("\n─── Test 7: head metadata ───");
ok(html.includes('name="description"'), "meta description present");
ok(html.includes('name="theme-color"'), "meta theme-color present");
ok(html.includes('property="og:title"'), "OG title present");
ok(html.includes('property="og:description"'), "OG description present");
ok(html.includes('name="twitter:card"'), "Twitter card present");
ok(html.includes('rel="icon"'), "favicon present");

// ─── Test 8: in-game reduced-motion toggle in HTML ──────────────────────────
console.log("\n─── Test 8: reduced-motion toggle ───");
ok(html.includes('id="reduced-motion-toggle"'), "reduced-motion toggle exists in HTML");
const toggleLabel = html.match(/<label[^>]*id="reduced-motion-label"[^>]*>/);
ok(toggleLabel && toggleLabel[0].includes("reset-btn"), "toggle label uses existing reset-btn chrome");

// ─── Test 9: prefers-reduced-motion CSS ─────────────────────────────────────
console.log("\n─── Test 9: reduced-motion CSS ───");
const css = fs.readFileSync(path.join(root, "css", "style.css"), "utf8");
ok(css.includes("prefers-reduced-motion: reduce"), "prefers-reduced-motion media query in CSS");
ok(css.includes(".reduce-motion"), "in-game .reduce-motion class rules in CSS");

// ─── Test 9b: announcer uses real visually-hidden, not display:none ─────────
console.log("\n─── Test 9b: announcer is visually-hidden (not display:none) ───");
const srOnlyBlock = css.match(/\.sr-only\s*\{([^}]*)\}/);
ok(srOnlyBlock, ".sr-only CSS rule exists");
if (srOnlyBlock) {
  ok(!srOnlyBlock[1].includes("display: none") && !srOnlyBlock[1].includes("display:none"),
     ".sr-only does not use display:none");
  ok(!srOnlyBlock[1].includes("visibility: hidden") && !srOnlyBlock[1].includes("visibility:hidden"),
     ".sr-only does not use visibility:hidden");
  ok(srOnlyBlock[1].includes("position: absolute") || srOnlyBlock[1].includes("position:absolute"),
     ".sr-only uses position:absolute");
  ok(srOnlyBlock[1].includes("clip"), ".sr-only uses clip");
}

// ─── Test 10: souls-count is focusable ──────────────────────────────────────
console.log("\n─── Test 10: souls-count focusable ───");
const soulsCountMatch = html.match(/<div[^>]*id="souls-count"[^>]*>/);
ok(soulsCountMatch, "souls-count element found");
if (soulsCountMatch) {
  ok(soulsCountMatch[0].includes('tabindex="0"'), "souls-count has tabindex=0");
  ok(soulsCountMatch[0].includes('aria-label="Soul counter"'), "souls-count has static aria-label");
}

// ─── Test 10b: no per-frame aria-label rewrite ──────────────────────────────
console.log("\n─── Test 10b: no per-frame aria-label rewrite ───");
ok(!gameJsSrc.includes('setAttribute("aria-label", "Souls:'), "no per-frame aria-label rewrite on souls-count");

// ─── Test 11: .is-hidden still display:none ─────────────────────────────────
console.log("\n─── Test 11: is-hidden intact ───");
const hiddenMatch = css.match(/\.card\.is-hidden\s*\{[^}]*display:\s*none/);
ok(hiddenMatch, ".card.is-hidden { display: none } intact");

// ─── Test 12: version string v6.9.1 ────────────────────────────────────────
console.log("\n─── Test 12: version string ───");
ok(html.includes("v6.9.1"), "footer version string v6.9.1");
ok(E.GAME_VERSION === "6.9.1", "GAME_VERSION is 6.9.1");

// ─── Test 13: gift announcements batched, not per-gift ──────────────────────
console.log("\n─── Test 13: gift announce batching ───");
const grantGiftSrc = gameJsSrc.match(/function grantGift\(g\)\s*\{[^}]*\}/);
ok(grantGiftSrc, "grantGift function found in source");
if (grantGiftSrc) {
  ok(!grantGiftSrc[0].includes("announce("), "grantGift does NOT call announce() directly (batched via flushGiftToasts)");
}
ok(gameJsSrc.includes("announce(msgs[0])"), "single-gift batch announces via flushGiftToasts");
ok(/announce\(\s*msgs\.length\s*\+/.test(gameJsSrc), "multi-gift batch announces count summary");

// ─── Summary ────────────────────────────────────────────────────────────────
console.log("\n" + (failed ? "FAILED " + failed + " / " + (passed + failed) : "all " + passed + " a11y assertions passed"));
process.exit(failed ? 1 : 0);
