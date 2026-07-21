import { describe, it, expect } from 'vitest';
import { summarizeExportWarnings } from '../../src/services/exportWarningSummary';
import type { ExportWarning } from '../../src/services/exportWarnings';

const w = (
  category: ExportWarning['category'],
  reason: ExportWarning['reason'],
): ExportWarning => ({ category, reason, cardType: 'markdown', keys: [], message: 'x' });

describe('summarizeExportWarnings (B8)', () => {
  it('reports nothing and no comment block for zero warnings', () => {
    const s = summarizeExportWarnings([]);
    expect(s.total).toBe(0);
    expect(s.hasLeaks).toBe(false);
    expect(s.lines).toEqual([]);
    expect(s.commentBlock).toBe('');
  });

  it('groups by reason with counts and pluralises', () => {
    const s = summarizeExportWarnings([
      w('placeholder', 'canvas-only-type'),
      w('placeholder', 'canvas-only-type'),
      w('visibility', 'visibility-approximated'),
    ]);
    expect(s.total).toBe(3);
    const placeholder = s.groups.find((g) => g.reason === 'canvas-only-type');
    expect(placeholder?.count).toBe(2);
    expect(placeholder?.line).toContain('2 cards');
    const vis = s.groups.find((g) => g.reason === 'visibility-approximated');
    expect(vis?.count).toBe(1);
    expect(vis?.line).toContain('1 visibility rule');
  });

  it('produces a YAML comment block summarising the warnings', () => {
    const s = summarizeExportWarnings([w('card-mod', 'card-mod-unavailable')]);
    expect(s.commentBlock).toContain('# Home Assistant export summary');
    expect(s.commentBlock).toContain('# - ');
    expect(s.commentBlock).toContain('card-mod');
  });

  it('flags hasLeaks when a self-check warning is present', () => {
    expect(summarizeExportWarnings([w('self-check', 'leaked-internal')]).hasLeaks).toBe(true);
    expect(summarizeExportWarnings([w('placeholder', 'canvas-only-type')]).hasLeaks).toBe(false);
  });
});
