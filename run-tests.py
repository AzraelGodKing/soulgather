#!/usr/bin/env python3
"""Run Soulgather node test suites, or report if node is unavailable."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
suites = [
    root / "test-economy.mjs",
    root / "test-load-safety.mjs",
    root / "sim-firstrun.mjs",
]
try:
    for suite in suites:
        print("==>", suite.name)
        r = subprocess.run(["node", str(suite)], cwd=str(root), capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        if r.returncode != 0:
            sys.exit(r.returncode)
except FileNotFoundError:
    print("node not found", file=sys.stderr)
    sys.exit(127)
sys.exit(0)
