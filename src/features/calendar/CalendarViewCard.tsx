import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card as AntCard, Empty, Segmented, Space, Tag, Typography } from 'antd';
import { CalendarOutlined, NumberOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import {
  buildCalendarDateCells,
  formatCalendarDateLabel,
  formatCalendarTimeLabel,
  getAgendaEventsForDate,
  getWeekNumber,
  groupEventsByDate,
  normalizeCalendarCard,
  resolveCalendarEvents,
} from './calendarService';
import type { CalendarDateCell, CalendarEventStatus, CalendarViewCardConfig, CalendarViewMode } from './types';

const { Text } = Typography;

interface CalendarViewCardProps {
  card: CalendarViewCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const statusColorMap: Record<CalendarEventStatus, string> = {
  success: '#6ccf7f',
  warning: '#ffd166',
  danger: '#ff7875',
  neutral: '#8a8a8a',
};

const nextIndex = (index: number, offset: number, size: number): number => {
  if (size === 0) return 0;
  return Math.max(0, Math.min(size - 1, index + offset));
};

export const CalendarViewCard: React.FC<CalendarViewCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const normalized = useMemo(() => normalizeCalendarCard(card), [card]);
  const [view, setView] = useState<CalendarViewMode>(normalized.view);
  const [selectedDate, setSelectedDate] = useState<string>(normalized.selectedDate);

  useEffect(() => {
    setView(normalized.view);
  }, [normalized.view]);

  useEffect(() => {
    setSelectedDate(normalized.selectedDate);
  }, [normalized.selectedDate]);

  const entitiesById = useMemo(() => {
    const map = new Map<string, { attributes?: Record<string, unknown> }>();
    normalized.calendarEntities.forEach((entityId) => {
      const entity = getEntity(entityId);
      map.set(entityId, entity ?? {});
    });
    return map;
  }, [getEntity, normalized.calendarEntities]);

  const events = useMemo(
    () => resolveCalendarEvents(card, entitiesById),
    [card, entitiesById],
  );

  const dateCells = useMemo(
    () => buildCalendarDateCells(view, selectedDate),
    [view, selectedDate],
  );

  const eventsByDate = useMemo(
    () => groupEventsByDate(events),
    [events],
  );

  const agendaEvents = useMemo(
    () => getAgendaEventsForDate(events, selectedDate),
    [events, selectedDate],
  );

  const selectedIndex = useMemo(
    () => dateCells.findIndex((cell) => cell.isoDate === selectedDate),
    [dateCells, selectedDate],
  );

  const title = normalized.title || 'Calendar';
  const dateSummary = dateCells.length === 1
    ? formatCalendarDateLabel(dateCells[0].timestamp, 'day')
    : formatCalendarDateLabel(dateCells[0].timestamp, view);

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const onSelectDate = (cell: CalendarDateCell): void => {
    setSelectedDate(cell.isoDate);
    onClick?.();
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let targetIndex = index;

    if (event.key === 'ArrowRight') {
      targetIndex = nextIndex(index, 1, dateCells.length);
    } else if (event.key === 'ArrowLeft') {
      targetIndex = nextIndex(index, -1, dateCells.length);
    } else if (event.key === 'ArrowDown') {
      const jump = view === 'month' ? 7 : 1;
      targetIndex = nextIndex(index, jump, dateCells.length);
    } else if (event.key === 'ArrowUp') {
      const jump = view === 'month' ? -7 : -1;
      targetIndex = nextIndex(index, jump, dateCells.length);
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = dateCells.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const current = dateCells[index];
      if (current) onSelectDate(current);
      return;
    } else {
      return;
    }

    event.preventDefault();
    const nextCell = dateCells[targetIndex];
    if (nextCell) {
      setSelectedDate(nextCell.isoDate);
      const target = document.querySelector<HTMLButtonElement>(`[data-calendar-date-index="${targetIndex}"]`);
      target?.focus();
    }
  };

  return (
    <AntCard
      size="small"
      data-testid="calendar-view-card"
      title={
        <Space>
          <CalendarOutlined />
          <span>{title}</span>
        </Space>
      }
      onClick={onClick}
      hoverable
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        header: {
          borderBottom: '1px solid #303030',
          color: '#e6e6e6',
        },
        body: {
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
          padding: 12,
        },
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Segmented
          data-testid="calendar-view-mode"
          value={view}
          onChange={(value) => setView(value as CalendarViewMode)}
          options={[
            { label: 'Month', value: 'month' },
            { label: 'Week', value: 'week' },
            { label: 'Day', value: 'day' },
          ]}
        />
        <Text data-testid="calendar-date-summary" style={{ color: '#cfcfcf', fontSize: 12 }}>
          {dateSummary}
        </Text>
      </div>

      {normalized.onDateSelectAction && normalized.onDateSelectAction !== 'none' && (
        <Tag data-testid="calendar-date-action" color="processing" style={{ width: 'fit-content' }}>
          on_date_select: {normalized.onDateSelectAction}
        </Tag>
      )}

      <div style={{ display: 'flex', flex: 1, gap: 12, minHeight: 0 }}>
        <div style={{ flex: normalized.showAgenda ? '0 0 68%' : '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            data-testid="calendar-grid"
            role="grid"
            aria-label={`Calendar ${view} view`}
            style={{
              display: 'grid',
              gridTemplateColumns: view === 'month' ? 'repeat(7, minmax(0, 1fr))' : `repeat(${dateCells.length}, minmax(0, 1fr))`,
              gap: 6,
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            {view === 'month' && normalized.showWeekNumbers && (
              <div data-testid="calendar-week-number-toggle" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 6, color: '#9d9d9d', fontSize: 11 }}>
                <NumberOutlined />
                <span>Week numbers enabled</span>
              </div>
            )}

            {dateCells.map((cell, index) => {
              const cellEvents = eventsByDate.get(cell.isoDate) ?? [];
              const isActive = cell.isoDate === selectedDate;
              const weekNumber = normalized.showWeekNumbers && (view === 'month' || view === 'week')
                ? getWeekNumber(cell.timestamp)
                : null;

              return (
                <div
                  key={cell.key}
                  role="gridcell"
                  aria-selected={isActive}
                  style={{
                    border: isActive ? '1px solid #4fa3ff' : '1px solid #3a3a3a',
                    borderRadius: 8,
                    background: isActive ? 'rgba(79, 163, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                    padding: '6px 6px 8px',
                    minHeight: view === 'day' ? 140 : 86,
                    opacity: view === 'month' && !cell.isCurrentMonth ? 0.55 : 1,
                  }}
                >
                  <Button
                    data-testid="calendar-date-cell"
                    data-calendar-date-index={index}
                    type="text"
                    onClick={() => onSelectDate(cell)}
                    onKeyDown={(event) => onGridKeyDown(event, index)}
                    tabIndex={index === Math.max(selectedIndex, 0) ? 0 : -1}
                    aria-label={`${formatCalendarDateLabel(cell.timestamp, view)}. ${cellEvents.length} events.`}
                    style={{
                      padding: 0,
                      height: 'auto',
                      color: '#f2f2f2',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {new Date(cell.timestamp).getDate()}
                    {weekNumber !== null && (
                      <span style={{ marginLeft: 6, color: '#8f8f8f', fontSize: 10 }}>W{weekNumber}</span>
                    )}
                  </Button>

                  <div data-testid="calendar-event-badges" role="list" style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {cellEvents.slice(0, 2).map((event) => (
                      <Tag
                        key={`${cell.isoDate}-${event.id}`}
                        data-testid="calendar-event-badge"
                        color={statusColorMap[event.status]}
                        style={{
                          marginInlineEnd: 0,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </Tag>
                    ))}
                    {cellEvents.length > 2 && (
                      <Text style={{ color: '#8f8f8f', fontSize: 11 }}>+{cellEvents.length - 2} more</Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No calendar events" />
          )}
        </div>

        {normalized.showAgenda && (
          <aside
            data-testid="calendar-agenda"
            aria-label="Agenda"
            style={{
              flex: '1 1 32%',
              borderLeft: '1px solid #2e2e2e',
              paddingLeft: 10,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            <Space style={{ marginBottom: 8 }}>
              <UnorderedListOutlined style={{ color: '#9dbdff' }} />
              <Text style={{ color: '#d7d7d7' }}>Agenda</Text>
            </Space>

            {agendaEvents.length === 0 && (
              <Text style={{ color: '#999' }}>No events for selected date</Text>
            )}

            {agendaEvents.map((event) => (
              <div
                key={`agenda-${event.id}`}
                data-testid="calendar-agenda-item"
                style={{
                  marginBottom: 8,
                  border: '1px solid #333',
                  borderLeft: `3px solid ${statusColorMap[event.status]}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <Text style={{ color: '#f0f0f0', fontSize: 12 }} strong>{event.title}</Text>
                <br />
                <Text style={{ color: '#9b9b9b', fontSize: 11 }}>
                  {event.allDay ? 'All day' : `${formatCalendarTimeLabel(event.start)} - ${formatCalendarTimeLabel(event.end)}`}
                </Text>
              </div>
            ))}
          </aside>
        )}
      </div>
    </AntCard>
  );
};
