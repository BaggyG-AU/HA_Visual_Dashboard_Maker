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
import { blockingFindings, checkPlan, type PlanFinding } from '../support/planConsistency';

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
  const c3 = (f: PlanFinding[]) => f.filter((x) => x.code === 'C3-COUNTDRIFT');

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

  it('FIRES when two sites AGREE — a second home drifts on the next edit', () => {
    // The owner's 2026-08-31 ruling is ONE home per running total. Two sites
    // that agree today are the SP-22 defect one edit before it shows.
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n- five review rounds complete\n`,
    });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
  });

  // ---- (a) it read only `spec`, so drift ACROSS the split was invisible ----
  it('READS THE HISTORY FILE: a total in the plan and a total in the history is drift', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n`,
      history: 'Across four review rounds the plan produced 20 findings.\n',
    });
    expect(c3(f).length, JSON.stringify(f)).toBeGreaterThan(0);
    expect(c3(f)[0].message).toContain('history:1');
  });

  it('names BOTH files in the message, so the fix is obvious', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n`,
      history: '- six review rounds complete\n',
    });
    expect(c3(f)[0].message).toContain('plan:');
    expect(c3(f)[0].message).toContain('history:');
  });

  // ---- (b) it was anchored on two exact phrasings ----
  it('catches "produced N findings", which the anchored phrasing missed', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- twenty-four findings, none false\n`,
      history: 'the plan produced 24 findings\n',
    });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
  });

  it('catches "the Nth review round" THROUGH MARKDOWN BOLD', () => {
    // Measured necessary: the live plan wrote `the **fourth** review round`,
    // and the asterisks alone kept it out of the frame.
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n- this is the **fourth** review round\n`,
    });
    expect(codes(f), JSON.stringify(f)).toContain('C3-COUNTDRIFT');
  });

  it('catches a sentence-initial "Across five review rounds"', () => {
    // Measured necessary: the frames were case-sensitive, so the capital A in
    // the history file's own opening sentence went unread.
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n`,
      history: 'Across five review rounds the plan grew.\n',
    });
    expect(codes(f), JSON.stringify(f)).toContain('C3-COUNTDRIFT');
  });

  // ---- (c) hyphenated compounds were truncated to their SECOND word ----
  it('parses hyphenated compounds instead of truncating them to a false accept', () => {
    // `twenty-four` used to parse as 4, so a stray `four findings, none false`
    // AGREED with it and the check certified a 24-vs-4 contradiction as clean.
    const f = checkPlan({
      spec: `${WIRED}\n- twenty-four findings, none false\n`,
      history: '- four findings, none false\n',
    });
    const m = c3(f)[0]?.message ?? '';
    expect(m, JSON.stringify(f)).toContain('states 24');
    expect(m).toContain('states 4');
  });

  it('parses compounds above twenty, which the old map could not represent', () => {
    const f = checkPlan({ spec: `${WIRED}\n- twenty-six findings, none false\n` });
    expect(codes(f)).not.toContain('C3-COUNTDRIFT'); // one site only
    const g = checkPlan({
      spec: `${WIRED}\n- twenty-six findings, none false\n`,
      history: '- thirty-one findings, none false\n',
    });
    expect(c3(g)[0].message).toContain('states 26');
    expect(c3(g)[0].message).toContain('states 31');
  });

  // ---- the QUOTED/CODE-SPAN exemption, which is what keeps it usable ----
  it('is SILENT on a quotation the formatter WRAPPED ACROSS A LINE BREAK', () => {
    // Measured necessary: a per-line stripper pairs the closing quote of one
    // phrase with the opening quote of the next and exempts the wrong span, so
    // a document DESCRIBING its own fixed drift tripped its own check.
    const wrapped =
      '- five review rounds complete\n' +
      'the plan said "twenty-four\nfindings" and a stray "four findings, none false"\n' +
      'would have agreed with it\n';
    const f = checkPlan({ spec: `${WIRED}\n${wrapped}` });
    expect(c3(f), JSON.stringify(c3(f), null, 2)).toEqual([]);
  });

  it('is SILENT on a figure inside a backtick code span', () => {
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n- it used to say \`the **fourth** review round\`\n`,
    });
    expect(c3(f), JSON.stringify(c3(f), null, 2)).toEqual([]);
  });

  it('still FIRES when the same figure is asserted OUTSIDE any quote', () => {
    // The exemption must not become a blanket amnesty.
    const f = checkPlan({
      spec: `${WIRED}\n- five review rounds complete\n- this is the **fourth** review round\n`,
    });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
  });

  // ---- the negative population: real historical prose it must LEAVE ALONE ----
  it('is SILENT on historical prose that is not a running total', () => {
    // Lifted verbatim from the live plan and history. A frame list cannot make
    // a semantic judgment about what a number is "about", so the frames are
    // proved against the prose they must not touch, not only against drift.
    const historical = [
      'Option A survived two review rounds and died in a minute.',
      'Two rounds of source review passed a defect execution caught at once.',
      'PARTIALLY RESOLVED**, and raised five new findings.',
      'commit `f1e7240`), whose **five findings were re-verified at source**.',
      'Two rounds of careful source review, by two different agents,',
      '**The re-trace rule held for a third round and caught nothing.**',
      'surfaced it one finding earlier as SP-13**.',
      'wrote the winning test case into his own commission three rounds running.',
    ].join('\n');
    const f = checkPlan({ spec: `${WIRED}\n${historical}\n` });
    expect(c3(f), JSON.stringify(c3(f), null, 2)).toEqual([]);
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

  // ⚠⚠⚠ AN ORDINARY `it`, AND THE READS ARE UNCONDITIONAL (F1, 2026-09-03).
  // This was `it.skipIf(!existsSync(SPEC))` with `existsSync(…) ? … : ''`
  // fallbacks, which meant DELETING OR RENAMING THE PLAN DELETED ITS OWN GATE:
  // Vitest recorded a skip, the runner stayed green, and the gate certified
  // nothing. A mandatory input must be lifecycle-bound to the check that
  // requires it. Measured fail-against-old: with the plan renamed, the old spec
  // reported `23 passed | 1 skipped` and exited 0; this one fails naming the path.
  it('reports no BLOCKING finding against the live plan', () => {
    for (const path of [SPEC, HIST, DSL]) {
      if (!existsSync(path)) {
        throw new Error(
          `the live plan gate requires ${path}, which is missing. If this file was ` +
            `deliberately moved or retired, update this test in the same commit — ` +
            `do not let the gate disappear with its target.`,
        );
      }
    }
    const findings = checkPlan({
      spec: readFileSync(SPEC, 'utf8'),
      history: readFileSync(HIST, 'utf8'),
      dsl: readFileSync(DSL, 'utf8'),
    });
    const blocking = blockingFindings(findings);
    expect(blocking, JSON.stringify(findings, null, 2)).toEqual([]);
  });

  it('CONTROL: the live plan carries exactly ONE canonical totals block', () => {
    const f = checkPlan({ spec: readFileSync(SPEC, 'utf8') });
    expect(codes(f)).not.toContain('C3-NOCANONICAL');
  });
});

// ---------------------------------------------------------------------------
// Controls added 2026-09-03 answering the independent review's F1-F6. Each was
// proved to FAIL against the pre-repair implementation (`94aee56`) before it was
// credited; the disposition table records the per-finding evidence.
// ---------------------------------------------------------------------------
describe('planConsistency — fail-closed structure (review F2/F3)', () => {
  const CANON = '\n```yaml\n# plan-running-totals\nreview_rounds_complete: 7\n```\n';

  it('F2: FIRES when the canonical totals block is MISSING', () => {
    const f = checkPlan({ spec: WIRED });
    expect(codes(f)).toContain('C3-NOCANONICAL');
  });

  it('F2: FIRES when the canonical totals block is DUPLICATED', () => {
    const f = checkPlan({ spec: `${WIRED}${CANON}${CANON}` });
    expect(codes(f)).toContain('C3-NOCANONICAL');
  });

  it('F2: the canonical block counts as a SITE — block + ONE prose restatement is drift', () => {
    const f = checkPlan({ spec: `${WIRED}${CANON}\nSeven review rounds complete.\n` });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
  });

  it('F3: FIRES when the implementation section is ABSENT', () => {
    const f = checkPlan({ spec: `${WIRED}${CANON}` });
    expect(codes(f)).toContain('C4-UNVERIFIABLE');
  });

  it('F3: FIRES when the section exists but no HELPER step does', () => {
    const spec =
      `${WIRED}${CANON}\n4. **Then implementation**, in this order:\n` +
      '   1. **The `src/` change first**\n   2. **Leg 1 first among the mechanism legs**\n---\n';
    expect(codes(checkPlan({ spec }))).toContain('C4-UNVERIFIABLE');
  });

  it('F3: FIRES when the helper anchor is DUPLICATED — the order is then ambiguous', () => {
    const spec =
      `${WIRED}${CANON}\n4. **Then implementation**, in this order:\n` +
      '   1. **Then the helper**\n   2. **Then the helper again**\n' +
      '   3. **Leg 1 first among the mechanism legs**\n---\n';
    expect(codes(checkPlan({ spec }))).toContain('C4-UNVERIFIABLE');
  });

  it('F3: CONTROL — a MISSING leg 1 is deliberately NOT unverifiable', () => {
    // A plan may legitimately schedule no leg 1; the committed `NOT leg 1`
    // fixture depends on this. Absence of the HELPER is the unverifiable case.
    const spec =
      `${WIRED}${CANON}\n4. **Then implementation**, in this order:\n` +
      '   1. **The `src/` change first**\n   2. **Then the helper**\n---\n';
    expect(codes(checkPlan({ spec }))).not.toContain('C4-UNVERIFIABLE');
  });

  it('F3: FIRES when the nested list is FLATTENED to zero parsed steps', () => {
    const spec =
      `${WIRED}${CANON}\n4. **Then implementation**, in this order:\n` +
      '- **Then the helper**\n- **Leg 1 first among the mechanism legs**\n---\n';
    expect(codes(checkPlan({ spec }))).toContain('C4-UNVERIFIABLE');
  });
});

describe("planConsistency — the review's SEV-3 findings (F5/F6)", () => {
  it('F5: a disposition row disposes WITHOUT bold emphasis', () => {
    const spec = `${WIRED}\nSP-99 was raised.\n\n| SP-99 | 1 | RESOLVED | fixed |\n`;
    expect(codes(checkPlan({ spec }))).not.toContain('C2-NODISPOSITION');
  });

  it('F5: CONTROL — the bold form still disposes', () => {
    const spec = `${WIRED}\nSP-98 was raised.\n\n| **SP-98** | 1 | RESOLVED | fixed |\n`;
    expect(codes(checkPlan({ spec }))).not.toContain('C2-NODISPOSITION');
  });

  it('F5: CONTROL — a genuinely undispositioned finding still FIRES', () => {
    expect(codes(checkPlan({ spec: `${WIRED}\nSP-97 was raised.\n` }))).toContain(
      'C2-NODISPOSITION',
    );
  });
});

// ---------------------------------------------------------------------------
// KNOWN-OPEN limits. These assert what the checker CURRENTLY does, honestly, so
// that anyone who later closes a hole breaks the test and must correct the
// claim in the same commit. They are NOT aspirations.
// ---------------------------------------------------------------------------
describe('planConsistency — KNOWN-OPEN limits (recorded, not fixed)', () => {
  const CANON = '\n```yaml\n# plan-running-totals\nreview_rounds_complete: 7\n```\n';

  it('KNOWN-OPEN: C1 counts textual callers, so a disconnected CYCLE reads as wired', () => {
    // Two private methods that only call each other are unreachable from the
    // live DSL, and C1 does not say so. Closing this needs a real call graph.
    const spec =
      '```ts\nprivate async a(): Promise<void> { await this.b(); }\n' +
      'private async b(): Promise<void> { await this.a(); }\n```\n';
    expect(codes(checkPlan({ spec }))).not.toContain('C1-ORPHAN');
  });

  it('KNOWN-OPEN: C3 cannot see a second home stated inside QUOTES', () => {
    const f = checkPlan({
      spec: `${WIRED}${CANON}\nCurrent status: "six review rounds complete".\n`,
    });
    expect(codes(f)).not.toContain('C3-COUNTDRIFT');
  });

  it('KNOWN-OPEN: C3 skips number forms `numberFrom` cannot parse', () => {
    for (const form of ['the eleventh review round', 'the 11th review round']) {
      const f = checkPlan({ spec: `${WIRED}${CANON}\nSee ${form}.\n` });
      expect(codes(f), form).not.toContain('C3-COUNTDRIFT');
    }
  });

  it('KNOWN-OPEN: C3 prose matches are ADVISORY, so a false positive cannot block', () => {
    // Two true historical facts about different sub-arcs collide in one bucket.
    // The finding is raised, but it must never fail a gate.
    const f = checkPlan({
      spec:
        `${WIRED}${CANON}\nAcross two review rounds, option A was rejected.\n` +
        'Across three review rounds, option B was refined.\n',
    });
    expect(codes(f)).toContain('C3-COUNTDRIFT');
    expect(blockingFindings(f).map((x) => x.code)).not.toContain('C3-COUNTDRIFT');
  });
});
