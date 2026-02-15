import { describe, expect, it } from 'vitest';
import {
  buildDeterministicSeriesData,
  normalizeApexChartsCardConfig,
} from '../../src/features/apexcharts/apexchartsService';
import type { ApexChartsCardConfig } from '../../src/features/apexcharts/types';

const makeCard = (overrides: Partial<ApexChartsCardConfig> = {}): ApexChartsCardConfig => ({
  type: 'custom:apexcharts-card',
  graph_span: '24h',
  update_interval: '30s',
  header: {
    title: 'Apex Chart',
    show: true,
  },
  series: [
    {
      entity: 'sensor.living_room_temperature',
      name: 'Temperature',
      type: 'line',
      color: '#00d9ff',
    },
  ],
  apex_config: {
    chart: {
      type: 'line',
      height: 280,
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
  },
  ...overrides,
});

describe('apexchartsService', () => {
  it('normalizes apex chart defaults and preserves pass-through config', () => {
    const normalized = normalizeApexChartsCardConfig(
      makeCard({
        apex_config: {
          chart: { type: 'line', height: 280, toolbar: { show: true } },
          stroke: { width: 3, curve: 'straight' },
          markers: { size: 4 },
        },
      }),
    );

    expect(normalized.graph_span_seconds).toBe(24 * 60 * 60);
    expect(normalized.update_interval_seconds).toBe(30);
    expect(normalized.apex_config.chart.type).toBe('line');
    expect(normalized.apex_config.chart.height).toBe(280);
    expect(normalized.apex_config.stroke.curve).toBe('straight');
    expect(normalized.apex_config.markers).toEqual({ size: 4 });
  });

  it('applies guardrails for malformed values and missing entities', () => {
    const normalized = normalizeApexChartsCardConfig(
      makeCard({
        graph_span: 'xyz',
        update_interval: 'abc',
        series: [{ entity: '   ' }, { entity: 'sensor.humidity', type: 'invalid-type' }],
        apex_config: {
          chart: { type: 'radialBar', height: 9999 },
          stroke: { width: 99, curve: 'zigzag' },
        },
      }),
    );

    expect(normalized.series).toHaveLength(1);
    expect(normalized.series[0].entity).toBe('sensor.humidity');
    expect(normalized.apex_config.chart.type).toBe('line');
    expect(normalized.apex_config.chart.height).toBe(720);
    expect(normalized.apex_config.stroke.width).toBe(12);
    expect(normalized.apex_config.stroke.curve).toBe('smooth');
    expect(normalized.warnings.length).toBeGreaterThan(0);
  });

  it('builds deterministic preview data for a series', () => {
    const normalized = normalizeApexChartsCardConfig(makeCard());
    const first = buildDeterministicSeriesData(normalized.series[0], normalized.graph_span_seconds, 1_700_000_000_000);
    const second = buildDeterministicSeriesData(normalized.series[0], normalized.graph_span_seconds, 1_700_000_000_000);

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(10);
    expect(first[0].x).toBeLessThan(first[first.length - 1].x);
    expect(first[0].y).toBeGreaterThanOrEqual(0);
  });
});
