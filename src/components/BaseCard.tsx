import React from 'react';
import { Card } from '../types/dashboard';
import { EntitiesCardRenderer } from './cards/EntitiesCardRenderer';
import { ButtonCardRenderer } from './cards/ButtonCardRenderer';
import { GlanceCardRenderer } from './cards/GlanceCardRenderer';
import { MarkdownCardRenderer } from './cards/MarkdownCardRenderer';
import { ApexChartsCardRenderer } from './cards/ApexChartsCardRenderer';
import { PowerFlowCardRenderer } from './cards/PowerFlowCardRenderer';
import { UnsupportedCard } from './cards/UnsupportedCard';

interface BaseCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * BaseCard component - routes to the appropriate card renderer
 * Supported cards get their specific renderer, unsupported cards get a placeholder
 */
export const BaseCard: React.FC<BaseCardProps> = ({ card, isSelected = false, onClick }) => {
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

  // Route to appropriate renderer based on card type
  switch (card.type) {
    case 'entities':
      return <EntitiesCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    case 'button':
      return <ButtonCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    case 'glance':
      return <GlanceCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    case 'markdown':
      return <MarkdownCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    case 'custom:apexcharts-card':
      return <ApexChartsCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    case 'custom:power-flow-card-plus':
    case 'custom:power-flow-card':
      return <PowerFlowCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    // Add more supported card types here as they are implemented
    // case 'gauge':
    //   return <GaugeCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;
    //
    // case 'history-graph':
    //   return <HistoryGraphCardRenderer card={card as any} isSelected={isSelected} onClick={onClick} />;

    default:
      // Unsupported card type - show placeholder
      return <UnsupportedCard card={card} isSelected={isSelected} onClick={onClick} />;
  }
};
