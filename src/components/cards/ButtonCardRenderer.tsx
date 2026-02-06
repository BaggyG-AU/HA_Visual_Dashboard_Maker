import React from 'react';
import { Card as AntCard, Popconfirm, Space, Typography } from 'antd';
import { ButtonCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { triggerHapticForAction } from '../../services/hapticService';
import { playSoundForAction } from '../../services/soundService';
import { resolveTapAction } from '../../services/smartActions';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { AttributeDisplay } from '../AttributeDisplay';
import { getStateIcon } from '../../services/stateIcons';
import { MdiIcon } from '../MdiIcon';
import {
  executeBatchAction,
  isDestructiveBatchAction,
  resolveMultiEntityIds,
  summarizeAggregateState,
  evaluateAggregateFunction,
} from '../../services/multiEntity';
import type { BatchActionType, MultiEntityMode } from '../../types/multiEntity';

const { Text } = Typography;

interface ButtonCardRendererProps {
  card: ButtonCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Button card type
 * Displays a button-style card for entity control
 */
export const ButtonCardRenderer: React.FC<ButtonCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity, entities } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const attributes = entity?.attributes || {};
  const state = entity?.state || 'unknown';
  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Button';
  const showName = card.show_name !== false;
  const showState = card.show_state !== false;
  const showIcon = card.show_icon !== false;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');
  const { action: tapAction } = resolveTapAction(card);
  const resolvedIcon = getStateIcon({
    entityId: card.entity,
    state,
    stateIcons: card.state_icons,
    entityAttributes: attributes,
    fallbackIcon: card.icon || 'mdi:gesture-tap',
  });
  const entityIds = resolveMultiEntityIds(card);
  const multiEntityMode = (card.multi_entity_mode ?? 'individual') as MultiEntityMode;
  const multiEntityEnabled = entityIds.length > 1;
  const aggregateFunction = card.aggregate_function ?? 'count_on';
  const batchActions = (card.batch_actions ?? ['turn_on', 'turn_off', 'toggle'])
    .map((entry) => (typeof entry === 'string' ? entry : entry?.type))
    .filter((entry): entry is BatchActionType => typeof entry === 'string');

  const handleClick = () => {
    triggerHapticForAction(tapAction, card.haptic);
    void playSoundForAction(tapAction, card.sound);
    onClick?.();
  };

  const runBatchAction = (action: BatchActionType) => {
    const result = executeBatchAction(action, entityIds, entities);
    console.info('[multi-entity] Batch action planned', {
      action,
      operationCount: result.operations.length,
      operations: result.operations,
      failures: result.failures,
    });
  };

  const aggregateValue = evaluateAggregateFunction(aggregateFunction, entityIds, entities);

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
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '12px',
        },
      }}
      onClick={handleClick}
      hoverable
    >
      {multiEntityEnabled && (
        <div data-testid="multi-entity-mode-badge">
          <Text type="secondary" style={{ fontSize: 11 }}>
            Mode: {multiEntityMode}
          </Text>
        </div>
      )}

      {multiEntityEnabled && multiEntityMode === 'individual' && (
        <div style={{ width: '100%' }} data-testid="multi-entity-individual-list">
          {entityIds.map((entityId) => {
            const targetEntity = getEntity(entityId);
            const targetState = targetEntity?.state ?? 'unavailable';
            const targetAttributes = targetEntity?.attributes ?? {};
            const targetIcon = getStateIcon({
              entityId,
              state: targetState,
              stateIcons: card.state_icons,
              entityAttributes: targetAttributes,
              fallbackIcon: card.icon || 'mdi:gesture-tap',
            });
            const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');

            return (
              <div
                key={entityId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: 6,
                  marginBottom: 6,
                }}
                data-testid={`multi-entity-individual-item-${safeEntityId}`}
              >
                <Space size={8}>
                  <MdiIcon icon={targetIcon.icon} color={targetIcon.color || '#9e9e9e'} size={16} />
                  <Text style={{ color: '#e6e6e6', fontSize: 12 }}>{entityId}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }} data-testid={`multi-entity-individual-state-${safeEntityId}`}>
                  {targetState}
                </Text>
              </div>
            );
          })}
        </div>
      )}

      {multiEntityEnabled && multiEntityMode === 'aggregate' && (
        <div
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #2e2e2e',
            borderRadius: 8,
            background: '#101010',
          }}
          data-testid="multi-entity-aggregate-panel"
        >
          <Text style={{ color: '#d9d9d9', display: 'block' }} data-testid="multi-entity-aggregate-indicator">
            {summarizeAggregateState(entityIds, entities)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }} data-testid="multi-entity-aggregate-value">
            {`Function (${aggregateFunction}): ${aggregateValue === null ? 'N/A' : String(aggregateValue)}`}
          </Text>
        </div>
      )}

      {multiEntityEnabled && multiEntityMode === 'batch' && (
        <div style={{ width: '100%' }} data-testid="multi-entity-batch-panel">
          <Space wrap>
            {batchActions.map((action) => {
              const destructive = isDestructiveBatchAction(action);
              const button = (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!destructive) {
                      runBatchAction(action);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!destructive && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      event.stopPropagation();
                      runBatchAction(action);
                    }
                  }}
                  style={{
                    border: '1px solid #3a3a3a',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#d9d9d9',
                    fontSize: 12,
                  }}
                  data-testid={`multi-entity-batch-action-${action}`}
                >
                  {action.replace('_', ' ')}
                </span>
              );

              if (!destructive) {
                return <React.Fragment key={action}>{button}</React.Fragment>;
              }

              return (
                <Popconfirm
                  key={action}
                  title={`Run ${action.replace('_', ' ')} for ${entityIds.length} entities?`}
                  okText="Run"
                  cancelText="Cancel"
                  onConfirm={(event) => {
                    event?.stopPropagation();
                    runBatchAction(action);
                  }}
                >
                  {button}
                </Popconfirm>
              );
            })}
          </Space>
        </div>
      )}

      {showIcon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 217, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(0, 217, 255, 0.3)',
          }}
        >
          <MdiIcon
            icon={resolvedIcon.icon}
            color={resolvedIcon.color || '#00d9ff'}
            size={32}
            testId="button-card-state-icon"
            style={{ transition: 'all 0.2s ease' }}
          />
        </div>
      )}

      {showName && (
        <Text
          strong
          style={{
            color: '#e6e6e6',
            fontSize: '14px',
            textAlign: 'center',
            textTransform: 'capitalize',
          }}
          data-testid="button-card-display-name"
        >
          {displayName}
        </Text>
      )}

      {card.attribute_display && card.attribute_display.length > 0 && (
        <AttributeDisplay
          attributes={attributes}
          items={card.attribute_display}
          layout={card.attribute_display_layout}
          testIdPrefix="attribute-display-button"
        />
      )}

      {showState && card.entity && (
        <div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {state}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
