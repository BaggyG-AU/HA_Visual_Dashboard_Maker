/**
 * Export-warning summary — slice **B8**. Turns the raw `ExportWarning[]`
 * collected by the boundary (card-mod B6 / visibility B6b / placeholder B7 /
 * self-check B8) into UI-agnostic, plain-language output used by BOTH the
 * pre-deploy summary Alert (`DeployDialog`) and the exported-YAML comment header
 * (`serializeForHA`).
 *
 * Only actionable outcomes carry a warning — a card-mod/visibility translation
 * that succeeds is silent (it just works), so this summary lists the things a
 * user should actually know about: styling that could not be applied, rules that
 * were approximated, cards replaced with a placeholder, and (should never
 * happen) internal fields that leaked through.
 */
import type { ExportWarning, ExportWarningReason } from './exportWarnings';

export interface ExportWarningSummaryGroup {
  reason: ExportWarningReason;
  count: number;
  /** Plain-language, non-expert-friendly one-liner (already pluralised). */
  line: string;
}

export interface ExportWarningSummary {
  total: number;
  /** True if any `self-check` warning is present (an export-boundary bug). */
  hasLeaks: boolean;
  groups: ExportWarningSummaryGroup[];
  /** `groups.map(g => g.line)` — convenience for list rendering. */
  lines: string[];
  /** A `#`-prefixed YAML comment block, or `''` when there is nothing to report. */
  commentBlock: string;
}

const REASON_ORDER: ExportWarningReason[] = [
  'canvas-only-type',
  'card-mod-unavailable',
  'existing-object-style',
  'visibility-approximated',
  'leaked-internal',
];

const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

const lineForReason = (reason: ExportWarningReason, count: number): string => {
  switch (reason) {
    case 'canvas-only-type':
      return `${plural(count, 'card', 'cards')} can't run in Home Assistant and ${
        count === 1 ? 'was' : 'were'
      } replaced with a "Card Not Available" placeholder.`;
    case 'card-mod-unavailable':
      return `${plural(count, 'card', 'cards')} had custom styling removed because the card-mod add-on isn't installed on your Home Assistant.`;
    case 'existing-object-style':
      return `${plural(count, 'card', 'cards')} already had advanced card-mod styling, so the HAVDM layout/style settings weren't merged in automatically.`;
    case 'visibility-approximated':
      return `${plural(count, 'visibility rule', 'visibility rules')} had no exact Home Assistant equivalent and ${
        count === 1 ? 'was' : 'were'
      } approximated.`;
    case 'leaked-internal':
      return `${plural(count, 'card', 'cards')} unexpectedly kept HAVDM-internal fields (please report this — it's an export bug).`;
    default:
      return `${plural(count, 'card', 'cards')} were adjusted.`;
  }
};

export const summarizeExportWarnings = (warnings: ExportWarning[]): ExportWarningSummary => {
  const counts = new Map<ExportWarningReason, number>();
  warnings.forEach((warning) => {
    counts.set(warning.reason, (counts.get(warning.reason) ?? 0) + 1);
  });

  const groups: ExportWarningSummaryGroup[] = REASON_ORDER.filter((reason) =>
    counts.has(reason),
  ).map((reason) => {
    const count = counts.get(reason) as number;
    return { reason, count, line: lineForReason(reason, count) };
  });

  const lines = groups.map((group) => group.line);
  const total = warnings.length;
  const hasLeaks = warnings.some((warning) => warning.category === 'self-check');

  const commentBlock =
    total === 0
      ? ''
      : ['# Home Assistant export summary (HAVDM):', ...lines.map((line) => `# - ${line}`)].join(
          '\n',
        );

  return { total, hasLeaks, groups, lines, commentBlock };
};
