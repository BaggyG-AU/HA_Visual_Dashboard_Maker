import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextResolver } from '../../hooks/useEntityContext';
import { MdiIcon } from '../MdiIcon';

const { Text } = Typography;

export interface BatteryStateCardConfig {
  type: string;
  title?: string;
  entities?: Array<string | { entity?: string; name?: string; [key: string]: unknown }>;
  sort_by_level?: 'asc' | 'desc';
  colors?: { steps?: Array<{ value: number; color?: string }> };
  style?: string;
  [key: string]: unknown;
}

interface BatteryStateCardRendererProps {
  card: BatteryStateCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Battery level -> colour, using the card's own `colors.steps` when supplied and
 * otherwise the thresholds the HACS card ships with.
 *
 * ⚠ An UNKNOWN level is grey, never green. A battery whose level we cannot read
 * must not look healthy — that is the one failure mode of a battery card that
 * actually matters.
 */
const levelColor = (level: number | undefined, card: BatteryStateCardConfig): string => {
  if (level === undefined) return '#8a8a8a';
  const steps = card.colors?.steps;
  if (Array.isArray(steps) && steps.length > 0) {
    // HA's card walks ascending steps and takes the last one at or below level.
    const sorted = [...steps].sort((a, b) => a.value - b.value);
    let chosen: string | undefined;
    for (const step of sorted) {
      if (level >= step.value && typeof step.color === 'string') chosen = step.color;
    }
    if (chosen) return chosen;
  }
  if (level <= 20) return '#f44336';
  if (level <= 45) return '#ffc107';
  return '#4caf50';
};

const batteryIcon = (level: number | undefined): string => {
  if (level === undefined) return 'mdi:battery-unknown';
  if (level >= 95) return 'mdi:battery';
  if (level <= 5) return 'mdi:battery-outline';
  return `mdi:battery-${Math.round(level / 10) * 10}`;
};

/**
 * Visual renderer for `custom:battery-state-card` (HACS).
 *
 * ⚠ It was offered in HAVDM's palette with no renderer — a user could drag it
 * out and immediately get an "Unsupported Card Type" placeholder.
 */
export const BatteryStateCardRenderer: React.FC<BatteryStateCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const resolveContext = useEntityContextResolver();
  const entities = Array.isArray(card.entities) ? card.entities : [];

  const resolvedTitle = card.title ? resolveContext(card.title, null) : '';
  const title = (card.title ? resolvedTitle : '') || 'Batteries';

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  const rows = entities.map((entry) => {
    const entityId = typeof entry === 'string' ? entry : entry?.entity;
    const entity = entityId ? getEntity(entityId) : null;
    const attributes = entity?.attributes ?? {};
    const parsed = entity ? Number.parseFloat(entity.state) : NaN;
    // A battery level can also live on `battery_level` when the entity itself
    // is the device rather than its battery sensor.
    const fromAttribute = Number.parseFloat(String(attributes.battery_level ?? ''));
    const level = Number.isFinite(parsed)
      ? parsed
      : Number.isFinite(fromAttribute)
        ? fromAttribute
        : undefined;
    const name =
      (typeof entry === 'object' && typeof entry?.name === 'string' ? entry.name : undefined) ||
      (attributes.friendly_name as string | undefined) ||
      entityId?.split('.')[1]?.replace(/_/g, ' ') ||
      entityId ||
      'Battery';

    return { entityId: entityId ?? '', name, level };
  });

  // `sort_by_level` is the card's own option; leaving it unset preserves the
  // author's ordering, which is what HA does.
  const ordered =
    card.sort_by_level === 'asc' || card.sort_by_level === 'desc'
      ? [...rows].sort((a, b) => {
          const av = a.level ?? Number.POSITIVE_INFINITY;
          const bv = b.level ?? Number.POSITIVE_INFINITY;
          return card.sort_by_level === 'asc' ? av - bv : bv - av;
        })
      : rows;

  return (
    <AntCard
      size="small"
      data-testid="ha-battery-state-card"
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 6,
          overflow: 'hidden',
        },
      }}
      onClick={onClick}
      hoverable
    >
      <Text strong ellipsis style={{ color: '#e6e6e6', fontSize: 14 }}>
        {title}
      </Text>

      {ordered.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 11 }} data-testid="battery-state-empty">
          No entities configured
        </Text>
      ) : (
        ordered.map((row, index) => {
          const color = levelColor(row.level, card);
          const safeId = row.entityId.replace(/[^a-zA-Z0-9_-]/g, '-') || `row-${index}`;
          return (
            <div
              key={`${row.entityId}-${index}`}
              data-testid={`battery-state-row-${safeId}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}
            >
              <MdiIcon icon={batteryIcon(row.level)} color={color} size={16} />
              <Text ellipsis style={{ color: '#e6e6e6', fontSize: 12, flex: 1, minWidth: 0 }}>
                {row.name}
              </Text>
              <div
                style={{
                  width: 48,
                  height: 5,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.12)',
                }}
              >
                <div
                  style={{
                    width: `${row.level === undefined ? 0 : Math.min(100, Math.max(0, row.level))}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: color,
                  }}
                />
              </div>
              <Text
                style={{ color, fontSize: 12, minWidth: 34, textAlign: 'right' }}
                data-testid={`battery-state-level-${safeId}`}
              >
                {row.level === undefined ? '—' : `${Math.round(row.level)}%`}
              </Text>
            </div>
          );
        })
      )}
    </AntCard>
  );
};
