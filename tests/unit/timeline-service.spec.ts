import { describe, expect, it } from 'vitest';
import {
  findNearestEventIndex,
  groupTimelineEvents,
  normalizeTimelineCard,
  resolveTimelineEvents,
  truncateTimelineText,
} from '../../src/features/timeline/timelineService';
import type { TimelineCardConfig } from '../../src/features/timeline/types';

const BASE_NOW = Date.parse('2026-02-14T12:00:00.000Z');

const makeCard = (overrides: Partial<TimelineCardConfig> = {}): TimelineCardConfig => ({
  type: 'logbook',
  entity: 'sensor.home_events',
  ...overrides,
});

describe('timelineService', () => {
  it('normalizes timeline options and clamps numeric fields', () => {
    const normalized = normalizeTimelineCard(makeCard({
      hours_to_show: 0,
      max_items: 999,
      orientation: 'horizontal',
      group_by: 'hour',
      item_density: 'compact',
      truncate_length: 4,
      selected_timestamp: '2026-02-14T09:30:00.000Z',
    }), BASE_NOW);

    expect(normalized.hoursToShow).toBe(1);
    expect(normalized.maxItems).toBe(200);
    expect(normalized.orientation).toBe('horizontal');
    expect(normalized.groupBy).toBe('hour');
    expect(normalized.itemDensity).toBe('compact');
    expect(normalized.truncateLength).toBe(24);
    expect(normalized.selectedTimestamp).toBe(Date.parse('2026-02-14T09:30:00.000Z'));
  });

  it('prefers explicit card events and sorts chronologically', () => {
    const events = resolveTimelineEvents(makeCard({
      selected_timestamp: '2026-02-14T12:00:00.000Z',
      events: [
        { timestamp: '2026-02-14T14:00:00.000Z', title: 'Future event' },
        { timestamp: '2026-02-14T10:00:00.000Z', title: 'Past event' },
        { timestamp: '2026-02-14T12:03:00.000Z', title: 'Present event' },
      ],
    }), null, BASE_NOW);

    expect(events).toHaveLength(3);
    expect(events[0].title).toBe('Past event');
    expect(events[1].phase).toBe('present');
    expect(events[2].phase).toBe('future');
  });

  it('reads timeline entries from entity attributes and truncates to max_items', () => {
    const events = resolveTimelineEvents(makeCard({
      selected_timestamp: '2026-02-14T12:00:00.000Z',
      max_items: 2,
    }), {
      attributes: {
        events: [
          { timestamp: '2026-02-14T07:00:00.000Z', title: 'One' },
          { timestamp: '2026-02-14T08:00:00.000Z', title: 'Two' },
          { timestamp: '2026-02-14T09:00:00.000Z', title: 'Three' },
        ],
      },
    }, BASE_NOW);

    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('Two');
    expect(events[1].title).toBe('Three');
  });

  it('groups events by day and finds nearest scrubber index', () => {
    const events = resolveTimelineEvents(makeCard({
      selected_timestamp: '2026-02-14T12:00:00.000Z',
      events: [
        { timestamp: '2026-02-13T23:55:00.000Z', title: 'Late previous day' },
        { timestamp: '2026-02-14T10:00:00.000Z', title: 'Morning' },
        { timestamp: '2026-02-14T17:00:00.000Z', title: 'Evening' },
      ],
    }), null, BASE_NOW);

    const groups = groupTimelineEvents(events, 'day');

    expect(groups).toHaveLength(2);
    expect(groups[1].events).toHaveLength(2);

    const index = findNearestEventIndex(events, Date.parse('2026-02-14T10:30:00.000Z'));
    expect(index).toBe(1);
  });

  it('truncates long text with ellipsis', () => {
    expect(truncateTimelineText('Short', 8)).toBe('Short');
    expect(truncateTimelineText('A very long sentence', 10)).toBe('A very lon...');
  });
});
