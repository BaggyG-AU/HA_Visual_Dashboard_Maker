import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { TileCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { getStateIcon } from '../../services/stateIcons';
import { resolveCardAction } from '../../services/smartActions';
import { triggerHapticForAction } from '../../services/hapticService';
import { playSoundForAction } from '../../services/soundService';
import { MdiIcon } from '../MdiIcon';
import {
  resolveTileFeatures,
  tileSliderLabel,
  tileSliderPercent,
  type ResolvedTileFeature,
} from '../../utils/tileFeatures';

const { Text } = Typography;

interface TileCardRendererProps {
  card: TileCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Home Assistant's theme colour tokens, as accepted by `tile`'s `color:`.
 *
 * ⚠ These are the ONLY named values HA honours — anything else it treats as a
 * CSS colour. Keeping the map explicit (rather than passing the token straight
 * to CSS) is what stops `color: primary` silently rendering as nothing.
 */
const HA_COLORS: Record<string, string> = {
  primary: '#03a9f4',
  accent: '#ff9800',
  disabled: '#bdbdbd',
  red: '#f44336',
  pink: '#e91e63',
  purple: '#926bc7',
  'deep-purple': '#6e41ab',
  indigo: '#3f51b5',
  blue: '#2196f3',
  'light-blue': '#03a9f4',
  cyan: '#00bcd4',
  teal: '#009688',
  green: '#4caf50',
  'light-green': '#8bc34a',
  lime: '#cddc39',
  yellow: '#ffeb3b',
  amber: '#ffc107',
  orange: '#ff9800',
  'deep-orange': '#ff6f22',
  brown: '#795548',
  grey: '#9e9e9e',
  'blue-grey': '#607d8b',
  black: '#000000',
  white: '#ffffff',
};

const ACTIVE_STATES = new Set([
  'on',
  'open',
  'opening',
  'unlocked',
  'home',
  'playing',
  'heat',
  'cool',
  'heat_cool',
  'auto',
  'dry',
  'fan_only',
  'cleaning',
  'active',
]);

const INACTIVE_COLOR = '#8a8a8a';
const DEFAULT_ACTIVE_COLOR = '#f5c518';

/**
 * Resolve the tile's icon colour.
 *
 * HA's rule, reproduced: an explicit theme token or CSS colour always wins;
 * `state` (and HA's default behaviour) colours an active entity and greys an
 * inactive one; an unavailable entity is always grey.
 */
const resolveTileColor = (color: string | undefined, state: string, hasEntity: boolean): string => {
  if (!hasEntity || state === 'unavailable' || state === 'unknown') return INACTIVE_COLOR;
  if (color && color !== 'state') {
    return HA_COLORS[color] ?? color;
  }
  return ACTIVE_STATES.has(state) ? DEFAULT_ACTIVE_COLOR : INACTIVE_COLOR;
};

/**
 * Build the tile's state line.
 *
 * `state_content` selects what appears there: `state`, `last_changed`, or any
 * attribute name — and a LIST joins several with HA's middle dot. Unset means
 * the entity's state, which is what the overwhelming majority of tiles do.
 */
const resolveStateContent = (
  stateContent: string | string[] | undefined,
  state: string,
  attributes: Record<string, unknown>,
): string => {
  const parts = Array.isArray(stateContent) ? stateContent : stateContent ? [stateContent] : null;
  if (!parts) return state;

  const rendered = parts
    .map((part) => {
      if (part === 'state') return state;
      const value = attributes[part];
      if (value === undefined || value === null) return '';
      return String(value);
    })
    .filter((value) => value !== '');

  return rendered.length > 0 ? rendered.join(' · ') : state;
};

/** A feature's own control, drawn per archetype rather than per feature type. */
const TileFeatureControl: React.FC<{ feature: ResolvedTileFeature; accent: string }> = ({
  feature,
  accent,
}) => {
  const testId = `tile-feature-${feature.type}`;

  if (!feature.supported) {
    return (
      <div
        data-testid={testId}
        data-feature-control="unsupported"
        style={{
          border: '1px dashed #6b5b1f',
          borderRadius: 8,
          padding: '4px 8px',
          fontSize: 11,
          color: '#c8a93a',
          background: 'rgba(250, 173, 20, 0.08)',
        }}
      >
        {feature.label}
      </div>
    );
  }

  if (feature.control === 'toggle') {
    return (
      <div
        data-testid={testId}
        data-feature-control="toggle"
        data-feature-on={feature.on ? 'true' : 'false'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: 999,
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            width: 32,
            height: 18,
            borderRadius: 999,
            background: feature.on ? accent : '#4a4a4a',
            position: 'relative',
            transition: 'background 0.2s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: feature.on ? 16 : 2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s ease',
            }}
          />
        </span>
        <Text style={{ fontSize: 11, color: '#d9d9d9' }}>{feature.label}</Text>
      </div>
    );
  }

  if (feature.control === 'slider') {
    return (
      <div
        data-testid={testId}
        data-feature-control="slider"
        style={{ flex: '1 1 120px', minWidth: 120 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text style={{ fontSize: 10, color: '#9a9a9a' }}>{feature.label}</Text>
          <Text style={{ fontSize: 10, color: '#d9d9d9' }} data-testid={`${testId}-value`}>
            {tileSliderLabel(feature)}
          </Text>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }}>
          <div
            style={{
              width: `${tileSliderPercent(feature)}%`,
              height: '100%',
              borderRadius: 999,
              background: accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    );
  }

  // `options` and `commands` share a chip row; only `options` has an active one.
  const entries = feature.options ?? [];
  return (
    <div
      data-testid={testId}
      data-feature-control={feature.control}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}
    >
      {entries.length === 0 ? (
        <Text style={{ fontSize: 10, color: '#7a7a7a' }} data-testid={`${testId}-empty`}>
          {feature.label} — none available
        </Text>
      ) : (
        entries.map((option) => {
          const isActive = feature.control === 'options' && option.value === feature.active;
          return (
            <span
              key={option.value}
              data-testid={`${testId}-option-${option.value}`}
              data-active={isActive ? 'true' : 'false'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                border: `1px solid ${isActive ? accent : '#3a3a3a'}`,
                background: isActive ? `${accent}22` : 'rgba(255,255,255,0.04)',
                color: isActive ? accent : '#c4c4c4',
                borderRadius: 8,
                padding: '3px 8px',
                fontSize: 11,
              }}
            >
              {option.icon && <MdiIcon icon={option.icon} size={12} color="currentColor" />}
              {option.label}
            </span>
          );
        })
      )}
    </div>
  );
};

/**
 * Visual renderer for Home Assistant's core `tile` card.
 *
 * The most-used modern HA card — 17 instances on the reference instance alone —
 * and one of four core cards that fell through to `UnsupportedCard` until now.
 */
export const TileCardRenderer: React.FC<TileCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const state = entity?.state ?? 'unavailable';
  const attributes = entity?.attributes ?? {};

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    (attributes.friendly_name as string | undefined) ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Tile';

  const accent = resolveTileColor(card.color, state, !!entity);
  const resolvedIcon = getStateIcon({
    entityId: card.entity,
    state,
    stateIcons: card.state_icons,
    entityAttributes: attributes,
    fallbackIcon: card.icon || 'mdi:help-circle-outline',
  });
  // An explicit `icon:` on the card outranks anything derived from the state,
  // matching HA — the user asked for that glyph specifically.
  const iconName = card.icon || resolvedIcon.icon;

  const stateLine = resolveStateContent(card.state_content, state, attributes);
  const features = resolveTileFeatures(card.features, entity);
  const isVertical = card.vertical === true;
  const isInline = card.features_position === 'inline';

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

  const entityPicture =
    card.show_entity_picture !== false && typeof attributes.entity_picture === 'string'
      ? (attributes.entity_picture as string)
      : undefined;

  return (
    <AntCard
      size="small"
      data-testid="ha-tile-card"
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
          justifyContent: 'center',
          height: '100%',
          gap: '10px',
          overflow: 'hidden',
        },
      }}
      onClick={handleClick}
      hoverable
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: 'center',
          gap: isVertical ? 6 : 12,
          textAlign: isVertical ? 'center' : 'left',
        }}
      >
        <div
          data-testid="tile-card-icon"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${accent}22`,
            overflow: 'hidden',
          }}
        >
          {entityPicture ? (
            <img
              src={entityPicture}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MdiIcon icon={iconName} color={accent} size={22} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Text
            strong
            ellipsis
            data-testid="tile-card-name"
            style={{
              display: 'block',
              color: '#e6e6e6',
              fontSize: 14,
              textTransform: 'capitalize',
            }}
          >
            {displayName}
          </Text>
          {card.hide_state !== true && (
            <Text
              ellipsis
              type="secondary"
              data-testid="tile-card-state"
              style={{ display: 'block', fontSize: 12 }}
            >
              {stateLine}
            </Text>
          )}
        </div>
      </div>

      {features.length > 0 && (
        <div
          data-testid="tile-card-features"
          style={{
            display: 'flex',
            flexDirection: isInline ? 'row' : 'column',
            flexWrap: isInline ? 'nowrap' : 'wrap',
            alignItems: isInline ? 'center' : 'stretch',
            gap: 8,
            borderTop: isInline ? 'none' : '1px solid rgba(255,255,255,0.06)',
            paddingTop: isInline ? 0 : 8,
          }}
        >
          {features.map((feature, index) => (
            <TileFeatureControl
              key={`${feature.type}-${index}`}
              feature={feature}
              accent={accent === INACTIVE_COLOR ? DEFAULT_ACTIVE_COLOR : accent}
            />
          ))}
        </div>
      )}
    </AntCard>
  );
};
