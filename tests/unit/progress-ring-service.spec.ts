import { describe, expect, it } from 'vitest';
import {
  buildRingGeometry,
  normalizeProgressRingCard,
  resolveProgressRingRuntime,
  resolveRingStroke,
  ringDashOffset,
  valueToPercent,
} from '../../src/features/progress-ring/progressRingService';
import type { ProgressRingCardConfig } from '../../src/features/progress-ring/types';

const makeCard = (overrides: Partial<ProgressRingCardConfig> = {}): ProgressRingCardConfig => ({
  type: 'custom:modern-circular-gauge',
  rings: [
    {
      entity: 'sensor.progress',
      min: 0,
      max: 100,
      color: '#4fa3ff',
    },
  ],
  ...overrides,
});

describe('progressRingService', () => {
  it('normalizes ring ranges and clamps runtime values', () => {
    const normalized = normalizeProgressRingCard(
      makeCard({
        rings: [
          {
            entity: 'sensor.progress',
            min: 50,
            max: 20,
            color: '#4fa3ff',
          },
        ],
      }),
    );

    expect(normalized.rings[0].min).toBe(50);
    expect(normalized.rings[0].max).toBe(51);

    const runtime = resolveProgressRingRuntime(normalized, { 'sensor.progress': 999 });
    expect(runtime[0].value).toBe(51);
    expect(runtime[0].percent).toBe(100);
  });

  it('resolves nested ring geometry deterministically', () => {
    const normalized = normalizeProgressRingCard(
      makeCard({
        rings: [
          { entity: 'sensor.one', min: 0, max: 100, thickness: 14 },
          { entity: 'sensor.two', min: 0, max: 100, thickness: 10 },
          { entity: 'sensor.three', min: 0, max: 100, thickness: 8 },
        ],
      }),
    );

    const runtime = resolveProgressRingRuntime(normalized, {
      'sensor.one': 10,
      'sensor.two': 20,
      'sensor.three': 30,
    });

    const layout = buildRingGeometry(runtime, 200, 6, 8);
    expect(layout).toHaveLength(3);
    expect(layout[0].radius).toBeGreaterThan(layout[1].radius);
    expect(layout[1].radius).toBeGreaterThan(layout[2].radius);
    expect(layout[0].thickness).toBe(14);
  });

  it('supports threshold and gradient stroke resolution', () => {
    const normalized = normalizeProgressRingCard(
      makeCard({
        rings: [
          {
            entity: 'sensor.threshold',
            min: 0,
            max: 100,
            color: '#4fa3ff',
            thresholds: [
              { value: 0, color: '#ff6b6b' },
              { value: 60, color: '#ffd166' },
              { value: 90, color: '#6ccf7f' },
            ],
          },
          {
            entity: 'sensor.gradient',
            min: 0,
            max: 100,
            gradient: {
              type: 'linear',
              angle: 90,
              stops: [
                { position: 0, color: '#6ccf7f' },
                { position: 100, color: '#2ca58d' },
              ],
            },
          },
        ],
      }),
    );

    const runtime = resolveProgressRingRuntime(normalized, {
      'sensor.threshold': 95,
      'sensor.gradient': 50,
    });

    expect(resolveRingStroke(runtime[0], 'ring-0')).toBe('#6ccf7f');
    expect(resolveRingStroke(runtime[1], 'ring-1')).toBe('url(#ring-1)');
  });

  it('calculates percent and directional dash offsets', () => {
    expect(valueToPercent(75, 0, 100)).toBe(75);

    const circumference = 100;
    const cw = ringDashOffset(circumference, 25, 'clockwise');
    const ccw = ringDashOffset(circumference, 25, 'counter-clockwise');

    expect(cw).toBe(75);
    expect(ccw).toBe(-75);
  });
});
