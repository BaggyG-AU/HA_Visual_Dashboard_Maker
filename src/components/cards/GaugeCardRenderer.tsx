import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { GaugeCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface GaugeCardRendererProps {
  card: GaugeCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Gauge card type
 * Displays a circular gauge visualization for numeric sensor values
 */
export const GaugeCardRenderer: React.FC<GaugeCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract gauge properties
  const state = entity?.state || '0';
  const attributes = entity?.attributes || {};
  const numericValue = parseFloat(state) || 0;

  const min = card.min ?? 0;
  const max = card.max ?? 100;
  const unit = card.unit || attributes.unit_of_measurement || '';
  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Gauge';
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Calculate percentage for gauge
  const percentage = Math.min(100, Math.max(0, ((numericValue - min) / (max - min)) * 100));

  // Determine color based on severity levels
  const getSeverityColor = () => {
    if (!entity) return '#666';

    const severity = card.severity;
    if (severity) {
      if (severity.red !== undefined && numericValue >= severity.red) return '#f44336';
      if (severity.yellow !== undefined && numericValue >= severity.yellow) return '#ffc107';
      if (severity.green !== undefined && numericValue >= severity.green) return '#52c41a';
    }

    // Default color gradient based on percentage
    if (percentage >= 80) return '#f44336'; // Red
    if (percentage >= 60) return '#ffc107'; // Yellow
    return '#52c41a'; // Green
  };

  const gaugeColor = getSeverityColor();

  // SVG gauge configuration
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <AntCard
      size="small"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Gauge visualization */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Value circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center value display */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: gaugeColor,
              lineHeight: 1,
            }}
          >
            {entity ? numericValue.toFixed(1) : '--'}
          </div>
          {unit && (
            <div
              style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px',
              }}
            >
              {unit}
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <Text
        strong
        style={{
          color: '#e6e6e6',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {displayName}
      </Text>

      {/* Range display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingX: '8px' }}>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {min}
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {max}
        </Text>
      </div>

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
