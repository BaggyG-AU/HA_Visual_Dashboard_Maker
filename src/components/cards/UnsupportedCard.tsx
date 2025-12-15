import React from 'react';
import { Card as AntCard, Typography, Space, Button } from 'antd';
import { QuestionCircleOutlined, GithubOutlined } from '@ant-design/icons';
import { Card } from '../../types/dashboard';

const { Text, Paragraph } = Typography;

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
  const cardTypeName = isCustomCard ? card.type.replace('custom:', '') : card.type;

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
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
      }}
      onClick={onClick}
      hoverable
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(250, 173, 20, 0.1)',
            border: '2px dashed #faad14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <QuestionCircleOutlined style={{ fontSize: '32px', color: '#faad14' }} />
        </div>

        <div>
          <Text strong style={{ color: '#fff', fontSize: '14px' }}>
            {card.type}
          </Text>
          {card.name && (
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {card.name}
              </Text>
            </div>
          )}
        </div>

        <Paragraph
          style={{
            color: '#999',
            fontSize: '12px',
            marginBottom: '8px',
            lineHeight: '1.5',
          }}
        >
          {isCustomCard ? (
            <>
              This is a custom HACS card ({cardTypeName}) that is not yet supported by the visual
              editor.
            </>
          ) : (
            <>
              This card type ({cardTypeName}) is not yet supported by the visual editor.
            </>
          )}
        </Paragraph>

        <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}>
            • You can still edit this card using the YAML editor
          </div>
          <div>
            • The card's position and size are preserved
          </div>
        </div>

        <Button
          type="link"
          size="small"
          icon={<GithubOutlined />}
          style={{ fontSize: '11px', padding: '0', height: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open GitHub issues page to request support
            console.log('Request support for card type:', card.type);
          }}
        >
          Request Support for This Card
        </Button>
      </Space>
    </AntCard>
  );
};
