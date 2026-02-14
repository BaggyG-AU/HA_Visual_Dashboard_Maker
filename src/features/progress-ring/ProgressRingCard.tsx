import React, { useEffect, useMemo, useState } from 'react';
import { Card as AntCard, Empty, Typography } from 'antd';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import {
  buildRingGeometry,
  normalizeProgressRingCard,
  resolveProgressRingRuntime,
  resolveRingStroke,
  ringDashOffset,
} from './progressRingService';
import type { ProgressRingCardConfig } from './types';

const { Text } = Typography;

interface ProgressRingCardProps {
  card: ProgressRingCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const RING_SIZE = 200;
const TRACK_STROKE = 'rgba(255, 255, 255, 0.12)';

const angleToLinearCoords = (angle: number): { x1: number; y1: number; x2: number; y2: number } => {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  return {
    x1: 50 - (x * 50),
    y1: 50 - (y * 50),
    x2: 50 + (x * 50),
    y2: 50 + (y * 50),
  };
};

export const ProgressRingCard: React.FC<ProgressRingCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const normalized = useMemo(() => normalizeProgressRingCard(card), [card]);

  const entityStates = useMemo<Record<string, unknown>>(() => {
    return normalized.rings.reduce<Record<string, unknown>>((acc, ring) => {
      const entity = getEntity(ring.entity);
      acc[ring.entity] = entity?.state;
      return acc;
    }, {});
  }, [getEntity, normalized.rings]);

  const runtimeRings = useMemo(
    () => resolveProgressRingRuntime(normalized, entityStates),
    [entityStates, normalized],
  );

  const ringGeometry = useMemo(
    () => buildRingGeometry(runtimeRings, RING_SIZE),
    [runtimeRings],
  );

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(79, 163, 255, 0.12)' : '#1f1f1f',
  );

  const title = normalized.title?.trim() || 'Progress Ring';
  const transitionEnabled = normalized.animate && !prefersReducedMotion;
  const center = RING_SIZE / 2;
  const ariaLabel = runtimeRings.length > 0
    ? runtimeRings
      .map((ring) => `${ring.label}: ${ring.displayValue} (${Math.round(ring.percent)} percent)`)
      .join(', ')
    : 'No rings configured';

  return (
    <AntCard
      size="small"
      title={title}
      data-testid="progress-ring-card"
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
          gap: '12px',
          padding: '12px',
        },
      }}
    >
      {runtimeRings.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No rings configured"
          style={{ margin: 'auto 0' }}
        />
      )}

      {runtimeRings.length > 0 && (
        <>
          <div
            data-testid="progress-ring-visual"
            role="img"
            aria-label={ariaLabel}
            style={{
              alignSelf: 'center',
              width: RING_SIZE,
              height: RING_SIZE,
              position: 'relative',
            }}
          >
            <svg width={RING_SIZE} height={RING_SIZE}>
              <defs>
                {runtimeRings.map((ring, index) => {
                  if (!ring.gradient) return null;
                  const gradientId = `progress-ring-gradient-${index}`;

                  if (ring.gradient.type === 'radial') {
                    return (
                      <radialGradient key={gradientId} id={gradientId} cx="50%" cy="50%" r="50%">
                        {ring.gradient.stops.map((stop, stopIndex) => (
                          <stop
                            key={`${gradientId}-${stopIndex}`}
                            offset={`${stop.position}%`}
                            stopColor={stop.color}
                          />
                        ))}
                      </radialGradient>
                    );
                  }

                  const linear = angleToLinearCoords(ring.gradient.angle);
                  return (
                    <linearGradient
                      key={gradientId}
                      id={gradientId}
                      x1={`${linear.x1}%`}
                      y1={`${linear.y1}%`}
                      x2={`${linear.x2}%`}
                      y2={`${linear.y2}%`}
                    >
                      {ring.gradient.stops.map((stop, stopIndex) => (
                        <stop
                          key={`${gradientId}-${stopIndex}`}
                          offset={`${stop.position}%`}
                          stopColor={stop.color}
                        />
                      ))}
                    </linearGradient>
                  );
                })}
              </defs>

              {runtimeRings.map((ring, index) => {
                const geometry = ringGeometry[index];
                if (!geometry) return null;

                const dashOffset = ringDashOffset(
                  geometry.circumference,
                  ring.percent,
                  normalized.direction,
                );
                const gradientId = `progress-ring-gradient-${index}`;
                const stroke = resolveRingStroke(ring, gradientId);

                return (
                  <g key={`${ring.entity}-${index}`}>
                    <circle
                      cx={center}
                      cy={center}
                      r={geometry.radius}
                      fill="none"
                      stroke={TRACK_STROKE}
                      strokeWidth={geometry.thickness}
                    />
                    <circle
                      data-testid="progress-ring-stroke"
                      cx={center}
                      cy={center}
                      r={geometry.radius}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={geometry.thickness}
                      strokeLinecap="round"
                      strokeDasharray={geometry.circumference}
                      strokeDashoffset={dashOffset}
                      transform={`rotate(${normalized.startAngle - 90} ${center} ${center})`}
                      style={{
                        transition: transitionEnabled
                          ? `stroke-dashoffset ${normalized.animationDurationMs}ms ${normalized.animationEasing}, stroke ${normalized.animationDurationMs}ms ${normalized.animationEasing}`
                          : 'none',
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                pointerEvents: 'none',
              }}
            >
              <Text style={{ color: '#e6e6e6', fontSize: 22, fontWeight: 600 }} data-testid="progress-ring-center-value">
                {Math.round(runtimeRings[0]?.percent ?? 0)}%
              </Text>
              {runtimeRings[0] && (
                <Text style={{ color: '#9f9f9f', fontSize: 11 }}>{runtimeRings[0].label}</Text>
              )}
            </div>
          </div>

          {normalized.showLabels && (
            <div
              data-testid="progress-ring-labels"
              aria-label="Progress ring values"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '6px',
              }}
            >
              {runtimeRings.map((ring, index) => (
                <div
                  key={`${ring.entity}-summary-${index}`}
                  data-testid="progress-ring-ring-summary"
                  style={{
                    border: `1px solid ${ring.color}`,
                    borderRadius: 6,
                    background: `${ring.color}22`,
                    color: '#d9d9d9',
                    padding: '4px 8px',
                    fontSize: 11,
                  }}
                >
                  {ring.label}: {ring.displayValue}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AntCard>
  );
};
