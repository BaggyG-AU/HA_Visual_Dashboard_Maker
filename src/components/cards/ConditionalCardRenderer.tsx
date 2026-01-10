import React from 'react';
import { Card as AntCard, Typography, Tag } from 'antd';
import { QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ConditionalCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { BaseCard } from '../BaseCard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface ConditionalCardRendererProps {
  card: ConditionalCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Conditional card type
 * Shows/hides a card based on entity state conditions
 */
export const ConditionalCardRenderer: React.FC<ConditionalCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();

  // Evaluate conditions
  const evaluateConditions = () => {
    const conditions = card.conditions || [];

    return conditions.map(condition => {
      const entity = getEntity(condition.entity);
      const currentState = entity?.state || 'unknown';

      let conditionMet = false;

      if (condition.state !== undefined) {
        // Check if state matches
        conditionMet = currentState === condition.state;
      } else if (condition.state_not !== undefined) {
        // Check if state does NOT match
        conditionMet = currentState !== condition.state_not;
      } else {
        // No specific state requirement - just check if entity exists
        conditionMet = entity !== null;
      }

      return {
        entity: condition.entity,
        expectedState: condition.state || `not ${condition.state_not}`,
        currentState,
        met: conditionMet,
      };
    });
  };

  const evaluatedConditions = evaluateConditions();
  const allConditionsMet = evaluatedConditions.every(c => c.met);
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // If no child card, show placeholder
  if (!card.card) {
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
          gap: '8px',
        },
      }}
        onClick={onClick}
        hoverable
      >
        <QuestionCircleOutlined style={{ fontSize: '32px', color: '#666' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Conditional Card
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          (No card configured)
        </Text>
      </AntCard>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        borderRadius: '8px',
        ...getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : 'transparent'),
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      {/* Render child card */}
      <div style={{
        height: '100%',
        opacity: allConditionsMet ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
        pointerEvents: allConditionsMet ? 'auto' : 'none',
      }}>
        <BaseCard
          card={card.card}
          isSelected={false}
          onClick={(e) => {
            e?.stopPropagation();
          }}
        />
      </div>

      {/* Conditional overlay indicator */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {evaluatedConditions.map((condition, index) => (
          <Tag
            key={index}
            color={condition.met ? 'success' : 'error'}
            icon={condition.met ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            style={{
              margin: 0,
              fontSize: '10px',
              padding: '2px 6px',
            }}
          >
            {condition.entity.split('.')[1]?.substring(0, 12) || 'condition'}
          </Tag>
        ))}
      </div>

      {/* Conditional badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '2px 8px',
          backgroundColor: allConditionsMet ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255, 77, 79, 0.2)',
          border: `1px solid ${allConditionsMet ? '#52c41a' : '#ff4d4f'}`,
          borderRadius: '4px',
          fontSize: '9px',
          color: allConditionsMet ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          CONDITIONAL {allConditionsMet ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};
