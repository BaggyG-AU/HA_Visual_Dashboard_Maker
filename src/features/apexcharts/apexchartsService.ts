import {
  ApexChartMode,
  ApexChartsCardConfig,
  ApexDataPoint,
  ApexSeriesMode,
  NormalizedApexChartsCardConfig,
  NormalizedApexChartsSeriesConfig,
} from './types';

const DEFAULT_GRAPH_SPAN = '24h';
const DEFAULT_UPDATE_INTERVAL = '30s';
const DEFAULT_HEIGHT = 280;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 720;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_CURVE: NormalizedApexChartsCardConfig['apex_config']['stroke']['curve'] = 'smooth';

const CHART_MODES: ApexChartMode[] = ['line', 'area', 'bar'];
const SERIES_MODES: ApexSeriesMode[] = ['line', 'area', 'column', 'bar'];
const CURVE_MODES: NormalizedApexChartsCardConfig['apex_config']['stroke']['curve'][] = ['smooth', 'straight', 'stepline'];

const toEntityLabel = (entity: string): string => entity.split('.')[1]?.replace(/_/g, ' ') || entity;

const parseDurationToSeconds = (value: string | undefined, fallbackSeconds: number): number => {
  if (!value || typeof value !== 'string') {
    return fallbackSeconds;
  }

  const match = value.trim().match(/^(\d+)(s|m|h|d|w)$/i);
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
    w: 60 * 60 * 24 * 7,
  };
  return amount * multipliers[unit];
};

const asChartMode = (value: unknown): ApexChartMode | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const lowered = value.toLowerCase();
  return CHART_MODES.includes(lowered as ApexChartMode) ? (lowered as ApexChartMode) : null;
};

const asSeriesMode = (value: unknown): ApexSeriesMode | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const lowered = value.toLowerCase();
  return SERIES_MODES.includes(lowered as ApexSeriesMode) ? (lowered as ApexSeriesMode) : undefined;
};

const asCurveMode = (value: unknown): NormalizedApexChartsCardConfig['apex_config']['stroke']['curve'] | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const lowered = value.toLowerCase();
  return CURVE_MODES.includes(lowered as typeof DEFAULT_CURVE) ? (lowered as typeof DEFAULT_CURVE) : null;
};

const normalizeSeries = (
  series: ApexChartsCardConfig['series'],
  warnings: string[],
): NormalizedApexChartsSeriesConfig[] => {
  if (!Array.isArray(series)) {
    warnings.push('Series must be an array for ApexCharts cards.');
    return [];
  }

  return series
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      const entity = typeof entry?.entity === 'string' ? entry.entity.trim() : '';
      if (!entity) {
        warnings.push('Ignored one series entry without a valid entity.');
        return false;
      }
      return true;
    })
    .map(({ entry, index }) => {
      const entity = entry.entity.trim();
      const parsedType = asSeriesMode(entry.type);
      if (entry.type && !parsedType) {
        warnings.push(`Series ${index + 1} uses unsupported type "${entry.type}"; preserving YAML but using card-level type in preview.`);
      }

      return {
        ...entry,
        entity,
        name: (typeof entry.name === 'string' && entry.name.trim()) || toEntityLabel(entity) || `Series ${index + 1}`,
        type: parsedType,
      };
    });
};

export const normalizeApexChartsCardConfig = (card: ApexChartsCardConfig): NormalizedApexChartsCardConfig => {
  const warnings: string[] = [];
  const graphSpanSeconds = parseDurationToSeconds(card.graph_span, 24 * 60 * 60);
  const updateIntervalSeconds = parseDurationToSeconds(card.update_interval, 30);

  if (card.graph_span && graphSpanSeconds === 24 * 60 * 60 && card.graph_span !== DEFAULT_GRAPH_SPAN) {
    warnings.push(`Unsupported graph_span "${card.graph_span}"; using ${DEFAULT_GRAPH_SPAN} in preview.`);
  }
  if (card.update_interval && updateIntervalSeconds === 30 && card.update_interval !== DEFAULT_UPDATE_INTERVAL) {
    warnings.push(`Unsupported update_interval "${card.update_interval}"; using ${DEFAULT_UPDATE_INTERVAL} in preview.`);
  }

  const normalizedSeries = normalizeSeries(card.series, warnings);

  const configChartType = asChartMode(card.apex_config?.chart?.type);
  const firstSeriesType = asChartMode(normalizedSeries[0]?.type);
  const chartType = configChartType || firstSeriesType || 'line';
  if (card.apex_config?.chart?.type && !configChartType) {
    warnings.push(`Unsupported apex_config.chart.type "${card.apex_config.chart.type}"; using "${chartType}" in preview.`);
  }

  const inputHeight = Number(card.apex_config?.chart?.height);
  const normalizedHeight = Number.isFinite(inputHeight)
    ? Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, inputHeight))
    : DEFAULT_HEIGHT;
  if (Number.isFinite(inputHeight) && inputHeight !== normalizedHeight) {
    warnings.push(`Chart height is clamped to ${MIN_HEIGHT}-${MAX_HEIGHT}px in editor preview.`);
  }

  const inputStrokeWidth = Number(card.apex_config?.stroke?.width);
  const strokeWidth = Number.isFinite(inputStrokeWidth)
    ? Math.max(0, Math.min(12, inputStrokeWidth))
    : DEFAULT_STROKE_WIDTH;

  const curveMode = asCurveMode(card.apex_config?.stroke?.curve) || DEFAULT_CURVE;

  return {
    ...card,
    header: {
      ...(card.header || {}),
      show: card.header?.show !== false,
    },
    graph_span: card.graph_span || DEFAULT_GRAPH_SPAN,
    graph_span_seconds: graphSpanSeconds,
    update_interval: card.update_interval || DEFAULT_UPDATE_INTERVAL,
    update_interval_seconds: updateIntervalSeconds,
    series: normalizedSeries,
    apex_config: {
      ...(card.apex_config || {}),
      chart: {
        ...(card.apex_config?.chart || {}),
        type: chartType,
        height: normalizedHeight,
      },
      stroke: {
        ...(card.apex_config?.stroke || {}),
        width: strokeWidth,
        curve: curveMode,
      },
    },
    warnings,
  };
};

const seedForEntity = (entity: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < entity.length; i += 1) {
    hash ^= entity.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const buildDeterministicSeriesData = (
  series: NormalizedApexChartsSeriesConfig,
  graphSpanSeconds: number,
  now = Date.now(),
): ApexDataPoint[] => {
  const points = Math.max(12, Math.min(96, Math.round(graphSpanSeconds / (15 * 60))));
  const intervalMs = Math.floor((graphSpanSeconds * 1000) / points);
  const seed = seedForEntity(series.entity);
  const data: ApexDataPoint[] = [];

  let value = 30 + seededRandom(seed) * 40;
  for (let index = points - 1; index >= 0; index -= 1) {
    const timestamp = now - index * intervalMs;
    const wave = Math.sin((points - index + (seed % 13)) / 4) * 6;
    const variance = (seededRandom(seed + index * 31) - 0.5) * 5;
    value = Math.max(0, value + wave * 0.15 + variance);
    data.push({ x: timestamp, y: Number(value.toFixed(2)) });
  }

  return data;
};
