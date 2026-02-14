import { describe, expect, it } from 'vitest';
import { buildGraphData, normalizeGraphConfig } from '../../src/features/graphs/graphService';
import type { NativeGraphCardConfig } from '../../src/features/graphs/types';

const makeCard = (overrides: Partial<NativeGraphCardConfig> = {}): NativeGraphCardConfig => ({
  type: 'custom:native-graph-card',
  ...overrides,
});

describe('graphService', () => {
  it('normalizes defaults and parses duration fields', () => {
    const normalized = normalizeGraphConfig(makeCard({ time_range: '7d', refresh_interval: '1m' }));

    expect(normalized.chart_type).toBe('line');
    expect(normalized.time_range_seconds).toBe(7 * 24 * 60 * 60);
    expect(normalized.refresh_interval_seconds).toBe(60);
    expect(normalized.series).toHaveLength(1);
  });

  it('normalizes axis bounds with auto fallback', () => {
    const normalized = normalizeGraphConfig(
      makeCard({
        y_axis: { min: '10.5', max: 'auto' },
      }),
    );

    expect(normalized.y_axis.min).toBe(10.5);
    expect(normalized.y_axis.max).toBe('auto');
  });

  it('normalizes series fallback behavior and chart type constraints', () => {
    const normalized = normalizeGraphConfig(
      makeCard({
        chart_type: 'pie',
        series: [
          { entity: 'sensor.temp', label: 'Temperature', color: '#123456', axis: 'right', smooth: false, stack: true },
          { entity: '', label: 'Invalid' },
        ],
      }),
    );

    expect(normalized.chart_type).toBe('pie');
    expect(normalized.series).toHaveLength(1);
    expect(normalized.series[0]).toMatchObject({
      entity: 'sensor.temp',
      label: 'Temperature',
      color: '#123456',
      axis: 'right',
      smooth: false,
      stack: true,
    });
  });

  it('builds deterministic chart and pie data', () => {
    const normalized = normalizeGraphConfig(
      makeCard({
        series: [
          { entity: 'sensor.a', label: 'A', color: '#4fa3ff' },
          { entity: 'sensor.b', label: 'B', color: '#6ccf7f' },
        ],
      }),
    );

    const data = buildGraphData(normalized, 1_700_000_000_000);

    expect(data.points.length).toBeGreaterThan(20);
    expect(data.points[0]).toHaveProperty('timestamp');
    expect(data.points[0]).toHaveProperty('series_0');
    expect(data.points[0]).toHaveProperty('series_1');
    expect(data.pie).toHaveLength(2);
    expect(data.pie[0]).toMatchObject({ name: 'A', color: '#4fa3ff' });
    expect(data.pie[1]).toMatchObject({ name: 'B', color: '#6ccf7f' });
  });
});
