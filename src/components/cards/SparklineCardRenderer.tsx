import React from 'react';
import { SparklineCard } from '../../features/sparkline/SparklineCard';
import type { SparklineCardConfig } from '../../features/sparkline/types';

interface SparklineCardRendererProps {
  card: SparklineCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SparklineCardRenderer: React.FC<SparklineCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <SparklineCard card={card} isSelected={isSelected} onClick={onClick} />;
