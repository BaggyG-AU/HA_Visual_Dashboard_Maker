import type {
  CalendarDateCell,
  CalendarEvent,
  CalendarEventConfig,
  CalendarEventStatus,
  CalendarViewCardConfig,
  CalendarViewMode,
  NormalizedCalendarViewCardConfig,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const toTimestamp = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const toIsoDate = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10);

const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const startOfWeek = (timestamp: number): number => {
  const date = new Date(startOfDay(timestamp));
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // Monday start
  return date.getTime() - (diff * DAY_MS);
};

const toView = (value: unknown): CalendarViewMode => {
  if (value === 'week' || value === 'day' || value === 'month') return value;
  if (value === 'list') return 'week';
  return 'month';
};

const fromInitialView = (value: unknown): CalendarViewMode => {
  if (value === 'day') return 'day';
  if (value === 'list') return 'week';
  return 'month';
};

const toStatus = (value: unknown): CalendarEventStatus => {
  if (typeof value !== 'string') return 'neutral';
  const normalized = value.trim().toLowerCase();
  if (['confirmed', 'ok', 'done', 'success'].includes(normalized)) return 'success';
  if (['tentative', 'pending', 'warning'].includes(normalized)) return 'warning';
  if (['cancelled', 'canceled', 'error', 'failed'].includes(normalized)) return 'danger';
  return 'neutral';
};

const normalizeEntities = (card: CalendarViewCardConfig): string[] => {
  const source = Array.isArray(card.calendar_entities)
    ? card.calendar_entities
    : Array.isArray(card.entities)
      ? card.entities
      : [];

  return source
    .filter((entity): entity is string => typeof entity === 'string')
    .map((entity) => entity.trim())
    .filter((entity) => entity.length > 0);
};

const normalizeCardEvent = (event: CalendarEventConfig, index: number): CalendarEvent | null => {
  const start = toTimestamp(event.start);
  if (start === null) return null;

  const end = toTimestamp(event.end) ?? (start + DAY_MS);
  const normalizedEnd = end <= start ? start + DAY_MS : end;
  const titleCandidate = typeof event.title === 'string' && event.title.trim().length > 0
    ? event.title.trim()
    : typeof event.summary === 'string' && event.summary.trim().length > 0
      ? event.summary.trim()
      : `Event ${index + 1}`;

  return {
    id: typeof event.id === 'string' && event.id.trim().length > 0 ? event.id.trim() : `calendar-event-${index}`,
    title: titleCandidate,
    start,
    end: normalizedEnd,
    status: toStatus(event.status),
    allDay: Boolean(event.all_day),
    sourceEntity: typeof event.source_entity === 'string' ? event.source_entity : undefined,
  };
};

const normalizeEntityEvents = (
  entityId: string,
  attributes: Record<string, unknown> | undefined,
): CalendarEvent[] => {
  if (!attributes) return [];

  const candidates = [attributes.events, attributes.entries];
  const rawEvents = candidates.find((entry) => Array.isArray(entry));
  if (!Array.isArray(rawEvents)) return [];

  return rawEvents
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Record<string, unknown>;
      const start = toTimestamp(raw.start)
        ?? toTimestamp(raw.start_time)
        ?? toTimestamp(raw.timestamp)
        ?? toTimestamp(raw.date);

      if (start === null) return null;

      const end = toTimestamp(raw.end) ?? toTimestamp(raw.end_time) ?? (start + DAY_MS);
      const normalizedEnd = end <= start ? start + DAY_MS : end;

      const title = typeof raw.title === 'string' && raw.title.trim().length > 0
        ? raw.title.trim()
        : typeof raw.summary === 'string' && raw.summary.trim().length > 0
          ? raw.summary.trim()
          : `Event ${index + 1}`;

      return {
        id: typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : `${entityId}-${index}`,
        title,
        start,
        end: normalizedEnd,
        status: toStatus(raw.status ?? raw.state),
        allDay: Boolean(raw.all_day),
        sourceEntity: entityId,
      } satisfies CalendarEvent;
    })
    .filter((event): event is CalendarEvent => Boolean(event));
};

const createSyntheticEvents = (date: string): CalendarEvent[] => {
  const dayStart = startOfDay(toTimestamp(date) ?? Date.now());
  return [
    {
      id: 'synthetic-0',
      title: 'Morning routine',
      start: dayStart + (8 * 60 * 60 * 1000),
      end: dayStart + (9 * 60 * 60 * 1000),
      status: 'success',
      allDay: false,
      sourceEntity: 'calendar.home',
    },
    {
      id: 'synthetic-1',
      title: 'Work focus block',
      start: dayStart + (13 * 60 * 60 * 1000),
      end: dayStart + (15 * 60 * 60 * 1000),
      status: 'warning',
      allDay: false,
      sourceEntity: 'calendar.work',
    },
    {
      id: 'synthetic-2',
      title: 'Evening lights automation',
      start: dayStart + (19 * 60 * 60 * 1000),
      end: dayStart + (20 * 60 * 60 * 1000),
      status: 'neutral',
      allDay: false,
      sourceEntity: 'calendar.home',
    },
  ];
};

const eventOverlapsDate = (event: CalendarEvent, dayStart: number): boolean => {
  const dayEnd = dayStart + DAY_MS;
  return event.start < dayEnd && event.end > dayStart;
};

export const normalizeCalendarCard = (
  card: CalendarViewCardConfig,
  nowTimestamp = Date.now(),
): NormalizedCalendarViewCardConfig => {
  const view = card.view
    ? toView(card.view)
    : fromInitialView(card.initial_view);

  const selectedDate = toTimestamp(card.selected_date) ?? nowTimestamp;

  return {
    type: 'calendar',
    title: typeof card.title === 'string' && card.title.trim().length > 0 ? card.title.trim() : 'Calendar',
    calendarEntities: normalizeEntities(card),
    view,
    showWeekNumbers: Boolean(card.show_week_numbers),
    showAgenda: Boolean(card.show_agenda),
    onDateSelectAction: card.on_date_select?.action,
    selectedDate: toIsoDate(selectedDate),
  };
};

export const resolveCalendarEvents = (
  card: CalendarViewCardConfig,
  entitiesById: Map<string, { attributes?: Record<string, unknown> }>,
  nowTimestamp = Date.now(),
): CalendarEvent[] => {
  const normalized = normalizeCalendarCard(card, nowTimestamp);

  const fromCard = Array.isArray(card.events)
    ? card.events
      .map((event, index) => normalizeCardEvent(event, index))
      .filter((event): event is CalendarEvent => Boolean(event))
    : [];

  const fromEntities = normalized.calendarEntities.flatMap((entityId) => {
    const entity = entitiesById.get(entityId);
    return normalizeEntityEvents(entityId, entity?.attributes);
  });

  const baseEvents = fromCard.length > 0
    ? fromCard
    : fromEntities.length > 0
      ? fromEntities
      : createSyntheticEvents(normalized.selectedDate);

  return [...baseEvents].sort((a, b) => a.start - b.start);
};

export const buildCalendarDateCells = (
  view: CalendarViewMode,
  selectedDateIso: string,
): CalendarDateCell[] => {
  const selectedTimestamp = toTimestamp(selectedDateIso) ?? Date.now();
  const anchorDay = startOfDay(selectedTimestamp);

  if (view === 'day') {
    return [{
      key: selectedDateIso,
      timestamp: anchorDay,
      isoDate: selectedDateIso,
      isCurrentMonth: true,
    }];
  }

  if (view === 'week') {
    const weekStart = startOfWeek(anchorDay);
    return Array.from({ length: 7 }, (_, index) => {
      const timestamp = weekStart + (index * DAY_MS);
      return {
        key: toIsoDate(timestamp),
        timestamp,
        isoDate: toIsoDate(timestamp),
        isCurrentMonth: true,
      };
    });
  }

  const selected = new Date(anchorDay);
  const monthStart = Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
  const firstGridDay = startOfWeek(monthStart);

  return Array.from({ length: 42 }, (_, index) => {
    const timestamp = firstGridDay + (index * DAY_MS);
    const date = new Date(timestamp);

    return {
      key: toIsoDate(timestamp),
      timestamp,
      isoDate: toIsoDate(timestamp),
      isCurrentMonth: date.getUTCMonth() === selected.getUTCMonth(),
    };
  });
};

export const groupEventsByDate = (
  events: CalendarEvent[],
): Map<string, CalendarEvent[]> => {
  const buckets = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    const start = startOfDay(event.start);
    const end = startOfDay(event.end - 1);

    for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
      const key = toIsoDate(timestamp);
      const existing = buckets.get(key);
      if (existing) {
        existing.push(event);
      } else {
        buckets.set(key, [event]);
      }
    }
  });

  buckets.forEach((items) => items.sort((a, b) => a.start - b.start));
  return buckets;
};

export const getAgendaEventsForDate = (events: CalendarEvent[], isoDate: string): CalendarEvent[] => {
  const dayStart = startOfDay(toTimestamp(isoDate) ?? Date.now());
  return events.filter((event) => eventOverlapsDate(event, dayStart));
};

export const getWeekNumber = (timestamp: number): number => {
  const date = new Date(timestamp);
  const dayNum = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayNum + 3);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
};

export const formatCalendarDateLabel = (timestamp: number, view: CalendarViewMode): string => {
  if (view === 'day') {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp));
  }

  if (view === 'week') {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp));
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
};

export const formatCalendarTimeLabel = (timestamp: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
};
