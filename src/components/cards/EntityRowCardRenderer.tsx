import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { getStateIcon } from '../../services/stateIcons';
import { MdiIcon } from '../MdiIcon';
import { describeRowCardPlacement } from '../../utils/hacsRowCards';

const { Text } = Typography;

/**
 * The three HACS entity-row types share one config surface loosely enough that
 * a single props type is honest: an `entity`, an optional list of others, and
 * per-type extras that the index signature preserves.
 */
export interface EntityRowCardConfig {
  type: string;
  entity?: string;
  name?: string;
  icon?: string;
  /** `multiple-entity-row`'s secondary entities; `fold-entity-row`'s children. */
  entities?: Array<string | { entity?: string; name?: string; [key: string]: unknown }>;
  /** `fold-entity-row`'s always-visible header row. */
  head?: string | { entity?: string; name?: string; [key: string]: unknown };
  /** `fold-entity-row` starts expanded. */
  open?: boolean;
  /** `fold-entity-row`'s nested rows, HA's newer key. */
  items?: Array<unknown>;
  /** `slider-entity-row` bounds. */
  min?: number;
  max?: number;
  step?: number;
  toggle?: boolean;
  style?: string;
  [key: string]: unknown;
}

interface EntityRowCardRendererProps {
  card: EntityRowCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const entityIdOf = (entry: unknown): string | undefined => {
  if (typeof entry === 'string') return entry;
  if (
    entry &&
    typeof entry === 'object' &&
    typeof (entry as { entity?: unknown }).entity === 'string'
  ) {
    return (entry as { entity: string }).entity;
  }
  return undefined;
};

const prettify = (entityId: string): string =>
  entityId.split('.')[1]?.replace(/_/g, ' ') ?? entityId;

/** One rendered row line: icon, name, value. The shape every row type shares. */
const RowLine: React.FC<{
  entityId?: string;
  label?: string;
  fallbackIcon: string;
  testId: string;
  trailing?: React.ReactNode;
}> = ({ entityId, label, fallbackIcon, testId, trailing }) => {
  const { getEntity } = useHAEntities();
  const entity = entityId ? getEntity(entityId) : null;
  const state = entity?.state ?? 'unavailable';
  const attributes = entity?.attributes ?? {};
  const resolved = getStateIcon({
    entityId,
    state,
    stateIcons: undefined,
    entityAttributes: attributes,
    fallbackIcon,
  });
  const unit =
    typeof attributes.unit_of_measurement === 'string'
      ? (attributes.unit_of_measurement as string)
      : '';
  const name =
    label ||
    (attributes.friendly_name as string | undefined) ||
    (entityId ? prettify(entityId) : 'Row');

  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
        minWidth: 0,
      }}
    >
      <MdiIcon icon={resolved.icon} color={resolved.color || '#9e9e9e'} size={16} />
      <Text ellipsis style={{ color: '#e6e6e6', fontSize: 13, flex: 1, minWidth: 0 }}>
        {name}
      </Text>
      {trailing ?? (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {entity ? `${state}${unit ? ` ${unit}` : ''}` : state}
        </Text>
      )}
    </div>
  );
};

/** `slider-entity-row`'s inline slider, drawn from the entity's own bounds. */
const InlineSlider: React.FC<{ card: EntityRowCardConfig }> = ({ card }) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const attributes = entity?.attributes ?? {};

  // A light's brightness is 0-255; everything else uses the entity's declared
  // range. Reading the domain rather than assuming 0-100 is what stops a light
  // slider sitting at 100% whenever it is merely on.
  const domain = card.entity?.split('.')[0] ?? '';
  const isLight = domain === 'light';
  const min = card.min ?? (isLight ? 0 : Number(attributes.min ?? 0));
  const max = card.max ?? (isLight ? 255 : Number(attributes.max ?? 100));
  const raw = isLight ? Number(attributes.brightness ?? 0) : Number(entity?.state ?? NaN);
  const value = Number.isFinite(raw) ? Math.min(max, Math.max(min, raw)) : undefined;
  const percent = value === undefined || max <= min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div style={{ flex: '0 0 96px', minWidth: 96 }} data-testid="entity-row-slider">
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            borderRadius: 999,
            background: '#00d9ff',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Visual renderer for the three HACS **entity row** types —
 * `custom:fold-entity-row`, `custom:multiple-entity-row` and
 * `custom:slider-entity-row`.
 *
 * ⚠⚠ These were offered in HAVDM's palette with no renderer, so a user could
 * drag one out and get an "Unsupported Card Type" placeholder. They now render —
 * AND they carry a placement notice, because they are not cards: in Home
 * Assistant they belong inside an `entities` card. Rendering them silently as
 * ordinary cards would have replaced a visible gap with an invisible lie.
 */
export const EntityRowCardRenderer: React.FC<EntityRowCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const placement = describeRowCardPlacement(card.type);

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  const isFold = card.type === 'custom:fold-entity-row';
  const isSlider = card.type === 'custom:slider-entity-row';

  // `fold-entity-row` nests its children under `entities` (older) or `items`
  // (newer); accept both rather than making the user's YAML version-sensitive.
  const foldChildren = (
    Array.isArray(card.entities) ? card.entities : Array.isArray(card.items) ? card.items : []
  ) as Array<unknown>;
  const headEntity = entityIdOf(card.head);
  const headLabel =
    card.head && typeof card.head === 'object' && typeof card.head.name === 'string'
      ? card.head.name
      : undefined;

  const secondary = Array.isArray(card.entities) ? card.entities : [];

  return (
    <AntCard
      size="small"
      data-testid="ha-entity-row-card"
      data-row-type={card.type}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '10px 12px',
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
      {isFold ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DownOutlined
              style={{
                fontSize: 11,
                color: '#9a9a9a',
                transform: card.open ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease',
              }}
              data-testid="entity-row-fold-chevron"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <RowLine
                entityId={headEntity}
                label={headLabel ?? (card.name ? resolvedName : undefined)}
                fallbackIcon={card.icon || 'mdi:folder-outline'}
                testId="entity-row-head"
              />
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }} data-testid="entity-row-fold-count">
            {`${foldChildren.length} row${foldChildren.length === 1 ? '' : 's'} folded`}
          </Text>
          {card.open &&
            foldChildren.slice(0, 4).map((child, index) => (
              <div key={index} style={{ paddingLeft: 16 }}>
                <RowLine
                  entityId={entityIdOf(child)}
                  fallbackIcon="mdi:circle-small"
                  testId={`entity-row-child-${index}`}
                />
              </div>
            ))}
        </>
      ) : (
        <>
          <RowLine
            entityId={card.entity}
            label={card.name ? resolvedName : undefined}
            fallbackIcon={card.icon || 'mdi:format-list-bulleted'}
            testId="entity-row-primary"
            trailing={isSlider ? <InlineSlider card={card} /> : undefined}
          />
          {!isSlider && secondary.length > 0 && (
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingLeft: 24 }}
              data-testid="entity-row-secondary"
            >
              {secondary.slice(0, 4).map((entry, index) => {
                const id = entityIdOf(entry);
                const label =
                  entry && typeof entry === 'object' && typeof entry.name === 'string'
                    ? entry.name
                    : id
                      ? prettify(id)
                      : '—';
                return (
                  <SecondaryValue
                    key={index}
                    entityId={id}
                    label={label}
                    testId={`entity-row-secondary-${index}`}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {placement && (
        <div
          data-testid="entity-row-placement-notice"
          style={{
            marginTop: 'auto',
            fontSize: 10,
            color: '#c8a93a',
            borderTop: '1px dashed rgba(250, 173, 20, 0.35)',
            paddingTop: 4,
          }}
        >
          {placement}
        </div>
      )}
    </AntCard>
  );
};

/** `multiple-entity-row`'s secondary readings — a small label over its value. */
const SecondaryValue: React.FC<{ entityId?: string; label: string; testId: string }> = ({
  entityId,
  label,
  testId,
}) => {
  const { getEntity } = useHAEntities();
  const entity = entityId ? getEntity(entityId) : null;
  const state = entity?.state ?? 'unavailable';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} data-testid={testId}>
      <Text type="secondary" style={{ fontSize: 9, lineHeight: 1.2 }}>
        {label}
      </Text>
      <Text style={{ color: '#e6e6e6', fontSize: 12, lineHeight: 1.2 }}>{state}</Text>
    </div>
  );
};
