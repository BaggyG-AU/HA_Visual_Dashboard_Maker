#!/usr/bin/env bash
# check-pr-evidence.sh — an ADVISORY pre-submit check over the evidence surfaces
# that no other gate touches: the LIVE pull-request body, and the Markdown and
# shell files a branch changes.
#
# WHY THIS EXISTS. PR #137 took SIX independent review rounds. Every finding in
# all six was an EVIDENCE defect — `src/` was cleared in round 1 and never moved
# again. Two findings accounted for five rounds each:
#   M4    a completeness claim in tools/f5-load-path-sweep.sh that the script's
#         own behaviour contradicted;
#   R2-m1 a count in the LIVE PR BODY that went stale and was republished in
#         four consecutive rounds.
# Measured afterwards, the reason is structural rather than personal:
#   src/            zero defects in six rounds  -> lint + typecheck + unit
#   tests/          closed in round 2           -> lint + typecheck
#   tools/*.sh      M4, five rounds             -> NOTHING. `prettier --file-info`
#                                                  returns `inferredParser: null`
#                                                  for shell; no shellcheck here.
#   the PR body     R2-m1, five rounds          -> NOTHING. It is not a file.
# ⭐ THE MOST HEAVILY GATED ARTIFACT WAS NEVER WRONG ONCE; THE TWO ARTIFACTS THAT
#   CARRIED THE FIVE-ROUND FINDINGS ARE GATED BY NOTHING AT ALL. This script
#   points a check at the actual failure surface.
#
# ⚠⚠⚠ WHAT THIS SCRIPT IS, STATED PRECISELY, BECAUSE OVERSTATING AN INSTRUMENT IS
# THE EXACT DEFECT IT EXISTS TO CATCH:
#   - It is a GREP over text. It flags CANDIDATES for a human to justify or
#     delete. It CANNOT decide whether a claim is true.
#   - Section 3 (commit SHAs) is the only genuinely DECIDABLE part: whether a SHA
#     is HEAD, an ancestor of HEAD, or unknown to this repository is a fact, and
#     it is checked with `git`, not with a pattern.
#   - It does NOT claim to find every stale count or every unverified universal.
#     No fixed word list can. It reports what its stated patterns matched.
#
# USAGE:
#   bash tools/check-pr-evidence.sh            # PR for the current branch
#   bash tools/check-pr-evidence.sh 137        # a specific PR number
#   bash tools/check-pr-evidence.sh --no-pr    # changed files only, no gh call
# Exit code is 0 unless --strict is passed, in which case any finding exits 1.
# It is ADVISORY BY DEFAULT ON PURPOSE: a noisy blocking gate gets ignored, and
# an ignored gate is worse than none.

set -uo pipefail
cd "$(dirname "$0")/.."

STRICT=0
PR_NUM=""
USE_PR=1
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=1 ;;
    --no-pr) USE_PR=0 ;;
    '' | *[!0-9]*) ;;
    *) PR_NUM="$arg" ;;
  esac
done

FINDINGS=0
note() {
  FINDINGS=$((FINDINGS + 1))
  printf '  %s\n' "$1"
}

BASE="${HAVDM_BASE_REF:-origin/main}"

echo "=============================================================="
echo "check-pr-evidence — the surfaces no other gate covers"
echo "=============================================================="
echo "  base ref: $BASE"

# --------------------------------------------------------------------------
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT
HAVE_BODY=0

if [ "$USE_PR" -eq 1 ] && command -v gh >/dev/null 2>&1; then
  if [ -z "$PR_NUM" ]; then
    PR_NUM="$(gh pr view --json number --jq .number 2>/dev/null || true)"
  fi
  if [ -n "$PR_NUM" ] && gh pr view "$PR_NUM" --json body --jq .body >"$BODY_FILE" 2>/dev/null; then
    HAVE_BODY=1
    echo "  live PR body: #$PR_NUM ($(wc -l <"$BODY_FILE") lines)"
    echo "  ⭐ READ FROM THE LIVE PR, NOT A LOCAL COPY — checking the local copy is"
    echo "     how a stale count survived a whole review round on #137."
  else
    echo "  ⚠ no PR body available (no open PR for this branch, or gh not authed)"
  fi
else
  echo "  (PR body check skipped)"
fi

# Changed Markdown and shell files — the other ungated surface.
#
# ⚠⚠⚠ INCLUDE UNCOMMITTED AND UNTRACKED WORK. The first version of this script
# scanned only `git diff "$BASE"...HEAD`, so running it PRE-SUBMIT on a dirty
# tree — the exact moment it is most useful — scanned nothing and printed a
# falsely clean "0 findings". Caught by dogfooding it on its own branch. That is
# the same class of defect this script exists to catch: AN INSTRUMENT THAT DOES
# NOT MEASURE WHAT ITS USER BELIEVES IT MEASURES. The three sources below are
# unioned so the answer does not depend on whether you have committed yet.
mapfile -t CHANGED < <(
  {
    git diff --name-only "$BASE"...HEAD -- '*.md' '*.sh' 2>/dev/null
    git diff --name-only HEAD -- '*.md' '*.sh' 2>/dev/null
    git ls-files --others --exclude-standard -- '*.md' '*.sh' 2>/dev/null
  } | sort -u
)
echo "  changed .md/.sh (committed + uncommitted + untracked): ${#CHANGED[@]}"
for f in "${CHANGED[@]}"; do echo "      $f"; done

echo
echo "=============================================================="
echo "1. COUNTS PRESENTED AS EVIDENCE"
echo "=============================================================="
echo "  A count is a MEASUREMENT and needs the enumeration that backs it."
echo "  ⚠ A count sitting beside the table it summarises is a SECOND SOURCE OF"
echo "    TRUTH and drifts the moment a row changes. Prefer deleting the count"
echo "    and publishing the command."
echo
COUNT_RE='[^0-9a-zA-Z_]([0-9]{1,6})[[:space:]]+(specs?|files?|tests?|paths?|rows?|call sites?|drawers?|cards?|legs?|passed|failed|skipped|warnings?|errors?)\b'
scan_counts() {
  grep -nEo "$COUNT_RE" "$1" 2>/dev/null | sed "s|^|      $1:|" || true
}
if [ "$HAVE_BODY" -eq 1 ]; then
  OUT="$(grep -nEo "$COUNT_RE" "$BODY_FILE" 2>/dev/null | sed 's|^|      PR body line |' || true)"
  if [ -n "$OUT" ]; then
    note "counts in the LIVE PR body — justify each or delete it:"
    printf '%s\n' "$OUT"
  else
    echo "      PR body: no counts matched"
  fi
fi
for f in "${CHANGED[@]}"; do
  [ -f "$f" ] || continue
  OUT="$(scan_counts "$f")"
  if [ -n "$OUT" ]; then
    note "counts in $f:"
    printf '%s\n' "$OUT"
  fi
done

echo
echo "=============================================================="
echo "2. UNIVERSALS"
echo "=============================================================="
echo "  \"only / every / all / none / never / always / zero / complete\" are"
echo "  measurements too. ⭐ AND BEFORE REACHING FOR A COMMAND, ASK WHETHER THE"
echo "  PROPERTY IS MECHANICALLY DECIDABLE AT ALL — if no command can decide it,"
echo "  the honest artifact is a LABELLED HAND TRACE, not a script that"
echo "  approximates one. ⚠ SOURCE-TEXT SEARCH + RUNTIME-BEHAVIOUR CLAIM = STOP."
echo
UNIV_RE='\b(only|every|all of|none of|never|always|zero|exhaustive|completely|every single)\b'
if [ "$HAVE_BODY" -eq 1 ]; then
  OUT="$(grep -nEi "$UNIV_RE" "$BODY_FILE" 2>/dev/null | cut -c1-140 | sed 's|^|      PR body |' || true)"
  if [ -n "$OUT" ]; then
    note "universals in the LIVE PR body — each needs its enumeration:"
    printf '%s\n' "$OUT"
  fi
fi
for f in "${CHANGED[@]}"; do
  [ -f "$f" ] || continue
  OUT="$(grep -nEi "$UNIV_RE" "$f" 2>/dev/null | cut -c1-140 | sed "s|^|      $f:|" || true)"
  if [ -n "$OUT" ]; then
    note "universals in $f:"
    printf '%s\n' "$OUT"
  fi
done

echo
echo "=============================================================="
echo "3. COMMIT SHAs IN THE PR BODY — THE DECIDABLE CHECK"
echo "=============================================================="
echo "  ⭐ THIS IS THE ONLY SECTION THAT DECIDES ANYTHING. A SHA quoted in prose"
echo "     is the same second-source-of-truth as a quoted count, one level up:"
echo "     #137's caveat said \"not re-run at 0ceeac8\" and was TWO COMMITS STALE"
echo "     by the time the reviewer read it."
echo "  ⚠ Prefer wording that pins NO head SHA at all — e.g. \"measured at <sha>"
echo "    and not re-run at any commit since, so UNVERIFIED at head\"."
echo
if [ "$HAVE_BODY" -eq 1 ]; then
  HEAD_SHA="$(git rev-parse HEAD)"
  mapfile -t SHAS < <(grep -oE '\b[0-9a-f]{7,40}\b' "$BODY_FILE" | sort -u)
  for sha in "${SHAS[@]}"; do
    git cat-file -e "${sha}^{commit}" 2>/dev/null || continue
    full="$(git rev-parse "$sha" 2>/dev/null)"
    if [ "$full" = "$HEAD_SHA" ]; then
      printf '      %-10s = HEAD\n' "$sha"
    elif git merge-base --is-ancestor "$sha" HEAD 2>/dev/null; then
      printf '      %-10s ancestor of HEAD — ⚠ STALE if the sentence implies "current"\n' "$sha"
      note "stale-capable SHA in the PR body: $sha (an ancestor, not HEAD)"
    else
      printf '      %-10s NOT an ancestor of HEAD — ⚠ check the claim around it\n' "$sha"
      note "SHA in the PR body that is not an ancestor of HEAD: $sha"
    fi
  done
  [ "${#SHAS[@]}" -eq 0 ] && echo "      (no commit SHAs in the body)"
fi

echo
echo "=============================================================="
echo "4. EVIDENCE LANGUAGE"
echo "=============================================================="
echo "  ⭐⭐ A CHECK NOT PERFORMED LEAVES A RESULT *UNVERIFIED* — never"
echo "     \"accepted\", \"confirmed\" or \"held\". The word choice is itself a"
echo "     claim about evidence."
echo
LANG_RE='\b(accepted|held|confirmed)\b'
if [ "$HAVE_BODY" -eq 1 ]; then
  OUT="$(grep -nEi "$LANG_RE" "$BODY_FILE" 2>/dev/null | cut -c1-140 | sed 's|^|      PR body |' || true)"
  if [ -n "$OUT" ]; then
    note "evidence-language words in the PR body — is each one a check somebody RAN?"
    printf '%s\n' "$OUT"
  else
    echo "      PR body: none matched"
  fi
fi

echo
echo "=============================================================="
echo "SUMMARY"
echo "=============================================================="
echo "  candidate findings: $FINDINGS"
echo "  ⚠ THESE ARE CANDIDATES, NOT DEFECTS. This script greps text; it cannot"
echo "    decide whether a claim is true. Justify each one or delete it."
echo "  ⚠ AND IT IS NOT EXHAUSTIVE: it reports what its stated patterns matched."
echo "    No fixed word list finds every stale count. Section 3 is the only part"
echo "    that decides anything."
if [ "$STRICT" -eq 1 ] && [ "$FINDINGS" -gt 0 ]; then
  echo "  --strict: exiting 1"
  exit 1
fi
exit 0
