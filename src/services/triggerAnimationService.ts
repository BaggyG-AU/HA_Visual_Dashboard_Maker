import type { Card } from '../types/dashboard';
import type { TriggerAnimationConfig } from '../types/logic';
import type { EntityStates } from './haWebSocketService';

const BUILTIN_ANIMATION_NAMES = {
  pulse: 'havdm-trigger-pulse',
  flash: 'havdm-trigger-flash',
  shake: 'havdm-trigger-shake',
  bounce: 'havdm-trigger-bounce',
} as const;

const DEFAULT_DURATION_MS = 320;
const MIN_DURATION_MS = 80;
const MAX_DURATION_MS = 5000;
const DEFAULT_ITERATIONS = 1;
const MAX_ITERATIONS = 10;
const DEFAULT_EASING = 'ease-out';
const MISSING_ENTITY_STATE = '__havdm_missing_entity__';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const sanitizeAnimationName = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  if (normalized in BUILTIN_ANIMATION_NAMES) {
    return BUILTIN_ANIMATION_NAMES[normalized as keyof typeof BUILTIN_ANIMATION_NAMES];
  }

  // Keep custom names only when they are CSS-safe identifiers.
  return /^[a-z_][a-z0-9_-]*$/i.test(normalized)
    ? normalized
    : BUILTIN_ANIMATION_NAMES.pulse;
};

const normalizeEntityIdFromCard = (card: Card): string | null => {
  if (typeof card.entity === 'string' && card.entity.trim().length > 0) {
    return card.entity;
  }
  if (!Array.isArray(card.entities)) {
    return null;
  }

  for (const candidate of card.entities) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
    if (isRecord(candidate) && typeof candidate.entity === 'string' && candidate.entity.trim().length > 0) {
      return candidate.entity;
    }
  }

  return null;
};

const normalizeTriggerType = (value: unknown): TriggerAnimationConfig['trigger'] | null => {
  if (value === 'state-change' || value === 'action' || value === 'manual') {
    return value;
  }
  return null;
};

export interface NormalizedTriggerAnimationConfig {
  id: string;
  trigger: TriggerAnimationConfig['trigger'];
  target?: string;
  animationName: string;
  durationMs: number;
  iterations: number;
  easing: string;
}

export const normalizeTriggerAnimations = (
  configs: TriggerAnimationConfig[] | unknown,
): NormalizedTriggerAnimationConfig[] => {
  if (!Array.isArray(configs)) return [];

  const normalized: NormalizedTriggerAnimationConfig[] = [];

  configs.forEach((entry, index) => {
    if (!isRecord(entry)) {
      return;
    }

    const trigger = normalizeTriggerType(entry.trigger);
    if (!trigger) {
      return;
    }

    const sourceAnimation = typeof entry.animation === 'string' && entry.animation.trim().length > 0
      ? entry.animation
      : 'pulse';

    const durationInput = toFiniteNumber(entry.duration_ms);
    const durationMs = durationInput === null
      ? DEFAULT_DURATION_MS
      : clamp(Math.round(durationInput), MIN_DURATION_MS, MAX_DURATION_MS);

    const iterationsInput = toFiniteNumber(entry.iterations);
    const iterations = iterationsInput === null
      ? DEFAULT_ITERATIONS
      : clamp(Math.round(iterationsInput), 1, MAX_ITERATIONS);

    const easing = typeof entry.easing === 'string' && entry.easing.trim().length > 0
      ? entry.easing.trim()
      : DEFAULT_EASING;

    const target = typeof entry.target === 'string' && entry.target.trim().length > 0
      ? entry.target.trim()
      : undefined;

    const rawId = typeof entry.id === 'string' && entry.id.trim().length > 0
      ? entry.id.trim()
      : `trigger-animation-${index}`;

    normalized.push({
      id: rawId,
      trigger,
      target,
      animationName: sanitizeAnimationName(sourceAnimation),
      durationMs,
      iterations,
      easing,
    });
  });

  return normalized;
};

export const buildStateChangeSnapshot = (
  card: Card,
  config: NormalizedTriggerAnimationConfig,
  entities: EntityStates,
): string => {
  const entityId = config.target ?? normalizeEntityIdFromCard(card);
  if (!entityId) return MISSING_ENTITY_STATE;
  return entities[entityId]?.state ?? MISSING_ENTITY_STATE;
};

export const resolveStateChangeTrigger = (
  card: Card,
  configs: NormalizedTriggerAnimationConfig[],
  entities: EntityStates,
  previousSnapshots: Record<string, string>,
): {
  triggered: NormalizedTriggerAnimationConfig | null;
  nextSnapshots: Record<string, string>;
} => {
  const nextSnapshots: Record<string, string> = { ...previousSnapshots };
  let triggered: NormalizedTriggerAnimationConfig | null = null;

  for (const config of configs) {
    if (config.trigger !== 'state-change') {
      continue;
    }

    const next = buildStateChangeSnapshot(card, config, entities);
    const previous = previousSnapshots[config.id];
    nextSnapshots[config.id] = next;

    if (previous !== undefined && previous !== next && triggered === null) {
      triggered = config;
    }
  }

  return { triggered, nextSnapshots };
};

export const resolveTriggerAnimation = (
  configs: NormalizedTriggerAnimationConfig[],
  trigger: TriggerAnimationConfig['trigger'],
): NormalizedTriggerAnimationConfig | null => {
  return configs.find((config) => config.trigger === trigger) ?? null;
};

export const toAnimationKeyframes = (
  animationName: string,
): Keyframe[] => {
  switch (animationName) {
    case BUILTIN_ANIMATION_NAMES.flash:
      return [
        { opacity: 1 },
        { opacity: 0.35 },
        { opacity: 1 },
      ];
    case BUILTIN_ANIMATION_NAMES.shake:
      return [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ];
    case BUILTIN_ANIMATION_NAMES.bounce:
      return [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-6px)' },
        { transform: 'translateY(0)' },
      ];
    case BUILTIN_ANIMATION_NAMES.pulse:
      return [
        { transform: 'scale(1)' },
        { transform: 'scale(1.025)' },
        { transform: 'scale(1)' },
      ];
    default:
      return [];
  }
};

export const toAnimationTiming = (
  config: NormalizedTriggerAnimationConfig,
): KeyframeAnimationOptions => {
  return {
    duration: config.durationMs,
    easing: config.easing,
    iterations: config.iterations,
    fill: 'none',
  };
};
