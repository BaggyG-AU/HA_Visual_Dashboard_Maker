import { describe, expect, it } from 'vitest';
import {
  buildSparklineDataset,
  downsampleSparklineData,
  normalizeSparklineCard,
  parseRangePresetToHours,
} from '../../src/features/sparkline/sparklineService';
import type { SparklineCardConfig } from '../../src/features/sparkline/types';

const makeCard = (overrides: Partial<SparklineCardConfig> = {}): SparklineCardConfig => ({
  type: 'custom:mini-graph-card',
  entities: ['sensor.living_room_temperature'],
  ...overrides,
});

describe('sparklineService', () => {
  it('parses supported range presets to hours', () => {
    expect(parseRangePresetToHours('1h')).toBe(1);
    expect(parseRangePresetToHours('6h')).toBe(6);
    expect(parseRangePresetToHours('24h')).toBe(24);
    expect(parseRangePresetToHours('7d')).toBe(168);
    expect(parseRangePresetToHours('invalid')).toBeNull();
  });

  it('normalizes sparkline options from mini-graph card shape', () => {
    const normalized = normalizeSparklineCard(makeCard({
      hours_to_show: 168,
      line_width: 3,
      points_per_hour: 2,
      height: 64,
      show: { fill: true, extrema: true, state: false },
    }));

    expect(normalized.rangePreset).toBe('7d');
    expect(normalized.style).toBe('area');
    expect(normalized.lineWidth).toBe(3);
    expect(normalized.pointsPerHour).toBe(2);
    expect(normalized.compact).toBe(true);
    expect(normalized.showMinMax).toBe(true);
    expect(normalized.showCurrent).toBe(false);
  });

  it('downsamples while preserving extrema and boundaries', () => {
    const points = Array.from({ length: 120 }, (_, index) => ({
      timestamp: index,
      value: index === 40 ? -10 : index === 90 ? 35 : Math.sin(index / 10),
    }));

    const sampled = downsampleSparklineData(points, 24);

    expect(sampled.length).toBeLessThanOrEqual(24);
    expect(sampled[0].timestamp).toBe(0);
    expect(sampled[sampled.length - 1].timestamp).toBe(119);
    expect(sampled.some((point) => point.value === -10)).toBe(true);
    expect(sampled.some((point) => point.value === 35)).toBe(true);
  });

  it('builds deterministic sparkline dataset with marker indexes', () => {
    const normalized = normalizeSparklineCard(makeCard({
      hours_to_show: 24,
      points_per_hour: 4,
    }));

    const dataset = buildSparklineDataset(normalized, '22.5', 1_700_000_000_000, 40);

    expect(dataset.points.length).toBeLessThanOrEqual(40);
    expect(dataset.points.length).toBeGreaterThan(20);
    expect(dataset.current).toBeCloseTo(22.5, 1);
    expect(dataset.minIndex).toBeGreaterThanOrEqual(0);
    expect(dataset.maxIndex).toBeGreaterThanOrEqual(0);
    expect(dataset.currentIndex).toBe(dataset.points.length - 1);
  });
});
