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
import { marked } from 'marked';
import {
  advisoryFindings,
  blockingFindings,
  checkPlan,
  reportAdvisories,
  type PlanFinding,
} from '../support/planConsistency';

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
    // ⚠ The gate SURFACES advisories on a passing run (R2) and fails only on
    // blocking findings. Reporting is part of the gate, not an afterthought.
    reportAdvisories(findings);
    const blocking = blockingFindings(findings);
    expect(blocking, JSON.stringify(findings, null, 2)).toEqual([]);
  });

  it('R2: the gate PATH surfaces an advisory on a PASSING run', () => {
    // Exercises the consumer, not the producer: a real advisory must reach a
    // logger while the gate still passes. Proving the filter works is NOT
    // proving delivery works — that was the R2 defect.
    const spec = `${readFileSync(SPEC, 'utf8')}\nAcross two review rounds, option A was rejected.\n`;
    const findings = checkPlan({
      spec,
      history: readFileSync(HIST, 'utf8'),
      dsl: readFileSync(DSL, 'utf8'),
    });
    const seen: string[] = [];
    const surfaced = reportAdvisories(findings, (m) => seen.push(m));
    expect(advisoryFindings(findings).length).toBeGreaterThan(0);
    expect(surfaced).toBe(advisoryFindings(findings).length);
    expect(seen.join('\n')).toContain('ADVISORY');
    expect(seen.join('\n')).toContain('C3-COUNTDRIFT');
    expect(blockingFindings(findings)).toEqual([]); // and it still does not block
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
  // ⚠ MUST declare all three governed keys with valid values (P7) — a fixture
  // named CANON that is itself missing keys fires C3-NOCANONICAL for a reason
  // unrelated to what any test using it names (found while porting the C3
  // parser plan revision 3, not by review).
  const CANON =
    '\n```yaml\n# plan-running-totals\nreview_rounds_complete: 7\nreviewer_findings: 30\n' +
    'findings_after_round_one: 24\n```\n';

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

  it('P13: an INVALID payload does NOT seed a site — the blocker fires, the advisory does not', () => {
    // Implementation review finding P13. Plan §2.3 item 6 says a site is
    // established only after the payload validates — as a WHOLE, not
    // key-by-key. `reviewer_findings` is malformed here; `review_rounds_complete`
    // is not, and would (wrongly) still seed a 'review-round' site if sites were
    // committed per-key rather than only once every key is confirmed valid.
    const invalid =
      '\n```yaml\n# plan-running-totals\nreview_rounds_complete: 7\nreviewer_findings: bananas\n' +
      'findings_after_round_one: 24\n```\n';
    const f = checkPlan({ spec: `${WIRED}${invalid}\nSeven review rounds complete.\n` });
    expect(codes(f)).toContain('C3-NOCANONICAL');
    expect(codes(f)).not.toContain('C3-COUNTDRIFT');
  });

  it('P13 CONTROL: a VALID payload still seeds a site and still drifts against matching prose', () => {
    // The inverse of the control above, so the P13 fix is proven to narrow the
    // defect rather than to have silenced the site-grouping mechanism outright.
    const f = checkPlan({ spec: `${WIRED}${CANON}\nThirty findings, none false.\n` });
    expect(codes(f)).not.toContain('C3-NOCANONICAL');
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

// ---------------------------------------------------------------------------
// R1 — the canonical block's GRAMMAR, attacked as a class, by delegating each
// term the contract BORROWS — "fenced code block" from CommonMark, "key" from
// YAML — to a real parser instead of hand-rolled line matching. Regenerated
// from the pre-code harness (`docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`
// revision 3 §2.10, `tools/c3-parser-harness.cjs`, 69 ok / 0 FAIL) rather than
// from any review's finding list — which is how three fail-opens no review
// had were found: an unfenced shadow home invisible to a fenced-only scan, a
// hand-written fence-closure test that accepted two genuinely unclosed
// fences, and a `heading.text` equality test that missed every FORMATTED
// shadow home. Every case names the specification clause that decides its
// expected verdict; the reference parsers (`marked` for Markdown, `yaml` for
// YAML) decide the grammar facts. Five cases from the harness's 69 pin a
// DECLARED RESIDUAL rather than attack the grammar and are committed instead
// under `KNOWN-OPEN limits` below, matching this project's convention that a
// known limit is pinned where the other known limits live.
// ---------------------------------------------------------------------------
describe('planConsistency — canonical block grammar (review R1)', () => {
  const MARKER = '# plan-running-totals';
  const MARKER_TEXT = 'plan-running-totals';
  const KEYS = [
    'review_rounds_complete: 7',
    'reviewer_findings: 30',
    'findings_after_round_one: 24',
  ];
  const fence = (body: readonly string[], open = '```yaml', close = '```'): string =>
    [open, MARKER, ...body, close].join('\n');
  const GOOD = fence(KEYS);
  const doc = (...parts: string[]): string => `${WIRED}\n\n${parts.join('\n\n')}\n`;
  const noCanon = (spec: string) => codes(checkPlan({ spec })).includes('C3-NOCANONICAL');

  it('PINS the dialect: marked.defaults.gfm===true, pedantic===false', () => {
    // §2.5 item 3. A future dependency bump that changes the dialect must fail
    // loudly here rather than silently changing what the C3 gate means.
    expect(marked.defaults.gfm).toBe(true);
    expect(marked.defaults.pedantic).toBe(false);
  });

  type Case = readonly [label: string, text: string, must: 'valid' | 'invalid'];
  const CASES: Case[] = [
    ['well-formed canonical block', doc(GOOD), 'valid'],

    // --- fence forms: CommonMark §4.5 ---------------------------------------
    ['tilde fence', doc(fence(KEYS, '~~~yaml', '~~~')), 'valid'],
    ['four-backtick fence', doc(fence(KEYS, '````yaml', '````')), 'valid'],
    ['untagged fence (no info string)', doc(fence(KEYS, '```', '```')), 'valid'],
    [
      'fence indented three spaces (legal)',
      doc(['   ```yaml', `   ${MARKER}`, ...KEYS.map((k) => `   ${k}`), '   ```'].join('\n')),
      'valid',
    ],
    ['backtick in the info string', doc(fence(KEYS, '```yaml`', '```')), 'invalid'],
    [
      'TAB before the opening fence',
      doc(['\t```yaml', MARKER, ...KEYS, '\t```'].join('\n')),
      'invalid',
    ],
    [
      'closer NARROWER than opener (4 open, 3 close)',
      doc(fence(KEYS, '````yaml', '```')),
      'invalid',
    ],
    ['closer WIDER than opener (3 open, 4 close)', doc(fence(KEYS, '```yaml', '````')), 'valid'],
    [
      'closer of the WRONG CHARACTER (backtick open, tilde close)',
      doc(fence(KEYS, '```yaml', '~~~')),
      'invalid',
    ],
    [
      'closer OVER-INDENTED four spaces',
      doc(['```yaml', MARKER, ...KEYS, '    ```'].join('\n'), 'Trailing prose paragraph.'),
      'invalid',
    ],
    [
      'unclosed fence SWALLOWS the rest of the document',
      `${WIRED}\n\n${['```yaml', MARKER, ...KEYS].join('\n')}\n\n## A later section\n\nOrdinary prose.\n`,
      'invalid',
    ],

    // --- leaf-block subtype: CommonMark §4.4 vs §4.5 ------------------------
    [
      'INDENTED code block alone is not a fenced block',
      doc([MARKER, ...KEYS].map((l) => `    ${l}`).join('\n')),
      'invalid',
    ],
    [
      'INDENTED example beside a valid fence is ignored',
      doc(GOOD, [MARKER, 'review_rounds_complete: 99'].map((l) => `    ${l}`).join('\n')),
      'valid',
    ],

    // --- containers: CommonMark §5.1, §5.2 ----------------------------------
    [
      'second canonical block in a BLOCK QUOTE',
      doc(GOOD, ['> ```yaml', `> ${MARKER}`, '> review_rounds_complete: 99', '> ```'].join('\n')),
      'invalid',
    ],
    [
      'second canonical block in a LIST ITEM',
      doc(GOOD, `- item\n\n  \`\`\`yaml\n  ${MARKER}\n  review_rounds_complete: 99\n  \`\`\``),
      'invalid',
    ],
    ['unfenced marker in a BLOCK QUOTE', doc(GOOD, `> ${MARKER}`), 'invalid'],
    ['unfenced marker in a LIST ITEM', doc(GOOD, `- ${MARKER}`), 'invalid'],
    ['unfenced marker in a NESTED block quote', doc(GOOD, `> > ${MARKER}`), 'invalid'],

    // --- heading forms: CommonMark §4.2, §4.3, §6 ---------------------------
    ['plain ATX shadow home', doc(GOOD, MARKER), 'invalid'],
    ['SETEXT shadow home', doc(GOOD, `${MARKER_TEXT}\n${'='.repeat(19)}`), 'invalid'],
    ['ATX with a closing # sequence', doc(GOOD, `${MARKER} #`), 'invalid'],
    ['BOLD shadow home', doc(GOOD, `# **${MARKER_TEXT}**`), 'invalid'],
    ['CODE-SPAN shadow home', doc(GOOD, `# \`${MARKER_TEXT}\``), 'invalid'],
    ['STRIKETHROUGH shadow home', doc(GOOD, `# ~~${MARKER_TEXT}~~`), 'invalid'],
    [
      'REFERENCE-LINK shadow home',
      doc(GOOD, `# [${MARKER_TEXT}][t]`, '[t]: https://example.invalid'),
      'invalid',
    ],
    ['CHARACTER-REFERENCE shadow home', doc(GOOD, '# plan&#x2D;running-totals'), 'invalid'],
    ['formatted SETEXT shadow home', doc(GOOD, `**${MARKER_TEXT}**\n${'='.repeat(19)}`), 'invalid'],
    [
      'CONTROL: a formatted heading that is NOT the marker',
      doc(GOOD, '# **other-running-totals**'),
      'valid',
    ],
    [
      'CONTROL: level-2 heading with the marker text is not a home',
      doc(GOOD, `## ${MARKER_TEXT}`),
      'valid',
    ],
    [
      'RESTORED (rev 1): marker indented four spaces as the first content line',
      doc(fence(KEYS, '```yaml', '```').replace(MARKER, `    ${MARKER}`)),
      'invalid',
    ],
    [
      'CONTROL: marker in an inline code span (live plan, line 14)',
      doc(GOOD, `The figures are in the \`${MARKER_TEXT}\` block.`),
      'valid',
    ],
    [
      'CONTROL: marker inside an HTML comment',
      doc(GOOD, `<!--\n${MARKER}\nDocumentation, not a home.\n-->`),
      'valid',
    ],

    // --- character references: CommonMark §2.5, decided by `entities` ------
    ['UPPERCASE-X hex reference shadow home', doc(GOOD, '# plan&#X2D;running-totals'), 'invalid'],
    ['DECIMAL reference shadow home', doc(GOOD, '# plan&#45;running-totals'), 'invalid'],
    [
      'NAMED reference `&Tab;` decodes to whitespace and collapses away',
      doc(GOOD, '# &Tab;plan-running-totals'),
      'invalid',
    ],
    [
      'CONTROL: `&Nbsp;` is INVALID — the name inventory is case-SENSITIVE',
      doc(GOOD, '# &Nbsp;plan-running-totals'),
      'valid',
    ],
    [
      'CONTROL: an OUT-OF-RANGE code point becomes U+FFFD, it does not throw',
      doc(GOOD, '# unrelated&#x110000;heading'),
      'valid',
    ],
    ['CONTROL: NUL becomes U+FFFD', doc(GOOD, '# unrelated&#0;heading'), 'valid'],
    [
      'CONTROL: a numeric reference with too many digits stays literal',
      doc(GOOD, '# plan&#x0000002D;running-totals'),
      'valid',
    ],
    [
      'CONTROL: a nonentity name stays literal',
      doc(GOOD, '# plan&#xnotanentity;running-totals'),
      'valid',
    ],
    [
      'CONTROL: references stay LITERAL inside a code span',
      doc(GOOD, '# `plan&#x2D;running-totals`'),
      'valid',
    ],

    // --- raw HTML: the owner's declared Markdown-only boundary (P11) -------
    [
      'CONTROL: inline HTML around the words still projects the text',
      doc(GOOD, '# plan-<b>running</b>-totals'),
      'invalid',
    ],

    // --- payload: YAML 1.2 ---------------------------------------------------
    ['empty payload', doc(fence([])), 'invalid'],
    [
      'FLOW-MAPPING payload',
      doc(
        fence([
          '{ review_rounds_complete: 7, reviewer_findings: 30, findings_after_round_one: 24 }',
        ]),
      ),
      'valid',
    ],
    ['SEQUENCE payload (root is not a mapping)', doc(fence(KEYS.map((k) => `- ${k}`))), 'invalid'],
    [
      'malformed YAML payload',
      doc(fence(['review_rounds_complete: [7', ...KEYS.slice(1)])),
      'invalid',
    ],
    [
      'MULTI-DOCUMENT payload',
      doc(fence([...KEYS, '---', 'review_rounds_complete: 99'])),
      'invalid',
    ],
    [
      'governed keys NESTED one level deep',
      doc(fence(['totals:', ...KEYS.map((k) => `  ${k}`)])),
      'invalid',
    ],
    ['governed key COMMENTED OUT', doc(fence([`# ${KEYS[0]}`, ...KEYS.slice(1)])), 'invalid'],
    [
      'key-shaped text inside a BLOCK SCALAR',
      doc(fence(['notes: |', ...KEYS.map((k) => `  ${k}`)])),
      'invalid',
    ],
    [
      'CONTROL: real keys PLUS a scalar mentioning one',
      doc(fence([...KEYS, 'notes: |', '  review_rounds_complete: 6'])),
      'valid',
    ],
    ['QUOTED duplicate key', doc(fence([...KEYS, '"review_rounds_complete": 999'])), 'invalid'],
    ['duplicate key with the SAME value', doc(fence([...KEYS, KEYS[0]])), 'invalid'],
    [
      'ALIAS used as a duplicate key',
      doc(fence([`&k ${KEYS[0]}`, '*k : 8', ...KEYS.slice(1)])),
      'invalid',
    ],
    [
      'RESTORED (rev 1): an ALIAS resolving to an integer is a valid value',
      doc(fence(['base: &n 7', 'review_rounds_complete: *n', ...KEYS.slice(1)])),
      'valid',
    ],
    [
      'an ALIAS resolving to a STRING is not a count',
      doc(fence(['base: &n oops', 'review_rounds_complete: *n', ...KEYS.slice(1)])),
      'invalid',
    ],
    [
      'CONTROL: a key that merely CONTAINS a governed key',
      doc(fence([...KEYS, 'x_reviewer_findings: 1'])),
      'valid',
    ],

    // --- values: the owner's P7 ruling ---------------------------------------
    ['STRING value', doc(fence(['review_rounds_complete: bananas', ...KEYS.slice(1)])), 'invalid'],
    ['NEGATIVE value', doc(fence(['review_rounds_complete: -1', ...KEYS.slice(1)])), 'invalid'],
    ['NULL value', doc(fence(['review_rounds_complete: null', ...KEYS.slice(1)])), 'invalid'],
    ['SEQUENCE value', doc(fence(['review_rounds_complete: [7]', ...KEYS.slice(1)])), 'invalid'],
    ['FLOAT value', doc(fence(['review_rounds_complete: 7.5', ...KEYS.slice(1)])), 'invalid'],
    [
      'CONTROL: zero is a legitimate total',
      doc(fence(['review_rounds_complete: 0', ...KEYS.slice(1)])),
      'valid',
    ],

    // --- YAML dialect: §2.2 names 1.2; implementation review finding P12 ----
    [
      'an explicit %YAML 1.1 directive lets a sexagesimal scalar pass as a count',
      doc(fence(['%YAML 1.1', '---', 'review_rounds_complete: 1:20', ...KEYS.slice(1)])),
      'invalid',
    ],
    [
      'CONTROL: the SAME sexagesimal scalar under an explicit %YAML 1.2 directive still blocks',
      doc(fence(['%YAML 1.2', '---', 'review_rounds_complete: 1:20', ...KEYS.slice(1)])),
      'invalid',
    ],
    [
      // Implementation review finding P16: a syntactically well-formed but
      // UNSUPPORTED numeric version is not a parser ERROR — `yaml` reports it
      // as a `BAD_DIRECTIVE` WARNING and keeps the fallback effective version
      // at 1.2, so checking `directives.yaml.version !== '1.2'` alone cannot
      // see it. A higher minor version.
      'an unsupported %YAML 1.3 directive (a BAD_DIRECTIVE warning, not an error) still blocks',
      doc(fence(['%YAML 1.3', '---', ...KEYS])),
      'invalid',
    ],
    [
      // The same class, an incompatible major version.
      'an unsupported %YAML 2.0 directive (a different major version) still blocks',
      doc(fence(['%YAML 2.0', '---', ...KEYS])),
      'invalid',
    ],

    // --- reserved directives: YAML 1.2.2 §6.8; implementation review P19 ---
    [
      // Implementation review finding P19: `yaml` reports an UNKNOWN
      // (reserved) directive through the exact same `BAD_DIRECTIVE` warning
      // code as an unsupported `%YAML` version. §6.8 requires processors to
      // accept the document and only warn — this is a valid totals block, not
      // a dialect violation, and must not block.
      'CONTROL: a reserved %FOO directive is warned about, not blocked (P19)',
      doc(fence(['%FOO bar', '---', ...KEYS])),
      'valid',
    ],
    [
      // The construction that broke the naive `directives.yaml.explicit`
      // discriminator floated during the P19 review: `explicit` is true here
      // because of the VALID %YAML 1.2 directive, even though the warning is
      // about the unrelated %FOO. Must still not block.
      'CONTROL: an explicit %YAML 1.2 directive beside a reserved %FOO still passes',
      doc(fence(['%YAML 1.2', '%FOO bar', '---', ...KEYS])),
      'valid',
    ],
    [
      // A genuinely unsupported version paired with a reserved directive must
      // still block on the version, proving the P19 fix did not narrow P16's
      // coverage back open.
      'a reserved %FOO directive does not mask a genuinely unsupported %YAML 1.3',
      doc(fence(['%YAML 1.3', '%FOO bar', '---', ...KEYS])),
      'invalid',
    ],
  ];

  for (const [label, text, must] of CASES) {
    it(`${must === 'invalid' ? 'FIRES' : 'is SILENT'}: ${label}`, () => {
      expect(noCanon(text), text).toBe(must === 'invalid');
    });
  }
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
  // ⚠ MUST declare all three governed keys with valid values (P7) — a fixture
  // named CANON that is itself missing keys fires C3-NOCANONICAL for a reason
  // unrelated to what any test using it names (found while porting the C3
  // parser plan revision 3, not by review).
  const CANON =
    '\n```yaml\n# plan-running-totals\nreview_rounds_complete: 7\nreviewer_findings: 30\n' +
    'findings_after_round_one: 24\n```\n';

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

  // -------------------------------------------------------------------------
  // §2.7 declared residuals of the C3 parser repair (plan revision 3), pinned
  // by passing controls asserting CURRENT behaviour — the same discipline as
  // the C1/C3 limits above. Ported from `tools/c3-parser-harness.cjs` (§2.5
  // item 4), which labels each of the first four `KNOWN-OPEN:`; the no-space
  // and ungoverned-key cases are added fresh per the same item.
  // -------------------------------------------------------------------------
  const c3nocanon = (spec: string) => codes(checkPlan({ spec })).includes('C3-NOCANONICAL');

  it('KNOWN-OPEN: an unclosed fence at END OF FILE is a valid block', () => {
    // The unterminated-fence departure was WITHDRAWN (§1.4, review finding
    // P1): CommonMark ends an unclosed fence at end of file, and this
    // fixture — nothing after the fence at all — is the simplest case of it.
    const spec =
      `${WIRED}\n\n\`\`\`yaml\n# plan-running-totals\nreview_rounds_complete: 7\n` +
      'reviewer_findings: 30\nfindings_after_round_one: 24';
    expect(c3nocanon(spec)).toBe(false);
  });

  it('KNOWN-OPEN: an unclosed fence swallows later content that YAML reads as comments', () => {
    // ⚠ NOT a universal — implementation review finding P14 (corrected; an
    // earlier version of this comment, and of the code comment it was copied
    // from, overstated the claim as "the swallow risk is caught by the YAML
    // parse" without qualification). ORDINARY swallowed prose, and deleting
    // the LIVE plan's own closer, are caught: the swallowed material then
    // fails to parse as valid YAML (see the disproof control below). Here the
    // swallowed material is ITSELF valid YAML — `##`/`###` headings, which
    // YAML reads as comments — so the payload still validates and NOTHING
    // catches it. That is the real, narrower residual §2.7 declares.
    const spec =
      `${WIRED}\n\n\`\`\`yaml\n# plan-running-totals\nreview_rounds_complete: 7\n` +
      'reviewer_findings: 30\nfindings_after_round_one: 24\n\n## Later section\n\n### Last section\n';
    expect(c3nocanon(spec)).toBe(false);
  });

  it('DISPROOF (of a false universal, P14): ordinary swallowed PROSE is still caught', () => {
    // The contrast that makes the residual above precise rather than a
    // blanket "closure is unnecessary" claim: swallowed content that is NOT
    // itself valid YAML still fails the payload parse.
    const spec =
      `${WIRED}\n\n\`\`\`yaml\n# plan-running-totals\nreview_rounds_complete: 7\n` +
      'reviewer_findings: 30\nfindings_after_round_one: 24\n\nA later section.\n\nOrdinary prose.\n';
    expect(c3nocanon(spec)).toBe(true);
  });

  it('KNOWN-OPEN: an IMAGE heading contributes no visible text', () => {
    // `# ![plan-running-totals](i.png)` is not a shadow home — a reader sees a
    // picture, not the `alt` attribute (§2.2a).
    const f = checkPlan({
      spec: `${WIRED}${CANON}\n# ![plan-running-totals](i.png)\n`,
    });
    expect(codes(f)).not.toContain('C3-NOCANONICAL');
  });

  it('KNOWN-OPEN: a raw `<h1>` renders a visible title and is NOT seen', () => {
    // Owner-ruled (P11): the contract stays Markdown-only, as §2.1 literally
    // says, rather than acquiring an HTML parsing boundary.
    const f = checkPlan({
      spec: `${WIRED}${CANON}\n<h1>plan-running-totals</h1>\n`,
    });
    expect(codes(f)).not.toContain('C3-NOCANONICAL');
  });

  it('KNOWN-OPEN: `#plan-running-totals` with no space is not a heading', () => {
    // CommonMark requires a space (or the line end) after the `#` for an ATX
    // heading; without it the line is an ordinary paragraph, correctly not a
    // shadow home.
    const f = checkPlan({
      spec: `${WIRED}${CANON}\n#plan-running-totals\n`,
    });
    expect(codes(f)).not.toContain('C3-NOCANONICAL');
  });

  it('KNOWN-OPEN: ungoverned keys in the canonical block are unconstrained', () => {
    // Only the three GOVERNED keys are value-checked; `review_rounds_owed`,
    // `repair_introduced_after_round_one` and `executable_spec_lines` are not.
    const spec =
      `${WIRED}\n\n\`\`\`yaml\n# plan-running-totals\nreview_rounds_complete: 7\n` +
      'reviewer_findings: 30\nfindings_after_round_one: 24\nreview_rounds_owed: bananas\n```\n';
    expect(c3nocanon(spec)).toBe(false);
  });
});
