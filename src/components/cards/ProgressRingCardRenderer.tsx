import React from 'react';
import { ProgressRingCard } from '../../features/progress-ring/ProgressRingCard';
import type { ProgressRingCardConfig } from '../../features/progress-ring/types';

interface ProgressRingCardRendererProps {
  card: ProgressRingCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ProgressRingCardRenderer: React.FC<ProgressRingCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <ProgressRingCard card={card} isSelected={isSelected} onClick={onClick} />;
