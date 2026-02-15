import React from 'react';
import { SparklineCard } from '../../features/sparkline/SparklineCard';
import type { SparklineCardConfig } from '../../features/sparkline/types';

interface MiniGraphCardRendererProps {
  card: SparklineCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Compatibility wrapper for upstream `custom:mini-graph-card`.
 * Feature 5.5 uses this renderer as the sparkline implementation.
 */
export const MiniGraphCardRenderer: React.FC<MiniGraphCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <SparklineCard card={card} isSelected={isSelected} onClick={onClick} />;
