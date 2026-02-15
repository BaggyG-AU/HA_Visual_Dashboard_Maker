import type { BaseCard } from '../../types/dashboard';

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineGroupBy = 'none' | 'day' | 'hour';
export type TimelineItemDensity = 'compact' | 'comfortable';
export type TimelineEventPhase = 'past' | 'present' | 'future';

export interface TimelineEventConfig {
  id?: string;
  timestamp: string | number;
  title?: string;
  description?: string;
}

export interface TimelineCardConfig extends BaseCard {
  type: 'logbook';
  title?: string;
  entity?: string;
  hours_to_show?: number;
  max_items?: number;
  orientation?: TimelineOrientation;
  show_now_marker?: boolean;
  group_by?: TimelineGroupBy;
  enable_scrubber?: boolean;
  item_density?: TimelineItemDensity;
  truncate_length?: number;
  selected_timestamp?: string;
  events?: TimelineEventConfig[];
}

export interface NormalizedTimelineCardConfig {
  type: 'logbook';
  title?: string;
  entity?: string;
  hoursToShow: number;
  maxItems: number;
  orientation: TimelineOrientation;
  showNowMarker: boolean;
  groupBy: TimelineGroupBy;
  enableScrubber: boolean;
  itemDensity: TimelineItemDensity;
  truncateLength: number;
  selectedTimestamp: number;
  nowTimestamp: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  description?: string;
  phase: TimelineEventPhase;
}

export interface TimelineEventGroup {
  key: string;
  label: string;
  events: TimelineEvent[];
}
