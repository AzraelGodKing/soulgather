#!/usr/bin/env node
/**
 * Real-browser smoke test: boots index.html from file:// in headless Chromium.
 *
 * The other suites run the game in a vm sandbox with a mocked DOM, which
 * cannot see layout-dependent behaviour (focus inside a closed <details>,
 * hidden elements, real localStorage). This one checks the shipped page:
 * no page errors, Draw and the hotkeys work, Memory export's copy fallback
 * fills and focuses the textarea, and the save survives a reload.
 *
 * Needs the `playwright` package and its Chromium. CI installs both; locally
 * the suite is skipped when playwright is missing (it fails under CI=true).
 */

import path from "path";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (err) {
  if (process.env.CI) {
    console.error("playwright is not installed: " + err.message);
    process.exit(1);
  }
  console.log("skip: playwright not installed (npm install --no-save playwright)");
  process.exit(0);
}

let passed = 0;
let failed = 0;
function assertTrue(label, cond, detail) {
  if (cond) {
    passed++;
    console.log("ok   " + label);
  } else {
    failed++;
    console.log("FAIL " + label + (detail === undefined ? "" : " (" + detail + ")"));
  }
}

const pageUrl = pathToFileURL(path.join(root, "index.html")).href;
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(pageUrl);
  await page.waitForFunction(() => !!globalThis.SoulgatherGame);

  const soulsText = () => page.textContent("#souls-count");
  assertTrue("fresh page starts at 0 souls", (await soulsText()).trim() === "0", await soulsText());

  for (let i = 0; i < 25; i++) await page.click("#gather-btn");
  assertTrue("Draw button gathers souls", (await soulsText()).trim() !== "0", await soulsText());

  const before = await soulsText();
  await page.focus("body");
  for (let i = 0; i < 5; i++) await page.keyboard.press("Space");
  assertTrue("Space hotkey draws", (await soulsText()) !== before, before + " -> " + (await soulsText()));

  for (const key of ["1", "2", "3", "t", "n", "v", "w", "g", "c", "u", "h", "l", "s", "b", "p", "k"]) {
    await page.keyboard.press(key);
  }
  assertTrue("every hotkey runs without a page error", errors.length === 0, errors.join(" | "));

  // Memory export with no async clipboard and the panel closed: the
  // execCommand fallback must open the panel before it focuses and selects
  // the textarea, since nothing inside a closed <details> can take focus.
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    document.getElementById("memory-panel").open = false;
    document.getElementById("memory-export").click();
  });
  const exported = await page.evaluate(() => {
    const ta = document.getElementById("memory-text");
    return {
      open: document.getElementById("memory-panel").open,
      focused: document.activeElement === ta,
      value: ta.value
    };
  });
  let parsed = null;
  try { parsed = JSON.parse(exported.value); } catch (e) { /* asserted below */ }
  assertTrue("export fallback keeps the Memory panel open", exported.open);
  assertTrue("export fallback focuses the textarea", exported.focused);
  assertTrue("export fallback writes the save JSON", !!parsed && typeof parsed === "object", exported.value.slice(0, 60));

  // pagehide flushes the save; a reload must restore the souls.
  const soulsBeforeReload = await soulsText();
  await page.reload();
  await page.waitForFunction(() => !!globalThis.SoulgatherGame);
  const soulsAfterReload = await soulsText();
  assertTrue("save survives a reload", soulsAfterReload.trim() !== "0", soulsBeforeReload + " -> " + soulsAfterReload);

  assertTrue("no page or console errors", errors.length === 0, errors.join(" | "));
} finally {
  await browser.close();
}

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
