import type { Card } from '../../types/dashboard';

export type AccordionExpandMode = 'single' | 'multi';
export type AccordionStyleMode = 'bordered' | 'borderless' | 'ghost';

export interface AccordionSectionConfig {
  title?: string;
  icon?: string;
  default_expanded?: boolean;
  cards?: Card[];
}

export interface AccordionCardConfig {
  type: 'custom:accordion-card';
  title?: string;
  expand_mode?: AccordionExpandMode;
  style?: AccordionStyleMode;
  header_background?: string;
  content_padding?: number;
  sections?: AccordionSectionConfig[];
  _accordionDepth?: number;
}

export interface NormalizedAccordionSection {
  title: string;
  icon: string;
  default_expanded: boolean;
  cards: Card[];
}

export interface NormalizedAccordionConfig {
  expand_mode: AccordionExpandMode;
  style: AccordionStyleMode;
  header_background?: string;
  content_padding: number;
  sections: NormalizedAccordionSection[];
}
