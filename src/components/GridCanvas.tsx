import React, { useMemo, useRef } from 'react';
import { theme } from 'antd';
import GridLayout, { getCompactor } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { View, Card } from '../types/dashboard';
import { getBackgroundLayerStyle } from '../utils/backgroundStyle';
import { BaseCard } from './BaseCard';
import { CardContextMenu } from './CardContextMenu';
import { SectionsCanvas } from './SectionsCanvas';
import { generateMasonryLayout, getCardSizeConstraints } from '../utils/cardSizingContract';
import {
  isLayoutCardGrid,
  convertLayoutCardToGridLayout,
  getCanvasColumns,
  getCanvasRowHeight,
} from '../utils/layoutCardParser';
import { logger } from '../services/logger';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridCanvas.css';

// Canvas geometry. react-grid-layout v2 replaced the flat v1 props
// (cols/rowHeight/margin/containerPadding) with a single `gridConfig` object,
// and reads geometry ONLY from it — flat props are silently ignored.
//
// These values are react-grid-layout's own defaults, stated explicitly. Until
// this was migrated, the flat props below were being dropped and the canvas had
// been rendering on these defaults for real, so pinning them here keeps the
// canvas pixel-identical to what users see today.
//
// NOTE: this is deliberately NOT the 56px row that cardSizingContract.ts
// documents ("1 row = 56px in HA sections grid"). Honouring 56 is the correct
// end state for Home-Assistant-Sections parity, but it makes every card ~2.7x
// shorter and the card `h` heuristics need re-tuning first (content currently
// clips, and the fixed-size icon circles lack flex-shrink: 0). Tracked
// separately — do not change these numbers without re-baselining
// tests/e2e/layout.visual.spec.ts.
//
// MUST stay identical between the empty and populated grids below.
const GRID_CONFIG = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
} as const;

// Equivalent of v1's compactType="vertical" + allowOverlap/preventCollision=false.
// Built via getCompactor() rather than the bare `verticalCompactor` export, which
// is the raw compaction pass without the collision handling those flags implied.
// (This matches v2's own default; stated explicitly so the intent survives.)
const COMPACTOR = getCompactor('vertical', false, false);

// v2 defaults to a 3px drag threshold; v1 had none, and the legacy shim pins 0
// for compatibility. Kept at 0 so a click still registers as a click (card
// selection) rather than being swallowed as a micro-drag.
const DRAG_THRESHOLD = 0;

interface GridCanvasProps {
  view: View;
  selectedCardIndex: number | null;
  selectedCardIndices?: number[];
  // Tier 4: for an HA "sections" view, which section the current card selection
  // targets (null = the flat `view.cards`, i.e. every non-sections view).
  selectedSectionIndex?: number | null;
  onCardSelect: (
    cardIndex: number | null,
    options?: { mode?: 'replace' | 'toggle' | 'range'; sectionIndex?: number | null },
  ) => void;
  onLayoutChange: (layout: Layout) => void;
  onCardDrop?: (cardType: string, x?: number, y?: number) => void;
  onCardCut?: () => void;
  onCardCopy?: () => void;
  onCardPaste?: () => void;
  onCardDelete?: () => void;
  // Tier 4 slice 4.3b: sections-view drag-move + drag-resize (no-ops elsewhere).
  onSectionCardMove?: (
    from: { sectionIndex: number; cardIndex: number },
    to: { sectionIndex: number; cardIndex: number },
  ) => void;
  onSectionCardResize?: (
    address: { sectionIndex: number; cardIndex: number },
    gridOptions: { columns?: number; rows?: number },
  ) => void;
  // Tier 4 slice 4.4: sections-view section-level authoring (no-ops elsewhere).
  onSectionAdd?: (atIndex?: number) => void;
  onSectionRemove?: (sectionIndex: number) => void;
  onSectionMove?: (fromIndex: number, toIndex: number) => void;
  onSectionTitleChange?: (sectionIndex: number, title: string) => void;
  onViewMaxColumnsChange?: (maxColumns: number) => void;
  // Tier 4 slice 4.5: convert this (non-sections) view into a sections view.
  onConvertToSections?: () => void;
  canPaste?: boolean;
}

// Generate layout positions for cards
// Supports three layout modes:
// 1. Layout-card grid (view_layout with grid positioning)
// 2. Internal layout (custom layout property)
// 3. Smart masonry (auto-calculated based on content)
const generateLayout = (view: View, cards: Card[]): Layout => {
  // Mode 1: Check if using layout-card grid system
  if (isLayoutCardGrid(view)) {
    const gridLayout = convertLayoutCardToGridLayout(view);
    return gridLayout;
  }

  // Mode 2: Check if cards have internal geometry (_havdm_layout)
  const hasExistingLayout = cards.some((card) => '_havdm_layout' in card && card._havdm_layout);

  if (hasExistingLayout) {
    // Use existing layout information with constraints
    const layouts = cards.map((card, index) => {
      if ('_havdm_layout' in card && card._havdm_layout) {
        const layout = card._havdm_layout as any;
        const constraints = getCardSizeConstraints(card);
        return {
          i: `card-${index}`,
          x: layout.x || 0,
          y: layout.y || 0,
          w: layout.w || constraints.w,
          h: layout.h || constraints.h,
          minW: constraints.minW,
          maxW: constraints.maxW,
          minH: constraints.minH,
          maxH: constraints.maxH,
        };
      }
      // Fallback for cards without layout - use constraints
      const constraints = getCardSizeConstraints(card);
      return {
        i: `card-${index}`,
        x: 0,
        y: index * 4,
        w: constraints.w,
        h: constraints.h,
        minW: constraints.minW,
        maxW: constraints.maxW,
        minH: constraints.minH,
        maxH: constraints.maxH,
      };
    });
    return layouts;
  }

  // Mode 3: Generate smart masonry layout based on card content with constraints
  const masonryLayout = generateMasonryLayout(cards);
  return masonryLayout;
};

export const GridCanvas: React.FC<GridCanvasProps> = ({
  view,
  selectedCardIndex,
  selectedCardIndices = [],
  selectedSectionIndex = null,
  onCardSelect,
  onLayoutChange,
  onCardDrop,
  onCardCut,
  onCardCopy,
  onCardPaste,
  onCardDelete,
  onSectionCardMove,
  onSectionCardResize,
  onSectionAdd,
  onSectionRemove,
  onSectionMove,
  onSectionTitleChange,
  onViewMaxColumnsChange,
  onConvertToSections,
  canPaste,
}) => {
  const { token } = theme.useToken();
  const cards = view.cards || [];
  const selectedCardSet = useMemo(() => new Set(selectedCardIndices), [selectedCardIndices]);
  const pendingSelectionModeRef = useRef<{ index: number; mode: 'toggle' | 'range' } | null>(null);

  const consumeSelectionMode = (
    index: number,
    event?: React.MouseEvent<HTMLElement>,
  ): 'replace' | 'toggle' | 'range' => {
    const pending = pendingSelectionModeRef.current;
    if (pending && pending.index === index) {
      pendingSelectionModeRef.current = null;
      return pending.mode;
    }

    if (event?.shiftKey) return 'range';
    if (event?.ctrlKey || event?.metaKey) return 'toggle';
    return 'replace';
  };

  // Generate layout for all cards
  const layout = useMemo(() => {
    return generateLayout(view, cards);
  }, [view, cards]);

  // Slice 4.7a: a layout-card view the USER authored can declare any column
  // count, and rendering it on HAVDM's fixed 12 puts every card at the wrong
  // width. Slice 4.7b extends the same idea to the declared ROW HEIGHT, which is
  // what makes a `grid_row: 1 / 5` span mean what the user wrote.
  //
  // Both helpers return the canvas defaults for HAVDM's own scaffold views and
  // for every plain HA view, so this resolves to the EXACT SAME GRID_CONFIG
  // object for them and the canvas stays pixel-identical (layout.visual-safe).
  const gridConfig = useMemo(() => {
    const cols = getCanvasColumns(view);
    const rowHeight = getCanvasRowHeight(view);
    return cols === GRID_CONFIG.cols && rowHeight === GRID_CONFIG.rowHeight
      ? GRID_CONFIG
      : { ...GRID_CONFIG, cols, rowHeight };
  }, [view]);

  const handleLayoutChange = (newLayout: Layout) => {
    onLayoutChange(newLayout);
  };

  // DRAG_THRESHOLD is 0 so that a click still selects a card, which means every
  // click also completes a zero-distance drag and fires onDragStop. Committing
  // that would push a junk undo entry and clear the redo stack purely from
  // selecting a card, so ignore stops where the item did not actually move.
  const handleDragStop = (
    newLayout: Layout,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
  ) => {
    if (
      oldItem &&
      newItem &&
      oldItem.x === newItem.x &&
      oldItem.y === newItem.y &&
      oldItem.w === newItem.w &&
      oldItem.h === newItem.h
    ) {
      return;
    }
    onLayoutChange(newLayout);
  };

  // Simple drop handler - just adds card at bottom of layout
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onCardDrop) return;

    const payload = e.dataTransfer.getData('text/plain');
    if (!payload) return;

    try {
      const data = JSON.parse(payload);
      const cardType = data.cardType;
      if (!cardType) return;

      // No explicit position: let the caller place the card below existing
      // content, matching where the vertical compactor renders it. Passing
      // (0, 0) here instead would store a position the grid never uses.
      onCardDrop(cardType);
    } catch (error) {
      logger.warn('Failed to parse drop data', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Tier 4: an HA "sections" view keeps its cards under `section.cards`, so
  // `view.cards` is empty and the flat paths below (incl. the empty-view
  // placeholder) would render it blank. Delegate to SectionsCanvas. Placed after
  // all hooks above so hook order stays unconditional.
  if (view.type === 'sections') {
    return (
      <SectionsCanvas
        view={view}
        selectedSectionIndex={selectedSectionIndex}
        selectedCardIndex={selectedCardIndex}
        selectedCardIndices={selectedCardIndices}
        onCardSelect={onCardSelect}
        onCardCut={onCardCut}
        onCardCopy={onCardCopy}
        onCardPaste={onCardPaste}
        onCardDelete={onCardDelete}
        onCardMove={onSectionCardMove}
        onCardResize={onSectionCardResize}
        onSectionAdd={onSectionAdd}
        onSectionRemove={onSectionRemove}
        onSectionMove={onSectionMove}
        onSectionTitleChange={onSectionTitleChange}
        onViewMaxColumnsChange={onViewMaxColumnsChange}
        canPaste={canPaste}
      />
    );
  }

  // Tier 4 slice 4.7b: a STRATEGY view has no cards of its own — Home Assistant
  // generates them at render time. The empty-view placeholder below would invite
  // the user to drag cards onto it, which is exactly the wrong affordance: those
  // cards cannot coexist with the strategy, and until 4.7b the export boundary
  // silently replaced the whole generated view with `cards: []`. Say what the
  // view actually is instead. Placed after all hooks so hook order stays
  // unconditional, and after the sections branch (the two are mutually
  // exclusive in practice).
  if (view.strategy && cards.length === 0) {
    return (
      <div
        data-testid="strategy-view-placeholder"
        style={{
          height: '100%',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: token.colorBgContainer,
        }}
      >
        <div style={{ textAlign: 'center', color: token.colorTextSecondary, maxWidth: 520 }}>
          <div style={{ color: token.colorText, fontSize: 16, marginBottom: 8 }}>
            Home Assistant generates this view
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            It uses the strategy <code>{view.strategy.type}</code>, so its cards are built by Home
            Assistant when the dashboard loads. HAVDM preserves the strategy exactly as written and
            deploys it unchanged.
          </div>
        </div>
      </div>
    );
  }

  // Tier 4 slice 4.5: offer a one-click conversion of this (non-sections) view
  // into an HA Sections view so the section-authoring surface (4.1..4.4) is
  // reachable without importing. Rendered ONLY on the EMPTY-view branch below:
  // a persistent in-flow banner on a populated flat canvas shifts card geometry
  // and breaks the position-sensitive layout.visual snapshots. Converting a
  // POPULATED view is the view-type editor's job (slice 4.6, which reuses
  // convertViewToSections — cards are preserved either way).
  const convertBanner = onConvertToSections ? (
    <div
      data-testid="convert-to-sections-banner"
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        padding: '8px 12px',
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: 6,
        color: token.colorText,
      }}
    >
      <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
        This empty view uses the Grid layout. Convert it to a Home Assistant Sections view for
        section-based authoring.
      </span>
      <button
        type="button"
        data-testid="convert-to-sections-button"
        onClick={onConvertToSections}
        style={{
          marginLeft: 'auto',
          background: '#177ddc',
          border: 'none',
          color: token.colorText,
          borderRadius: 4,
          cursor: 'pointer',
          padding: '4px 12px',
          whiteSpace: 'nowrap',
        }}
      >
        Convert to Sections view
      </button>
    </div>
  ) : null;

  if (cards.length === 0) {
    return (
      <div
        style={{ height: '100%', padding: '16px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {convertBanner}
        <GridLayout
          className="layout"
          layout={[]}
          width={1200}
          gridConfig={GRID_CONFIG}
          dragConfig={{ enabled: false, threshold: DRAG_THRESHOLD }}
          resizeConfig={{ enabled: false }}
          compactor={COMPACTOR}
          style={{
            backgroundColor: token.colorBgContainer,
            minHeight: 'calc(100% - 32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            key="empty-message"
            style={{
              color: token.colorTextTertiary,
              fontSize: '16px',
              textAlign: 'center',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            No cards in this view. Drag cards from the palette to add them.
          </div>
        </GridLayout>
      </div>
    );
  }

  return (
    <div
      style={{ height: '100%', overflow: 'auto', padding: '16px' }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('[data-testid="canvas-card"]')) return;
        // ⚠⚠ A click inside the card CONTEXT MENU is not a click on empty
        // canvas. antd renders the dropdown popup inside this container, so
        // without this guard choosing Cut/Copy/Paste/Delete cleared the very
        // selection the action was about to operate on — the action then reported
        // "No card selected" and did nothing. Second half of the v1.0.0 UAT
        // round-1 defect CANVAS-06, whose Expected is "Delete removes only the
        // card you right-clicked".
        if (target.closest('.ant-dropdown')) return;
        if (selectedCardIndex !== null || selectedCardIndices.length > 0) {
          onCardSelect(null, { mode: 'replace' });
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GridLayout
        className="layout"
        layout={layout}
        width={1200}
        gridConfig={gridConfig}
        onDragStop={handleDragStop}
        onResizeStop={handleLayoutChange}
        dragConfig={{ enabled: true, cancel: '.swiper', threshold: DRAG_THRESHOLD }}
        resizeConfig={{ enabled: true }}
        compactor={COMPACTOR}
        style={{
          backgroundColor: token.colorBgContainer,
          minHeight: '100%',
        }}
      >
        {cards.map((card, index) => (
          <div key={`card-${index}`} style={{ overflow: 'hidden' }}>
            <div
              data-testid="canvas-card"
              style={{ height: '100%', width: '100%', position: 'relative' }}
            >
              {(() => {
                const backgroundStyle = getBackgroundLayerStyle((card as { style?: string }).style);
                if (!backgroundStyle) return null;
                return (
                  <div
                    data-testid="card-background-layer"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      data-testid="card-background-layer-visual"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                        ...backgroundStyle,
                      }}
                    />
                  </div>
                );
              })()}
              <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <div
                  style={{ height: '100%' }}
                  onMouseDownCapture={(event) => {
                    if (event.shiftKey) {
                      pendingSelectionModeRef.current = { index, mode: 'range' };
                      return;
                    }
                    if (event.ctrlKey || event.metaKey) {
                      pendingSelectionModeRef.current = { index, mode: 'toggle' };
                      return;
                    }
                    pendingSelectionModeRef.current = null;
                  }}
                >
                  <CardContextMenu
                    // ⚠ Selection happens on OPEN, not inside each item handler.
                    // The old code selected and acted in the same tick, so the
                    // action read a selection React had not committed yet and
                    // Delete silently did nothing on an unselected card. See the
                    // note on CardContextMenuProps.onOpen.
                    onOpen={() => {
                      if (!selectedCardSet.has(index)) {
                        onCardSelect(index, { mode: 'replace' });
                      }
                    }}
                    onCut={() => onCardCut?.()}
                    onCopy={() => onCardCopy?.()}
                    onPaste={() => onCardPaste?.()}
                    onDelete={() => onCardDelete?.()}
                    canPaste={canPaste ?? false}
                  >
                    <BaseCard
                      card={card}
                      isSelected={selectedCardSet.has(index)}
                      onClick={(event) => {
                        onCardSelect(index, { mode: consumeSelectionMode(index, event) });
                      }}
                    />
                  </CardContextMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
