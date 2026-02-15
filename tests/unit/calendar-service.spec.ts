import { describe, expect, it } from 'vitest';
import {
  buildCalendarDateCells,
  getAgendaEventsForDate,
  getWeekNumber,
  groupEventsByDate,
  normalizeCalendarCard,
  resolveCalendarEvents,
} from '../../src/features/calendar/calendarService';
import type { CalendarViewCardConfig } from '../../src/features/calendar/types';

const BASE_NOW = Date.parse('2026-02-15T12:00:00.000Z');

const makeCard = (overrides: Partial<CalendarViewCardConfig> = {}): CalendarViewCardConfig => ({
  type: 'calendar',
  title: 'Calendar',
  calendar_entities: ['calendar.home'],
  view: 'month',
  selected_date: '2026-02-15',
  ...overrides,
});

describe('calendarService', () => {
  it('normalizes calendar view and entity source fields', () => {
    const normalized = normalizeCalendarCard(makeCard({
      view: 'week',
      show_week_numbers: true,
      show_agenda: true,
      on_date_select: { action: 'more-info' },
    }), BASE_NOW);

    expect(normalized.view).toBe('week');
    expect(normalized.calendarEntities).toEqual(['calendar.home']);
    expect(normalized.showWeekNumbers).toBe(true);
    expect(normalized.showAgenda).toBe(true);
    expect(normalized.onDateSelectAction).toBe('more-info');
    expect(normalized.selectedDate).toBe('2026-02-15');
  });

  it('resolves explicit card events and preserves ordering', () => {
    const events = resolveCalendarEvents(makeCard({
      events: [
        { start: '2026-02-15T13:00:00Z', title: 'Lunch', status: 'confirmed' },
        { start: '2026-02-15T08:00:00Z', title: 'Standup', status: 'tentative' },
      ],
    }), new Map(), BASE_NOW);

    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('Standup');
    expect(events[0].status).toBe('warning');
    expect(events[1].status).toBe('success');
  });

  it('resolves events from entity attributes and groups by date', () => {
    const events = resolveCalendarEvents(makeCard({ events: undefined }), new Map([
      ['calendar.home', {
        attributes: {
          events: [
            { start: '2026-02-15T08:00:00Z', end: '2026-02-15T09:00:00Z', title: 'Breakfast' },
            { start: '2026-02-16T11:00:00Z', end: '2026-02-16T12:00:00Z', title: 'Meeting' },
          ],
        },
      }],
    ]), BASE_NOW);

    const grouped = groupEventsByDate(events);
    expect(grouped.get('2026-02-15')).toHaveLength(1);
    expect(grouped.get('2026-02-16')).toHaveLength(1);

    const agenda = getAgendaEventsForDate(events, '2026-02-15');
    expect(agenda).toHaveLength(1);
    expect(agenda[0].title).toBe('Breakfast');
  });

  it('builds expected grid sizes for month/week/day', () => {
    expect(buildCalendarDateCells('month', '2026-02-15')).toHaveLength(42);
    expect(buildCalendarDateCells('week', '2026-02-15')).toHaveLength(7);
    expect(buildCalendarDateCells('day', '2026-02-15')).toHaveLength(1);
  });

  it('computes ISO week numbers', () => {
    expect(getWeekNumber(Date.parse('2026-01-05T12:00:00Z'))).toBe(2);
    expect(getWeekNumber(Date.parse('2026-12-28T12:00:00Z'))).toBeGreaterThanOrEqual(52);
  });
});
