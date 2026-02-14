import type {
  NormalizedSparklineCardConfig,
  SparklineCardConfig,
  SparklineDataset,
  SparklinePoint,
  SparklineRangePreset,
  SparklineStyle,
} from './types';

const RANGE_PRESET_HOURS: Record<SparklineRangePreset, number> = {
  '1h': 1,
  '6h': 6,
  '24h': 24,
  '7d': 24 * 7,
};

const DEFAULT_COLOR = '#4fa3ff';
const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_POINTS_PER_HOUR = 1;
const DEFAULT_RANGE_PRESET: SparklineRangePreset = '24h';
const DEFAULT_HEIGHT = 96;
const DEFAULT_MAX_POINTS = 48;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const getPrimaryEntity = (card: SparklineCardConfig): string | undefined => {
  if (typeof card.entity === 'string' && card.entity.trim().length > 0) {
    return card.entity.trim();
  }
  if (!Array.isArray(card.entities) || card.entities.length === 0) return undefined;

  const first = card.entities[0];
  if (typeof first === 'string') return first.trim();
  if (first && typeof first.entity === 'string') return first.entity.trim();
  return undefined;
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

const seededNoise = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const resolveRangePreset = (hours: number): SparklineRangePreset => {
  if (hours <= 1) return '1h';
  if (hours <= 6) return '6h';
  if (hours <= 24) return '24h';
  return '7d';
};

const findExtremaIndices = (points: SparklinePoint[]): { minIndex: number; maxIndex: number } => {
  let minIndex = 0;
  let maxIndex = 0;

  points.forEach((point, index) => {
    if (point.value < points[minIndex].value) minIndex = index;
    if (point.value > points[maxIndex].value) maxIndex = index;
  });

  return { minIndex, maxIndex };
};

export const parseRangePresetToHours = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim() as SparklineRangePreset;
  return RANGE_PRESET_HOURS[normalized] ?? null;
};

export const normalizeSparklineCard = (card: SparklineCardConfig): NormalizedSparklineCardConfig => {
  const parsedPreset = parseRangePresetToHours((card as { range?: unknown }).range);
  const hoursToShow = clamp(
    Math.round(parsedPreset ?? toFiniteNumber(card.hours_to_show, RANGE_PRESET_HOURS[DEFAULT_RANGE_PRESET])),
    1,
    RANGE_PRESET_HOURS['7d'],
  );
  const show = card.show ?? {};
  const style: SparklineStyle = show.fill ? 'area' : 'line';

  return {
    type: 'custom:mini-graph-card',
    entity: getPrimaryEntity(card),
    name: typeof card.name === 'string' ? card.name : undefined,
    color: typeof card.color === 'string' && card.color.trim().length > 0 ? card.color : DEFAULT_COLOR,
    lineWidth: clamp(toFiniteNumber(card.line_width, DEFAULT_LINE_WIDTH), 1, 8),
    pointsPerHour: clamp(toFiniteNumber(card.points_per_hour, DEFAULT_POINTS_PER_HOUR), 0.25, 24),
    hoursToShow,
    rangePreset: resolveRangePreset(hoursToShow),
    style,
    showName: show.name !== false,
    showCurrent: show.state !== false,
    showIcon: show.icon !== false,
    showMinMax: show.extrema === true,
    compact: toFiniteNumber(card.height, DEFAULT_HEIGHT) <= 72,
    height: clamp(toFiniteNumber(card.height, DEFAULT_HEIGHT), 52, 200),
  };
};

export const downsampleSparklineData = (
  points: SparklinePoint[],
  maxPoints = DEFAULT_MAX_POINTS,
): SparklinePoint[] => {
  if (points.length <= maxPoints) return [...points];
  if (maxPoints < 3) return [points[0], points[points.length - 1]];

  const { minIndex, maxIndex } = findExtremaIndices(points);
  const required = new Set<number>([0, points.length - 1, minIndex, maxIndex]);

  const sampled = new Set<number>();
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i += 1) {
    sampled.add(Math.round(i * step));
  }
  required.forEach((index) => sampled.add(index));

  const sorted = () => [...sampled].sort((a, b) => a - b);
  while (sampled.size > maxPoints) {
    const indices = sorted();
    let removeCandidate: number | null = null;
    let smallestGap = Number.POSITIVE_INFINITY;

    for (let i = 1; i < indices.length - 1; i += 1) {
      const index = indices[i];
      if (required.has(index)) continue;
      const gap = indices[i + 1] - indices[i - 1];
      if (gap < smallestGap) {
        smallestGap = gap;
        removeCandidate = index;
      }
    }

    if (removeCandidate === null) break;
    sampled.delete(removeCandidate);
  }

  return sorted().map((index) => points[index]);
};

export const buildSparklineDataset = (
  config: NormalizedSparklineCardConfig,
  currentState: unknown,
  now = Date.now(),
  maxPoints = DEFAULT_MAX_POINTS,
): SparklineDataset => {
  const basePointCount = Math.round(config.hoursToShow * config.pointsPerHour);
  const rawPointCount = clamp(basePointCount, 24, 720);
  const timeRangeMs = config.hoursToShow * 60 * 60 * 1000;
  const stepMs = rawPointCount > 1 ? Math.floor(timeRangeMs / (rawPointCount - 1)) : timeRangeMs;
  const seed = hashString(config.entity ?? 'sparkline');
  const stateValue = toFiniteNumber(currentState, 50);

  const rawPoints: SparklinePoint[] = Array.from({ length: rawPointCount }, (_, index) => {
    const timestamp = now - (rawPointCount - index - 1) * stepMs;
    const trend = Math.sin((index + seed % 13) / 8) * 6;
    const seasonal = Math.cos((index + seed % 29) / 21) * 2.5;
    const noise = (seededNoise(index * 31 + seed) - 0.5) * 2.2;
    const slope = ((index / Math.max(1, rawPointCount - 1)) - 0.5) * (seed % 11) * 0.4;
    return {
      timestamp,
      value: Number((stateValue + trend + seasonal + noise + slope).toFixed(2)),
    };
  });

  if (rawPoints.length > 0 && Number.isFinite(stateValue)) {
    rawPoints[rawPoints.length - 1] = {
      ...rawPoints[rawPoints.length - 1],
      value: Number(stateValue.toFixed(2)),
    };
  }

  const points = downsampleSparklineData(rawPoints, maxPoints);
  const { minIndex, maxIndex } = findExtremaIndices(points);
  const currentIndex = Math.max(0, points.length - 1);

  return {
    points,
    minIndex,
    maxIndex,
    currentIndex,
    min: points[minIndex]?.value ?? 0,
    max: points[maxIndex]?.value ?? 0,
    current: points[currentIndex]?.value ?? 0,
  };
};
