#!/usr/bin/env bash
# check-e2e-guardrails.sh — block flaky anti-patterns in E2E specs.
#
# Enforces the rules documented in docs/testing/TESTING_STANDARDS.md and
# docs/testing/PLAYWRIGHT_TESTING.md:
#   1. No raw sleeps — use web-first assertions / DSL readiness waits.
#   2. No non-unified Electron launch — specs must go through launchWithDSL()
#      (tests/support), never launch Electron directly.
#
# Reconstructed 2026-07: the original was lost because tools/ was gitignored,
# so it was never committed. Referenced by `npm run test:e2e:guardrails`.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
E2E_DIR="$ROOT/tests/e2e"
status=0

if [[ ! -d "$E2E_DIR" ]]; then
  echo "guardrails: no tests/e2e directory ($E2E_DIR) — nothing to check."
  exit 0
fi

fail() { echo "❌ $1"; status=1; }

# 1) Raw sleeps — inherently flaky; wait on state/assertions instead.
#    Catches page.waitForTimeout(), promise-based setTimeout() sleeps, and raw
#    .wait(<ms>). Deliberately does NOT flag test.setTimeout()/setDefaultTimeout()
#    — those set timeout budgets, they are not sleeps.
sleeps=$(grep -rnE "waitForTimeout\(|new Promise[^;]*setTimeout|\.wait\(\s*[0-9]" "$E2E_DIR" --include='*.ts' || true)
if [[ -n "$sleeps" ]]; then
  fail "Raw sleeps in E2E specs (use web-first assertions / DSL readiness waits):"
  echo "$sleeps"
fi

# 2) Non-unified Electron launch — specs must use launchWithDSL() from tests/support.
launches=$(grep -rnE "_?electron\.launch\(" "$E2E_DIR" --include='*.ts' || true)
if [[ -n "$launches" ]]; then
  fail "Direct Electron launch in E2E specs (use launchWithDSL() from tests/support):"
  echo "$launches"
fi

if [[ "$status" -eq 0 ]]; then
  echo "✅ E2E guardrails passed (no raw sleeps, no direct Electron launches)."
fi
exit "$status"
