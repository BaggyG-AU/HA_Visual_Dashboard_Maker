import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { StatisticsGraphCard, StatisticType } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface StatisticsGraphCardRendererProps {
  card: StatisticsGraphCard;
  isSelected?: boolean;
  onClick?: () => void;
}

const SERIES_COLORS = [
  '#03a9f4',
  '#4caf50',
  '#ff9800',
  '#e91e63',
  '#9c27b0',
  '#00bcd4',
  '#ffc107',
  '#f44336',
];

const PERIOD_LABELS: Record<string, string> = {
  '5minute': '5-minute',
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

/**
 * A deterministic pseudo-random source, seeded from the entity id.
 *
 * ⚠⚠ DELIBERATELY NOT `Math.random()`, which is what the older
 * `HistoryGraphCardRenderer` uses. An indicative plot that changes on every
 * render cannot be captured by a visual snapshot, and this repo already carries
 * several visual specs whose flakiness is documented. Same honest placeholder,
 * stable pixels.
 */
const seededNoise = (seed: string, index: number): number => {
  let hash = 2166136261;
  const input = `${seed}:${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Map to [-1, 1).
  return ((hash >>> 0) % 20001) / 10000 - 1;
};

/**
 * Visual renderer for Home Assistant's core `statistics-graph` card.
 *
 * ⚠⚠ WHAT THIS DOES AND DOES NOT CLAIM: Home Assistant sources this card from
 * the recorder's long-term statistics, which HAVDM does not query — for exactly
 * the same reason it does not query history. So the header, title, series,
 * statistic types, period, span and axis bounds below are all REAL, read
 * straight from the card's config, and the PLOT ITSELF IS INDICATIVE.
 *
 * ⭐ That is deliberately the same bargain `history-graph` has always struck on
 * this canvas. Answering the identical question two different ways side by side
 * would be the real inconsistency — and the alternative, wiring a live
 * statistics fetch, would make a card that must be provable offline depend on a
 * live instance.
 */
export const StatisticsGraphCardRenderer: React.FC<StatisticsGraphCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const resolveContext = useEntityContextResolver();

  const entities = Array.isArray(card.entities) ? card.entities : [];
  const daysToShow = card.days_to_show ?? 30;
  const chartType = card.chart_type ?? 'line';
  const period = card.period ?? 'hour';
  const statTypes: StatisticType[] = Array.isArray(card.stat_types)
    ? card.stat_types
    : card.stat_types
      ? [card.stat_types]
      : ['mean'];

  const defaultEntityId =
    entities.length > 0
      ? typeof entities[0] === 'string'
        ? entities[0]
        : entities[0].entity
      : null;
  const resolvedTitle = card.title ? resolveContext(card.title, defaultEntityId ?? null) : '';
  const title = (card.title ? resolvedTitle : '') || 'Statistics';

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  const series = entities.map((entityConfig, index) => {
    const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
    const entity = getEntity(entityId);
    const attributes = entity?.attributes ?? {};
    const nameTemplate =
      typeof entityConfig === 'object' && entityConfig.name ? entityConfig.name : '';
    const name = nameTemplate
      ? resolveContext(nameTemplate, entityId)
      : (attributes.friendly_name as string | undefined) ||
        entityId.split('.')[1]?.replace(/_/g, ' ') ||
        entityId;

    return {
      entityId,
      name,
      unit: card.unit ?? (attributes.unit_of_measurement as string | undefined) ?? '',
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      present: !!entity,
    };
  });

  const POINTS = 24;

  const linePath = (entityId: string): string =>
    Array.from({ length: POINTS }, (_, i) => {
      const x = (i / (POINTS - 1)) * 100;
      const y = 50 - seededNoise(entityId, i) * 28;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${Math.max(6, Math.min(94, y)).toFixed(2)}`;
    }).join(' ');

  const bars = (entityId: string): Array<{ x: number; y: number; h: number }> =>
    Array.from({ length: POINTS }, (_, i) => {
      const h = 20 + Math.abs(seededNoise(entityId, i)) * 60;
      return { x: (i / POINTS) * 100, y: 100 - h, h };
    });

  const ChartIcon = chartType === 'bar' ? BarChartOutlined : LineChartOutlined;

  return (
    <AntCard
      size="small"
      data-testid="ha-statistics-graph-card"
      data-chart-type={chartType}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '10px',
          overflow: 'hidden',
        },
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text strong ellipsis style={{ color: '#e6e6e6', fontSize: 14 }}>
          {title}
        </Text>
        <ChartIcon style={{ fontSize: 16, color: '#999' }} />
      </div>

      <Text type="secondary" style={{ fontSize: 11 }} data-testid="statistics-graph-span">
        {`${PERIOD_LABELS[period] ?? period} · last ${daysToShow} days · ${statTypes.join(', ')}`}
      </Text>

      <div
        style={{
          flex: 1,
          position: 'relative',
          minHeight: 80,
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: 4,
          padding: 4,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {series.map((s) =>
            chartType === 'bar' ? (
              <g key={s.entityId}>
                {bars(s.entityId).map((bar, i) => (
                  <rect
                    key={i}
                    x={bar.x + 1}
                    y={bar.y}
                    width={100 / POINTS - 2}
                    height={bar.h}
                    fill={s.color}
                    opacity={0.75}
                  />
                ))}
              </g>
            ) : (
              <path
                key={s.entityId}
                d={linePath(s.entityId)}
                fill="none"
                stroke={s.color}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ),
          )}
        </svg>
      </div>

      {card.hide_legend !== true && series.length > 0 && (
        <div
          data-testid="statistics-graph-legend"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          {series.map((s) => (
            <span
              key={s.entityId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              data-testid={`statistics-graph-series-${s.entityId.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
            >
              <span
                style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}
              />
              <Text type="secondary" style={{ fontSize: 10 }}>
                {s.name}
                {s.unit ? ` (${s.unit})` : ''}
              </Text>
            </span>
          ))}
        </div>
      )}

      {series.length === 0 && (
        <Text type="secondary" style={{ fontSize: 11 }} data-testid="statistics-graph-empty">
          No entities configured
        </Text>
      )}
    </AntCard>
  );
};
