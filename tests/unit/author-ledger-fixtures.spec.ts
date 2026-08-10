/**
 * THE HOSTILE CASES FOR THE AUTHOR SELF-PASS GATE.
 *
 * ⚠⚠⚠ WHY THIS FILE EXISTS. Round 1 of PR #141's independent review
 * (`docs/reviews/self-pass-gate-codex-review.md`, `90cc492`) returned
 * CHANGES-REQUIRED with four fail-open classes. Every one was found the same
 * way — by CONSTRUCTING Git state and driving the real detector against it —
 * and every one had a prose "verified" line beside it in the author's ledger.
 * A hostile case that lives in a document is a check that was named and not
 * run, which is the exact defect class this whole mechanism exists to catch.
 *
 * ⚠⚠⚠ ROUND 2 (`docs/reviews/self-pass-gate-codex-round2-review.md`) then found
 * three more and the owner chose to REDUCE. This file changed in four ways:
 *   - the reviewer-anchor fixtures are GONE with the mechanism they tested;
 *   - the base/message lifecycle fixtures are GONE likewise, replaced by one
 *     fixture for `checkLedgerFreshness()`;
 *   - `KNOWN-OPEN:` is relabelled. Round 1's version implied the residue was
 *     narrow (only before a reviewer commit). With the anchor cut it is simply
 *     open, and the test now says so;
 *   - the disposition matrix is exercised over ALL TWELVE kind/disposition
 *     cells. Round-2 M3 found four normative cells absent while the ledger
 *     claimed the vocabulary was covered — a false PASS on a universal, in the
 *     mechanism built to stop exactly that.
 *
 * Each test builds real Git state in a temporary repository, applies exactly
 * ONE mutation, and asserts on the specific check that must catch it plus the
 * whole gate. The fixture carries the REAL governed tree (`docs/governance/`,
 * `docs/templates/`, `ai_rules.md`, `CLAUDE.md`) so the fingerprint legs see
 * real content, and a SYNTHETIC commission/ledger pair so the disposition
 * matrix can be exercised against a genuinely NORMATIVE row — the real
 * commission has only one.
 *
 * ⚠ NO SETUP CALLS `git add` UNLESS ITS TEST NAME SAYS "staged". Round 1's M4
 * existed because the author's own mode fixture ran `git add -A` first and
 * therefore only ever exercised the staged state.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  chmodSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  COMMISSION,
  LEDGER,
  checkCertificate,
  checkCommissionInput,
  checkCommitMessageCandidates,
  checkDispositions,
  checkGovernedObligation,
  checkLedgerCoverage,
  checkLedgerFreshness,
  checkOwnerAcceptance,
  governedFingerprint,
  loadContext,
  runGate,
} from '../support/authorLedger';

const REAL = resolve(__dirname, '..', '..');
const GOVERNED_FILE = 'docs/governance/OPERATING_AGREEMENT.md';
/** A tracked file that is this gate's own but is NOT governed — see GATE_OWN. */
const GATE_OWN_FILE = 'tools/claims-worklist.sh';
/** Tracked, and neither governed nor gate-own: the scoping control. */
const UNRELATED_FILE = 'docs/notes.md';

let dir: string;
let certified: string;
let baseSha: string;

const g = (...args: string[]) =>
  execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

const commissionMd = () => `# Fixture commission

## Commissioned checks

| ID  | Kind      | Check                                                    |
| --- | --------- | -------------------------------------------------------- |
| C01 | EMPIRICAL | Does the first empirical property hold when measured?    |
| C02 | EMPIRICAL | Does the second empirical property hold when measured?   |
| C03 | NORMATIVE | Nobody may bypass the writer lease. (a quoted rule)      |
`;

const ledgerMd = (fingerprint: string) => `# Fixture ledger

governed fingerprint: \`${fingerprint}\`

## Rows

| ID  | Check          | Disposition | Evidence                       |
| --- | -------------- | ----------- | ------------------------------ |
| C01 | first property | PASS        | measured in the fixture        |
| C02 | second one     | FIXED       | measured, then repaired here   |
| C03 | the rule       | NORMATIVE   | quoted verbatim from the rule  |
`;

const cPath = () => join(dir, COMMISSION);
const lPath = () => join(dir, LEDGER);
const readC = () => readFileSync(cPath(), 'utf8');
const readL = () => readFileSync(lPath(), 'utf8');
const writeC = (s: string) => writeFileSync(cPath(), s);
const writeL = (s: string) => writeFileSync(lPath(), s);

/** Rewrite one ledger row's disposition and evidence cells in place. */
function setRow(id: string, disposition: string, evidence: string): void {
  const out = readL()
    .split('\n')
    .map((line) => {
      if (!line.startsWith(`| ${id} `)) return line;
      const cells = line.split('|');
      cells[3] = ` ${disposition} `;
      cells[4] = ` ${evidence} `;
      return cells.join('|');
    })
    .join('\n');
  writeL(out);
}

const dropRow = (text: string, id: string) =>
  text
    .split('\n')
    .filter((l) => !l.startsWith(`| ${id} `))
    .join('\n');

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'havdm-self-pass-gate-'));
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'fixture@example.com');
  g('config', 'user.name', 'Fixture');
  g('config', 'commit.gpgsign', 'false');

  // The real governed tree, so the fingerprint legs hash real content.
  cpSync(join(REAL, 'docs/governance'), join(dir, 'docs/governance'), { recursive: true });
  cpSync(join(REAL, 'docs/templates'), join(dir, 'docs/templates'), { recursive: true });
  copyFileSync(join(REAL, 'ai_rules.md'), join(dir, 'ai_rules.md'));
  copyFileSync(join(REAL, 'CLAUDE.md'), join(dir, 'CLAUDE.md'));
  // Two tracked non-governed files: one this gate owns, one it does not. They
  // are what makes the round-2 scoping behaviour testable at all.
  mkdirSync(join(dir, 'tools'), { recursive: true });
  writeFileSync(join(dir, GATE_OWN_FILE), '#!/usr/bin/env bash\necho fixture\n');
  writeFileSync(join(dir, UNRELATED_FILE), 'notes\n');
  g('add', '-A');
  g('commit', '-q', '-m', 'fixture base tree');
  baseSha = g('rev-parse', 'HEAD').trim();

  g('checkout', '-q', '-b', 'feature/fixture');
  mkdirSync(join(dir, 'docs/reviews'), { recursive: true });
  writeC(commissionMd());
  writeL(ledgerMd(governedFingerprint(dir)));
  g('add', '-A');
  g('commit', '-q', '-m', 'fixture: the author commission and its ledger');
  certified = g('rev-parse', 'HEAD').trim();
});

afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
  g('reset', '-q', '--hard', certified);
  g('clean', '-qfd');
  try {
    g('update-ref', '-d', 'refs/remotes/origin/main');
  } catch {
    /* absent is the normal case */
  }
});

/** Assert the whole gate went red, and name the check that had to catch it. */
function expectRed(specific: string[]): void {
  expect(specific).not.toEqual([]);
  expect(runGate(loadContext(dir)).length).toBeGreaterThan(0);
}

describe('self-pass gate — the green control and the round-2 scoping', () => {
  it('a correctly certified branch passes every check', () => {
    const ctx = loadContext(dir);
    expect(ctx.owesLedger).toBe(true); // the fixture is inside the obligation…
    expect(runGate(ctx)).toEqual([]); // …and clean
  });

  /**
   * ⭐ ROUND-2. The previous condition was "any branch work at all", which made
   * every branch in the repository — dependency bumps, external contributions,
   * reviewer-only branches — owe a commission forever. Round 2 called that a
   * policy mechanism smuggled in through a unit test. It is now scoped to
   * governed text and this gate's own files.
   */
  it('an ordinary later branch touching neither governed text nor this gate owes nothing', () => {
    g('update-ref', 'refs/remotes/origin/main', certified);
    writeFileSync(join(dir, UNRELATED_FILE), 'notes, edited\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'chore: an ordinary unrelated change');
    const ctx = loadContext(dir);
    expect(ctx.hasBranchWork).toBe(true); // there IS work…
    expect(ctx.changed).toEqual([UNRELATED_FILE]); // …exactly one path, out of scope…
    expect(ctx.owesLedger).toBe(false); // …so nothing is owed…
    // …even though an inherited, now-stale commission and ledger sit in the tree.
    expect(ctx.commissionRaw).not.toBeNull();
    expect(runGate(ctx)).toEqual([]);
  });

  /**
   * ⚠ The corollary, and the reason deleting the artifacts is NOT a way out:
   * both are in GATE_OWN, so removing them is itself a change to this gate.
   */
  it('deleting the commission and ledger does NOT escape the obligation', () => {
    g('update-ref', 'refs/remotes/origin/main', certified);
    rmSync(cPath());
    rmSync(lPath());
    g('add', '-A');
    g('commit', '-q', '-m', 'chore: remove the self-pass artifacts');
    const ctx = loadContext(dir);
    expect(ctx.owesLedger).toBe(true);
    expectRed(checkCommissionInput(ctx));
  });

  it('a branch touching this gate DOES owe, even though nothing governed changed', () => {
    g('update-ref', 'refs/remotes/origin/main', certified);
    writeFileSync(join(dir, GATE_OWN_FILE), '#!/usr/bin/env bash\necho edited\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'chore: edit the mechanism itself');
    const ctx = loadContext(dir);
    expect(ctx.owesLedger).toBe(true);
    expectRed(checkLedgerFreshness(ctx)); // the inherited ledger was not touched here
  });
});

describe('round-1 M1 — the commissioned population is mandatory, unique and typed', () => {
  it('an ABSENT commission is red, not "nothing owed"', () => {
    rmSync(cPath());
    expectRed(checkCommissionInput(loadContext(dir)));
  });

  it('a commission whose "Commissioned checks" HEADING is missing is red', () => {
    writeC(readC().replace('## Commissioned checks', '## Checks that were commissioned'));
    expectRed(checkCommissionInput(loadContext(dir)));
  });

  it('a commission whose table parses to ZERO rows is red', () => {
    writeC('# Fixture commission\n\n## Commissioned checks\n\n(intentionally empty)\n');
    expectRed(checkCommissionInput(loadContext(dir)));
  });

  it('DUPLICATE commission ids are red — two questions may not collapse into one obligation', () => {
    writeC(readC().replace('| C02 |', '| C01 |'));
    writeL(dropRow(readL(), 'C02'));
    const ctx = loadContext(dir);
    expect(checkLedgerCoverage(ctx)).toEqual([]); // the set comparison is satisfied…
    expectRed(checkCommissionInput(ctx)); // …and the uniqueness check still fails
  });

  it('a commission row with no recognised Kind is red', () => {
    writeC(readC().replace('| C01 | EMPIRICAL |', '| C01 |           |'));
    expectRed(checkCommissionInput(loadContext(dir)));
  });

  it('a LEDGER row deleted while its commission row remains is red (the round-0 control)', () => {
    writeL(dropRow(readL(), 'C02'));
    expectRed(checkLedgerCoverage(loadContext(dir)));
  });

  it('an ORPHAN ledger row with no commissioned question is red', () => {
    writeL(`${readL()}| C99 | invented | PASS | invented evidence |\n`);
    expectRed(checkLedgerCoverage(loadContext(dir)));
  });

  /**
   * ⚠⚠ THE BOUNDARY, PINNED AS AN EXECUTABLE STATEMENT RATHER THAN A PARAGRAPH.
   *
   * Round 1's version of this test carried the qualifier "with no reviewer
   * deliverable yet", because the monotonic anchor was believed to close the
   * case once a review existed. **Round 2 measured two bypasses of that anchor
   * and it was cut.** The residue is therefore not narrow and not timed: a
   * question deleted together with its ledger row leaves both artifacts
   * internally consistent, and NOTHING in this mechanism sees it. The tracked
   * commission makes it a visible diff for the reviewer and the owner. That is
   * the whole of the protection and this test says so out loud.
   *
   * ⚠ If a future change closes this, THIS TEST WILL FAIL. Rewrite it as a red
   * case and correct the prose in the commission and the ledger in the same
   * commit — that is the point of asserting a known-open limit.
   */
  it('KNOWN-OPEN: deleting a question together with its ledger row stays GREEN', () => {
    writeC(dropRow(readC(), 'C02'));
    writeL(dropRow(readL(), 'C02'));
    expect(runGate(loadContext(dir))).toEqual([]);
  });
});

/**
 * ⭐⭐ ROUND-2 M3. The full twelve-cell kind/disposition matrix, exhaustively.
 *
 * The round-1 ledger dispositioned C22 `PASS` and claimed nine fixtures covered
 * "the whole vocabulary", naming `DISCLOSED` and `UNRUN` for BOTH kinds and
 * `PASS` and `FIXED` on a normative row. Round 2 enumerated the cells and found
 * four absent — every missing one on the normative row. That was a false PASS
 * on a universal, written by the author of the rule against unverified
 * universals, in the mechanism built to catch them.
 *
 * The matrix is 6 dispositions x 2 kinds. Every cell below is either a baseline
 * row, a green case, or a red case; the count is asserted at the end so the
 * claim cannot drift from the fixtures again.
 */
describe('round-1 M2 / round-2 M3 — every disposition against BOTH kinds', () => {
  // ---- EMPIRICAL rows (C01, C02) ----
  it('EMPIRICAL + PASS and EMPIRICAL + FIXED are the green baseline', () => {
    expect(runGate(loadContext(dir))).toEqual([]); // C01 PASS, C02 FIXED as authored
  });

  it('EMPIRICAL + NORMATIVE is red', () => {
    setRow('C01', 'NORMATIVE', 'Declared a rule instead of running anything.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('EMPIRICAL + DISCLOSED is red', () => {
    setRow('C01', 'DISCLOSED', 'The in-scope defect is real, unresolved and unaccepted.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('EMPIRICAL + UNRUN is red', () => {
    setRow('C01', 'UNRUN', 'not executed');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('EMPIRICAL + OWNER-ACCEPTED without an "owner:" citation is red', () => {
    setRow('C01', 'OWNER-ACCEPTED', 'The residue was accepted.');
    expectRed(checkOwnerAcceptance(loadContext(dir)));
  });

  it('EMPIRICAL + OWNER-ACCEPTED with a citation is green', () => {
    setRow('C01', 'OWNER-ACCEPTED', 'owner: BaggyG-AU accepted this residue on the PR thread.');
    expect(runGate(loadContext(dir))).toEqual([]);
  });

  // ---- NORMATIVE row (C03) — the four cells round 2 found missing ----
  it('NORMATIVE + NORMATIVE is green', () => {
    setRow('C03', 'NORMATIVE', 'Quoted verbatim from the governing text.');
    expect(runGate(loadContext(dir))).toEqual([]);
  });

  it('NORMATIVE + PASS is red — a rule cannot be "run"', () => {
    setRow('C03', 'PASS', 'Claimed to have measured a prohibition.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('NORMATIVE + FIXED is red — a rule cannot be repaired by running something', () => {
    setRow('C03', 'FIXED', 'Claimed to have repaired a prohibition.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('NORMATIVE + DISCLOSED is red', () => {
    setRow('C03', 'DISCLOSED', 'Mentioned the rule rather than recording it.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('NORMATIVE + UNRUN is red', () => {
    setRow('C03', 'UNRUN', 'not executed');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('NORMATIVE + OWNER-ACCEPTED without an "owner:" citation is red', () => {
    setRow('C03', 'OWNER-ACCEPTED', 'The rule was waived.');
    expectRed(checkOwnerAcceptance(loadContext(dir)));
  });

  it('NORMATIVE + OWNER-ACCEPTED with a citation is green', () => {
    setRow('C03', 'OWNER-ACCEPTED', 'owner: BaggyG-AU waived this rule for this branch.');
    expect(runGate(loadContext(dir))).toEqual([]);
  });

  // ---- the vocabulary itself, and two non-cell failures ----
  it('an unrecognised disposition is red', () => {
    setRow('C01', 'PROBABLY-FINE', 'looks alright');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('a row with empty evidence is red', () => {
    setRow('C01', 'PASS', '');
    expectRed(checkDispositions(loadContext(dir)));
  });

  /**
   * ⚠ The guard against C22 drifting again: if a disposition is added to the
   * matrix, this fails until its two cells are written above.
   */
  it('the matrix has exactly the six dispositions these fixtures exercise', async () => {
    const { DISPOSITION_MATRIX } = await import('../support/authorLedger');
    expect(Object.keys(DISPOSITION_MATRIX).sort()).toEqual(
      ['DISCLOSED', 'FIXED', 'NORMATIVE', 'OWNER-ACCEPTED', 'PASS', 'UNRUN'].sort(),
    );
  });
});

describe('round-2 — what replaced the lifecycle certificate', () => {
  /**
   * Round 1's MEASURED inheritance state, kept red by the smallest thing that
   * can keep it red. ⚠ The claim is only that the ledger was EDITED here.
   */
  it('a later branch inheriting the ledger unchanged is red', () => {
    g('update-ref', 'refs/remotes/origin/main', certified);
    writeFileSync(join(dir, GATE_OWN_FILE), '#!/usr/bin/env bash\necho later branch\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'chore: later branch work');
    const ctx = loadContext(dir);
    expect(checkCertificate(ctx)).toEqual([]); // the governed tree is untouched…
    expectRed(checkLedgerFreshness(ctx)); // …and freshness is what catches it
  });

  it('a malformed fingerprint declaration is a loud failure, not a silent no-op', () => {
    writeL(
      readL().replace(/^governed fingerprint: `[^`]*`$/m, 'governed fingerprint: `not-a-hash`'),
    );
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('a missing fingerprint declaration is red', () => {
    writeL(readL().replace(/^governed fingerprint: `[^`]*`\n/m, ''));
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('an undispositioned count candidate in a commit message is red', () => {
    g('commit', '-q', '--allow-empty', '-m', 'chore: 999 tests passed');
    expectRed(checkCommitMessageCandidates(loadContext(dir)));
  });
});

describe('round-1 M4 — the fingerprint sees the working tree, not only the index', () => {
  it('an UNSTAGED content edit to a tracked governed file is red', () => {
    writeFileSync(
      join(dir, GOVERNED_FILE),
      `${readFileSync(join(dir, GOVERNED_FILE), 'utf8')}\nhostile\n`,
    );
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('an UNSTAGED deletion of a tracked governed file is red', () => {
    rmSync(join(dir, GOVERNED_FILE));
    expectRed(checkCertificate(loadContext(dir)));
  });

  it("an UNSTAGED chmod of a tracked governed file is red — round 1's measured false accept", () => {
    const abs = join(dir, GOVERNED_FILE);
    chmodSync(abs, statSync(abs).mode | 0o111);
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('a STAGED chmod is red too — the narrower control the old index-only hash already had', () => {
    const abs = join(dir, GOVERNED_FILE);
    chmodSync(abs, statSync(abs).mode | 0o111);
    g('add', '-A');
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('an UNTRACKED governed addition is red', () => {
    writeFileSync(join(dir, 'docs/governance/SMUGGLED.md'), 'normative text nobody commissioned\n');
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('replacing a tracked governed file with a SYMLINK is red — type, not only content', () => {
    const abs = join(dir, GOVERNED_FILE);
    rmSync(abs);
    symlinkSync('/dev/null', abs);
    expectRed(checkCertificate(loadContext(dir)));
  });
});

describe('round-0 regression guards — the repairs that HELD must not be undone', () => {
  it('a governed file renamed OUT of docs/governance is seen through its preimage', () => {
    mkdirSync(join(dir, 'docs/reviews'), { recursive: true });
    g('mv', GOVERNED_FILE, 'docs/reviews/moved-operating-agreement.md');
    g('commit', '-q', '-m', 'chore: move a governed file out of its directory');
    rmSync(cPath());
    const ctx = loadContext(dir);
    expect(ctx.changed).toContain(GOVERNED_FILE); // the PREIMAGE, not only the destination
    expectRed(checkGovernedObligation(ctx));
  });

  it('the base ref must resolve — a checkout with none throws rather than skipping', () => {
    g('checkout', '-q', '--detach');
    g('branch', '-q', '-D', 'main');
    expect(() => loadContext(dir)).toThrow(/No base ref resolves/);
    g('branch', '-q', 'main', baseSha);
    g('checkout', '-q', 'feature/fixture');
  });
});
