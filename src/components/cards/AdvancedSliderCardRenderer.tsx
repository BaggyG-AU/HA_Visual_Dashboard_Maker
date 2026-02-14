import React from 'react';
import { AdvancedSliderCard } from '../../features/advanced-slider/AdvancedSliderCard';
import type { AdvancedSliderCardConfig } from '../../features/advanced-slider/types';

interface AdvancedSliderCardRendererProps {
  card: AdvancedSliderCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const AdvancedSliderCardRenderer: React.FC<AdvancedSliderCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <AdvancedSliderCard card={card} isSelected={isSelected} onClick={onClick} />;
