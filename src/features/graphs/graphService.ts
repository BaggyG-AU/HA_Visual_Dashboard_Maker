import type {
  GraphServiceDataResult,
  NativeGraphCardConfig,
  NormalizedNativeGraphConfig,
  NormalizedGraphSeriesConfig,
} from './types';

const DEFAULT_COLORS = [
  '#4fa3ff',
  '#6ccf7f',
  '#f5a623',
  '#f76d6d',
  '#b084ff',
  '#32c5d2',
  '#f58bd8',
  '#ffd166',
];

const DEFAULT_RANGE_SECONDS = 24 * 60 * 60;
const DEFAULT_REFRESH_SECONDS = 30;
const MAX_POINTS = 180;

const durationPattern = /^(\d+)(s|m|h|d)$/i;

const toSeconds = (value: unknown, fallback: number): number => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const match = trimmed.match(durationPattern);
  if (!match) return fallback;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;

  const unit = match[2].toLowerCase();
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 3600;
  return amount * 86400;
};

const parseAxisBound = (value: unknown): number | 'auto' => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '' || trimmed === 'auto') return 'auto';
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 'auto';
};

const toBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeSeries = (series: NativeGraphCardConfig['series']): NormalizedGraphSeriesConfig[] => {
  if (!Array.isArray(series) || series.length === 0) {
    return [
      {
        entity: 'sensor.example_temperature',
        label: 'Series 1',
        color: DEFAULT_COLORS[0],
        axis: 'left',
        smooth: true,
        stack: false,
      },
    ];
  }

  return series
    .filter((entry): entry is NonNullable<NativeGraphCardConfig['series']>[number] => Boolean(entry && entry.entity))
    .map((entry, index) => ({
      entity: entry.entity,
      label: entry.label?.trim() || entry.entity.split('.')[1]?.replace(/_/g, ' ') || `Series ${index + 1}`,
      color: entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      axis: entry.axis === 'right' ? 'right' : 'left',
      smooth: toBoolean(entry.smooth, true),
      stack: toBoolean(entry.stack, false),
    }));
};

const clampPoints = (value: number): number => {
  const normalized = Math.floor(value);
  if (!Number.isFinite(normalized) || normalized < 24) return 24;
  return Math.min(normalized, MAX_POINTS);
};

const seededValue = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const formatDuration = (seconds: number, fallback: string): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return fallback;
  if (seconds % 86400 === 0) return `${seconds / 86400}d`;
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
};

export const normalizeGraphConfig = (card: NativeGraphCardConfig): NormalizedNativeGraphConfig => {
  const timeRangeSeconds = toSeconds(card.time_range, DEFAULT_RANGE_SECONDS);
  const refreshSeconds = toSeconds(card.refresh_interval, DEFAULT_REFRESH_SECONDS);

  const chartType = card.chart_type;
  const supportedChartType = chartType === 'line' || chartType === 'bar' || chartType === 'area' || chartType === 'pie'
    ? chartType
    : 'line';

  return {
    type: 'custom:native-graph-card',
    title: card.title,
    chart_type: supportedChartType,
    time_range: formatDuration(timeRangeSeconds, '24h'),
    refresh_interval: formatDuration(refreshSeconds, '30s'),
    time_range_seconds: timeRangeSeconds,
    refresh_interval_seconds: refreshSeconds,
    x_axis: {
      mode: card.x_axis?.mode === 'category' ? 'category' : 'time',
    },
    y_axis: {
      min: parseAxisBound(card.y_axis?.min),
      max: parseAxisBound(card.y_axis?.max),
    },
    series: normalizeSeries(card.series),
    zoom_pan: toBoolean(card.zoom_pan, true),
  };
};

export const buildGraphData = (
  config: NormalizedNativeGraphConfig,
  now = Date.now(),
): GraphServiceDataResult => {
  const pointCount = clampPoints(config.time_range_seconds / Math.max(config.refresh_interval_seconds, 15));
  const pointStep = Math.floor(config.time_range_seconds / pointCount) * 1000;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const timestamp = now - (pointCount - index - 1) * pointStep;
    const row: Record<string, number> = { timestamp };

    config.series.forEach((series, seriesIndex) => {
      const base = 30 + seriesIndex * 15;
      const wave = Math.sin((index + seriesIndex * 7) / 10) * 12;
      const random = (seededValue(index * 13 + seriesIndex * 101) - 0.5) * 6;
      row[`series_${seriesIndex}`] = Number((base + wave + random).toFixed(2));
    });

    return row;
  });

  const pie = config.series.map((series, index) => {
    const lastPoint = points[points.length - 1] ?? { [`series_${index}`]: 0 };
    const latest = Number(lastPoint[`series_${index}`] ?? 0);
    return {
      name: series.label,
      value: Math.max(0.01, Number.isFinite(latest) ? latest : 0.01),
      color: series.color,
    };
  });

  return {
    points: points as Array<{ timestamp: number; [seriesKey: string]: number }>,
    pie,
  };
};
