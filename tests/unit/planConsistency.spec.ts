/**
 * The plan-consistency checker must be able to FAIL. This spec drives every
 * check with known-bad input, because the checker's orphan rule was silently
 * dead for one iteration while it was being written — it parsed nothing and
 * reported a clean pass, and only a re-run against known-bad input caught it.
 *
 * Each fixture is the minimal reproduction of a defect that actually blocked a
 * review round, named by its finding.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { checkPlan } from '../support/planConsistency';

const codes = (f: { code: string }[]) => f.map((x) => x.code);

/** A spec whose helpers form a complete call chain — the passing shape for C1.
 *  ⓘ The first draft of this fixture was itself caught by C1: it wired
 *  `expectSelectShows` but left `selectOptionByText` with no caller. */
const WIRED = `
\`\`\`ts
private async setPreset(prefix: string, preset: string): Promise<void> {
  await this.selectOptionByText(prefix, /x/);
}
private async selectOptionByText(testId: string, pattern: RegExp): Promise<void> {
  await this.expectSelectShows(testId, pattern);
}
private async expectSelectShows(testId: string, expected: RegExp): Promise<void> {
  return;
}
\`\`\`
`;

describe('planConsistency — C1 orphaned definition (SP-15)', () => {
  it('FIRES when a defined helper is never called', () => {
    const orphaned = `
\`\`\`ts
private async selectOptionByText(testId: string, pattern: RegExp): Promise<void> {
  return;
}
private async expectSelectShows(testId: string, expected: RegExp): Promise<void> {
  return;
}
\`\`\`
`;
    const f = checkPlan({ spec: orphaned });
    expect(codes(f)).toContain('C1-ORPHAN');
    expect(f.find((x) => x.code === 'C1-ORPHAN')!.message).toContain('expectSelectShows');
  });

  it('is SILENT when the whole chain is wired', () => {
    // `setPreset` is reached from the public setters, which live in the DSL and
    // are not reproduced in the plan's code block — exactly as in the real plan.
    const f = checkPlan({ spec: WIRED, dsl: 'await this.setPreset("spacing-margin", p);' });
    expect(codes(f), JSON.stringify(f)).not.toContain('C1-ORPHAN');
  });

  it('does not call a helper orphaned when only the LIVE DSL calls it', () => {
    const f = checkPlan({
      spec: `
\`\`\`ts
private async setPreset(a: string, b: string): Promise<void> {
  return;
}
\`\`\`
`,
      dsl: 'await this.setPreset("spacing-margin", preset);',
    });
    expect(codes(f)).not.toContain('C1-ORPHAN');
  });

  it('THROWS rather than passing when it can parse no declaration at all', () => {
    // The dead-check hazard: a broken pattern must not read as a clean plan.
    expect(() => checkPlan({ spec: 'no code blocks here at all' })).toThrow(/DEAD/);
  });
});

describe('planConsistency — C2 disposition coverage', () => {
  it('FIRES when a raised finding has no disposition row', () => {
    const f = checkPlan({ spec: `${WIRED}\nSP-99 was raised.` });
    expect(codes(f)).toContain('C2-NODISPOSITION');
  });

  it('is SILENT when the row lives in the companion history file', () => {
    const f = checkPlan({
      spec: `${WIRED}\nSP-99 was raised.`,
      history: '| **SP-99** | 1 | **RESOLVED** | fixed |',
    });
    expect(codes(f)).not.toContain('C2-NODISPOSITION');
  });
});

describe('planConsistency — C3 count drift (SP-22)', () => {
  it('FIRES when a total is stated with two different values', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- four review rounds complete\n- five review rounds complete\n`,
    });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
  });

  it('does NOT fire on a stale figure that is being quoted and corrected', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n- it wrongly said "four review rounds complete"\n`,
    });
    expect(codes(f)).not.toContain('C3-COUNTDRIFT');
  });
});

describe('planConsistency — C4 leg sequencing (SP-20)', () => {
  const seq = (body: string) =>
    `${WIRED}\n4. **Then implementation**, in this order:\n${body}\n---\n`;

  it('FIRES when leg 1 precedes the helper it needs', () => {
    const f = checkPlan({
      spec: seq(
        '   1. **The `src/` change first**\n   2. **Leg 1 immediately after**\n   3. **Then the helper**',
      ),
    });
    expect(codes(f)).toContain('C4-SEQUENCE');
  });

  it('is SILENT when the helper is built first', () => {
    const f = checkPlan({
      spec: seq(
        '   1. **The `src/` change first**\n   2. **Then the helper**\n   3. **Leg 1 first among the mechanism legs**',
      ),
    });
    expect(codes(f)).not.toContain('C4-SEQUENCE');
  });

  it('is SILENT when a step only mentions leg 1 to exclude it', () => {
    const f = checkPlan({
      spec: seq(
        '   1. **The `src/` change first**\n   2. **A class smoke step — census kind, NOT leg 1**\n   3. **Then the helper**',
      ),
    });
    expect(codes(f)).not.toContain('C4-SEQUENCE');
  });
});

describe('planConsistency — the real plan, when it is present on this branch', () => {
  const SPEC = 'docs/testing/SPACING_HELPER_PRESET_PLAN.md';
  const HIST = 'docs/testing/SPACING_HELPER_PRESET_PLAN_HISTORY.md';
  const DSL = 'tests/support/dsl/spacing.ts';

  it.skipIf(!existsSync(SPEC))('reports no finding against the live plan', () => {
    const findings = checkPlan({
      spec: readFileSync(SPEC, 'utf8'),
      history: existsSync(HIST) ? readFileSync(HIST, 'utf8') : '',
      dsl: existsSync(DSL) ? readFileSync(DSL, 'utf8') : '',
    });
    expect(findings, JSON.stringify(findings, null, 2)).toEqual([]);
  });
});
