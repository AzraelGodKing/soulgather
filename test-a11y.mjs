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

// ─── Test 12: version string v6.10.0 ───────────────────────────────────────
console.log("\n─── Test 12: version string ───");
ok(html.includes("v6.10.0"), "footer version string v6.10.0");
ok(E.GAME_VERSION === "6.10.0", "GAME_VERSION is 6.10.0");

// ─── Test 13: gift announcements batched, not per-gift ──────────────────────
console.log("\n─── Test 13: gift announce batching ───");
const grantGiftSrc = gameJsSrc.match(/function grantGift\(g\)\s*\{[^}]*\}/);
ok(grantGiftSrc, "grantGift function found in source");
if (grantGiftSrc) {
  ok(!grantGiftSrc[0].includes("announce("), "grantGift does NOT call announce() directly (batched via flushGiftToasts)");
}
ok(gameJsSrc.includes("announce(msgs[0])"), "single-gift batch announces via flushGiftToasts");
ok(/announce\(\s*msgs\.length\s*\+/.test(gameJsSrc), "multi-gift batch announces count summary");

// ─── Shared node mock for focus / inert tests (AZR-197, AZR-198) ───────────
function mkNode(name, opts = {}) {
  const n = {
    name, disabled: !!opts.disabled, children: opts.children || [], attrs: {},
    classes: new Set(opts.classes || []), textContent: ""
  };
  n.classList = {
    add: (c) => n.classes.add(c),
    remove: (c) => n.classes.delete(c),
    contains: (c) => n.classes.has(c),
    toggle(c, force) {
      const on = force === undefined ? !n.classes.has(c) : !!force;
      if (on) n.classes.add(c); else n.classes.delete(c);
      return on;
    }
  };
  n.setAttribute = (k, v) => { n.attrs[k] = String(v); };
  n.removeAttribute = (k) => { delete n.attrs[k]; };
  n.getAttribute = (k) => (k in n.attrs ? n.attrs[k] : null);
  n.focus = () => { documentMock.activeElement = n; };
  n.contains = (x) => x === n || n.children.some((c) => c.contains(x));
  n.querySelectorAll = () => n.children;
  n.addEventListener = () => {};
  return n;
}
documentMock.body.contains = () => true;
function keyEv(key, shiftKey = false) {
  return { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; } };
}

// ─── Test 14: AZR-196 contrast tokens + non-color Hollow cue ────────────────
console.log("\n─── Test 14: AZR-196 contrast ───");
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255]
    .map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; })
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function cssVar(name) {
  const m = css.match(new RegExp("--" + name + ":\\s*(#[0-9a-fA-F]{6})"));
  return m ? m[1] : null;
}
function cssRule(sel) {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp("(?:^|\\n)" + esc + "\\s*\\{([^}]*)\\}"));
  return m ? m[1] : null;
}
const voidC = cssVar("void");
const panelC = cssVar("panel");
for (const tok of ["crimson-ink", "ash", "gold-dim", "bone-dim"]) {
  const c = cssVar(tok);
  ok(c && contrast(c, voidC) >= 4.5, `--${tok} ${c} ≥4.5:1 on void (${c && contrast(c, voidC).toFixed(2)})`);
  ok(c && contrast(c, panelC) >= 4.5, `--${tok} ${c} ≥4.5:1 on panel (${c && contrast(c, panelC).toFixed(2)})`);
}
ok(contrast(cssVar("ash"), "#1a1416") >= 4.5, "disabled buy text (--ash) ≥4.5:1 on #1a1416");
const hollowRule = cssRule(".souls-hollow");
ok(hollowRule && hollowRule.includes("var(--crimson-ink)"), "Hollow text uses --crimson-ink");
ok(hollowRule && !/opacity:/.test(hollowRule), "Hollow text has no extra opacity");
ok(hollowRule && /border:/.test(hollowRule), "Hollow has a bordered badge (non-color cue)");
ok(/\.souls-hollow::before\s*\{[^}]*content:\s*"\\26A0/.test(css), "Hollow has a warning glyph (non-color cue)");
const disabledRule = cssRule(".card-buy:disabled");
ok(disabledRule && !/opacity:/.test(disabledRule), ".card-buy:disabled has no opacity fade");
ok(disabledRule && /border-style:\s*dashed/.test(disabledRule), ".card-buy:disabled uses a dashed border cue");
ok(!css.includes("#6a5e52"), "old low-contrast disabled text #6a5e52 removed");
ok(/\.card#spirit-card\.can-buy::before,[\s\S]*?repeating-linear-gradient/.test(css),
   "crimson-family can-buy accent bar is dashed (hue-independent)");

// ─── Test 15: AZR-199 buy-mode names, contrast, focus ring ──────────────────
console.log("\n─── Test 15: AZR-199 buy-mode ───");
for (const [mode, label, key] of [["1", "Buy 1 (key 1)", "1"], ["10", "Buy 10 (key 2)", "2"], ["max", "Buy Max (key 3)", "3"]]) {
  const m = html.match(new RegExp('<button[^>]*data-mode="' + mode + '"[^>]*>'));
  ok(m && m[0].includes('aria-label="' + label + '"'), `buy-mode ${mode} accessible name "${label}"`);
  ok(m && m[0].includes('aria-keyshortcuts="' + key + '"'), `buy-mode ${mode} aria-keyshortcuts=${key}`);
  ok(m && m[0].includes("aria-pressed="), `buy-mode ${mode} keeps aria-pressed`);
}
const buyModeBtn = cssRule(".buy-mode-btn");
ok(buyModeBtn && !/opacity:/.test(buyModeBtn), "buy-mode off state has no opacity fade");
ok(buyModeBtn && buyModeBtn.includes("var(--ash)"), "buy-mode off state uses --ash");
ok(contrast(cssVar("ash"), "#120c14") >= 4.5, "buy-mode off text ≥4.5:1 on #120c14");
const buyModeGroup = cssRule(".buy-mode");
ok(buyModeGroup && !/overflow:\s*hidden/.test(buyModeGroup), ".buy-mode no longer clips focus rings");
const buyModeFocus = cssRule(".buy-mode-btn:focus-visible");
ok(buyModeFocus && /outline-offset:\s*-/.test(buyModeFocus), "buy-mode focus ring is inset");
const buyModeOn = cssRule(".buy-mode-btn.is-on");
ok(buyModeOn && /font-weight:\s*700/.test(buyModeOn), "selected buy-mode has a weight cue beyond hue");
ok(/id="buy-mode-hint-dismiss"[^>]*aria-label="Dismiss buy amount hint"/.test(html), "hint dismiss has a specific accessible name");

// ─── Test 16: AZR-197 toast dismiss affordance ──────────────────────────────
console.log("\n─── Test 16: AZR-197 toast dismiss ───");
const toastDiv = html.match(/<div[^>]*id="toast"[^>]*>/);
ok(toastDiv && !toastDiv[0].includes("role="), "#toast container is not itself the live region");
ok(/id="toast-msg"[^>]*role="status"/.test(html), "#toast-msg is the role=status region");
ok(/<button[^>]*id="toast-dismiss"[^>]*aria-label="Dismiss notification"/.test(html), "toast has a focusable dismiss button with a name");
ok(/id="toast-hint"[^>]*aria-hidden="true"/.test(html), "visual Esc hint is aria-hidden (SR gets announce)");

const tMsg = mkNode("toast-msg");
const tHint = mkNode("toast-hint", { classes: ["is-hidden"] });
const tDismiss = mkNode("toast-dismiss");
const tToast = mkNode("toast", { classes: ["is-hidden"], children: [tMsg, tDismiss, tHint] });
const tGather = mkNode("gather-btn");
E._setEls({ toast: tToast, toastMsg: tMsg, toastHint: tHint, gatherBtn: tGather });
E._resetToast();
E._resetAnnouncer();
dateNowVal = 3000000;

E.showToast("first toast");
ok(tMsg.textContent === "first toast", "message written to #toast-msg, not the container");
ok(tToast.children.includes(tDismiss), "dismiss button survives a toast write");
ok(tHint.textContent === "Click or Esc to dismiss" && !tHint.classes.has("is-hidden"), "first toast of session shows dismiss hint");

E.showToast("second");
E.showToast("third");
ok(tHint.textContent.startsWith("Esc for next"), "queued toasts switch hint to Esc-for-next");

E.dismissToastEscape();
let ts = E._getToastState();
ok(tMsg.textContent === "second" && ts.armed, "first Esc advances and arms clear-all");
ok(tToast.classes.has("is-armed"), "armed state is visible on toast chrome");
ok(tHint.textContent === "Esc again clears all", "armed hint text");
ok(announcer.textContent === "Press Escape again to clear all notifications." ||
   E._getAnnounceQueue().includes("Press Escape again to clear all notifications."),
   "armed state is announced via the throttled announcer");

E.dismissToastEscape();
ts = E._getToastState();
ok(!ts.active && ts.queue.length === 0 && !ts.armed, "second Esc clears the queue");
ok(!tToast.classes.has("is-armed") && tToast.classes.has("is-hidden"), "cleared toast hides and disarms");

E.showToast("later");
ok(tHint.classes.has("is-hidden"), "hint stays quiet after the first toast when nothing is queued");
documentMock.activeElement = tDismiss;
E.dismissToastNext();
ok(documentMock.activeElement === tGather, "focus on dismiss returns to the page (not <body>) when the toast closes");

// ─── Test 17: AZR-198 load-fail alertdialog focus management ────────────────
console.log("\n─── Test 17: AZR-198 load-fail dialog ───");
ok(/id="load-fail-notice"[^>]*tabindex="-1"/.test(html), "alertdialog container is programmatically focusable");

const lfRaw = mkNode("load-fail-raw");
const lfExport = mkNode("load-fail-export");
const lfRestore = mkNode("load-fail-restore", { disabled: true });
const lfFresh = mkNode("load-fail-fresh");
const lfDialog = mkNode("load-fail-notice", { classes: ["is-hidden"], children: [lfRaw, lfExport, lfRestore, lfFresh] });
const pageWrap = mkNode("wrap");
const skip = mkNode("skip-link");
const prevFocus = mkNode("prev-button");
E._setEls({
  loadFailNotice: lfDialog, loadFailRaw: lfRaw, loadFailRestore: lfRestore,
  wrap: pageWrap, skipLink: skip, gatherBtn: tGather
});
documentMock.activeElement = prevFocus;
E.showLoadFailNotice();
ok(E.loadFailNoticeOpen(), "notice opens");
ok(documentMock.activeElement === lfDialog, "opening moves focus to the alertdialog");
ok(documentMock.activeElement !== lfFresh, "Start Fresh is not the initial focus target");
ok(pageWrap.attrs.inert === "" && pageWrap.attrs["aria-hidden"] === "true", "page behind dialog is inert + aria-hidden");
ok(skip.attrs.inert === "", "skip link is inert while dialog open");

E.showLoadFailNotice();
ok(documentMock.activeElement === lfDialog, "re-show while open does not steal the saved return focus");

let ev = keyEv("Tab");
E.handleLoadFailKeydown(ev);
ok(ev.prevented && documentMock.activeElement === lfRaw, "Tab from dialog enters first control");
E.handleLoadFailKeydown(keyEv("Tab"));
ok(documentMock.activeElement === lfExport, "Tab → Export");
E.handleLoadFailKeydown(keyEv("Tab"));
ok(documentMock.activeElement === lfFresh, "Tab skips disabled Restore → Start Fresh");
E.handleLoadFailKeydown(keyEv("Tab"));
ok(documentMock.activeElement === lfRaw, "Tab wraps from last to first");
E.handleLoadFailKeydown(keyEv("Tab", true));
ok(documentMock.activeElement === lfFresh, "Shift+Tab wraps from first to last");

const loadFailedBefore = E.getLoadFailed();
ev = keyEv("Escape");
E.handleLoadFailKeydown(ev);
ok(ev.prevented && documentMock.activeElement === lfFresh, "Esc keeps focus where it is inside the dialog");
ok(E.loadFailNoticeOpen() && E.getLoadFailed() === loadFailedBefore, "Esc does not close the dialog or Start Fresh");
documentMock.activeElement = prevFocus;
E.handleLoadFailKeydown(keyEv("Escape"));
ok(documentMock.activeElement === lfDialog, "Esc with focus outside pulls focus back into the dialog");

documentMock.activeElement = lfExport;
E.hideLoadFailNotice();
ok(!E.loadFailNoticeOpen(), "notice closes");
ok(!("inert" in pageWrap.attrs) && !("aria-hidden" in pageWrap.attrs), "page inert/aria-hidden removed on close");
ok(documentMock.activeElement === prevFocus, "focus restored to the pre-dialog element");
E.hideLoadFailNotice();
ok(documentMock.activeElement === prevFocus, "hide while already closed leaves focus alone");

// ─── Summary ────────────────────────────────────────────────────────────────
console.log("\n" + (failed ? "FAILED " + failed + " / " + (passed + failed) : "all " + passed + " a11y assertions passed"));
process.exit(failed ? 1 : 0);
