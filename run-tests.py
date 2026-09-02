#!/usr/bin/env python3
"""Run test-economy.mjs via node, or report if node is unavailable."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
cmd = ["node", str(root / "test-economy.mjs")]
try:
    r = subprocess.run(cmd, cwd=str(root), capture_output=True, text=True)
except FileNotFoundError:
    print("node not found", file=sys.stderr)
    sys.exit(127)
sys.stdout.write(r.stdout)
sys.stderr.write(r.stderr)
sys.exit(r.returncode)
