import React from 'react';
import { CalendarViewCard } from '../../features/calendar/CalendarViewCard';
import type { CalendarViewCardConfig } from '../../features/calendar/types';

interface CalendarViewCardRendererProps {
  card: CalendarViewCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CalendarViewCardRenderer: React.FC<CalendarViewCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => <CalendarViewCard card={card} isSelected={isSelected} onClick={onClick} />;
