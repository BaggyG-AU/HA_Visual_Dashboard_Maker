import React, { useMemo } from 'react';
import { Card as AntCard, Empty, Space, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { buildSparklineDataset, normalizeSparklineCard } from './sparklineService';
import type { SparklineCardConfig, SparklinePoint } from './types';

const { Text } = Typography;

interface SparklineCardProps {
  card: SparklineCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const toPath = (
  points: SparklinePoint[],
): { linePath: string; areaPath: string; minX: number; maxX: number; minY: number; maxY: number } => {
  if (points.length === 0) {
    return { linePath: '', areaPath: '', minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const safeSpan = Math.max(1e-6, max - min);

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = ((max - point.value) / safeSpan) * 100;
    return { x, y };
  });

  const linePath = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return {
    linePath,
    areaPath,
    minX: coords[0]?.x ?? 0,
    maxX: coords[coords.length - 1]?.x ?? 100,
    minY: Math.min(...coords.map((coord) => coord.y)),
    maxY: Math.max(...coords.map((coord) => coord.y)),
  };
};

export const SparklineCard: React.FC<SparklineCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const normalized = useMemo(() => normalizeSparklineCard(card), [card]);
  const entity = normalized.entity ? getEntity(normalized.entity) : null;
  const currentState = entity?.state;
  const attributes = entity?.attributes ?? {};
  const unit = typeof attributes.unit_of_measurement === 'string' ? attributes.unit_of_measurement : '';

  const resolvedName = useEntityContextValue(normalized.name ?? '', normalized.entity ?? null);
  const displayName =
    (normalized.name ? resolvedName : '') ||
    attributes.friendly_name ||
    normalized.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Sparkline';

  const dataset = useMemo(
    () => buildSparklineDataset(normalized, currentState),
    [normalized, currentState],
  );
  const path = useMemo(() => toPath(dataset.points), [dataset.points]);
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );
  const graphHeight = normalized.compact ? 52 : 78;

  const markerCoords = useMemo(() => {
    const points = dataset.points;
    const min = Math.min(...points.map((point) => point.value));
    const max = Math.max(...points.map((point) => point.value));
    const safeSpan = Math.max(1e-6, max - min);

    const toCoord = (index: number): { x: number; y: number } => {
      const value = points[index]?.value ?? 0;
      const x = points.length <= 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = ((max - value) / safeSpan) * 100;
      return { x, y };
    };

    return {
      min: toCoord(dataset.minIndex),
      max: toCoord(dataset.maxIndex),
      current: toCoord(dataset.currentIndex),
    };
  }, [dataset]);

  const formatValue = (value: number): string => (Number.isFinite(value) ? value.toFixed(1) : '--');

  const ariaLabel = `Sparkline trend for ${displayName}. Current ${formatValue(dataset.current)}${unit ? ` ${unit}` : ''}, min ${formatValue(dataset.min)}, max ${formatValue(dataset.max)} over ${normalized.rangePreset}.`;

  return (
    <AntCard
      size="small"
      data-testid="sparkline-card"
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
        body: {
          padding: normalized.compact ? '10px 12px' : '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: normalized.compact ? '8px' : '10px',
          height: '100%',
        },
      }}
    >
      {!normalized.entity && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select an entity for sparkline"
          style={{ margin: 'auto 0' }}
        />
      )}

      {normalized.entity && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Space size={8}>
              {normalized.showIcon && <LineChartOutlined style={{ color: normalized.color }} />}
              {normalized.showName && (
                <Text style={{ color: '#e6e6e6', fontSize: normalized.compact ? 12 : 13 }} strong>
                  {displayName}
                </Text>
              )}
            </Space>
            {normalized.showCurrent && (
              <Text
                data-testid="sparkline-current-value"
                style={{ color: normalized.color, fontSize: normalized.compact ? 14 : 16, fontWeight: 600 }}
              >
                {formatValue(dataset.current)} {unit}
              </Text>
            )}
          </div>

          <div
            data-testid="sparkline-graph"
            role="img"
            aria-label={ariaLabel}
            style={{ position: 'relative', minHeight: `${graphHeight}px`, flex: 1 }}
          >
            <svg width="100%" height={graphHeight} viewBox="0 0 100 100" preserveAspectRatio="none">
              {normalized.style === 'area' && (
                <path d={path.areaPath} fill={`${normalized.color}33`} stroke="none" />
              )}
              <path
                d={path.linePath}
                fill="none"
                stroke={normalized.color}
                strokeWidth={normalized.lineWidth}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {normalized.showMinMax && (
                <>
                  <circle
                    data-testid="sparkline-marker-min"
                    cx={markerCoords.min.x}
                    cy={markerCoords.min.y}
                    r="2.2"
                    fill="#6ccf7f"
                    stroke="#121212"
                    strokeWidth="0.4"
                  />
                  <circle
                    data-testid="sparkline-marker-max"
                    cx={markerCoords.max.x}
                    cy={markerCoords.max.y}
                    r="2.2"
                    fill="#f76d6d"
                    stroke="#121212"
                    strokeWidth="0.4"
                  />
                </>
              )}

              {normalized.showCurrent && (
                <circle
                  data-testid="sparkline-marker-current"
                  cx={markerCoords.current.x}
                  cy={markerCoords.current.y}
                  r="2.4"
                  fill={normalized.color}
                  stroke="#ffffff"
                  strokeWidth="0.45"
                />
              )}
            </svg>
          </div>

          <Text
            data-testid="sparkline-fallback-labels"
            style={{ color: '#9f9f9f', fontSize: 11 }}
            aria-label="Sparkline numeric fallback values"
          >
            Min {formatValue(dataset.min)} • Max {formatValue(dataset.max)} • Current {formatValue(dataset.current)}
            {unit ? ` ${unit}` : ''}
          </Text>
        </>
      )}
    </AntCard>
  );
};
