/**
 * Unit tests for the CardPalette "HAVDM-only" badge — Phase 0.3.
 *
 * The palette flagged only `custom:popup-card` as HAVDM-only, so the other
 * canvas-only phantom types (native-graph-card, card-mod, and the entity-row
 * types) masqueraded as real, deployable cards. The fix flags EVERY type in
 * CANVAS_ONLY_CARD_TYPES. These tests render the real palette (backed by the
 * card registry) and assert the badge appears for all of them and for none of
 * the real cards.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardPalette } from '../../src/components/CardPalette';
import { CANVAS_ONLY_CARD_TYPES } from '../../src/services/haExportContract';

const BADGE = 'HAVDM-only';

// Typing into the search box auto-expands the matching categories, so the
// collapsed-panel content (and its badges) is rendered into the DOM.
const search = (term: string) => {
  fireEvent.change(screen.getByTestId('card-search'), { target: { value: term } });
};

describe('CardPalette canvas-only badge (Phase 0.3)', () => {
  it('flags every CANVAS_ONLY_CARD_TYPES card, not just popup-card', () => {
    render(<CardPalette onCardAdd={() => {}} />);
    // Every canvas-only type starts with "custom:" so this matches them all
    // (by type) and expands their categories.
    search('custom:');
    expect(screen.getAllByText(BADGE)).toHaveLength(CANVAS_ONLY_CARD_TYPES.length);
  });

  it('flags a non-popup canvas-only type (the regression: native-graph-card)', () => {
    render(<CardPalette onCardAdd={() => {}} />);
    search('custom:native-graph-card');
    expect(screen.getByText('custom:native-graph-card')).toBeInTheDocument();
    expect(screen.getByText(BADGE)).toBeInTheDocument();
  });

  it('still flags custom:popup-card', () => {
    render(<CardPalette onCardAdd={() => {}} />);
    search('custom:popup-card');
    expect(screen.getByText(BADGE)).toBeInTheDocument();
  });

  it('does not flag a real, deployable card', () => {
    render(<CardPalette onCardAdd={() => {}} />);
    search('gauge');
    expect(screen.getByText('gauge')).toBeInTheDocument();
    expect(screen.queryByText(BADGE)).toBeNull();
  });
});
