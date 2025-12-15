import React from 'react';
import { Card as AntCard } from 'antd';
import { Card } from '../types/dashboard';
import {
  BulbOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  FormOutlined,
} from '@ant-design/icons';

interface BaseCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}

// Map card types to icons
const getCardIcon = (cardType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    entities: <AppstoreOutlined />,
    button: <ThunderboltOutlined />,
    glance: <DashboardOutlined />,
    markdown: <FileTextOutlined />,
    'entity-button': <BulbOutlined />,
    'gauge': <BarChartOutlined />,
    'history-graph': <HistoryOutlined />,
    'picture': <PictureOutlined />,
    'map': <EnvironmentOutlined />,
    'custom': <FormOutlined />,
  };

  return iconMap[cardType] || <AppstoreOutlined />;
};

// Get a preview description for the card
const getCardPreview = (card: Card): string => {
  if ('entities' in card && Array.isArray(card.entities)) {
    return `${card.entities.length} entities`;
  }
  if ('entity' in card && card.entity) {
    return card.entity as string;
  }
  if ('content' in card && card.content) {
    const content = card.content as string;
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }
  return 'No content';
};

export const BaseCard: React.FC<BaseCardProps> = ({ card, isSelected = false, onClick }) => {
  const cardTitle = card.name || card.type;
  const preview = getCardPreview(card);
  const icon = getCardIcon(card.type);

  // Check if this is a spacer card
  const isSpacer = card.type === 'spacer' || '_isSpacer' in card;

  if (isSpacer) {
    // Render spacer as a semi-transparent placeholder
    return (
      <div
        style={{
          height: '100%',
          border: isSelected ? '2px dashed #00d9ff' : '1px dashed #434343',
          backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
          cursor: 'pointer',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '12px',
          transition: 'all 0.3s ease',
        }}
        onClick={onClick}
      >
        {isSelected ? 'Spacer (Empty)' : ''}
      </div>
    );
  }

  return (
    <AntCard
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span>{cardTitle}</span>
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
        padding: '12px',
        color: '#b0b0b0',
        fontSize: '12px',
      }}
      onClick={onClick}
      hoverable
    >
      <div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Type:</strong> {card.type}
        </div>
        <div>
          <strong>Preview:</strong> {preview}
        </div>
      </div>
    </AntCard>
  );
};
