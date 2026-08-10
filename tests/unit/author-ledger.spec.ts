/**
 * AUTHOR EXECUTION LEDGER — the blocking gate.
 *
 * This file is the GATE. The detector it drives lives in
 * `tests/support/authorLedger.ts`, and the hostile cases that prove each check
 * can fail live in `tests/unit/author-ledger-fixtures.spec.ts`. All three read
 * the same code: the fixtures do not re-implement a parser this file uses, and
 * this file does not assert a property the fixtures cannot construct.
 *
 * WHY IT LIVES IN `tests/unit/`. `vitest` is the only blocking gate in
 * `./tools/checks` that can read arbitrary files, and `./tools/checks` mirrors
 * `.github/workflows/ci.yml`. A defect in a TEST is ordinary PR evidence; a
 * defect in `docs/governance/**` would be a governance amendment costing its
 * own review round. PR #139's whole lesson was to keep the mechanism out of the
 * governing text.
 *
 * ⚠⚠⚠ ROUND 1 OF THIS PR'S INDEPENDENT REVIEW RETURNED CHANGES-REQUIRED with
 * four fail-open classes, every one demonstrated against the real spec rather
 * than argued (`docs/reviews/self-pass-gate-codex-review.md`, `90cc492`):
 *   M1  an absent, heading-less or empty commission read as "nothing owed", and
 *       duplicate upstream ids collapsed two questions into one obligation.
 *   M2  `DISCLOSED` and `NORMATIVE` were unconstrained pass routes, and the
 *       test TITLED "DISCLOSED may not be self-awarded" asserted nothing about
 *       `DISCLOSED`.
 *   M3  fixed filenames let a later branch inherit a green ledger, and the
 *       "hashing commit messages is an infinite regress" rationale was FALSE.
 *   M4  the fingerprint read the INDEX, so an unstaged edit, deletion or
 *       `chmod` on a tracked governed file was invisible.
 * Each repair is named at the assertion that closes it.
 *
 * ⚠⚠⚠ ROUND 2 THEN RETURNED CHANGES-REQUIRED and the owner chose to REDUCE.
 * The monotonic reviewer anchor and the base/message lifecycle certificate
 * were CUT — both were measured green bypasses — and the assertions that drove
 * them are gone from this file. What replaced them is one smaller assertion
 * (the ledger was authored on this branch) and a scoped obligation. The
 * measurements and the reasoning live at the cut sites in
 * `tests/support/authorLedger.ts`.
 */

import { describe, it, expect } from 'vitest';
import {
  checkCertificate,
  checkCommissionInput,
  checkLedgerFreshness,
  checkCommitMessageCandidates,
  checkDispositions,
  checkGovernedObligation,
  checkLedgerCoverage,
  checkOwnerAcceptance,
  loadContext,
  baseRef,
} from '../support/authorLedger';

describe('author execution ledger (the self-pass gate)', () => {
  // M2 (round 0): throws rather than skipping when no base ref resolves, which
  // fails the whole suite at collection. A shallow CI checkout must not certify
  // nothing while reporting success.
  const ctx = loadContext();

  it('M2 — resolves a base ref, and fails closed rather than skipping when it cannot', () => {
    expect(ctx.base).toBeTruthy();
    expect(() => baseRef(ctx.repo)).not.toThrow();
  });

  it('M4 — governed-change discovery decomposes renames and sees the preimage', () => {
    expect(checkGovernedObligation(ctx)).toEqual([]);
  });

  it('M1 (round 1) — the commission is present, sectioned, non-empty, uniquely identified and typed', () => {
    expect(checkCommissionInput(ctx)).toEqual([]);
  });

  it('M3 (round 2) — the ledger was authored on this branch, not inherited', () => {
    expect(checkLedgerFreshness(ctx)).toEqual([]);
  });

  it('M3 — every commissioned check has exactly one ledger row', () => {
    expect(checkLedgerCoverage(ctx)).toEqual([]);
  });

  it('M2 (round 1) — each disposition is legal for its row KIND; DISCLOSED and UNRUN pass nothing', () => {
    expect(checkDispositions(ctx)).toEqual([]);
  });

  it('OWNER-ACCEPTED cites the owner', () => {
    expect(checkOwnerAcceptance(ctx)).toEqual([]);
  });

  it('M1 — claim candidates in branch commit messages are dispositioned', () => {
    expect(checkCommitMessageCandidates(ctx)).toEqual([]);
  });

  // ⚠ ROUND-3 M2: this title used to say "bound to this base, this message range
  // and this working tree". `base commit` and `commit-message range` were CUT in
  // round 2 and the body never tested them — an assertion TITLE claiming a
  // property the assertion does not exercise, which is round-1 M2's own defect
  // class committed again. The certificate is the governed tree and nothing else.
  it('M4 (round 1) — the certificate covers the GOVERNED TREE ONLY: index, working tree, untracked', () => {
    expect(checkCertificate(ctx)).toEqual([]);
  });
});
