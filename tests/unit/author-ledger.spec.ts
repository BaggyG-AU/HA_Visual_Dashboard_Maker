/**
 * AUTHOR EXECUTION LEDGER — the blocking detector.
 *
 * WHY THIS EXISTS, MEASURED. Across PR #139's six review rounds and PR #140's
 * first, 19 defects were attributable to the author. Codex's process review
 * (`docs/reviews/pr139-author-process-review-codex.md`) measured that 14 of 16
 * named defects had an author-published check capable of exposing them; one of
 * those (R6-M1) was actually run and caught it, so 13 were NAMED AND NOT RUN.
 *
 * THE STRUCTURAL CAUSE. Writing "verified: grep returns 0" costs one line.
 * Constructing the hostile case costs ten minutes and produces THE SAME ONE
 * LINE. The two are indistinguishable in the output, so under any pressure to
 * produce a response the cheap one wins — and nothing downstream can tell.
 * Meanwhile `./tools/checks` is eslint -> prettier -> tsc -> vitest, and
 * Prettier parses every finding-bearing file here as `markdown`, i.e.
 * formatting only. Findings by surface across the arc: governance prose = many,
 * the live PR body = several, `src/` and `tests/` = ZERO. THE GATE POINTED
 * AWAY FROM THE FAILURE SURFACE.
 *
 * WHY IT LIVES IN `tests/unit/`. `vitest` is the only blocking gate in
 * `./tools/checks` that can read arbitrary files, and `tools/checks` mirrors
 * `.github/workflows/ci.yml`. Putting the detector here hijacks the one ritual
 * that is never skipped: the author is required to run the gate and report its
 * real exit code, so an unrun check becomes a RED GATE instead of silence.
 *
 * ⚠ DELIBERATELY NOT IN `OPERATING_AGREEMENT.md`. PR #139's whole lesson is
 * that a mechanism placed in the governing text makes every defect in the
 * mechanism a governance amendment costing its own review round. This is a
 * test, so a defect in it is a defect in one PR's evidence.
 *
 * ⚠⚠ WHAT THIS CANNOT DO. It cannot verify that a claim is TRUE, and it cannot
 * detect a surface the author never considered — PR #140's M1 was exactly that
 * and this test would not have caught it. It makes a SKIP VISIBLE; it does not
 * make the author run the check. Visibility is what was missing.
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = resolve(__dirname, '..', '..');

/** Artifacts whose change obliges a ledger. */
const GOVERNED = [/^docs\/governance\//, /^docs\/templates\//, /^ai_rules\.md$/, /^CLAUDE\.md$/];

/**
 * PASS          the check ran and the claim held
 * FIXED         the check ran, found a defect, and it is repaired in this PR
 * NORMATIVE     a rule or quoted prohibition, not an empirical claim
 * DISCLOSED     the check ran and found something real that is deliberately
 *               NOT actioned here (out of scope, pre-existing) — recorded so a
 *               reviewer sees it rather than discovering it
 * OWNER-ACCEPTED the owner accepted the residue; must cite "owner: <ref>", and
 *               the author may not self-award it
 * UNRUN         not executed — handoff is not permitted while any row is UNRUN
 */
const DISPOSITIONS = ['PASS', 'FIXED', 'NORMATIVE', 'DISCLOSED', 'OWNER-ACCEPTED', 'UNRUN'];

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
}

function tryGit(...args: string[]): string | null {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

/** The base this branch is measured against, or null if it cannot be resolved. */
function resolveBase(): string | null {
  for (const ref of ['origin/main', 'main']) {
    if (tryGit('rev-parse', '--verify', '--quiet', ref) !== null) return ref;
  }
  return null;
}

describe('author execution ledger', () => {
  const base = resolveBase();
  const head = tryGit('rev-parse', 'HEAD');

  // A checkout with no resolvable base (a shallow CI clone, a fresh init)
  // cannot compute the obligation. Say so rather than passing silently.
  const usable = base !== null && head !== null;
  if (!usable) {
    it.skip('skipped — no resolvable base ref (main / origin/main)', () => {});
    return;
  }

  // Committed changes on the branch UNION anything dirty in the working tree.
  // The working-tree half matters: the obligation must bite while the author
  // is still editing, not only after a commit exists — otherwise the gate is
  // unrunnable at exactly the moment it is useful.
  const committed = git('diff', '--name-only', `${base}...HEAD`).split('\n');
  const dirty = git('status', '--porcelain')
    .split('\n')
    .map((l) => l.slice(3).trim())
    // Rename entries read "old -> new"; the new path is the one that exists.
    .map((p) => (p.includes(' -> ') ? p.split(' -> ')[1] : p));
  const changed = [...new Set([...committed, ...dirty].filter(Boolean))];
  const governedChanged = changed.filter((f) => GOVERNED.some((re) => re.test(f)));
  const ledgers = changed.filter((f) => /^docs\/reviews\/.*-author-ledger\.md$/.test(f));

  if (governedChanged.length === 0) {
    it('no governed artifact changed — no ledger owed', () => {
      expect(governedChanged).toHaveLength(0);
    });
    return;
  }

  it('a branch changing a governed artifact carries exactly one ledger', () => {
    expect(
      ledgers,
      `changed governed artifacts:\n  ${governedChanged.join('\n  ')}\n` +
        'Expected exactly one docs/reviews/<branch>-author-ledger.md',
    ).toHaveLength(1);
  });

  if (ledgers.length !== 1) return;

  const ledgerPath = resolve(REPO, ledgers[0]);
  const text = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
  const rows = text
    .split('\n')
    .filter((l) => l.trimStart().startsWith('|'))
    .map((l) => l.split('|').map((c) => c.trim()))
    // Drop the header row and the |---|---| separator.
    .filter((c) => c.length > 3 && !/^-+$/.test(c[1] ?? '') && c[1] !== 'ID');

  it('declares a self-pass header pinned to the governed content it certified', () => {
    const m = text.match(/AUTHOR SELF-PASS:\s*COMPLETE;\s*target=([0-9a-f]{12});\s*OPEN=(\d+)/);
    expect(
      m,
      'missing or malformed "AUTHOR SELF-PASS: COMPLETE; target=<fingerprint>; OPEN=<n>"',
    ).not.toBeNull();
    const [, target, open] = m!;
    // The mechanical form of "an amend invalidates the declaration". PR #140's
    // N1 was a commission left pinned to a pre-amend commit. A COMMIT SHA
    // cannot serve here — the ledger is inside the commit it would name, so
    // writing the SHA changes it. This fingerprint covers the governed paths
    // only, so editing the ledger leaves it alone and editing any certified
    // file breaks it.
    const actual = execFileSync('bash', ['tools/claims-worklist.sh', '--fingerprint'], {
      cwd: REPO,
      encoding: 'utf8',
    }).trim();
    expect(
      target,
      `ledger certifies governed content ${target} but the tree is now ${actual} — ` +
        'a certified file changed after the self-pass; rerun the affected rows',
    ).toBe(actual);
    expect(Number(open), 'OPEN must be 0 at handoff').toBe(0);
  });

  it('every row is atomic, dispositioned, and carries a declared expectation', () => {
    expect(rows.length, 'ledger has no rows').toBeGreaterThan(0);
    for (const cells of rows) {
      const [, id, probe, expected, actual, disposition] = cells;
      expect(DISPOSITIONS, `row ${id}: disposition "${disposition}"`).toContain(disposition);
      expect(disposition, `row ${id} is UNRUN — handoff is not permitted`).not.toBe('UNRUN');
      expect(probe?.length ?? 0, `row ${id}: empty probe`).toBeGreaterThan(0);
      expect(expected?.length ?? 0, `row ${id}: no expectation declared`).toBeGreaterThan(0);
      expect(actual?.length ?? 0, `row ${id}: no actual result`).toBeGreaterThan(0);
      // The author cannot self-award OWNER-ACCEPTED; it must cite the owner.
      if (disposition === 'OWNER-ACCEPTED') {
        expect(
          /owner:/i.test(actual ?? ''),
          `row ${id}: OWNER-ACCEPTED must cite "owner: <ref>"`,
        ).toBe(true);
      }
    }
  });

  it('OPEN matches the number of UNRUN rows', () => {
    const m = text.match(/OPEN=(\d+)/);
    const unrun = rows.filter((c) => c[5] === 'UNRUN').length;
    expect(Number(m?.[1] ?? -1), 'declared OPEN disagrees with the rows').toBe(unrun);
  });

  it('the live PR body is dispositioned — it is the canonical ungated surface', () => {
    const hasPrRow = rows.some((c) => /^PR-BODY$/i.test(c[1] ?? ''));
    expect(hasPrRow, 'ledger needs a PR-BODY row; stale PR bodies survived two whole rounds').toBe(
      true,
    );
  });

  it('every claim candidate the generator finds is dispositioned in the ledger', () => {
    // Single source of truth: the test consumes tools/claims-worklist.sh
    // rather than reimplementing its key, so the two cannot drift.
    let out: string;
    try {
      out = execFileSync('bash', ['tools/claims-worklist.sh', '--base', base!], {
        cwd: REPO,
        encoding: 'utf8',
      });
    } catch (e) {
      // An erroring generator prints nothing, which is indistinguishable from
      // "no claims". Fail loudly instead of reading the silence as clean.
      throw new Error(`tools/claims-worklist.sh failed: ${(e as Error).message}`);
    }
    const candidates = out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const rowText = rows.map((c) => c.join(' | ').toLowerCase());
    const missing = candidates.filter((p) => !rowText.some((r) => r.includes(p)));
    expect(
      missing,
      `these claim candidates have no ledger row:\n  ${missing.join('\n  ')}\n` +
        'Disposition each (NORMATIVE for a rule, PASS with evidence for a measured claim).',
    ).toHaveLength(0);
  });
});
