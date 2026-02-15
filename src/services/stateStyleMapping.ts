import type { StateStyleMap, StateStyleResolutionInput } from '../types/stateStyling';

type NormalizedStateStyleMap<TValue> = Record<string, TValue>;

const normalizedCache = new WeakMap<object, NormalizedStateStyleMap<unknown>>();

const normalizeStateKey = (state?: string): string => {
  if (!state || typeof state !== 'string') return 'unknown';
  const normalized = state.trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
};

export const normalizeStateStyleMap = <TValue>(
  styles?: StateStyleMap<TValue>,
): NormalizedStateStyleMap<TValue> => {
  if (!styles) return {};

  const cacheKey = styles as object;
  const cached = normalizedCache.get(cacheKey);
  if (cached) {
    return cached as NormalizedStateStyleMap<TValue>;
  }

  const normalized: NormalizedStateStyleMap<TValue> = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (value == null) return;
    const normalizedKey = normalizeStateKey(key);
    normalized[normalizedKey] = value;
  });

  normalizedCache.set(cacheKey, normalized as NormalizedStateStyleMap<unknown>);
  return normalized;
};

export const resolveStateStyleValue = <TValue>({
  state,
  styles,
}: StateStyleResolutionInput<TValue>): TValue | undefined => {
  const normalizedStyles = normalizeStateStyleMap(styles);
  const normalizedState = normalizeStateKey(state);

  if (normalizedState in normalizedStyles) {
    return normalizedStyles[normalizedState];
  }

  if ('unknown' in normalizedStyles) {
    return normalizedStyles.unknown;
  }

  return normalizedStyles.default;
};
