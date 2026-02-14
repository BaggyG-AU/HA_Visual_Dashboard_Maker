import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography } from 'antd';
import { BaseCard } from '../../components/BaseCard';
import { MdiIcon } from '../../components/MdiIcon';
import type { Card } from '../../types/dashboard';
import type { ExpanderCardConfig } from './types';
import { normalizeExpanderConfig } from './accordionService';

const { Text } = Typography;

interface ExpanderPanelProps {
  card: ExpanderCardConfig;
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

export const ExpanderPanel: React.FC<ExpanderPanelProps> = ({
  card,
  depth = 1,
  onCardClick,
}) => {
  const config = useMemo(() => normalizeExpanderConfig(card), [card]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(config.expanded);

  useEffect(() => {
    setExpanded(config.expanded);
  }, [config.expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

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
      const nestedCard = childCard.type === 'custom:expander-card'
        ? { ...childCard, _expanderDepth: depth + 1 }
        : childCard;

      return (
        <div key={`expander-card-${cardIndex}`} style={{ minHeight: 0, padding: config.childPadding }}>
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

  const headerId = `expander-header-${depth}`;
  const panelId = `expander-panel-${depth}`;

  return (
    <div data-testid="expander-panel" style={{ height: '100%', overflow: 'auto' }} onClick={onCardClick}>
      <div
        data-testid="expander-section-0"
        style={{
          border: '1px solid #343434',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#141414',
        }}
      >
        <div role="heading" aria-level={Math.min(6, depth + 2)}>
          <button
            id={headerId}
            type="button"
            data-testid="expander-section-header-0"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#f0f0f0',
              background: config.buttonBackground || '#1f1f1f',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            {config.titleCard ? (
              <span style={{ width: '100%', pointerEvents: 'none' }}>
                <BaseCard
                  card={config.titleCard}
                  isSelected={false}
                  onClick={(event) => {
                    event?.stopPropagation();
                  }}
                />
              </span>
            ) : (
              <span>{config.title || 'Section'}</span>
            )}

            <span
              style={config.titleCardButtonOverlay
                ? {
                  position: 'absolute',
                  right: config.overlayMargin,
                  top: '50%',
                  transform: `translateY(-50%) ${expanded ? 'rotate(0deg)' : 'rotate(0deg)'}`,
                }
                : {
                  marginLeft: config.overlayMargin,
                }}
            >
              <MdiIcon
                icon={expanded ? config.expandedIcon : config.collapsedIcon}
                size={18}
                color="#d9d9d9"
                testId="expander-section-chevron-0"
                style={{
                  transition: prefersReducedMotion ? 'none' : 'transform 240ms ease',
                }}
              />
            </span>
          </button>
        </div>

        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          data-testid="expander-section-content-0"
          style={{
            maxHeight: expanded ? '1200px' : '0px',
            opacity: expanded ? 1 : 0,
            overflow: 'hidden',
            transition: prefersReducedMotion ? 'none' : 'max-height 260ms ease, opacity 220ms ease',
            borderTop: '1px solid #2f2f2f',
          }}
        >
          <div
            style={{
              marginTop: config.gap,
              padding: config.padding,
              clear: config.clear ? 'both' : undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {renderSectionCards(config.cards)}
          </div>
        </div>
      </div>
    </div>
  );
};
