import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { EntitiesCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextResolver } from '../../hooks/useEntityContext';
import { AttributeDisplay } from '../AttributeDisplay';
import { evaluateEntityVisibility } from '../../services/conditionalVisibility';
import { getStateIcon } from '../../services/stateIcons';
import { MdiIcon } from '../MdiIcon';

const { Text } = Typography;

interface EntitiesCardRendererProps {
  card: EntitiesCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Entities card type
 * Displays a list of entities with their current states
 */
export const EntitiesCardRenderer: React.FC<EntitiesCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolveContext = useEntityContextResolver();
  const defaultEntityId = Array.isArray(card.entities)
    ? (typeof card.entities[0] === 'string' ? card.entities[0] : card.entities[0]?.entity)
    : null;
  const resolvedTitle = card.title ? resolveContext(card.title, defaultEntityId ?? null) : '';
  const resolvedName = card.name ? resolveContext(card.name, defaultEntityId ?? null) : '';
  const title = (card.title ? resolvedTitle : '') || (card.name ? resolvedName : '') || 'Entities';
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Get live entity states (if available)
  const { entities, getEntity, isLoading } = useHAEntities();
  const visibleEntities = Array.isArray(card.entities)
    ? card.entities.filter((entity) => evaluateEntityVisibility(entity, entities))
    : [];
  const entityCount = visibleEntities.length;

  // Extract entity IDs for display
  const getEntityId = (entity: unknown): string => {
    if (typeof entity === 'string') return entity;
    if (typeof entity === 'object' && entity !== null && 'entity' in entity) {
      const entityId = (entity as { entity?: unknown }).entity;
      if (typeof entityId === 'string') return entityId;
    }
    return 'unknown';
  };

  // Format state value for display
  const formatState = (state: string) => {
    // For binary states
    if (['on', 'off'].includes(state.toLowerCase())) {
      return state.charAt(0).toUpperCase() + state.slice(1);
    }

    // For numeric states, keep as is
    if (!isNaN(Number(state))) {
      return state;
    }

    // Capitalize first letter
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <AntCard
      size="small"
      title={
        card.title ? (
          <div style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#e1e1e1',
            padding: '0',
          }} data-testid="entities-card-title">
            {title}
          </div>
        ) : undefined
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
        borderRadius: '12px',
      }}
      headStyle={{
        padding: card.title ? '12px 16px 8px 16px' : '0',
        minHeight: card.title ? '40px' : '0',
        borderBottom: 'none',
      }}
      styles={{
        body: {
        padding: '0 16px 12px 16px',
        paddingTop: card.title ? '0' : '12px',
        height: card.title ? 'calc(100% - 40px)' : '100%',
        overflowY: 'auto',
      },
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {visibleEntities.slice(0, 10).map((entity, idx) => {
          const entityId = getEntityId(entity);
          const rawNameValue = typeof entity === 'object' && entity !== null && 'name' in entity
            ? (entity as { name?: unknown }).name
            : '';
          const rawName = typeof rawNameValue === 'string' ? rawNameValue : '';
          const entityName =
            rawName
              ? resolveContext(rawName, entityId)
              : entityId.split('.')[1]?.replace(/_/g, ' ');

          // Get live state from HA
          const entityState = getEntity(entityId);
          const state = entityState?.state || 'unknown';
          const stateDisplay = formatState(state);
          const resolved = getStateIcon({
            entityId,
            state: isLoading ? 'unknown' : state,
            stateIcons: card.state_icons,
            entityAttributes: entityState?.attributes,
          });
          const iconColor = resolved.color
            || (state === 'on' ? '#52c41a' : state === 'unavailable' || state === 'unknown' ? '#ff5252' : '#9e9e9e');

          // Get unit of measurement from attributes
          const unit = entityState?.attributes?.unit_of_measurement || '';
          const displayValue = unit ? `${stateDisplay} ${unit}` : stateDisplay;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '40px',
                padding: '0 8px',
                gap: '12px',
                borderBottom: idx < Math.min(visibleEntities.length, 10) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
              data-testid={`entities-card-row-${entityId.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MdiIcon
                    icon={resolved.icon}
                    color={iconColor}
                    size={16}
                    testId={`entities-card-icon-${entityId.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                    style={{ flexShrink: 0, transition: 'all 0.2s ease' }}
                  />
                  <Text
                    style={{
                      color: '#e1e1e1',
                      fontSize: '14px',
                      textTransform: 'capitalize',
                      fontWeight: 400,
                    }}
                    ellipsis={{ tooltip: entityName }}
                  >
                    {entityName}
                  </Text>
                </div>
                {card.attribute_display && card.attribute_display.length > 0 && entityState && (
                  <AttributeDisplay
                    attributes={entityState.attributes || {}}
                    items={card.attribute_display}
                    layout={card.attribute_display_layout}
                    testIdPrefix={`attribute-display-${entityId.replace('.', '-')}`}
                  />
                )}
              </div>
              <Text style={{
                color: state === 'unavailable' || state === 'unknown' ? '#ff5252' : '#9e9e9e',
                fontSize: '14px',
                flexShrink: 0,
                fontWeight: state === 'on' ? 500 : 400,
              }}>
                {displayValue}
              </Text>
            </div>
          );
        })}
        {entityCount > 10 && (
          <Text type="secondary" style={{ fontSize: '12px', padding: '8px' }}>
            +{entityCount - 10} more
          </Text>
        )}
      </div>
    </AntCard>
  );
};
