import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from 'antd';
import { BaseCard } from '../../components/BaseCard';
import { MdiIcon } from '../../components/MdiIcon';
import type { TabsCardConfig } from '../../types/tabs';
import {
  getNextActiveTabIndex,
  normalizeTabsConfig,
  shouldRenderTabPanel,
} from '../../services/tabsService';

const { Text } = Typography;

type KeyboardDirection = 'next' | 'prev' | 'first' | 'last';

interface TabsPanelProps {
  card: TabsCardConfig;
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

const positionToOrientation: Record<'top' | 'bottom' | 'left' | 'right', 'horizontal' | 'vertical'> = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
};

const sizeToFontSize: Record<'default' | 'small' | 'large', string> = {
  default: '13px',
  small: '12px',
  large: '14px',
};

export const TabsPanel: React.FC<TabsPanelProps> = ({ card, onCardClick }) => {
  const config = useMemo(() => normalizeTabsConfig(card), [card]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(config.default_tab);

  useEffect(() => {
    setActiveTabIndex(config.default_tab);
  }, [config.default_tab]);

  useEffect(() => {
    setActiveTabIndex((previous) => getNextActiveTabIndex(previous, previous, config.tabs.length));
  }, [config.tabs.length]);

  const orientation = positionToOrientation[config.tab_position];
  const tablistIsVertical = orientation === 'vertical';

  const moveFocus = useCallback((index: number) => {
    const element = tabRefs.current[index];
    if (element) {
      element.focus();
    }
  }, []);

  const getNextFocusIndex = useCallback((index: number, direction: KeyboardDirection) => {
    const total = config.tabs.length;
    if (total <= 0) return 0;
    if (direction === 'first') return 0;
    if (direction === 'last') return total - 1;
    if (direction === 'next') return index === total - 1 ? 0 : index + 1;
    return index === 0 ? total - 1 : index - 1;
  }, [config.tabs.length]);

  const activateTab = useCallback((requestedIndex: number) => {
    setActiveTabIndex((current) => getNextActiveTabIndex(current, requestedIndex, config.tabs.length));
  }, [config.tabs.length]);

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const key = event.key;

    if (key === 'Home') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'first'));
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'last'));
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      activateTab(index);
      return;
    }

    if (!tablistIsVertical && key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'next'));
      return;
    }

    if (!tablistIsVertical && key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'prev'));
      return;
    }

    if (tablistIsVertical && key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'next'));
      return;
    }

    if (tablistIsVertical && key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(getNextFocusIndex(index, 'prev'));
    }
  }, [activateTab, getNextFocusIndex, moveFocus, tablistIsVertical]);

  const tabListFlexDirection = config.tab_position === 'bottom'
    ? 'column-reverse'
    : config.tab_position === 'right'
      ? 'row-reverse'
      : config.tab_position === 'left'
        ? 'row'
        : 'column';

  return (
    <div
      data-testid="tabs-panel"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: tabListFlexDirection,
        minHeight: 0,
      }}
      onClick={onCardClick}
    >
      <div
        role="tablist"
        aria-orientation={orientation}
        data-testid="tabs-tablist"
        style={{
          display: 'flex',
          flexDirection: tablistIsVertical ? 'column' : 'row',
          gap: '6px',
          padding: '6px',
          borderBottom: config.tab_position === 'top' ? '1px solid #2f2f2f' : undefined,
          borderTop: config.tab_position === 'bottom' ? '1px solid #2f2f2f' : undefined,
          borderRight: config.tab_position === 'left' ? '1px solid #2f2f2f' : undefined,
          borderLeft: config.tab_position === 'right' ? '1px solid #2f2f2f' : undefined,
          flexShrink: 0,
          minWidth: tablistIsVertical ? '140px' : undefined,
        }}
      >
        {config.tabs.map((tab, index) => {
          const selected = activeTabIndex === index;
          const tabId = `tabs-tab-${index}`;
          const panelId = `tabs-panel-${index}`;

          return (
            <button
              key={tabId}
              id={tabId}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              data-testid={`tabs-trigger-${index}`}
              onClick={(event) => {
                event.stopPropagation();
                activateTab(index);
              }}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: selected ? '1px solid #00d9ff' : '1px solid #343434',
                borderRadius: '8px',
                background: selected ? 'rgba(0, 217, 255, 0.12)' : '#191919',
                color: selected ? '#d4f9ff' : '#d9d9d9',
                padding: config.tab_size === 'large' ? '10px 12px' : config.tab_size === 'small' ? '6px 10px' : '8px 11px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: sizeToFontSize[config.tab_size],
              }}
            >
              <MdiIcon icon={tab.icon} size={16} color={selected ? '#9fefff' : '#b0b0b0'} testId={`tabs-icon-${index}`} />
              <span>{tab.title}</span>
              {typeof tab.count === 'number' && (
                <span
                  data-testid={`tabs-count-${index}`}
                  style={{
                    padding: '0 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    background: 'rgba(255,255,255,0.14)',
                  }}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span
                  data-testid={`tabs-badge-${index}`}
                  style={{
                    padding: '0 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    background: 'rgba(140, 255, 140, 0.15)',
                    color: '#9cf5a5',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {config.tabs.map((tab, index) => {
          const selected = activeTabIndex === index;
          const shouldRender = shouldRenderTabPanel(index, activeTabIndex, config.lazy_render);
          if (!shouldRender) return null;

          const panelId = `tabs-panel-${index}`;
          const tabId = `tabs-tab-${index}`;

          return (
            <div
              key={panelId}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!selected}
              data-testid={`tabs-content-${index}`}
              style={{
                padding: '10px',
                display: selected ? 'flex' : 'none',
                flexDirection: 'column',
                gap: '10px',
                minHeight: '100%',
                opacity: selected ? 1 : 0,
                transform: selected
                  ? 'translateX(0)'
                  : config.animation === 'slide'
                    ? 'translateX(8px)'
                    : 'translateX(0)',
                transition: prefersReducedMotion || config.animation === 'none'
                  ? 'none'
                  : config.animation === 'fade'
                    ? 'opacity 220ms ease'
                    : 'opacity 220ms ease, transform 220ms ease',
              }}
            >
              {tab.cards.length > 0 ? tab.cards.map((childCard, childIndex) => (
                <div key={`tabs-panel-${index}-card-${childIndex}`} style={{ minHeight: 0 }}>
                  <BaseCard
                    card={childCard}
                    isSelected={false}
                    onClick={(event) => {
                      event?.stopPropagation();
                    }}
                  />
                </div>
              )) : (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
