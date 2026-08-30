/**
 * Consistency checks for long-lived governed plan documents.
 *
 * WHY THIS EXISTS, MEASURED. Across five independent review rounds of
 * `docs/testing/SPACING_HELPER_PRESET_PLAN.md`, 24 findings were raised and
 * **17 of the 18 raised after round 1 were defects introduced by the previous
 * round's own repairs**. The measured cause was structural: `tools/checks` gates
 * code with eslint, prettier, tsc and vitest, while the plan — the artifact
 * carrying every one of those defects — was checked by nothing but a formatter.
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

const WORDS: Record<string, number> = {
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
  twenty: 20,
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

  // ---- C3 (SP-5, SP-22): a total stated in two places drifts on the next edit.
  const tally = (text: string, pattern: RegExp): Map<number, number[]> => {
    const found = new Map<number, number[]>();
    text.split('\n').forEach((raw, i) => {
      for (const m of stripQuoted(raw).matchAll(pattern)) {
        const tok = m[1].toLowerCase();
        const v = WORDS[tok] ?? (/^\d+$/.test(tok) ? Number(tok) : NaN);
        if (Number.isNaN(v)) continue;
        found.set(v, [...(found.get(v) ?? []), i + 1]);
      }
    });
    return found;
  };
  const rounds = tally(spec, /\b(\w+)\s+(?:independent\s+)?review\s+rounds?\s+complete\b/g);
  const finds = tally(spec, /\b(\w+)\s+findings?,?\s+none\s+false\b/g);
  for (const [label, m] of [
    ['review-round', rounds],
    ['finding', finds],
  ] as const) {
    if (m.size > 1) {
      const detail = [...m.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([v, ls]) => `${v} at line(s) ${ls.join(', ')}`)
        .join('; ');
      add('C3-COUNTDRIFT', `${label} count stated with different values: ${detail} (SP-22)`);
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
