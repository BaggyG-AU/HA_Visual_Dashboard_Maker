import { describe, expect, it } from 'vitest';
import { normalizeBubbleHash } from '../../src/services/bubbleCardHash';

// Phase 4 PR-5 — the pure hash normalizer used by the bubble-card pop-up form.
// PropertiesPanel.tsx has no unit harness, so the normalization rules are proven
// here directly; the form wiring is covered by tests/e2e/bubble-card.spec.ts.
describe('normalizeBubbleHash', () => {
  it('adds a leading # when the user omits it', () => {
    expect(normalizeBubbleHash('kitchen')).toBe('#kitchen');
  });

  it('leaves an already-prefixed hash unchanged', () => {
    expect(normalizeBubbleHash('#kitchen')).toBe('#kitchen');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeBubbleHash('  kitchen  ')).toBe('#kitchen');
    expect(normalizeBubbleHash('  #kitchen  ')).toBe('#kitchen');
  });

  it('collapses repeated leading # to a single one', () => {
    expect(normalizeBubbleHash('##kitchen')).toBe('#kitchen');
    expect(normalizeBubbleHash('###living-room')).toBe('#living-room');
  });

  it('returns empty string for blank, whitespace, or bare-# input', () => {
    expect(normalizeBubbleHash('')).toBe('');
    expect(normalizeBubbleHash('   ')).toBe('');
    expect(normalizeBubbleHash('#')).toBe('');
    expect(normalizeBubbleHash('  ##  ')).toBe('');
  });

  it('preserves the hash body verbatim (only the prefix is normalized)', () => {
    expect(normalizeBubbleHash('pop-up_1')).toBe('#pop-up_1');
    expect(normalizeBubbleHash('#Kitchen-Lights')).toBe('#Kitchen-Lights');
  });
});
