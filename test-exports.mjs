#!/usr/bin/env node
/**
 * Every namespace key a harness reads must exist after loadGame.
 *
 * Scans each *.mjs harness for `const X = sandbox.SoulgatherY;` and then
 * every `X.key` use, and fails on keys the loaded namespace lacks. Catches a
 * cleanup that drops an export another change still reads, with the file and
 * key named, before the suite that reads it crashes halfway through.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTestSandbox, loadGame } from "./test-helpers.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const { sandbox } = createTestSandbox(root);
loadGame(sandbox);

const harnesses = fs.readdirSync(root)
  .filter((f) => f.endsWith(".mjs") && f !== "test-exports.mjs" && f !== "test-helpers.mjs" && f !== "check-syntax.mjs")
  .sort();

let checked = 0;
const missing = [];

for (const file of harnesses) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const aliases = {};
  for (const m of src.matchAll(/\bconst\s+(\w+)\s*=\s*sandbox\.(Soulgather\w+)\s*;/g)) {
    aliases[m[1]] = m[2];
  }
  for (const [alias, ns] of Object.entries(aliases)) {
    const obj = sandbox[ns];
    if (!obj) {
      missing.push(file + ": sandbox." + ns + " is not defined");
      continue;
    }
    const keys = new Set();
    const use = new RegExp("(?<![\\w.$])" + alias + "\\.([A-Za-z_$][\\w$]*)", "g");
    for (const m of src.matchAll(use)) keys.add(m[1]);
    for (const k of keys) {
      checked++;
      if (!(k in obj)) missing.push(file + ": " + alias + "." + k + " (" + ns + ")");
    }
  }
}

if (missing.length) {
  console.error("Harnesses read keys the game does not export:");
  for (const line of missing) console.error("  FAIL " + line);
  process.exit(1);
}
console.log("all " + checked + " harness namespace keys exist (" + harnesses.length + " files)");
