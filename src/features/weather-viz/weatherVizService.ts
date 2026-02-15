import type {
  NormalizedWeatherVizConfig,
  WeatherForecastPoint,
  WeatherForecastSummary,
  WeatherForecastVisualizationCardConfig,
  WeatherVizMetric,
} from './types';

const DEFAULT_METRICS: WeatherVizMetric[] = ['temperature', 'precipitation', 'wind_speed'];
const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const isMetric = (value: unknown): value is WeatherVizMetric =>
  value === 'temperature' || value === 'precipitation' || value === 'wind_speed';

export const normalizeWeatherVizConfig = (
  card: WeatherForecastVisualizationCardConfig,
): NormalizedWeatherVizConfig => {
  const requestedMode = card.mode === 'hourly' || card.forecast_type === 'hourly' ? 'hourly' : 'daily';
  const metrics = Array.isArray(card.metrics) ? card.metrics.filter(isMetric) : [];

  return {
    mode: requestedMode,
    metrics: metrics.length > 0 ? metrics : DEFAULT_METRICS,
    iconAnimation: card.icon_animation === 'off' || card.icon_animation === 'pulse' ? card.icon_animation : 'subtle',
    days: clamp(Math.floor(toNumber(card.days) ?? 5), 1, 7),
    locale: typeof card.locale === 'string' && card.locale.trim().length > 0 ? card.locale.trim() : undefined,
    unitSystem: card.unit_system === 'metric' || card.unit_system === 'imperial' ? card.unit_system : 'auto',
    showForecast: card.show_forecast !== false,
  };
};

const toTimestamp = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeForecastPoint = (item: unknown): WeatherForecastPoint | null => {
  if (!item || typeof item !== 'object') return null;

  const source = item as Record<string, unknown>;
  const timestamp = toTimestamp(source.datetime) ?? toTimestamp(source.time);
  if (!timestamp) return null;

  return {
    datetime: new Date(timestamp).toISOString(),
    timestamp,
    condition: typeof source.condition === 'string' ? source.condition : 'unknown',
    temperature: toNumber(source.temperature),
    templow: toNumber(source.templow),
    precipitation: toNumber(source.precipitation),
    precipitationProbability: toNumber(source.precipitation_probability),
    windSpeed: toNumber(source.wind_speed),
    windBearing: toNumber(source.wind_bearing),
  };
};

export const normalizeForecastPayload = (
  rawForecast: unknown,
  mode: 'daily' | 'hourly',
  days: number,
): WeatherForecastPoint[] => {
  if (!Array.isArray(rawForecast)) return [];

  const normalized = rawForecast
    .map(normalizeForecastPoint)
    .filter((point): point is WeatherForecastPoint => Boolean(point))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (mode === 'hourly') {
    return normalized.slice(0, days * 24);
  }

  return normalized.slice(0, days);
};

const guessTempUnit = (value: string | undefined): 'C' | 'F' | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('f')) return 'F';
  if (normalized.includes('c')) return 'C';
  return undefined;
};

const convertTemperature = (
  value: number,
  sourceUnit: 'C' | 'F',
  targetUnit: 'C' | 'F',
): number => {
  if (sourceUnit === targetUnit) return value;
  return sourceUnit === 'C' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
};

const convertWindSpeed = (
  value: number,
  sourceUnit: string | undefined,
  targetUnit: 'km/h' | 'mph',
): number => {
  const normalizedSource = (sourceUnit ?? '').toLowerCase();
  let kmh = value;

  if (normalizedSource.includes('m/s')) {
    kmh = value * 3.6;
  } else if (normalizedSource.includes('mph')) {
    kmh = value * 1.60934;
  }

  if (targetUnit === 'mph') {
    return kmh / 1.60934;
  }

  return kmh;
};

export const formatTemperature = (
  value: number | undefined,
  unitSystem: 'auto' | 'metric' | 'imperial',
  sourceUnitText?: string,
  roundValue = true,
): string => {
  if (value === undefined) return '--';

  const sourceUnit = guessTempUnit(sourceUnitText) ?? 'C';
  const targetUnit = unitSystem === 'imperial' ? 'F' : unitSystem === 'metric' ? 'C' : sourceUnit;
  const converted = convertTemperature(value, sourceUnit, targetUnit);
  const rendered = roundValue ? Math.round(converted) : Number(converted.toFixed(1));
  return `${rendered}°${targetUnit}`;
};

export const formatWindSpeed = (
  value: number | undefined,
  unitSystem: 'auto' | 'metric' | 'imperial',
  sourceUnitText?: string,
): string => {
  if (value === undefined) return '--';

  const targetUnit = unitSystem === 'imperial' ? 'mph' : 'km/h';
  if (unitSystem === 'auto' && typeof sourceUnitText === 'string' && sourceUnitText.trim().length > 0) {
    return `${Math.round(value)} ${sourceUnitText}`;
  }

  const converted = convertWindSpeed(value, sourceUnitText, targetUnit);
  return `${Math.round(converted)} ${targetUnit}`;
};

export const formatForecastDate = (
  timestamp: number,
  mode: 'daily' | 'hourly',
  locale?: string,
): string => {
  const formatter = mode === 'hourly'
    ? new Intl.DateTimeFormat(locale, { hour: 'numeric' })
    : new Intl.DateTimeFormat(locale, { weekday: 'short' });
  return formatter.format(new Date(timestamp));
};

export const buildForecastSummary = (points: WeatherForecastPoint[]): WeatherForecastSummary => {
  if (points.length === 0) return {};

  const temperatures = points.map((point) => point.temperature).filter((v): v is number => v !== undefined);
  const precip = points.map((point) => point.precipitation).filter((v): v is number => v !== undefined);
  const winds = points.map((point) => point.windSpeed).filter((v): v is number => v !== undefined);

  return {
    minTemperature: temperatures.length > 0 ? Math.min(...temperatures) : undefined,
    maxTemperature: temperatures.length > 0 ? Math.max(...temperatures) : undefined,
    avgTemperature: temperatures.length > 0
      ? temperatures.reduce((acc, value) => acc + value, 0) / temperatures.length
      : undefined,
    totalPrecipitation: precip.length > 0 ? precip.reduce((acc, value) => acc + value, 0) : undefined,
    maxWindSpeed: winds.length > 0 ? Math.max(...winds) : undefined,
  };
};

export const resolveForecastFallback = (
  points: WeatherForecastPoint[],
  nowTemperature: number | undefined,
): WeatherForecastPoint[] => {
  if (points.length > 0) return points;
  if (nowTemperature === undefined) return [];

  const now = Date.now();
  return [
    {
      datetime: new Date(now).toISOString(),
      timestamp: now,
      condition: 'unknown',
      temperature: nowTemperature,
      precipitation: 0,
      windSpeed: undefined,
    },
    {
      datetime: new Date(now + DAY_MS).toISOString(),
      timestamp: now + DAY_MS,
      condition: 'unknown',
      temperature: nowTemperature,
      precipitation: 0,
      windSpeed: undefined,
    },
  ];
};

export const buildForecastPointAriaLabel = (
  point: WeatherForecastPoint,
  config: NormalizedWeatherVizConfig,
  sourceUnits: { temperature?: string; wind?: string },
): string => {
  const parts: string[] = [formatForecastDate(point.timestamp, config.mode, config.locale)];

  if (config.metrics.includes('temperature')) {
    parts.push(`temperature ${formatTemperature(point.temperature, config.unitSystem, sourceUnits.temperature)}`);
  }
  if (config.metrics.includes('precipitation')) {
    const precip = point.precipitation !== undefined ? `${point.precipitation} mm` : '--';
    parts.push(`precipitation ${precip}`);
  }
  if (config.metrics.includes('wind_speed')) {
    parts.push(`wind ${formatWindSpeed(point.windSpeed, config.unitSystem, sourceUnits.wind)}`);
  }

  return parts.join(', ');
};
