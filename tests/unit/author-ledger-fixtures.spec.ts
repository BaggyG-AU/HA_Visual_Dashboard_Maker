/**
 * THE HOSTILE CASES FOR THE AUTHOR SELF-PASS GATE.
 *
 * ⚠⚠⚠ WHY THIS FILE EXISTS. Round 1 of PR #141's independent review
 * (`docs/reviews/self-pass-gate-codex-review.md`, `90cc492`) returned
 * CHANGES-REQUIRED with four fail-open classes. Every one was found the same
 * way — by CONSTRUCTING Git state and driving the real detector against it —
 * and every one had a prose "verified" line beside it in the author's ledger.
 * The repair is not only the code in `tests/support/authorLedger.ts`; it is
 * that the constructed states now RUN on every `./tools/checks`. A hostile case
 * that lives in a document is a check that was named and not run, which is the
 * exact defect class this whole mechanism exists to catch.
 *
 * Each test builds real Git state in a temporary repository, applies exactly
 * ONE mutation, and asserts on the specific check that must catch it plus the
 * whole gate. The fixture carries the REAL governed tree (`docs/governance/`,
 * `docs/templates/`, `ai_rules.md`, `CLAUDE.md`) so the fingerprint legs see
 * real content, and a SYNTHETIC commission/ledger pair so the disposition
 * matrix can be exercised against a genuinely NORMATIVE row — the real
 * commission has none.
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
  checkCommissionMonotonic,
  checkCommitMessageCandidates,
  checkDispositions,
  checkGovernedObligation,
  checkLedgerCoverage,
  checkOwnerAcceptance,
  governedFingerprint,
  loadContext,
  messageRangeHash,
  runGate,
} from '../support/authorLedger';

const REAL = resolve(__dirname, '..', '..');
const GOVERNED_FILE = 'docs/governance/OPERATING_AGREEMENT.md';

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

const ledgerMd = (
  fingerprint: string,
  baseCommit: string,
  messageRange: string,
) => `# Fixture ledger

governed fingerprint: \`${fingerprint}\`
base commit: \`${baseCommit}\`
commit-message range: \`${messageRange}\`

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
  g('add', '-A');
  g('commit', '-q', '-m', 'fixture base tree');
  baseSha = g('rev-parse', 'HEAD').trim();

  g('checkout', '-q', '-b', 'feature/fixture');
  mkdirSync(join(dir, 'docs/reviews'), { recursive: true });
  writeC(commissionMd());
  writeL(ledgerMd('unset', 'unset', 'unset'));
  g('add', '-A');
  g('commit', '-q', '-m', 'fixture: the author commission and its ledger');

  // ⭐ THE AMEND LOOP, EXECUTED RATHER THAN ARGUED. Round 1 refuted the claim
  // that hashing commit messages is an infinite regress: commit with the final
  // MESSAGE, compute the range hash, write it in, then `--amend --no-edit`.
  // The message is preserved, so the hash the ledger declares is still the hash
  // the tree computes. Every run of this file re-proves it.
  const pre = loadContext(dir);
  const rangeBeforeAmend = messageRangeHash(dir, pre.mergeBase);
  writeL(ledgerMd(governedFingerprint(dir), pre.mergeBase, rangeBeforeAmend));
  g('add', '-A');
  g('commit', '-q', '--amend', '--no-edit');
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

describe('self-pass gate — the green control', () => {
  it('a correctly certified branch passes every check', () => {
    expect(runGate(loadContext(dir))).toEqual([]);
  });

  /**
   * ⭐ THE REFUTED "INFINITE REGRESS", EXECUTED. The withdrawn rationale said a
   * literal hash of commit messages cannot be recorded because recording it
   * needs another commit whose message changes the hash again. That is true of
   * a HEAD SHA and false of a MESSAGE range. Here is the real authoring loop:
   * edit the ledger, stage it, `--amend --no-edit`. The tree changes, HEAD
   * moves, the message is untouched, and the declared hash still matches.
   */
  it('the certificate survives `git commit --amend --no-edit` — the refuted "infinite regress"', () => {
    const before = loadContext(dir);
    const hashBefore = messageRangeHash(dir, before.mergeBase);
    const headBefore = before.head;
    writeL(readL().replace('measured in the fixture', 'measured in the fixture, then amended'));
    g('add', '-A');
    g('commit', '-q', '--amend', '--no-edit');
    const after = loadContext(dir);
    expect(after.head).not.toBe(headBefore); // HEAD moved…
    expect(messageRangeHash(dir, after.mergeBase)).toBe(hashBefore); // …the message range did not
    expect(checkCertificate(after)).toEqual([]);
    expect(runGate(after)).toEqual([]);
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
    // Exactly round 1's fixture: relabel C02 to a duplicate C01, then delete
    // ledger C02 so the sets still compare equal.
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

  it('dropping a question AFTER the reviewer committed their deliverable is red', () => {
    writeFileSync(
      join(dir, 'docs/reviews/fixture-codex-review.md'),
      '# review\n\nCHANGES-REQUIRED\n',
    );
    g('add', '-A');
    g('commit', '-q', '-m', 'docs(review): the reviewer deliverable');
    writeC(dropRow(readC(), 'C02'));
    writeL(dropRow(readL(), 'C02'));
    const ctx = loadContext(dir);
    expect(checkCommissionInput(ctx)).toEqual([]); // internally consistent…
    expect(checkLedgerCoverage(ctx)).toEqual([]); // …in both directions…
    expectRed(checkCommissionMonotonic(ctx)); // …and still caught by the reviewer's snapshot
  });

  /**
   * ⚠⚠ THE BOUNDARY, PINNED AS AN EXECUTABLE STATEMENT RATHER THAN A PARAGRAPH.
   * Before any reviewer deliverable exists on the branch there is no anchor the
   * author does not control, so deleting a question together with its ledger
   * row leaves both artifacts consistent and the gate GREEN. This is the same
   * class as never writing the question down, and it is NOT closed. If a future
   * change closes it, this test will fail and must be rewritten as a red case —
   * which is the point of asserting it.
   */
  it('KNOWN-OPEN: with no reviewer deliverable yet, dropping a question and its row stays GREEN', () => {
    writeC(dropRow(readC(), 'C02'));
    writeL(dropRow(readL(), 'C02'));
    expect(runGate(loadContext(dir))).toEqual([]);
  });
});

describe('round-1 M2 — a disposition is legal only for the KIND it is awarded to', () => {
  it('an EMPIRICAL row dispositioned DISCLOSED is red', () => {
    setRow('C01', 'DISCLOSED', 'The in-scope defect is real, unresolved and unaccepted.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('an EMPIRICAL row dispositioned NORMATIVE is red', () => {
    setRow('C01', 'NORMATIVE', 'Declared a rule instead of running anything.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('a NORMATIVE row dispositioned PASS is red — a rule cannot be "run"', () => {
    setRow('C03', 'PASS', 'Claimed to have measured a prohibition.');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('a NORMATIVE row dispositioned NORMATIVE is green', () => {
    setRow('C03', 'NORMATIVE', 'Quoted verbatim from the governing text.');
    expect(runGate(loadContext(dir))).toEqual([]);
  });

  it('any row dispositioned UNRUN is red', () => {
    setRow('C01', 'UNRUN', 'not executed');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('an unrecognised disposition is red', () => {
    setRow('C01', 'PROBABLY-FINE', 'looks alright');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('a row with empty evidence is red', () => {
    setRow('C01', 'PASS', '');
    expectRed(checkDispositions(loadContext(dir)));
  });

  it('OWNER-ACCEPTED without an "owner:" citation is red', () => {
    setRow('C01', 'OWNER-ACCEPTED', 'The residue was accepted.');
    expectRed(checkOwnerAcceptance(loadContext(dir)));
  });

  it('OWNER-ACCEPTED with an "owner:" citation is the one route by which a residue passes', () => {
    setRow('C01', 'OWNER-ACCEPTED', 'owner: BaggyG-AU accepted this residue on the PR thread.');
    expect(runGate(loadContext(dir))).toEqual([]);
  });
});

describe('round-1 M3 — the certificate is bound to a base/head lifecycle', () => {
  it('a LATER branch inheriting the artifacts unchanged is red', () => {
    // Round 1's exact fixture: simulate the post-merge state and add a commit
    // whose whole message carries no count candidate at all.
    g('update-ref', 'refs/remotes/origin/main', certified);
    g('commit', '-q', '--allow-empty', '-m', 'all checks passed');
    const ctx = loadContext(dir);
    expect(checkCommitMessageCandidates(ctx)).toEqual([]); // the count key sees nothing…
    expectRed(checkCertificate(ctx)); // …and the lifecycle binding catches it anyway
  });

  it('a later commit on the SAME branch invalidates the certificate until it is regenerated', () => {
    g('commit', '-q', '--allow-empty', '-m', 'a further commit with no numbers in it');
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('a malformed fingerprint declaration is a loud failure, not a silent no-op', () => {
    writeL(
      readL().replace(/^governed fingerprint: `[^`]*`$/m, 'governed fingerprint: `not-a-hash`'),
    );
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('a missing "base commit" declaration is red', () => {
    writeL(readL().replace(/^base commit: `[^`]*`\n/m, ''));
    expectRed(checkCertificate(loadContext(dir)));
  });

  it('a missing "commit-message range" declaration is red', () => {
    writeL(readL().replace(/^commit-message range: `[^`]*`\n/m, ''));
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
