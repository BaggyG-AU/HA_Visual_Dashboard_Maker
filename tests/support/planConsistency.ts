/**
 * Consistency checks for long-lived governed plan documents.
 *
 * WHY THIS EXISTS, MEASURED AS AT REVISION 6 OF
 * `docs/testing/SPACING_HELPER_PRESET_PLAN.md` (2026-08-31) AND DELIBERATELY NOT
 * MAINTAINED HERE: review of that plan had by then raised the great majority of
 * its findings against defects introduced by the previous round's own repairs.
 * ⚠ The live figures are stated ONCE, in that plan's own cost section — this
 * comment pins a moment rather than carrying a second copy of a running total,
 * which is the exact defect C3 below exists to catch.
 *
 * The measured cause was structural: `tools/checks` gates code with eslint,
 * prettier, tsc and vitest, while the plan — the artifact carrying every one of
 * those defects — was checked by nothing but a formatter.
 *
 * These checks are therefore keyed on the classes that ACTUALLY BIT, not on a
 * general notion of document tidiness. Each one names the finding it comes from.
 *
 * ⚠⚠ THE MOST IMPORTANT PROPERTY OF THIS MODULE IS THAT IT CAN STILL FAIL.
 * While it was being written, the orphan check was silently DEAD for one
 * iteration — a mis-escaped pattern parsed nothing and reported a clean pass.
 * That is why `checkPlan` throws if it cannot parse any declaration, and why the
 * accompanying spec drives every check with known-bad input rather than only
 * asserting that the real document is clean.
 */

export interface PlanFinding {
  /** Stable code, e.g. `C1-ORPHAN`. */
  code: string;
  /** What is wrong, in the plan author's terms. */
  message: string;
}

export interface PlanSources {
  /** The specification document. */
  spec: string;
  /** The companion review-history document, if the plan has been split. */
  history?: string;
  /** The live DSL, so a method called only from real code is not "orphaned". */
  dsl?: string;
}

const UNITS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

/**
 * Parse a number written as digits, a word, an ordinal, or a hyphenated
 * compound.
 *
 * ⚠⚠ THE COMPOUND CASE IS WHY THIS FUNCTION EXISTS. Its predecessor was a
 * single flat map capped at `twenty`, read through a `\w+` capture that cannot
 * span a hyphen — so "twenty-four" parsed as **4**, "twenty-six" as **6** and
 * "twenty-one" as **1**. That is a FALSE ACCEPT, not a miss: the plan's own
 * "twenty-four findings" was held as 4, so a stray "four findings" anywhere
 * would have AGREED with it and the check would have certified a 24-vs-4
 * contradiction as clean.
 */
const numberFrom = (raw: string): number => {
  const t = raw.toLowerCase();
  if (/^\d+$/.test(t)) return Number(t);
  if (t in UNITS) return UNITS[t];
  if (t in TENS) return TENS[t];
  if (t in ORDINALS) return ORDINALS[t];
  const compound = /^([a-z]+)-([a-z]+)$/.exec(t);
  if (compound) {
    const tens = TENS[compound[1]];
    const unit = UNITS[compound[2]];
    if (tens !== undefined && unit !== undefined && unit < 10) return tens + unit;
  }
  return NaN;
};

/** A real method declaration — not a mention of one in prose. */
const DECL =
  /^[ \t]*(?:private[ \t]+)?(?:static[ \t]+)?(?:async[ \t]+)?([a-z]\w*)[ \t]*\([^;{]*?\)[ \t]*:[ \t]*(?:Promise<|Locator|Record<|string|number|boolean|void)/gm;

const stripComments = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const codeBlocks = (s: string): string =>
  [...s.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');

/** Drop quoted spans: a quoted stale figure is being CORRECTED, not asserted. */
const stripQuoted = (line: string): string => line.replace(/["“”][^"“”]*["“”]/g, ' ');

/**
 * Drop markdown emphasis markers before frame matching.
 *
 * ⚠ MEASURED NECESSARY, not defensive: this document emphasises the very words
 * the frames key on, and `the **fourth** review round` does not match a frame
 * written as `the <number> review round` while the asterisks are still there.
 * Only `*` is removed — `_` is left alone because it appears inside real
 * identifiers in this corpus (`card_margin`, `expected-failures`).
 */
const stripEmphasis = (line: string): string => line.replace(/\*/g, '');

export function checkPlan({ spec, history = '', dsl = '' }: PlanSources): PlanFinding[] {
  const out: PlanFinding[] = [];
  const add = (code: string, message: string) => out.push({ code, message });

  // ---- C1 (SP-15): a method DEFINED in a code block must be CALLED somewhere.
  // P4 once survived as a definition, an inventory row and a harness leg with no
  // call site at all — three mentions read like a wired detector.
  const code = stripComments(codeBlocks(spec));
  const defined = new Set([...code.matchAll(DECL)].map((m) => m[1]));
  if (defined.size === 0) {
    throw new Error(
      'planConsistency C1 is DEAD: no method declarations were parsed from the ' +
        'spec. A check that cannot fail must never report a pass.',
    );
  }
  const called = new Set<string>([
    ...[...code.matchAll(/this\.(\w+)\(/g)].map((m) => m[1]),
    // Called only from the live DSL: factual, so no hand-maintained allowlist.
    ...[...stripComments(dsl).matchAll(/this\.(\w+)\(/g)].map((m) => m[1]),
  ]);
  for (const name of [...defined].filter((d) => !called.has(d)).sort()) {
    add('C1-ORPHAN', `\`${name}\` is defined in a code block but nothing calls it (SP-15)`);
  }

  // ---- C2 (coverage): every finding raised must have a disposition row, in
  // either document, so the split cannot hide one.
  const both = `${spec}\n${history}`;
  const raised = new Set([...both.matchAll(/\bSP-(\d+)\b/g)].map((m) => Number(m[1])));
  const disposed = new Set(
    [...both.matchAll(/\|\s*\*\*SP-(\d+)\*\*\s*\|/g)].map((m) => Number(m[1])),
  );
  for (const n of [...raised].filter((n) => !disposed.has(n)).sort((a, b) => a - b)) {
    add('C2-NODISPOSITION', `SP-${n} is referenced but has no disposition row`);
  }

  // ---- C3 (SP-5, and SP-22 TWICE): a running total must have exactly ONE home.
  //
  // ⚠⚠⚠ THIS CHECK REPORTED A CLEAN PASS OVER THE VERY DRIFT IT IS NAMED FOR.
  // Measured against revision 6 of the spacing plan: `checkPlan` returned ZERO
  // findings while the plan called it "the fourth review round" and the history
  // both stated the running totals and claimed it stated none. Three separate
  // defects produced that green, and all three are fixed here:
  //   (a) it read only `spec` — `tally(spec, …)` at BOTH call sites, with
  //       `history` never passed — so drift ACROSS the split was invisible,
  //       which is precisely the drift the split created;
  //   (b) it was anchored on two exact phrasings, so "produced 24 findings"
  //       and "the fourth review round" did not register at all;
  //   (c) its `\w+` capture could not span a hyphen — see `numberFrom`.
  //
  // ⚠⚠ IT IS NOW KEYED ON SITE COUNT, NOT ON VALUE DISAGREEMENT. The owner's
  // 2026-08-31 ruling is that a running total is stated ONCE and every other
  // mention is a pointer; two sites that happen to agree today are the SP-5 /
  // SP-22 defect one edit before it shows. A QUOTED figure stays exempt — it is
  // being corrected, not asserted.
  //
  // ⚠ THE LIMIT, STATED PLAINLY: this is an enumerated FRAME list, not a
  // semantic judgment about what a number is "about". "Option A survived two
  // review rounds" is a historical fact and not a running total, and no regex
  // decides that in general. Each frame below is therefore proved in the
  // accompanying spec against BOTH populations — the sites it must catch, and
  // the real historical prose it must leave alone.
  const FRAMES: ReadonlyArray<{ subject: string; source: string }> = [
    {
      subject: 'review-round',
      source: '\\b([\\w-]+)\\s+(?:independent\\s+)?review\\s+rounds?\\s+complete\\b',
    },
    { subject: 'review-round', source: '\\bthe\\s+([\\w-]+)\\s+review\\s+round\\b' },
    { subject: 'review-round', source: '\\bacross\\s+([\\w-]+)\\s+(?:review\\s+)?rounds?\\b' },
    { subject: 'finding', source: '\\b([\\w-]+)\\s+findings?,?\\s+none\\s+false\\b' },
    { subject: 'finding', source: '\\bproduced\\s+([\\w-]+)\\s+findings?\\b' },
  ];
  const sites = new Map<string, string[]>();
  for (const [file, text] of [
    ['plan', spec],
    ['history', history],
  ] as const) {
    if (!text) continue;
    text.split('\n').forEach((raw, i) => {
      const line = stripEmphasis(stripQuoted(raw));
      for (const { subject, source } of FRAMES) {
        for (const m of line.matchAll(new RegExp(source, 'gi'))) {
          const v = numberFrom(m[1]);
          if (Number.isNaN(v)) continue;
          sites.set(subject, [...(sites.get(subject) ?? []), `${file}:${i + 1} states ${v}`]);
        }
      }
    });
  }
  for (const [subject, where] of [...sites.entries()].sort()) {
    if (where.length > 1) {
      add(
        'C3-COUNTDRIFT',
        `the ${subject} total is asserted at ${where.length} sites; it must be ` +
          `stated ONCE and pointed at from everywhere else — ${where.join('; ')} (SP-22)`,
      );
    }
  }

  // ---- C4 (SP-20): a leg needing the repaired helper cannot precede it.
  const seq = spec.match(/\*\*Then implementation\*\*[\s\S]*?(?=\n\d+\.\s\*\*|\n---)/);
  if (seq) {
    const steps = [...seq[0].matchAll(/\n\s+(\d+)\.\s+\*\*(.*?)\*\*/g)].map(
      (m) => [Number(m[1]), m[2]] as const,
    );
    const helperAt = steps.find(([, t]) => /the helper/i.test(t))?.[0];
    const legAt = steps.find(
      ([, t]) => /\bleg\s*1\b(?!\d)/i.test(t) && !/\bNOT\s+leg\s*1\b/i.test(t),
    )?.[0];
    if (helperAt !== undefined && legAt !== undefined && legAt < helperAt) {
      add(
        'C4-SEQUENCE',
        `leg 1 is scheduled at step ${legAt} but the repaired helper it needs is ` +
          `only built at step ${helperAt} (SP-20)`,
      );
    }
  }

  return out;
}
