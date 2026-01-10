import React from 'react';
import { Card as AntCard, Typography, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';

const { Text } = Typography;

interface UnsupportedCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Placeholder component for unsupported card types
 * Displays helpful information about the card type and how to request support
 */
export const UnsupportedCard: React.FC<UnsupportedCardProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const isCustomCard = card.type.startsWith('custom:');
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );
  return (
    <AntCard
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QuestionCircleOutlined style={{ color: '#faad14' }} />
          <span>Unsupported Card Type</span>
        </div>
      }
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
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: 'calc(100% - 40px)', // Account for header
        overflow: 'hidden',
      },
      }}
      onClick={onClick}
      hoverable
    >
      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(250, 173, 20, 0.1)',
            border: '2px dashed #faad14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <QuestionCircleOutlined style={{ fontSize: '20px', color: '#faad14' }} />
        </div>

        <div>
          <Text strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>
            {card.type}
          </Text>
          {card.name && (
            <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>
              {card.name}
            </Text>
          )}
        </div>

        <div style={{ fontSize: '10px', color: '#999', lineHeight: '1.4', marginTop: '4px' }}>
          {isCustomCard ? 'Custom HACS card' : 'Standard card'} - not yet supported
        </div>

        <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.3', marginTop: '4px' }}>
          <div>• Edit via YAML editor</div>
          <div>• Position preserved</div>
        </div>
      </Space>
    </AntCard>
  );
};
