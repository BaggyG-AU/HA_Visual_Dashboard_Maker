import type { Action, BaseCard } from '../../types/dashboard';

export type CalendarViewMode = 'month' | 'week' | 'day';
export type CalendarEventStatus = 'success' | 'warning' | 'danger' | 'neutral';

export interface CalendarEventConfig {
  id?: string;
  title?: string;
  summary?: string;
  start: string | number;
  end?: string | number;
  status?: string;
  all_day?: boolean;
  source_entity?: string;
}

export interface CalendarViewCardConfig extends BaseCard {
  type: 'calendar';
  title?: string;
  entities?: string[];
  calendar_entities?: string[];
  initial_view?: 'day' | 'list' | 'month';
  view?: CalendarViewMode;
  show_week_numbers?: boolean;
  show_agenda?: boolean;
  on_date_select?: Action;
  selected_date?: string;
  events?: CalendarEventConfig[];
}

export interface NormalizedCalendarViewCardConfig {
  type: 'calendar';
  title: string;
  calendarEntities: string[];
  view: CalendarViewMode;
  showWeekNumbers: boolean;
  showAgenda: boolean;
  onDateSelectAction?: Action['action'];
  selectedDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: number;
  end: number;
  status: CalendarEventStatus;
  allDay: boolean;
  sourceEntity?: string;
}

export interface CalendarDateCell {
  key: string;
  timestamp: number;
  isoDate: string;
  isCurrentMonth: boolean;
}
