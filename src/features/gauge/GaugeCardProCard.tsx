import React, { useMemo } from 'react';
import { Card as AntCard, Empty, Typography } from 'antd';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { normalizeGaugeCardProConfig } from './gaugeService';
import type { GaugeCardProConfig } from './types';

const { Text } = Typography;

interface GaugeCardProCardProps {
  card: GaugeCardProConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const GaugeCardProCard: React.FC<GaugeCardProCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const rawState = entity?.state;
  const numericValue = typeof rawState === 'string' ? Number(rawState) : Number.NaN;
  const hasValue = Number.isFinite(numericValue);

  const normalized = useMemo(
    () => normalizeGaugeCardProConfig(card, hasValue ? numericValue : null),
    [card, hasValue, numericValue],
  );

  const title = normalized.header || card.name || entity?.attributes?.friendly_name || 'Gauge Card Pro';
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const circumference = 2 * Math.PI * 52;
  const strokeOffset = circumference - (normalized.percentage / 100) * circumference;

  return (
    <AntCard
      size="small"
      title={title}
      data-testid="gauge-card-pro-card"
      onClick={onClick}
      hoverable
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #4fa3ff' : '1px solid #434343',
        transition: 'all 0.3s ease',
        ...backgroundStyle,
      }}
      styles={{
        header: { borderBottom: '1px solid #303030', color: '#e6e6e6' },
        body: {
          height: 'calc(100% - 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '12px',
        },
      }}
    >
      <Text type="secondary" data-testid="gauge-card-pro-meta">
        {normalized.needle ? 'Needle' : 'Severity'} | range {normalized.min}..{normalized.max}
      </Text>

      {normalized.unavailable ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span data-testid="gauge-card-pro-value">Unavailable</span>}
          style={{ margin: 'auto 0' }}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="52" stroke="#2f2f2f" strokeWidth="12" fill="none" />
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  stroke={normalized.activeColor}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  data-testid="gauge-card-pro-progress"
                />
                {normalized.needle && (
                  <line
                    x1="70"
                    y1="70"
                    x2="70"
                    y2="24"
                    stroke="#f0f0f0"
                    strokeWidth="2"
                    transform={`rotate(${(normalized.percentage / 100) * 180 - 90} 70 70)`}
                  />
                )}
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 12px',
                }}
              >
                <Text strong data-testid="gauge-card-pro-value" style={{ color: normalized.activeColor, fontSize: 18 }}>
                  {normalized.value.toFixed(normalized.valuePrecision)}{normalized.unit ? ` ${normalized.unit}` : ''}
                </Text>
              </div>
            </div>
          </div>

          <div
            data-testid="gauge-card-pro-segments"
            style={{ display: 'grid', gap: '4px', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}
          >
            {normalized.segments.map((segment) => (
              <div
                key={`${segment.from}-${segment.color}`}
                style={{
                  border: `1px solid ${segment.isActive ? segment.color : '#3a3a3a'}`,
                  borderRadius: '6px',
                  padding: '4px 6px',
                  background: segment.isActive ? `${segment.color}22` : 'transparent',
                  fontSize: '11px',
                }}
              >
                <Text style={{ color: '#d9d9d9', fontSize: '11px' }}>
                  {segment.label || `${segment.from}+`}
                </Text>
              </div>
            ))}
          </div>
        </>
      )}
    </AntCard>
  );
};
