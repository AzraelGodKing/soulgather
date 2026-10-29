#!/usr/bin/env node
/** `node --check` every js/*.js file. Plain Node so `npm run check` works on any OS. */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(path.join(root, "js")).filter((f) => f.endsWith(".js")).sort();

for (const f of files) {
  const rel = path.join("js", f);
  const r = spawnSync(process.execPath, ["--check", rel], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log("syntax ok: " + files.length + " files");
