import { describe, expect, it } from 'vitest';
import {
  normalizeGaugeCardProConfig,
  normalizeGaugeSegments,
} from '../../src/features/gauge/gaugeService';
import type { GaugeCardProConfig } from '../../src/features/gauge/types';

const makeCard = (overrides: Partial<GaugeCardProConfig> = {}): GaugeCardProConfig => ({
  type: 'custom:gauge-card-pro',
  ...overrides,
});

describe('gaugeService', () => {
  it('normalizes defaults and clamps value into range', () => {
    const normalized = normalizeGaugeCardProConfig(
      makeCard({ min: 0, max: 100, gradient: false }),
      170,
    );

    expect(normalized.value).toBe(100);
    expect(normalized.percentage).toBe(100);
    expect(normalized.segments.length).toBeGreaterThan(0);
  });

  it('normalizes segments and sorts by from', () => {
    const segments = normalizeGaugeSegments(
      [
        { from: 70, color: '#6ccf7f', label: 'High' },
        { from: 0, color: '#ff6b6b', label: 'Low' },
      ],
      0,
      100,
    );

    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ from: 0, color: '#ff6b6b' });
    expect(segments[1]).toMatchObject({ from: 70, color: '#6ccf7f' });
  });

  it('resolves active color from matching segment when gradient disabled', () => {
    const card = makeCard({
      gradient: false,
      segments: [
        { from: 0, color: '#ff6b6b', label: 'Low' },
        { from: 30, color: '#ffd166', label: 'Medium' },
        { from: 70, color: '#6ccf7f', label: 'High' },
      ],
    });

    const normalized = normalizeGaugeCardProConfig(card, 30);
    expect(normalized.activeColor).toBe('#ffd166');
  });

  it('interpolates color when gradient is enabled', () => {
    const normalized = normalizeGaugeCardProConfig(
      makeCard({
        min: 0,
        max: 100,
        gradient: true,
        segments: [
          { from: 0, color: '#000000' },
          { from: 100, color: '#ffffff' },
        ],
      }),
      50,
    );

    expect(normalized.activeColor).toBe('#808080');
  });

  // Phase 4 PR-7 — gauge-card-pro nests the primary unit under
  // value_texts.primary.unit_of_measurement (upstream benjamin-dcs). The pre-PR-7
  // flat value_texts.primary_unit is read only as a back-compat fallback.
  // RED-BEFORE-GREEN: confirmed red when the gaugeService change is reverted (base
  // reads only primary_unit, so the nested-path cases resolve to '').
  it('resolves the primary unit from value_texts.primary.unit_of_measurement', () => {
    const normalized = normalizeGaugeCardProConfig(
      makeCard({ value_texts: { primary: { unit_of_measurement: 'psi' } } }),
      50,
    );
    expect(normalized.unit).toBe('psi');
  });

  it('falls back to the deprecated flat value_texts.primary_unit', () => {
    const normalized = normalizeGaugeCardProConfig(
      makeCard({ value_texts: { primary_unit: '%' } }),
      50,
    );
    expect(normalized.unit).toBe('%');
  });

  it('prefers the nested unit over the deprecated flat one', () => {
    const normalized = normalizeGaugeCardProConfig(
      makeCard({ value_texts: { primary: { unit_of_measurement: 'kPa' }, primary_unit: '%' } }),
      50,
    );
    expect(normalized.unit).toBe('kPa');
  });
});
