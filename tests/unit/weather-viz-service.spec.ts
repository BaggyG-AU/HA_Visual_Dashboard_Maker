import { describe, expect, it } from 'vitest';
import {
  buildForecastSummary,
  formatForecastDate,
  formatTemperature,
  formatWindSpeed,
  normalizeForecastPayload,
  normalizeWeatherVizConfig,
} from '../../src/features/weather-viz/weatherVizService';
import type { WeatherForecastVisualizationCardConfig } from '../../src/features/weather-viz/types';

const makeCard = (overrides: Partial<WeatherForecastVisualizationCardConfig> = {}): WeatherForecastVisualizationCardConfig => ({
  type: 'weather-forecast',
  entity: 'weather.home',
  ...overrides,
});

describe('weatherVizService', () => {
  it('normalizes mode and default metrics', () => {
    const normalized = normalizeWeatherVizConfig(makeCard({
      mode: 'hourly',
      metrics: ['temperature', 'wind_speed'],
      days: 10,
      icon_animation: 'pulse',
      unit_system: 'imperial',
    }));

    expect(normalized.mode).toBe('hourly');
    expect(normalized.metrics).toEqual(['temperature', 'wind_speed']);
    expect(normalized.days).toBe(7);
    expect(normalized.iconAnimation).toBe('pulse');
    expect(normalized.unitSystem).toBe('imperial');
  });

  it('normalizes forecast payload and filters invalid entries', () => {
    const points = normalizeForecastPayload(
      [
        {
          datetime: '2026-02-15T01:00:00Z',
          temperature: 21.4,
          precipitation: 0.1,
          wind_speed: 10,
          condition: 'sunny',
        },
        { datetime: 'invalid-date', temperature: 99 },
      ],
      'daily',
      3,
    );

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({
      condition: 'sunny',
      temperature: 21.4,
      precipitation: 0.1,
      windSpeed: 10,
    });
  });

  it('formats temperature and wind with metric and imperial units', () => {
    expect(formatTemperature(20, 'metric', '°C')).toBe('20°C');
    expect(formatTemperature(20, 'imperial', '°C')).toBe('68°F');

    expect(formatWindSpeed(10, 'metric', 'mph')).toBe('16 km/h');
    expect(formatWindSpeed(10, 'imperial', 'km/h')).toBe('6 mph');
  });

  it('builds summary metrics and locale date labels', () => {
    const points = normalizeForecastPayload(
      [
        { datetime: '2026-02-15T00:00:00Z', temperature: 10, precipitation: 1.2, wind_speed: 7, condition: 'rainy' },
        { datetime: '2026-02-16T00:00:00Z', temperature: 20, precipitation: 0.4, wind_speed: 13, condition: 'cloudy' },
      ],
      'daily',
      2,
    );

    const summary = buildForecastSummary(points);
    expect(summary.minTemperature).toBe(10);
    expect(summary.maxTemperature).toBe(20);
    expect(summary.avgTemperature).toBe(15);
    expect(summary.totalPrecipitation).toBeCloseTo(1.6);
    expect(summary.maxWindSpeed).toBe(13);

    const label = formatForecastDate(points[0].timestamp, 'daily', 'en-US');
    expect(label.length).toBeGreaterThan(0);
  });
});

