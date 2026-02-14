import React from 'react';
import { GaugeCardProCard } from '../../features/gauge/GaugeCardProCard';
import type { GaugeCardProConfig } from '../../features/gauge/types';

interface GaugeCardProCardRendererProps {
  card: GaugeCardProConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const GaugeCardProCardRenderer: React.FC<GaugeCardProCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <GaugeCardProCard card={card} isSelected={isSelected} onClick={onClick} />;
