import React from 'react';
import { TimelineCard } from '../../features/timeline/TimelineCard';
import type { TimelineCardConfig } from '../../features/timeline/types';

interface TimelineCardRendererProps {
  card: TimelineCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const TimelineCardRenderer: React.FC<TimelineCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <TimelineCard card={card} isSelected={isSelected} onClick={onClick} />;
