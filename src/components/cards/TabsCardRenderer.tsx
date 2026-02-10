import React, { useMemo } from 'react';
import { Card as AntCard, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type { TabsCardConfig } from '../../types/tabs';
import { TabsPanel } from '../../features/tabs/TabsPanel';
import { normalizeTabsConfig } from '../../services/tabsService';

const { Text } = Typography;

interface TabsCardRendererProps {
  card: TabsCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TabsCardRenderer: React.FC<TabsCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const normalized = useMemo(() => normalizeTabsConfig(card), [card]);

  return (
    <AntCard
      size="small"
      title={card.title || undefined}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      headStyle={{
        borderBottom: '1px solid #434343',
        color: '#e6e6e6',
        fontSize: '14px',
        fontWeight: 600,
      }}
      bodyStyle={{
        padding: 0,
        height: card.title ? 'calc(100% - 48px)' : '100%',
        overflow: 'hidden',
      }}
      onClick={onClick}
      data-testid="tabs-card"
      hoverable
    >
      <TabsPanel card={card} onCardClick={onClick} />

      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          border: '1px solid #00d9ff',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#00d9ff',
          fontWeight: 700,
          pointerEvents: 'none',
        }}>
          <AppstoreOutlined style={{ marginRight: '4px' }} />
          TABS
        </div>
      )}

      {normalized.tabs.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '4px',
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Add tabs in Properties Panel
          </Text>
        </div>
      )}
    </AntCard>
  );
};
