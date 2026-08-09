#!/usr/bin/env bash
# claims-worklist.sh — emit the CLAIM CANDIDATES a branch introduces, so the
# author must DISPOSITION each one rather than remember to look for them.
#
# WHY THIS EXISTS. Across PR #139's six rounds and PR #140's first, 19 defects
# were attributable to the author and 13 of them had a check he had already
# WRITTEN DOWN and did not run. The recurring sub-class is a numeral or a
# universal asserted in the same breath as the check that "verified" it:
#   "31 commits"          -> 31 file-revision pairs across 24 unique commits
#   "all four surfaces"   -> a fifth surface disagreed
#   "never have"          -> true, but never enumerated until challenged
#   "a non-ASCII path fails safe" (R5-N1) -> tested under one config only
# The author reliably NOTICES claims and unreliably RECORDS them. So this script
# generates the population; it is not left to memory.
#
# ⚠⚠ WHAT THIS IS, STATED PRECISELY — overstating an instrument is the exact
# defect it exists to catch:
#   - It is a GREP. It emits CANDIDATES. It CANNOT decide whether a claim is
#     true, nor whether a universal is normative ("never set X" is a RULE) or
#     empirical ("never have" is a CLAIM ABOUT HISTORY).
#   - Deciding that is the author's job, one word per row, in the ledger.
#   - It does NOT find every claim. No fixed key can. It reports what its
#     stated patterns matched, and its key is published below so a reviewer can
#     attack the key rather than guess at it.
#
# THE KEY, AND WHY IT IS THIS ONE. A bare numeral is almost always a reference
# (a PR number, a date, a section, a line, a drawer hex) — measured on PR #140,
# the naive "any 2+ digit number" key returned 185 hits on 435 lines, which is
# an unusable gate. What distinguishes a COUNT CLAIM is a quantity BINDING A
# PLURAL NOUN ("31 commits"), and what distinguishes a UNIVERSAL is a
# quantifier binding a word ("all four"). That key returned 44 distinct
# candidates on the same branch, which is affordable at one word each.
#
# SURFACES. Author-content markdown (reviewer deliverables under docs/reviews/
# are excluded — they are the reviewer's artifact) plus every commit message on
# the branch. With --with-pr, also the LIVE pull-request body, which is the
# canonical ungated surface and where "all four surfaces" survived into review.
#
# USAGE:
#   bash tools/claims-worklist.sh                 # local surfaces, base=main
#   bash tools/claims-worklist.sh --base <ref>
#   bash tools/claims-worklist.sh --with-pr [n]   # also the live PR body (needs gh)
#
# Output: one distinct lower-cased candidate phrase per line, sorted.
# Exit 0 on success (INCLUDING zero candidates), non-zero on internal failure —
# a caller must be able to tell "nothing matched" from "this script broke".

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="main"
WITH_PR=0
PR_NUM=""
FINGERPRINT=0

# The governed artifacts a ledger certifies. Kept in step with the GOVERNED
# list in tests/unit/author-ledger.spec.ts.
GOVERNED_PATHS=(docs/governance docs/templates ai_rules.md CLAUDE.md)

# A content fingerprint over those paths, taken from the WORKING TREE so it is
# meaningful before the commit exists.
#
# ⭐ WHY A FINGERPRINT AND NOT A COMMIT SHA. The review that prompted this asked
# for `target=<commit sha>`, invalidated on amend. That is unsatisfiable: the
# ledger is part of the commit it would name, so writing the SHA changes the
# SHA. A fingerprint over the governed paths has the property actually wanted —
# it is UNCHANGED by editing the ledger (which lives in docs/reviews/, outside
# these paths) and CHANGES the moment any certified file changes, whether by a
# fresh commit, an amend, or an uncommitted edit.
emit_fingerprint() {
  git ls-files -- "${GOVERNED_PATHS[@]}" | LC_ALL=C sort | while IFS= read -r f; do
    [ -f "$f" ] || continue
    printf '%s %s\n' "$(git hash-object "$f")" "$f"
  done | git hash-object --stdin | cut -c1-12
}

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="${2:?--base needs a ref}"; shift 2 ;;
    --fingerprint) FINGERPRINT=1; shift ;;
    --with-pr) WITH_PR=1; shift
               if [ $# -gt 0 ] && [[ "$1" =~ ^[0-9]+$ ]]; then PR_NUM="$1"; shift; fi ;;
    -h|--help) sed -n '1,45p' "$0"; exit 0 ;;
    *) echo "claims-worklist: unknown argument '$1'" >&2; exit 2 ;;
  esac
done

if [ "$FINGERPRINT" -eq 1 ]; then
  emit_fingerprint
  exit 0
fi

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  # Try the remote-tracking form before giving up: CI often lacks a local main.
  if git rev-parse --verify --quiet "origin/$BASE" >/dev/null; then
    BASE="origin/$BASE"
  else
    echo "claims-worklist: base ref '$BASE' does not resolve" >&2
    exit 3
  fi
fi

NUM='([0-9]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen)'
KEY="\\b$NUM [a-z][a-z-]*s\\b|\\b(every|all|none|never|always|only) [a-z][a-z-]*\\b"
# Drop line/section citations ("lines 163-166", "ai_rules.md:329") — those are
# pointers, not claims, and they dominated the first measured key.
NOISE='(lines? [0-9]+|:[0-9]+)'

collect() {
  # Added markdown lines that the AUTHOR contributed.
  git diff "$BASE...HEAD" -- '*.md' ':!docs/reviews/**' \
    | grep '^+' | grep -v '^+++' | sed 's/^+//'
  # Every commit message on the branch.
  git log "$BASE..HEAD" --format=%B --no-merges
  # The live PR body, on request.
  if [ "$WITH_PR" -eq 1 ]; then
    if command -v gh >/dev/null 2>&1; then
      if [ -n "$PR_NUM" ]; then gh pr view "$PR_NUM" --json body --jq .body 2>/dev/null || true
      else gh pr view --json body --jq .body 2>/dev/null || true; fi
    else
      echo "claims-worklist: --with-pr given but gh is not installed" >&2
      exit 4
    fi
  fi
}

# Strip section references BEFORE matching: "§3.5 binds" must not read as the
# count claim "5 binds". Stripping (rather than dropping the whole line) keeps
# the real claims on lines that also happen to cite a section — governance
# prose cites one in almost every sentence.
OUT="$(collect | sed 's/§[0-9][0-9.]*//g' | grep -viE "$NOISE" | grep -oiE "$KEY" | tr 'A-Z' 'a-z' | sort -u)"
rc=$?
# grep exits 1 when nothing matched; that is a legitimate empty result, not a
# failure. Any other non-zero is a real fault and must not read as "clean".
if [ $rc -gt 1 ]; then
  echo "claims-worklist: extraction failed (exit $rc)" >&2
  exit 5
fi

[ -n "$OUT" ] && printf '%s\n' "$OUT"
exit 0
