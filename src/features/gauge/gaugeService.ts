import type {
  GaugeCardProConfig,
  GaugeCardProSegment,
  NormalizedGaugeCardProConfig,
  NormalizedGaugeCardProSegment,
} from './types';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_COLOR = '#4fa3ff';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const parseHexColor = (color: string): [number, number, number] | null => {
  const normalized = color.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
};

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

const interpolateHexColor = (start: string, end: string, ratio: number): string => {
  const startRgb = parseHexColor(start);
  const endRgb = parseHexColor(end);
  if (!startRgb || !endRgb) return DEFAULT_COLOR;

  const t = clamp(ratio, 0, 1);
  const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t);
  const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t);
  const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const normalizeSegment = (
  segment: GaugeCardProSegment,
  fallbackColor: string,
): GaugeCardProSegment | null => {
  const from = toFiniteNumber(segment.from, Number.NaN);
  if (!Number.isFinite(from)) return null;

  return {
    from,
    color: typeof segment.color === 'string' && segment.color.trim() ? segment.color : fallbackColor,
    label: typeof segment.label === 'string' && segment.label.trim() ? segment.label.trim() : undefined,
  };
};

export const normalizeGaugeSegments = (
  segments: GaugeCardProConfig['segments'],
  min: number,
  max: number,
): GaugeCardProSegment[] => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [
      { from: min, color: '#ff6b6b', label: 'Low' },
      { from: min + (max - min) * 0.5, color: '#ffd166', label: 'Medium' },
      { from: min + (max - min) * 0.8, color: '#6ccf7f', label: 'High' },
    ];
  }

  return segments
    .map((segment) => normalizeSegment(segment, DEFAULT_COLOR))
    .filter((segment): segment is GaugeCardProSegment => Boolean(segment))
    .map((segment) => ({ ...segment, from: clamp(segment.from, min, max) }))
    .sort((a, b) => a.from - b.from);
};

const resolveSegmentColor = (
  normalizedSegments: GaugeCardProSegment[],
  value: number,
): string => {
  let color = normalizedSegments[0]?.color || DEFAULT_COLOR;
  normalizedSegments.forEach((segment) => {
    if (value >= segment.from) {
      color = segment.color;
    }
  });
  return color;
};

export const normalizeGaugeCardProConfig = (
  card: GaugeCardProConfig,
  rawValue: number | null,
): NormalizedGaugeCardProConfig => {
  const min = toFiniteNumber(card.min, DEFAULT_MIN);
  const maxCandidate = toFiniteNumber(card.max, DEFAULT_MAX);
  const max = maxCandidate > min ? maxCandidate : min + 1;

  const value = rawValue === null ? min : clamp(rawValue, min, max);
  const percentage = ((value - min) / (max - min)) * 100;

  const segments = normalizeGaugeSegments(card.segments, min, max);
  const activeColor = card.gradient && segments.length >= 2
    ? interpolateHexColor(segments[0].color, segments[segments.length - 1].color, percentage / 100)
    : resolveSegmentColor(segments, value);

  const normalizedSegments: NormalizedGaugeCardProSegment[] = segments.map((segment, index) => {
    const next = segments[index + 1];
    const upperBound = next?.from ?? max;
    const isActive = value >= segment.from && value <= upperBound;
    return {
      ...segment,
      isActive,
    };
  });

  return {
    type: 'custom:gauge-card-pro',
    min,
    max,
    value,
    percentage,
    unit: card.value_texts?.primary_unit || '',
    needle: typeof card.needle === 'boolean' ? card.needle : false,
    gradient: Boolean(card.gradient),
    header: card.header,
    unavailable: rawValue === null,
    segments: normalizedSegments,
    activeColor,
    valuePrecision: 1,
  };
};
