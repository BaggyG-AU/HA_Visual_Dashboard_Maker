import React, { useState, useMemo } from 'react';
import { Collapse, Input, Badge, Tooltip } from 'antd';
import type { CollapseProps } from 'antd';
import {
  AppstoreOutlined,
  DashboardOutlined,
  ControlOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  ApiOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { cardRegistry, CardCategory, CardTypeMetadata } from '../services/cardRegistry';

const { Panel } = Collapse;

interface CardPaletteProps {
  onCardAdd: (cardType: string) => void;
}

// Map category to icon and label
const categoryConfig: Record<CardCategory, { icon: React.ReactNode; label: string; color: string }> = {
  layout: {
    icon: <AppstoreOutlined />,
    label: 'Layout',
    color: '#1890ff',
  },
  sensor: {
    icon: <DashboardOutlined />,
    label: 'Sensors & Display',
    color: '#52c41a',
  },
  control: {
    icon: <ControlOutlined />,
    label: 'Controls',
    color: '#fa8c16',
  },
  media: {
    icon: <PlayCircleOutlined />,
    label: 'Media',
    color: '#eb2f96',
  },
  information: {
    icon: <InfoCircleOutlined />,
    label: 'Information',
    color: '#13c2c2',
  },
  custom: {
    icon: <ApiOutlined />,
    label: 'Custom Cards',
    color: '#722ed1',
  },
};

export const CardPalette: React.FC<CardPaletteProps> = ({ onCardAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Get all cards and group by category
  const allCards = cardRegistry.getAll();
  const cardsByCategory = allCards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {} as Record<CardCategory, CardTypeMetadata[]>);

  // Filter cards by search term
  const filteredCardsByCategory = Object.entries(cardsByCategory).reduce(
    (acc, [category, cards]) => {
      const filtered = cards.filter(
        card =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category as CardCategory] = filtered;
      }
      return acc;
    },
    {} as Record<CardCategory, CardTypeMetadata[]>
  );

  const handleCardClick = (cardType: string) => {
    onCardAdd(cardType);
  };

  const handleDragStart = (e: React.DragEvent, cardType: string) => {
    // RGL looks for "text/plain" by default
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardType }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', paddingBottom: '12px' }}>
        <h3 style={{ color: 'white', marginBottom: '12px', marginTop: 0 }}>Card Palette</h3>
        <Input
          placeholder="Search cards..."
          prefix={<SearchOutlined style={{ color: '#666' }} />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginBottom: '12px' }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
        <Collapse
          activeKey={activeKeys}
          onChange={keys => setActiveKeys(keys as string[])}
          ghost
          style={{ background: 'transparent' }}
          items={Object.entries(filteredCardsByCategory).map(([category, cards]) => {
            const config = categoryConfig[category as CardCategory];
            return {
              key: category,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>{config.label}</span>
                  <Badge
                    count={cards.length}
                    style={{
                      backgroundColor: config.color,
                      marginLeft: '4px',
                    }}
                  />
                </div>
              ),
              style: {
                borderBottom: '1px solid #434343',
                marginBottom: '4px',
              },
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cards.map(card => (
                    <Tooltip key={card.type} title={card.description} placement="right">
                      <div
                        draggable
                        onDragStart={e => handleDragStart(e, card.type)}
                        onClick={() => handleCardClick(card.type)}
                        style={{
                          padding: '12px',
                          background: '#1f1f1f',
                          borderRadius: '6px',
                          cursor: 'grab',
                          border: '1px solid #434343',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#2a2a2a';
                          e.currentTarget.style.borderColor = config.color;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#1f1f1f';
                          e.currentTarget.style.borderColor = '#434343';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: config.color, fontSize: '16px' }}>
                            {config.icon}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
                              {card.name}
                            </div>
                            <div
                              style={{
                                color: '#888',
                                fontSize: '11px',
                                marginTop: '2px',
                              }}
                            >
                              {card.type}
                            </div>
                          </div>
                          {card.isCustom && (
                            <Badge
                              count="Custom"
                              style={{
                                backgroundColor: '#722ed1',
                                fontSize: '10px',
                                height: '18px',
                                lineHeight: '18px',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              ),
            };
          })}
        />
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #434343',
          color: '#666',
          fontSize: '11px',
        }}
      >
        {allCards.length} cards available
        {searchTerm && ` (${Object.values(filteredCardsByCategory).flat().length} shown)`}
      </div>
    </div>
  );
};
