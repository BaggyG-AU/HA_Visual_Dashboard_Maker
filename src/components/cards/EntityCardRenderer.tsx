import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { EntityCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { getStateIcon } from '../../services/stateIcons';
import { resolveCardAction } from '../../services/smartActions';
import { triggerHapticForAction } from '../../services/hapticService';
import { playSoundForAction } from '../../services/soundService';
import { MdiIcon } from '../MdiIcon';

const { Text } = Typography;

interface EntityCardRendererProps {
  card: EntityCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Domains Home Assistant colours by state on an `entity` card without being
 * asked. HA turns `state_color` on by default for things that are meaningfully
 * on or off, and leaves a sensor's icon neutral — a temperature reading has no
 * "on".
 */
const STATE_COLOR_DOMAINS = new Set([
  'light',
  'switch',
  'fan',
  'binary_sensor',
  'input_boolean',
  'automation',
  'script',
  'cover',
  'lock',
  'climate',
  'media_player',
  'humidifier',
  'siren',
  'valve',
]);

const ACTIVE_STATES = new Set(['on', 'open', 'opening', 'unlocked', 'home', 'playing', 'active']);

const ACTIVE_COLOR = '#f5c518';
const INACTIVE_COLOR = '#8a8a8a';

/**
 * Visual renderer for Home Assistant's core `entity` card.
 *
 * One of the oldest cards HA ships — a single entity's icon, name and state —
 * and absent from HAVDM's registry until now.
 */
export const EntityCardRenderer: React.FC<EntityCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const state = entity?.state ?? 'unavailable';
  const attributes = entity?.attributes ?? {};
  const domain = card.entity?.split('.')[0] ?? '';

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    (attributes.friendly_name as string | undefined) ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Entity';

  // `attribute:` swaps the displayed value for one of the entity's attributes —
  // the reason an `entity` card can show "42 %" for a battery rather than "on".
  const rawValue = card.attribute ? attributes[card.attribute] : state;
  const displayValue =
    rawValue === undefined || rawValue === null || rawValue === '' ? '—' : String(rawValue);

  const unit =
    card.unit ??
    (card.attribute
      ? ''
      : typeof attributes.unit_of_measurement === 'string'
        ? (attributes.unit_of_measurement as string)
        : '');

  const stateColorEnabled = card.state_color ?? STATE_COLOR_DOMAINS.has(domain);
  const resolvedIcon = getStateIcon({
    entityId: card.entity,
    state,
    stateIcons: card.state_icons,
    entityAttributes: attributes,
    fallbackIcon: card.icon || 'mdi:eye-outline',
  });
  const iconName = card.icon || resolvedIcon.icon;

  const iconColor = !entity
    ? INACTIVE_COLOR
    : card.color
      ? card.color
      : stateColorEnabled && ACTIVE_STATES.has(state)
        ? ACTIVE_COLOR
        : resolvedIcon.color || INACTIVE_COLOR;

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  const { action: tapAction } = resolveCardAction(card, 'tap');

  const handleClick = () => {
    triggerHapticForAction(tapAction, card.haptic);
    void playSoundForAction(tapAction, card.sound);
    onClick?.();
  };

  return (
    <AntCard
      size="small"
      data-testid="ha-entity-card"
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
          justifyContent: 'space-between',
          height: '100%',
          gap: 8,
          overflow: 'hidden',
        },
      }}
      onClick={handleClick}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
        <MdiIcon icon={iconName} color={iconColor} size={22} testId="entity-card-icon" />
        <Text
          ellipsis
          data-testid="entity-card-name"
          style={{ color: '#e6e6e6', fontSize: 14, textTransform: 'capitalize', minWidth: 0 }}
        >
          {displayName}
        </Text>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
        <Text
          strong
          data-testid="entity-card-state"
          style={{ color: '#e6e6e6', fontSize: 26, lineHeight: 1 }}
        >
          {displayValue}
        </Text>
        {unit && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {unit}
          </Text>
        )}
      </div>
    </AntCard>
  );
};
