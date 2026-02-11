import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from 'antd';
import { BaseCard } from '../../components/BaseCard';
import { MdiIcon } from '../../components/MdiIcon';
import type { Card } from '../../types/dashboard';
import type { AccordionCardConfig } from './types';
import {
  normalizeAccordionConfig,
  toggleAccordionSection,
} from './accordionService';

const { Text } = Typography;

interface AccordionPanelProps {
  card: AccordionCardConfig;
  depth?: number;
  onCardClick?: () => void;
}

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return prefersReducedMotion;
};

export const AccordionPanel: React.FC<AccordionPanelProps> = ({
  card,
  depth = 1,
  onCardClick,
}) => {
  const config = useMemo(() => normalizeAccordionConfig(card), [card]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const expansionSeed = useMemo(
    () => `${config.expand_mode}:${config.sections.map((section) => Number(section.default_expanded)).join(',')}`,
    [config.expand_mode, config.sections],
  );
  const defaultExpandedSections = useMemo(
    () => {
      const [modePart, defaultsPart] = expansionSeed.split(':');
      const defaults = defaultsPart ? defaultsPart.split(',').map((value) => Number(value) === 1) : [];
      if (modePart === 'single') {
        const firstExpanded = defaults.findIndex((value) => value);
        return firstExpanded >= 0 ? [firstExpanded] : [];
      }
      return defaults
        .map((value, index) => (value ? index : -1))
        .filter((index) => index >= 0);
    },
    [expansionSeed],
  );
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    () => new Set(defaultExpandedSections)
  );

  useEffect(() => {
    setExpandedSections(new Set(defaultExpandedSections));
  }, [defaultExpandedSections]);

  const toggleSection = useCallback((index: number) => {
    setExpandedSections((prev) => toggleAccordionSection(prev, index, config.expand_mode));
  }, [config.expand_mode]);

  const focusHeader = useCallback((index: number) => {
    const header = headerRefs.current[index];
    if (header) {
      header.focus();
    }
  }, []);

  const handleHeaderKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = config.sections.length - 1;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSection(index);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusHeader(index === lastIndex ? 0 : index + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusHeader(index === 0 ? lastIndex : index - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusHeader(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusHeader(lastIndex);
    }
  }, [config.sections.length, focusHeader, toggleSection]);

  const renderSectionCards = (sectionCards: Card[]) => {
    if (sectionCards.length === 0) {
      return (
        <div
          style={{
            minHeight: '40px',
            border: '1px dashed #3b3b3b',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7f7f7f',
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px' }}>(No cards)</Text>
        </div>
      );
    }

    return sectionCards.map((childCard, cardIndex) => {
      const nestedCard = childCard.type === 'custom:accordion-card'
        ? { ...childCard, _accordionDepth: depth + 1 }
        : childCard;

      return (
        <div key={`section-card-${cardIndex}`} style={{ minHeight: 0 }}>
          <BaseCard
            card={nestedCard}
            isSelected={false}
            onClick={(event) => {
              event?.stopPropagation();
            }}
          />
        </div>
      );
    });
  };

  const sectionBorder = config.style === 'bordered' ? '1px solid #343434' : '1px solid transparent';
  const sectionBackground = config.style === 'ghost' ? 'transparent' : '#1f1f1f';
  const sectionMarginBottom = config.style === 'borderless' ? '8px' : '10px';

  return (
    <div data-testid="accordion-panel" style={{ height: '100%', overflow: 'auto' }} onClick={onCardClick}>
      {config.sections.map((section, index) => {
        const expanded = expandedSections.has(index);
        const headerId = `accordion-header-${depth}-${index}`;
        const panelId = `accordion-panel-${depth}-${index}`;

        return (
          <div
            key={`accordion-section-${index}`}
            data-testid={`accordion-section-${index}`}
            style={{
              border: sectionBorder,
              borderRadius: '8px',
              marginBottom: sectionMarginBottom,
              overflow: 'hidden',
              background: config.style === 'ghost' ? 'transparent' : '#141414',
            }}
          >
            <div role="heading" aria-level={Math.min(6, depth + 2)}>
              <button
                id={headerId}
                ref={(el) => {
                  headerRefs.current[index] = el;
                }}
                type="button"
                data-testid={`accordion-section-header-${index}`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSection(index);
                }}
                onKeyDown={(event) => handleHeaderKeyDown(event, index)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: '#f0f0f0',
                  background: config.header_background || sectionBackground,
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <MdiIcon icon={section.icon} size={18} color="#d9d9d9" testId={`accordion-section-icon-${index}`} />
                  <span>{section.title}</span>
                </span>
                <MdiIcon
                  icon="mdi:chevron-down"
                  size={18}
                  color="#d9d9d9"
                  testId={`accordion-section-chevron-${index}`}
                  style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: prefersReducedMotion ? 'none' : 'transform 240ms ease',
                  }}
                />
              </button>
            </div>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              data-testid={`accordion-section-content-${index}`}
              style={{
                maxHeight: expanded ? '1200px' : '0px',
                opacity: expanded ? 1 : 0,
                overflow: 'hidden',
                transition: prefersReducedMotion ? 'none' : 'max-height 260ms ease, opacity 220ms ease',
                borderTop: config.style === 'ghost' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #2f2f2f',
              }}
            >
              <div
                style={{
                  padding: `${config.content_padding}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {renderSectionCards(section.cards)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
