import { describe, expect, it } from 'vitest';
import {
  buildSliderMarkers,
  normalizeAdvancedSliderConfig,
  resolveSliderUpdate,
  snapSliderValue,
} from '../../src/features/advanced-slider/advancedSliderService';
import type { AdvancedSliderCardConfig } from '../../src/features/advanced-slider/types';

const makeCard = (overrides: Partial<AdvancedSliderCardConfig> = {}): AdvancedSliderCardConfig => ({
  type: 'custom:slider-button-card',
  ...overrides,
});

describe('advancedSliderService', () => {
  it('clamps and snaps slider values to configured step and precision', () => {
    const snapped = snapSliderValue(73.19, 0, 100, 5, 0);
    expect(snapped).toBe(75);

    const normalized = normalizeAdvancedSliderConfig(
      makeCard({ min: 0, max: 1, step: 0.25, precision: 2 }),
      0.63,
    );

    expect(normalized.value).toBe(0.75);
    expect(normalized.precision).toBe(2);
  });

  it('generates stepped markers and applies zone colors', () => {
    const normalized = normalizeAdvancedSliderConfig(
      makeCard({
        min: 0,
        max: 20,
        step: 10,
        zones: [
          { from: 0, to: 9, color: '#ff6b6b', label: 'Low' },
          { from: 10, to: 20, color: '#6ccf7f', label: 'High' },
        ],
      }),
      12,
    );

    expect(normalized.markers).toHaveLength(3);
    expect(normalized.markers[0]).toMatchObject({ value: 0, color: '#ff6b6b' });
    expect(normalized.markers[1]).toMatchObject({ value: 10, color: '#6ccf7f' });
    expect(normalized.activeColor).toBe('#6ccf7f');

    const noMarkers = buildSliderMarkers(0, 100, 10, 0, false, normalized.zones);
    expect(noMarkers).toHaveLength(0);
  });

  it('respects commit-on-release behavior for update resolution', () => {
    const deferred = resolveSliderUpdate(20, 30, true, false);
    expect(deferred).toMatchObject({
      draftValue: 30,
      committedValue: 20,
      shouldCommit: false,
    });

    const released = resolveSliderUpdate(20, 30, true, true);
    expect(released).toMatchObject({
      draftValue: 30,
      committedValue: 30,
      shouldCommit: true,
    });

    const immediate = resolveSliderUpdate(20, 25, false, false);
    expect(immediate).toMatchObject({
      committedValue: 25,
      shouldCommit: true,
    });
  });
});
