import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntCard, Empty, Slider, Space, Typography } from 'antd';
import { ClockCircleOutlined, FlagOutlined } from '@ant-design/icons';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import {
  findNearestEventIndex,
  formatTimelineTimestamp,
  groupTimelineEvents,
  normalizeTimelineCard,
  resolveTimelineEvents,
  truncateTimelineText,
} from './timelineService';
import type { TimelineCardConfig, TimelineEvent } from './types';

const { Text } = Typography;

interface TimelineCardProps {
  card: TimelineCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const markerColor = (phase: TimelineEvent['phase']): string => {
  if (phase === 'past') return '#6ccf7f';
  if (phase === 'present') return '#4fa3ff';
  return '#ffd166';
};

export const TimelineCard: React.FC<TimelineCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const normalized = useMemo(() => normalizeTimelineCard(card), [card]);
  const entity = normalized.entity ? getEntity(normalized.entity) : null;

  const events = useMemo(
    () => resolveTimelineEvents(card, entity, normalized.nowTimestamp),
    [card, entity, normalized.nowTimestamp],
  );

  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(normalized.selectedTimestamp);
  useEffect(() => {
    setSelectedTimestamp(normalized.selectedTimestamp);
  }, [normalized.selectedTimestamp]);

  const grouped = useMemo(
    () => groupTimelineEvents(events, normalized.groupBy),
    [events, normalized.groupBy],
  );

  const selectedIndex = useMemo(
    () => findNearestEventIndex(events, selectedTimestamp),
    [events, selectedTimestamp],
  );

  const selectedLabel = events[selectedIndex] ? formatTimelineTimestamp(events[selectedIndex].timestamp) : 'No events';

  const title = normalized.title?.trim() || 'Timeline';
  const compact = normalized.itemDensity === 'compact';
  const axisVertical = normalized.orientation === 'vertical';

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const ariaSummary = events.length === 0
    ? 'Timeline has no events'
    : `${events.length} events. Selected time ${selectedLabel}.`;

  return (
    <AntCard
      size="small"
      title={title}
      data-testid="timeline-card"
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
          gap: compact ? '8px' : '12px',
          padding: compact ? '10px 12px' : '12px',
          overflow: 'hidden',
        },
      }}
    >
      {normalized.showNowMarker && (
        <div data-testid="timeline-now-marker" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#4fa3ff' }} />
          <Text style={{ color: '#9ecbff', fontSize: compact ? 11 : 12 }}>Now: {formatTimelineTimestamp(normalized.nowTimestamp)}</Text>
        </div>
      )}

      {events.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No timeline events"
          style={{ margin: 'auto 0' }}
        />
      )}

      {events.length > 0 && (
        <>
          {normalized.enableScrubber && events.length > 1 && (
            <div data-testid="timeline-scrubber" aria-label="Timeline scrubber" style={{ padding: compact ? '0 2px' : '0 4px' }}>
              <Slider
                min={0}
                max={events.length - 1}
                value={selectedIndex}
                onChange={(next) => {
                  const index = typeof next === 'number' ? next : next[0] ?? 0;
                  const event = events[index];
                  if (event) {
                    setSelectedTimestamp(event.timestamp);
                  }
                }}
                tooltip={{
                  formatter: (index) => {
                    if (typeof index !== 'number') return null;
                    const event = events[index];
                    return event ? formatTimelineTimestamp(event.timestamp) : null;
                  },
                }}
              />
              <Text data-testid="timeline-selected-timestamp" style={{ color: '#9f9f9f', fontSize: 11 }}>
                Selected: {selectedLabel}
              </Text>
            </div>
          )}

          <div
            data-testid="timeline-events"
            role="list"
            aria-label={ariaSummary}
            style={{
              display: 'flex',
              flexDirection: axisVertical ? 'column' : 'row',
              gap: compact ? '8px' : '12px',
              overflowX: axisVertical ? 'hidden' : 'auto',
              overflowY: axisVertical ? 'auto' : 'hidden',
              paddingRight: axisVertical ? '2px' : 0,
            }}
          >
            {grouped.map((group) => (
              <div key={group.key} data-testid="timeline-group" style={{ minWidth: axisVertical ? undefined : 240 }}>
                {normalized.groupBy !== 'none' && (
                  <Text strong style={{ color: '#d9d9d9', fontSize: compact ? 11 : 12 }}>
                    {group.label}
                  </Text>
                )}

                <div
                  style={{
                    marginTop: normalized.groupBy === 'none' ? 0 : 6,
                    display: 'flex',
                    flexDirection: axisVertical ? 'column' : 'row',
                    gap: compact ? '6px' : '8px',
                    flexWrap: axisVertical ? 'nowrap' : 'wrap',
                  }}
                >
                  {group.events.map((event) => {
                    const isSelectedEvent = Math.abs(event.timestamp - selectedTimestamp) <= 60 * 1000;
                    return (
                      <div
                        key={event.id}
                        data-testid="timeline-event"
                        role="listitem"
                        aria-label={`${event.title}. ${formatTimelineTimestamp(event.timestamp)}. ${event.phase}.`}
                        style={{
                          border: `1px solid ${isSelectedEvent ? '#4fa3ff' : '#3a3a3a'}`,
                          borderRadius: 8,
                          background: isSelectedEvent ? 'rgba(79, 163, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                          padding: compact ? '6px 8px' : '8px 10px',
                          minWidth: axisVertical ? undefined : 210,
                          flex: axisVertical ? undefined : '1 0 auto',
                        }}
                      >
                        <Space size={6} align="start">
                          <FlagOutlined style={{ color: markerColor(event.phase), marginTop: 2 }} />
                          <div>
                            <Text style={{ color: '#f0f0f0', fontSize: compact ? 11 : 12 }} strong>
                              {truncateTimelineText(event.title, normalized.truncateLength)}
                            </Text>
                            <br />
                            <Text style={{ color: '#a6a6a6', fontSize: 11 }}>
                              {formatTimelineTimestamp(event.timestamp)}
                            </Text>
                            {event.description && (
                              <>
                                <br />
                                <Text style={{ color: '#8a8a8a', fontSize: 11 }}>
                                  {truncateTimelineText(event.description, normalized.truncateLength)}
                                </Text>
                              </>
                            )}
                          </div>
                        </Space>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AntCard>
  );
};
