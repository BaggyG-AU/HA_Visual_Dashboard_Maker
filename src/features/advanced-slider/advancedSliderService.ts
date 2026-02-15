import type {
  AdvancedSliderCardConfig,
  AdvancedSliderZone,
  NormalizedAdvancedSliderConfig,
  NormalizedAdvancedSliderZone,
  SliderMarker,
  SliderUpdateResolution,
} from './types';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const DEFAULT_PRECISION = 0;
const DEFAULT_COLOR = '#4fa3ff';
const MAX_MARKERS = 21;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const decimalsForStep = (step: number): number => {
  const text = step.toString();
  const index = text.indexOf('.');
  if (index < 0) return 0;
  return Math.min(6, text.length - index - 1);
};

const roundToPrecision = (value: number, precision: number): number => {
  const boundedPrecision = clamp(precision, 0, 6);
  const factor = 10 ** boundedPrecision;
  return Math.round(value * factor) / factor;
};

const normalizeRange = (minValue: unknown, maxValue: unknown): { min: number; max: number } => {
  const min = toFiniteNumber(minValue, DEFAULT_MIN);
  const maxCandidate = toFiniteNumber(maxValue, DEFAULT_MAX);
  const max = maxCandidate > min ? maxCandidate : min + 1;
  return { min, max };
};

const normalizeStep = (step: unknown, min: number, max: number): number => {
  const candidate = toFiniteNumber(step, DEFAULT_STEP);
  if (!Number.isFinite(candidate) || candidate <= 0) return DEFAULT_STEP;
  const capped = Math.min(candidate, max - min);
  return capped > 0 ? capped : DEFAULT_STEP;
};

const normalizePrecision = (precision: unknown, step: number): number => {
  const explicit = toFiniteNumber(precision, Number.NaN);
  if (Number.isFinite(explicit)) {
    return clamp(Math.floor(explicit), 0, 6);
  }
  return decimalsForStep(step);
};

const normalizeZones = (
  zones: AdvancedSliderCardConfig['zones'],
  min: number,
  max: number,
): NormalizedAdvancedSliderZone[] => {
  if (!Array.isArray(zones)) return [];

  return zones
    .map((zone, index) => {
      if (!zone || typeof zone !== 'object') return null;
      const from = clamp(toFiniteNumber((zone as AdvancedSliderZone).from, min), min, max);
      const to = clamp(toFiniteNumber((zone as AdvancedSliderZone).to, max), min, max);
      const lower = Math.min(from, to);
      const upper = Math.max(from, to);
      const color = typeof zone.color === 'string' && zone.color.trim() ? zone.color.trim() : DEFAULT_COLOR;
      const label = typeof zone.label === 'string' && zone.label.trim()
        ? zone.label.trim()
        : `${roundToPrecision(lower, 2)}-${roundToPrecision(upper, 2)}`;

      return {
        from: lower,
        to: upper,
        color,
        label,
        sortIndex: index,
      };
    })
    .filter((zone): zone is NormalizedAdvancedSliderZone & { sortIndex: number } => Boolean(zone))
    .sort((a, b) => (a.from - b.from) || (a.to - b.to) || (a.sortIndex - b.sortIndex))
    .map(({ sortIndex, ...zone }) => zone);
};

const resolveZoneColor = (zones: NormalizedAdvancedSliderZone[], value: number): string => {
  for (const zone of zones) {
    if (value >= zone.from && value <= zone.to) {
      return zone.color;
    }
  }
  return DEFAULT_COLOR;
};

const markerCountFromStep = (min: number, max: number, step: number): number => {
  const span = Math.max(0, max - min);
  return Math.floor(span / step) + 1;
};

const buildSteppedMarkers = (
  min: number,
  max: number,
  step: number,
  precision: number,
  zones: NormalizedAdvancedSliderZone[],
): SliderMarker[] => {
  const count = markerCountFromStep(min, max, step);

  if (count > MAX_MARKERS) {
    const divisions = 4;
    return Array.from({ length: divisions + 1 }, (_, index) => {
      const value = roundToPrecision(min + ((max - min) * index) / divisions, precision);
      return {
        value,
        label: String(value),
        color: resolveZoneColor(zones, value),
      };
    });
  }

  const markers: SliderMarker[] = [];
  let cursor = min;
  while (cursor <= max + step / 2) {
    const value = roundToPrecision(clamp(cursor, min, max), precision);
    markers.push({
      value,
      label: String(value),
      color: resolveZoneColor(zones, value),
    });
    cursor += step;
  }
  return markers;
};

export const snapSliderValue = (
  rawValue: number,
  min: number,
  max: number,
  step: number,
  precision: number,
): number => {
  const clamped = clamp(rawValue, min, max);
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  return roundToPrecision(clamp(snapped, min, max), precision);
};

export const buildSliderMarkers = (
  min: number,
  max: number,
  step: number,
  precision: number,
  showMarkers: boolean,
  zones: NormalizedAdvancedSliderZone[],
): SliderMarker[] => {
  if (!showMarkers) return [];
  return buildSteppedMarkers(min, max, step, precision, zones);
};

export const normalizeAdvancedSliderConfig = (
  card: AdvancedSliderCardConfig,
  rawValue: number | null,
): NormalizedAdvancedSliderConfig => {
  const { min, max } = normalizeRange(card.min, card.max);
  const step = normalizeStep(card.step, min, max);
  const precision = normalizePrecision(card.precision, step);

  const value = snapSliderValue(rawValue ?? min, min, max, step, precision);
  const zones = normalizeZones(card.zones, min, max);

  return {
    type: 'custom:slider-button-card',
    min,
    max,
    step,
    precision,
    orientation: card.orientation === 'vertical' ? 'vertical' : 'horizontal',
    showMarkers: typeof card.show_markers === 'boolean' ? card.show_markers : true,
    showValue: typeof card.show_value === 'boolean' ? card.show_value : true,
    commitOnRelease: Boolean(card.commit_on_release),
    animateFill: typeof card.animate_fill === 'boolean' ? card.animate_fill : true,
    value,
    unavailable: rawValue === null,
    zones,
    markers: buildSliderMarkers(
      min,
      max,
      step,
      precision,
      typeof card.show_markers === 'boolean' ? card.show_markers : true,
      zones,
    ),
    activeColor: resolveZoneColor(zones, value),
  };
};

export const resolveSliderUpdate = (
  currentCommitted: number,
  nextDraft: number,
  commitOnRelease: boolean,
  isRelease: boolean,
): SliderUpdateResolution => {
  if (commitOnRelease && !isRelease) {
    return {
      draftValue: nextDraft,
      committedValue: currentCommitted,
      shouldCommit: false,
    };
  }

  return {
    draftValue: nextDraft,
    committedValue: nextDraft,
    shouldCommit: true,
  };
};
