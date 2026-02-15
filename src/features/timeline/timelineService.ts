import type {
  NormalizedTimelineCardConfig,
  TimelineCardConfig,
  TimelineEvent,
  TimelineEventConfig,
  TimelineEventGroup,
  TimelineEventPhase,
  TimelineGroupBy,
  TimelineItemDensity,
  TimelineOrientation,
} from './types';

const DEFAULT_HOURS_TO_SHOW = 24;
const DEFAULT_MAX_ITEMS = 50;
const DEFAULT_TRUNCATE_LENGTH = 72;
const PRESENT_WINDOW_MS = 5 * 60 * 1000;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toTimestamp = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

const seededNoise = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const normalizeOrientation = (value: unknown): TimelineOrientation =>
  value === 'horizontal' ? 'horizontal' : 'vertical';

const normalizeGroupBy = (value: unknown): TimelineGroupBy =>
  value === 'none' || value === 'hour' ? value : 'day';

const normalizeDensity = (value: unknown): TimelineItemDensity =>
  value === 'compact' ? 'compact' : 'comfortable';

const toPhase = (timestamp: number, selectedTimestamp: number): TimelineEventPhase => {
  const delta = timestamp - selectedTimestamp;
  if (Math.abs(delta) <= PRESENT_WINDOW_MS) return 'present';
  return delta < 0 ? 'past' : 'future';
};

const pickText = (event: Record<string, unknown>, key: string): string | undefined => {
  const value = event[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

const pickTimestamp = (event: Record<string, unknown>): number | null => {
  return toTimestamp(event.timestamp)
    ?? toTimestamp(event.time)
    ?? toTimestamp(event.date)
    ?? toTimestamp(event.created)
    ?? toTimestamp(event.updated);
};

const normalizeEventConfig = (
  event: TimelineEventConfig,
  index: number,
  selectedTimestamp: number,
): TimelineEvent | null => {
  const timestamp = toTimestamp(event.timestamp);
  if (timestamp === null) return null;

  const title = typeof event.title === 'string' && event.title.trim().length > 0
    ? event.title.trim()
    : `Event ${index + 1}`;

  return {
    id: typeof event.id === 'string' && event.id.trim().length > 0 ? event.id.trim() : `event-${index}`,
    timestamp,
    title,
    description: typeof event.description === 'string' && event.description.trim().length > 0
      ? event.description.trim()
      : undefined,
    phase: toPhase(timestamp, selectedTimestamp),
  };
};

const normalizeEventsFromAttributes = (
  attributes: Record<string, unknown> | undefined,
  selectedTimestamp: number,
): TimelineEvent[] => {
  if (!attributes) return [];

  const candidates = [attributes.events, attributes.timeline, attributes.entries];
  const firstArray = candidates.find((entry) => Array.isArray(entry));
  if (!Array.isArray(firstArray)) return [];

  return firstArray
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const timestamp = pickTimestamp(record);
      if (timestamp === null) return null;

      const title = pickText(record, 'title')
        ?? pickText(record, 'message')
        ?? pickText(record, 'name')
        ?? `Event ${index + 1}`;

      return {
        id: pickText(record, 'id') ?? `attr-${index}`,
        timestamp,
        title,
        description: pickText(record, 'description') ?? pickText(record, 'details'),
        phase: toPhase(timestamp, selectedTimestamp),
      } satisfies TimelineEvent;
    })
    .filter((event): event is TimelineEvent => Boolean(event));
};

const createSyntheticEvents = (
  entity: string | undefined,
  selectedTimestamp: number,
  hoursToShow: number,
): TimelineEvent[] => {
  const seed = hashString(entity ?? 'timeline');
  const count = 16;
  const spanMs = hoursToShow * 60 * 60 * 1000;
  const start = selectedTimestamp - Math.floor(spanMs * 0.75);
  const step = Math.max(5 * 60 * 1000, Math.floor((spanMs * 1.5) / count));

  return Array.from({ length: count }, (_, index) => {
    const jitter = Math.floor((seededNoise(seed + index * 19) - 0.5) * step * 0.4);
    const timestamp = start + (index * step) + jitter;
    const phase = toPhase(timestamp, selectedTimestamp);

    return {
      id: `synthetic-${index}`,
      timestamp,
      title: phase === 'past'
        ? `Completed step ${index + 1}`
        : phase === 'present'
          ? `Current checkpoint`
          : `Planned step ${index + 1}`,
      description: entity
        ? `Source: ${entity}`
        : 'Synthetic preview data for timeline layout testing',
      phase,
    };
  });
};

export const normalizeTimelineCard = (
  card: TimelineCardConfig,
  nowTimestamp = Date.now(),
): NormalizedTimelineCardConfig => {
  const selectedTimestamp = toTimestamp(card.selected_timestamp) ?? nowTimestamp;

  return {
    type: 'logbook',
    title: typeof card.title === 'string' ? card.title : undefined,
    entity: typeof card.entity === 'string' && card.entity.trim().length > 0 ? card.entity.trim() : undefined,
    hoursToShow: clamp(Math.floor(toFiniteNumber(card.hours_to_show, DEFAULT_HOURS_TO_SHOW)), 1, 168),
    maxItems: clamp(Math.floor(toFiniteNumber(card.max_items, DEFAULT_MAX_ITEMS)), 1, 200),
    orientation: normalizeOrientation(card.orientation),
    showNowMarker: typeof card.show_now_marker === 'boolean' ? card.show_now_marker : true,
    groupBy: normalizeGroupBy(card.group_by),
    enableScrubber: typeof card.enable_scrubber === 'boolean' ? card.enable_scrubber : true,
    itemDensity: normalizeDensity(card.item_density),
    truncateLength: clamp(Math.floor(toFiniteNumber(card.truncate_length, DEFAULT_TRUNCATE_LENGTH)), 24, 160),
    selectedTimestamp,
    nowTimestamp,
  };
};

export const truncateTimelineText = (value: string | undefined, maxLength: number): string | undefined => {
  if (!value) return undefined;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength)).trimEnd()}...`;
};

export const resolveTimelineEvents = (
  card: TimelineCardConfig,
  entityState: { attributes?: Record<string, unknown> } | null,
  nowTimestamp = Date.now(),
): TimelineEvent[] => {
  const normalized = normalizeTimelineCard(card, nowTimestamp);

  const fromCard = Array.isArray(card.events)
    ? card.events
      .map((event, index) => normalizeEventConfig(event, index, normalized.selectedTimestamp))
      .filter((event): event is TimelineEvent => Boolean(event))
    : [];

  const fromEntity = normalizeEventsFromAttributes(entityState?.attributes, normalized.selectedTimestamp);
  const fallback = createSyntheticEvents(normalized.entity, normalized.selectedTimestamp, normalized.hoursToShow);

  const sorted = (fromCard.length > 0 ? fromCard : fromEntity.length > 0 ? fromEntity : fallback)
    .sort((a, b) => a.timestamp - b.timestamp);

  return sorted.slice(-normalized.maxItems);
};

export const groupTimelineEvents = (
  events: TimelineEvent[],
  groupBy: TimelineGroupBy,
): TimelineEventGroup[] => {
  if (groupBy === 'none') {
    return [{ key: 'all', label: 'All events', events }];
  }

  const formatter = groupBy === 'day'
    ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
    });

  const buckets = new Map<string, TimelineEventGroup>();

  events.forEach((event) => {
    const keyDate = new Date(event.timestamp);
    const key = groupBy === 'day'
      ? `${keyDate.getUTCFullYear()}-${keyDate.getUTCMonth()}-${keyDate.getUTCDate()}`
      : `${keyDate.getUTCFullYear()}-${keyDate.getUTCMonth()}-${keyDate.getUTCDate()}-${keyDate.getUTCHours()}`;

    const group = buckets.get(key);
    if (group) {
      group.events.push(event);
      return;
    }

    buckets.set(key, {
      key,
      label: formatter.format(keyDate),
      events: [event],
    });
  });

  return [...buckets.values()].sort((a, b) => {
    const firstA = a.events[0]?.timestamp ?? 0;
    const firstB = b.events[0]?.timestamp ?? 0;
    return firstA - firstB;
  });
};

export const formatTimelineTimestamp = (timestamp: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

export const findNearestEventIndex = (events: TimelineEvent[], targetTimestamp: number): number => {
  if (events.length === 0) return 0;

  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  events.forEach((event, index) => {
    const delta = Math.abs(event.timestamp - targetTimestamp);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });

  return bestIndex;
};
