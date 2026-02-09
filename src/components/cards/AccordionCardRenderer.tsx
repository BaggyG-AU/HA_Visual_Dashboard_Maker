import React, { useMemo } from 'react';
import { Alert, Card as AntCard, Typography } from 'antd';
import { MenuFoldOutlined } from '@ant-design/icons';
import type { AccordionCardConfig } from '../../features/accordion/types';
import { AccordionPanel } from '../../features/accordion/AccordionPanel';
import { MAX_ACCORDION_DEPTH, normalizeAccordionConfig } from '../../features/accordion/accordionService';

const { Text } = Typography;

interface AccordionCardRendererProps {
  card: AccordionCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const AccordionCardRenderer: React.FC<AccordionCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const normalized = useMemo(() => normalizeAccordionConfig(card), [card]);
  const depth = typeof card._accordionDepth === 'number' ? card._accordionDepth : 1;

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
        padding: '10px',
        height: card.title ? 'calc(100% - 48px)' : '100%',
        overflow: 'auto',
      }}
      onClick={onClick}
      data-testid="accordion-card"
      hoverable
    >
      {depth > MAX_ACCORDION_DEPTH ? (
        <Alert
          type="warning"
          showIcon
          message="Accordion nesting limit reached"
          description={`Maximum supported accordion nesting depth is ${MAX_ACCORDION_DEPTH}.`}
        />
      ) : (
        <AccordionPanel card={card} depth={depth} onCardClick={onClick} />
      )}

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
          <MenuFoldOutlined style={{ marginRight: '4px' }} />
          ACCORDION
        </div>
      )}

      {normalized.sections.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '4px',
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Add sections in Properties Panel
          </Text>
        </div>
      )}
    </AntCard>
  );
};
