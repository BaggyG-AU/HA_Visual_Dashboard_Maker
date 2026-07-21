import { Card, View, DashboardConfig } from '../types/dashboard';
import { convertGridLayoutToViewLayout } from './layoutCardParser';
import { LayoutItem } from 'react-grid-layout';

/**
 * Export dashboard in layout-card format
 * Converts internal grid positions to layout-card view_layout syntax
 */

/**
 * Apply view_layout to cards based on current grid positions
 */
export const applyViewLayoutToCards = (view: View, gridLayout: readonly LayoutItem[]): View => {
  const viewLayouts = convertGridLayoutToViewLayout(gridLayout);

  const updatedCards: Card[] = (view.cards || []).map((card, index) => {
    const viewLayout = viewLayouts[index];

    if (!viewLayout) return card;

    // Remove internal grid geometry if it exists
    const cardWithoutLayout = { ...(card as Record<string, unknown>) };
    delete cardWithoutLayout._havdm_layout;

    // Add view_layout. The spread widens to Record<string, unknown> (losing the
    // discriminating `type`), so the Card shape is re-asserted here.
    return {
      ...cardWithoutLayout,
      view_layout: {
        grid_column: viewLayout.grid_column,
        grid_row: viewLayout.grid_row,
      },
    } as unknown as Card;
  });

  return {
    ...view,
    cards: updatedCards,
  };
};

/**
 * Convert view to layout-card grid format
 */
export const convertToLayoutCardView = (view: View, gridLayout?: readonly LayoutItem[]): View => {
  // If gridLayout provided, apply it to cards
  let updatedView = view;
  if (gridLayout) {
    updatedView = applyViewLayoutToCards(view, gridLayout);
  }

  // Set view type and layout configuration
  return {
    ...updatedView,
    type: 'custom:layout-card',
    layout_type: 'grid',
    layout: {
      grid_template_columns: 'repeat(12, 1fr)',
      grid_template_rows: 'repeat(auto-fill, 30px)',
      grid_gap: '8px',
      ...(view.layout || {}),
    },
  };
};

/**
 * Convert entire dashboard to use layout-card format
 */
export const convertDashboardToLayoutCard = (
  config: DashboardConfig,
  viewLayouts?: Map<number, readonly LayoutItem[]>,
): DashboardConfig => {
  const updatedViews = config.views.map((view, index) => {
    const gridLayout = viewLayouts?.get(index);
    return convertToLayoutCardView(view, gridLayout);
  });

  return {
    ...config,
    views: updatedViews,
  };
};

/**
 * Check if dashboard is using layout-card format
 */
export const isLayoutCardDashboard = (config: DashboardConfig): boolean => {
  return config.views.some(
    (view) =>
      view.type === 'custom:layout-card' ||
      view.layout_type === 'grid' ||
      (view.cards || []).some((card) => card.view_layout),
  );
};

/**
 * Get layout mode description for UI
 */
export const getLayoutMode = (view: View): string => {
  if (view.type === 'custom:layout-card' && view.layout_type === 'grid') {
    return 'Layout-Card Grid';
  }
  if (view.layout_type === 'grid') {
    return 'Grid Layout';
  }
  if ((view.cards || []).some((card) => card.view_layout)) {
    return 'Grid (view_layout)';
  }
  if (view.type === 'masonry') {
    return 'Masonry';
  }
  if ((view.cards || []).some((card) => '_havdm_layout' in card && card._havdm_layout)) {
    return 'Custom Layout';
  }
  return 'Auto Layout';
};
