#!/usr/bin/env python3
"""Run Soulgather CI steps locally, or report if node is unavailable."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent

checks = [["node", str(root / "check-syntax.mjs")]]
suites = [
    root / "test-economy.mjs",
    root / "sim-firstrun.mjs",
    root / "test-load-safety.mjs",
    root / "test-fields.mjs",
    root / "test-gifts.mjs",
    root / "test-a11y.mjs",
]
eslint = ["npx", "--yes", "eslint@8", "js/"]
try:
    for cmd in checks:
        print("==>", " ".join(cmd))
        r = subprocess.run(cmd, cwd=str(root), capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        if r.returncode != 0:
            sys.exit(r.returncode)
    for suite in suites:
        print("==>", suite.name)
        r = subprocess.run(["node", str(suite)], cwd=str(root), capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        if r.returncode != 0:
            sys.exit(r.returncode)
    print("==> ESLint")
    r = subprocess.run(eslint, cwd=str(root), capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    if r.returncode != 0:
        sys.exit(r.returncode)
except FileNotFoundError:
    print("node not found", file=sys.stderr)
    sys.exit(127)
sys.exit(0)
