import React from 'react';
import { Typography } from 'antd';
import { HeadingCard, HeadingBadgeConfig } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { getStateIcon } from '../../services/stateIcons';
import { MdiIcon } from '../MdiIcon';

const { Text } = Typography;

interface HeadingCardRendererProps {
  card: HeadingCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/** One heading badge — an icon plus its entity's state, rendered inline. */
const HeadingBadge: React.FC<{ badge: HeadingBadgeConfig }> = ({ badge }) => {
  const { getEntity } = useHAEntities();
  const entity = badge.entity ? getEntity(badge.entity) : null;
  const state = entity?.state ?? 'unavailable';
  const attributes = entity?.attributes ?? {};

  const resolved = getStateIcon({
    entityId: badge.entity,
    state,
    stateIcons: undefined,
    entityAttributes: attributes,
    fallbackIcon: badge.icon || 'mdi:information-outline',
  });
  const icon = badge.icon || resolved.icon;

  // `content` overrides the state entirely; otherwise show the state plus the
  // entity's own unit, which is what makes a badge readable at a glance.
  const unit =
    typeof attributes.unit_of_measurement === 'string'
      ? (attributes.unit_of_measurement as string)
      : '';
  const label = badge.content ?? (entity ? `${state}${unit ? ` ${unit}` : ''}` : state);

  const safeId = (badge.entity ?? 'badge').replace(/[^a-zA-Z0-9_-]/g, '-');

  return (
    <span
      data-testid={`heading-card-badge-${safeId}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        fontSize: 12,
        color: '#d9d9d9',
      }}
    >
      <MdiIcon icon={icon} size={14} color={resolved.color || '#9e9e9e'} />
      {label}
    </span>
  );
};

/**
 * Visual renderer for Home Assistant's core `heading` card (HA 2024.8+).
 *
 * ⚠ Deliberately NOT wrapped in an `AntCard`. A heading in Home Assistant is a
 * section label, not a panel — it has no border, no background and no padding
 * box. Rendering it as a card would put a frame around every section title on
 * the canvas and misrepresent what deploys.
 */
export const HeadingCardRenderer: React.FC<HeadingCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolvedHeading = useEntityContextValue(card.heading ?? '', card.entity ?? null);
  // HA falls back to the literal "New section" for a heading with no text —
  // matching it keeps a freshly-added section looking the same in both tools.
  const heading = (card.heading ? resolvedHeading : '') || 'New section';
  const isTitle = (card.heading_style ?? 'title') === 'title';
  const badges = Array.isArray(card.badges) ? card.badges : [];

  const backgroundStyle = getCardBackgroundStyle(card.style, 'transparent');

  return (
    <div
      data-testid="ha-heading-card"
      onClick={onClick}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: 8,
        border: isSelected ? '2px solid #00d9ff' : '2px solid transparent',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {card.icon && (
          <MdiIcon
            icon={card.icon}
            size={isTitle ? 22 : 16}
            color="#e6e6e6"
            testId="heading-card-icon"
          />
        )}
        <Text
          ellipsis
          data-testid="heading-card-text"
          data-heading-style={isTitle ? 'title' : 'subtitle'}
          style={{
            color: isTitle ? '#e6e6e6' : '#9a9a9a',
            fontSize: isTitle ? 20 : 14,
            fontWeight: isTitle ? 600 : 400,
            lineHeight: 1.3,
          }}
        >
          {heading}
        </Text>
      </span>

      {badges.length > 0 && (
        <span
          data-testid="heading-card-badges"
          style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}
        >
          {badges.map((badge, index) => (
            <HeadingBadge key={`${badge.entity ?? 'badge'}-${index}`} badge={badge} />
          ))}
        </span>
      )}
    </div>
  );
};
