#!/usr/bin/env bash
# test-headless.sh — run Playwright/Electron tests against a virtual X display.
#
# WHY: under WSL2 + WSLg, every Electron window Playwright launches is rendered
# onto the real Windows desktop and STEALS FOCUS — you can't use the machine
# while a suite runs. Xvfb is a headless in-memory X server; pointing the tests
# at it keeps the windows off-screen. (Verified: visual-regression snapshots
# still match their baselines under Xvfb software rendering.)
#
# HOW:
#   - `env -u WAYLAND_DISPLAY` drops Wayland so Electron/Chromium takes the X11
#     path; otherwise it ignores $DISPLAY and goes back to WSLg.
#   - `xvfb-run -a` starts an Xvfb server on the first free display and cleans it
#     up on exit.
#   - A fixed 1920x1080 screen is large enough for the app window and avoids the
#     WSLg dynamic-resize artifact behind some viewport-clamp visual flakes.
#
# USAGE (any `playwright test` args are forwarded verbatim):
#   bash tools/test-headless.sh --project=electron-e2e
#   bash tools/test-headless.sh tests/e2e/sparkline.spec.ts --workers=1
# Or via the npm wrappers: npm run test:e2e:headless / test:integration:headless.
#
# Requires Xvfb (`sudo apt-get install xvfb` — ships xvfb-run). On a headless
# host with no Wayland/X (e.g. CI) this still works; it is a no-op improvement.
set -uo pipefail

if ! command -v xvfb-run >/dev/null 2>&1; then
  echo "ERROR: xvfb-run not found. Install it with: sudo apt-get install -y xvfb" >&2
  echo "       (Or run the raw 'npm run test:e2e' — but Electron windows will steal focus under WSLg.)" >&2
  exit 127
fi

exec env -u WAYLAND_DISPLAY xvfb-run -a --server-args="-screen 0 1920x1080x24" \
  npx playwright test "$@"
