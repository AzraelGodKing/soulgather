#!/usr/bin/env node
/**
 * Fail when a commit message in a range carries an AI-tool trailer
 * (Claude / Cursor Agent co-author lines, Claude-Session links,
 * "Generated with Claude Code"). Human Co-authored-by lines are fine.
 *
 *   node check-trailers.mjs [<rev-range>]     default: origin/main..HEAD
 */

import { execFileSync } from "child_process";

const range = process.argv[2] || "origin/main..HEAD";
const AI_TRAILER = new RegExp(
  "^\\s*(" + [
    "co-authored-by:\\s*(claude|cursor agent)\\b.*",
    ".*<(noreply@anthropic\\.com|cursoragent@cursor\\.com)>.*",
    "claude-session:.*",
    ".*generated with \\[claude code\\].*",
    "https://claude\\.ai/code/session_\\S*"
  ].join("|") + ")\\s*$",
  "im"
);

let log;
try {
  log = execFileSync("git", ["log", "--format=%H%x00%s%x00%B%x1e", range], { encoding: "utf8" });
} catch (err) {
  console.error("git log " + range + " failed: " + err.message);
  process.exit(2);
}

const bad = [];
let count = 0;
for (const rec of log.split("\x1e")) {
  if (!rec.trim()) continue;
  const [sha, subject, body] = rec.replace(/^\n/, "").split("\x00");
  count++;
  const m = body.match(AI_TRAILER);
  if (m) bad.push(sha.slice(0, 7) + " " + subject + "\n      " + m[0].trim());
}

if (bad.length) {
  console.error("AI-tool trailers found in " + range + ":");
  for (const line of bad) console.error("  FAIL " + line);
  console.error("Reword those commits (or the squash message) without the trailer lines.");
  process.exit(1);
}
console.log("no AI trailers in " + count + " commit(s) of " + range);
