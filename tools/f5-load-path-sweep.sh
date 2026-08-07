#!/usr/bin/env bash
# f5-load-path-sweep.sh — regenerate the SOURCE-SIDE population for F5's
# `loadDashboard` regression sweep, and the consumer mapping derived from it.
#
# WHY THIS EXISTS. PR #137's published sweep grepped TEST-FILE SPELLING —
# `grep -rlE "loadDashboard|loadYaml|openFile|..." tests/e2e tests/integration` —
# and reported the resulting 20 files as proof of "every load path, zero
# under-inclusion". That command enumerates specs that happen to MENTION those
# tokens. It cannot enumerate the specs that REACH a production `loadDashboard`
# call site, because a spec that clicks a template tile never spells the word.
# The independent review of PR #137 (M4) found three consumers missing that way;
# running this script finds six.
#
# ⭐ THE RULE IT ENCODES: a population claim needs an enumeration of the
# POPULATION, and the enumeration has to be mechanical and re-runnable. Start at
# the production call sites — the thing the change actually touches — and walk
# outward to the controls that reach them and the specs that drive those
# controls. A count of files containing a token is not a count of files
# exercising a behaviour.
#
# ⚠ WHAT THIS SCRIPT DOES NOT DO. Step 3's control-to-spec hop is mechanical but
# not exhaustive on its own: a spec can reach a control through a DSL method, so
# the script reports BOTH the direct spec references and the DSL files, and the
# DSL files must then be resolved to their callers. Every hop it cannot make is
# printed rather than silently skipped.
#
# USAGE:  bash tools/f5-load-path-sweep.sh
set -uo pipefail
cd "$(dirname "$0")/.."

echo "=============================================================="
echo "1. PRODUCTION loadDashboard CALL SITES (the population)"
echo "=============================================================="
grep -rnE '\bloadDashboard\s*\(' src/ --include=*.ts --include=*.tsx \
  | grep -v 'loadDashboard: ' \
  | grep -vE '^\S+:[0-9]+:\s*(//|\*)' \
  | sort -t: -k2 -n

echo
echo "=============================================================="
echo "2. ENTRY CONTROLS that reach those call sites"
echo "=============================================================="
for testid in \
  toolbar-new-dashboard \
  new-dashboard-blank-option \
  new-dashboard-sections-option \
  new-dashboard-template-option \
  new-dashboard-entity-type-option \
  yaml-apply-button \
  dashboard-browser-modal; do
  printf '  %-34s -> ' "$testid"
  grep -rl "$testid" src/ --include=*.tsx | tr '\n' ' '
  echo
done

echo
echo "=============================================================="
echo "3. CONSUMERS — specs and DSL modules that drive those controls"
echo "=============================================================="
for testid in \
  toolbar-new-dashboard \
  new-dashboard-blank-option \
  new-dashboard-sections-option \
  new-dashboard-template-option \
  new-dashboard-entity-type-option \
  yaml-apply-button \
  dashboard-browser-modal; do
  echo "  --- $testid ---"
  specs=$(grep -rl "$testid" tests/e2e tests/integration --include=*.spec.ts 2>/dev/null | sort)
  dsls=$(grep -rl "$testid" tests/support --include=*.ts 2>/dev/null | sort)
  if [ -n "$specs" ]; then echo "$specs" | sed 's/^/      spec: /'; fi
  if [ -n "$dsls" ]; then echo "$dsls" | sed 's/^/      DSL : /'; fi
  if [ -z "$specs$dsls" ]; then echo "      (no consumer — this control has no test driving it)"; fi
done

echo
echo "=============================================================="
echo "4. THE mode:'edit' BOUNDARY — does anything cross the Apply confirm?"
echo "=============================================================="
echo "  Only the OK handler of the Apply confirmation reaches"
echo "  handleApplyYamlChanges -> loadDashboard(..., { mode: 'edit' })."
echo "  Specs that click it:"
grep -rn 'Apply & Reload' tests/ --include=*.ts | sed 's/^/      /' \
  || echo "      (NONE — the mode:'edit' load path has no end-to-end consumer)"

echo
echo "=============================================================="
echo "5. FOR CONTRAST — the token-spelling list PR #137 originally published"
echo "=============================================================="
grep -rlE 'loadDashboard|loadYaml|openFile|dashboard-generator|handleCardDropIntoContainer|onCardDropIntoContainer' \
  tests/e2e tests/integration --include=*.spec.ts | sort | sed 's/^/      /'
