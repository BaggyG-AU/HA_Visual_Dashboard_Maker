import { describe, expect, it } from 'vitest';
import { normalizeGaugeCardProConfig, normalizeGaugeSegments } from '../../src/features/gauge/gaugeService';
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
});
