import type {
  NormalizedProgressRingCardConfig,
  NormalizedProgressRingConfig,
  NormalizedProgressRingGradient,
  ProgressRingCardConfig,
  ProgressRingDirection,
  RingGeometry,
  RingRuntimeState,
} from './types';

const DEFAULT_COLOR = '#4fa3ff';
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_THICKNESS = 12;
const DEFAULT_START_ANGLE = 0;
const DEFAULT_DURATION_MS = 500;
const DEFAULT_PRECISION = 0;
const MAX_RINGS = 4;
const MIN_RING_THICKNESS = 4;
const MAX_RING_THICKNESS = 32;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeRange = (minValue: unknown, maxValue: unknown): { min: number; max: number } => {
  const min = toFiniteNumber(minValue, DEFAULT_MIN);
  const maxCandidate = toFiniteNumber(maxValue, DEFAULT_MAX);
  return {
    min,
    max: maxCandidate > min ? maxCandidate : min + 1,
  };
};

const normalizeGradient = (gradient: unknown): NormalizedProgressRingGradient | undefined => {
  if (!gradient || typeof gradient !== 'object') return undefined;

  const type = (gradient as { type?: unknown }).type === 'radial' ? 'radial' : 'linear';
  const angle = toFiniteNumber((gradient as { angle?: unknown }).angle, 90);
  const stops = Array.isArray((gradient as { stops?: unknown[] }).stops)
    ? (gradient as { stops?: unknown[] }).stops
      .map((stop) => {
        if (!stop || typeof stop !== 'object') return null;
        const color = typeof (stop as { color?: unknown }).color === 'string'
          ? (stop as { color: string }).color.trim()
          : '';
        if (!color) return null;
        return {
          color,
          position: clamp(toFiniteNumber((stop as { position?: unknown }).position, 0), 0, 100),
        };
      })
      .filter((stop): stop is { color: string; position: number } => Boolean(stop))
      .sort((a, b) => a.position - b.position)
    : [];

  if (stops.length < 2) return undefined;

  return {
    type,
    angle,
    stops,
  };
};

const normalizeThresholds = (thresholds: unknown): Array<{ value: number; color: string }> => {
  if (!Array.isArray(thresholds)) return [];

  return thresholds
    .map((threshold) => {
      if (!threshold || typeof threshold !== 'object') return null;
      const color = typeof (threshold as { color?: unknown }).color === 'string'
        ? (threshold as { color: string }).color.trim()
        : '';
      if (!color) return null;
      return {
        value: toFiniteNumber((threshold as { value?: unknown }).value, 0),
        color,
      };
    })
    .filter((threshold): threshold is { value: number; color: string } => Boolean(threshold))
    .sort((a, b) => a.value - b.value);
};

const normalizeDirection = (direction: unknown): ProgressRingDirection =>
  direction === 'counter-clockwise' ? 'counter-clockwise' : 'clockwise';

const normalizeRing = (
  ring: unknown,
  index: number,
  fallbackThickness: number,
): NormalizedProgressRingConfig | null => {
  if (!ring || typeof ring !== 'object') return null;
  const entity = typeof (ring as { entity?: unknown }).entity === 'string'
    ? (ring as { entity: string }).entity.trim()
    : '';
  if (!entity) return null;

  const { min, max } = normalizeRange((ring as { min?: unknown }).min, (ring as { max?: unknown }).max);

  const rawColor = typeof (ring as { color?: unknown }).color === 'string'
    ? (ring as { color: string }).color.trim()
    : '';

  const label = typeof (ring as { label?: unknown }).label === 'string' && (ring as { label: string }).label.trim().length > 0
    ? (ring as { label: string }).label.trim()
    : `Ring ${index + 1}`;

  return {
    entity,
    label,
    min,
    max,
    color: rawColor || DEFAULT_COLOR,
    thickness: clamp(
      toFiniteNumber((ring as { thickness?: unknown }).thickness, fallbackThickness),
      MIN_RING_THICKNESS,
      MAX_RING_THICKNESS,
    ),
    gradient: normalizeGradient((ring as { gradient?: unknown }).gradient),
    thresholds: normalizeThresholds((ring as { thresholds?: unknown }).thresholds),
  };
};

export const normalizeProgressRingCard = (
  card: ProgressRingCardConfig,
): NormalizedProgressRingCardConfig => {
  const cardThickness = clamp(toFiniteNumber(card.thickness, DEFAULT_THICKNESS), MIN_RING_THICKNESS, MAX_RING_THICKNESS);

  const ringsSource = Array.isArray(card.rings) ? card.rings : [];
  const rings = ringsSource
    .slice(0, MAX_RINGS)
    .map((ring, index) => normalizeRing(ring, index, cardThickness))
    .filter((ring): ring is NormalizedProgressRingConfig => Boolean(ring));

  return {
    type: 'custom:modern-circular-gauge',
    title: card.title,
    rings,
    startAngle: clamp(toFiniteNumber(card.start_angle, DEFAULT_START_ANGLE), -360, 360),
    direction: normalizeDirection(card.direction),
    animate: typeof card.animate === 'boolean' ? card.animate : true,
    animationDurationMs: clamp(toFiniteNumber(card.animation_duration_ms, DEFAULT_DURATION_MS), 0, 5000),
    animationEasing: card.animation_easing === 'linear'
      || card.animation_easing === 'ease-in'
      || card.animation_easing === 'ease-out'
      || card.animation_easing === 'ease-in-out'
      ? card.animation_easing
      : 'ease',
    showLabels: typeof card.show_labels === 'boolean' ? card.show_labels : true,
    labelPrecision: clamp(Math.floor(toFiniteNumber(card.label_precision, DEFAULT_PRECISION)), 0, 3),
  };
};

export const resolveProgressValue = (rawState: unknown, min: number, max: number): number => {
  const numeric = toFiniteNumber(rawState, min);
  return clamp(numeric, min, max);
};

export const valueToPercent = (value: number, min: number, max: number): number => {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
};

export const resolveProgressRingRuntime = (
  config: NormalizedProgressRingCardConfig,
  states: Record<string, unknown>,
): RingRuntimeState[] => {
  return config.rings.map((ring) => {
    const value = resolveProgressValue(states[ring.entity], ring.min, ring.max);
    const percent = valueToPercent(value, ring.min, ring.max);

    return {
      entity: ring.entity,
      label: ring.label,
      value,
      percent,
      displayValue: value.toFixed(config.labelPrecision),
      color: ring.color,
      thickness: ring.thickness,
      gradient: ring.gradient,
      thresholds: ring.thresholds,
    };
  });
};

export const resolveRingStroke = (
  ring: RingRuntimeState,
  gradientId: string,
): string => {
  if (ring.gradient) return `url(#${gradientId})`;

  if (ring.thresholds.length > 0) {
    const matching = ring.thresholds.filter((threshold) => ring.value >= threshold.value);
    return matching.length > 0 ? matching[matching.length - 1].color : ring.color;
  }

  return ring.color;
};

export const buildRingGeometry = (
  rings: RingRuntimeState[],
  size: number,
  gap = 6,
  padding = 8,
): RingGeometry[] => {
  const center = size / 2;
  let currentOuterRadius = center - padding;

  return rings
    .map((ring) => {
      const thickness = clamp(ring.thickness, MIN_RING_THICKNESS, MAX_RING_THICKNESS);
      const radius = currentOuterRadius - (thickness / 2);
      currentOuterRadius = radius - (thickness / 2) - gap;
      return {
        radius,
        circumference: Math.max(0, 2 * Math.PI * radius),
        thickness,
      };
    })
    .filter((ring) => ring.radius > 2);
};

export const ringDashOffset = (
  circumference: number,
  percent: number,
  direction: ProgressRingDirection,
): number => {
  const progress = clamp(percent, 0, 100) / 100;
  const offset = circumference - (progress * circumference);
  return direction === 'counter-clockwise' ? -offset : offset;
};
