/**
 * F5 leg U3 — the MANDATORY named proof of AC 19: a `SectionsCanvas` mounted
 * WITHOUT `onPaletteCardDrop` refuses palette drops exactly as it does today —
 * no `preventDefault()`, no card, no message.
 *
 * ⚠ WHY THIS IS A UNIT FILE AND NOT AN e2e LEG. The optional-callback refusal is
 * unreachable from e2e: every production mount supplies the callback. Leaving
 * its proof to "a component assertion, or else code inspection" would have let
 * the guard ship with no committed test at all.
 *
 * ⚠ CLASSIFICATION: GREEN ON BASE **AND** ON THE BRANCH — a CONTROL LEG, not a
 * red leg. On base nothing accepts a palette drag at all; on the branch it is
 * specifically the callback's ABSENCE that withholds acceptance. What it
 * discriminates is a correct implementation from one that accepts every dragover
 * unconditionally and then discards the drop silently when no writer is mounted
 * — which is precisely the failure `GridCanvas` models in the other direction
 * (it `preventDefault()`s unconditionally and only checks `if (!onCardDrop)` at
 * drop time). Accepting a gesture and then dropping it on the floor recreates
 * the silent-gesture failure VIEWS-04 is about.
 *
 * ⚠ This whole FILE is new, so it cannot be red-legged in the ordinary way: with
 * `src/` stashed the import resolves but the component has no
 * `onPaletteCardDrop` prop at all, and every assertion here would pass for the
 * wrong reason (nothing is accepted on base for any input). That is exactly why
 * it is declared a control leg rather than dressed up as a red one.
 *
 * The companion positive case — that the callback, when supplied, IS honoured —
 * is proved end-to-end by the e2e legs in tests/e2e/sections-canvas.spec.ts.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionsCanvas } from '../../src/components/SectionsCanvas';
import { PALETTE_CARD_MIME } from '../../src/components/CardPalette';
import { HAEntityProvider } from '../../src/contexts/HAEntityContext';
import { CapabilityProfileProvider } from '../../src/contexts/CapabilityProfileContext';
import type { View } from '../../src/types/dashboard';

// Two sections, the second EMPTY — the tester's VIEWS-04 shape.
const SECTIONS_VIEW = {
  title: 'Home',
  type: 'sections',
  max_columns: 3,
  sections: [
    { type: 'grid', title: 'Lights', cards: [{ type: 'markdown', content: 'A' }] },
    { type: 'grid', title: 'Empty One', cards: [] },
  ],
} as unknown as View;

/**
 * jsdom's `DragEvent` does not carry a real `DataTransfer`, so build the event
 * and attach a minimal stand-in exposing exactly the two surfaces the production
 * code reads: `types` (the only thing readable at dragover, where the drag data
 * store is in protected mode) and `getData` (readable at drop).
 */
const paletteDragEvent = (type: string, payload = JSON.stringify({ cardType: 'markdown' })) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const data: Record<string, string> = {
    'text/plain': payload,
    [PALETTE_CARD_MIME]: payload,
  };
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: ['text/plain', PALETTE_CARD_MIME],
      getData: (mime: string) => data[mime] ?? '',
      setData: () => {},
      dropEffect: 'none',
      effectAllowed: 'copy',
    },
    configurable: true,
  });
  return event;
};

const renderCanvas = (props: Partial<React.ComponentProps<typeof SectionsCanvas>> = {}) =>
  render(
    <CapabilityProfileProvider>
      <HAEntityProvider enabled={false}>
        <SectionsCanvas
          view={SECTIONS_VIEW}
          selectedSectionIndex={null}
          selectedCardIndex={null}
          onCardSelect={() => {}}
          {...props}
        />
      </HAEntityProvider>
    </CapabilityProfileProvider>,
  );

describe('SectionsCanvas without onPaletteCardDrop refuses palette drops (F5 AC 19)', () => {
  it('does not preventDefault a palette dragover on a populated section body', () => {
    renderCanvas();

    const event = paletteDragEvent('dragover');
    screen.getByTestId('sections-canvas-section-0').dispatchEvent(event);

    // Not accepting the dragover IS the refusal: HTML5 DnD refuses any drop
    // whose dragover did not preventDefault, so the browser shows a "no drop"
    // cursor and never dispatches a drop at all.
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not preventDefault a palette dragover on an EMPTY section', () => {
    renderCanvas();

    const event = paletteDragEvent('dragover');
    screen.getByTestId('section-empty-1').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('does not preventDefault a palette dragover on an existing card', () => {
    renderCanvas();

    const event = paletteDragEvent('dragover');
    screen.getAllByTestId('canvas-card')[0].dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('writes nothing when a palette drop is dispatched anyway', () => {
    const onCardMove = vi.fn();
    const onCardSelect = vi.fn();
    renderCanvas({ onCardMove, onCardSelect });

    // Bypass the browser's refusal and dispatch the drop directly — the
    // strongest form of the assertion, because it proves the refusal does not
    // depend on the browser declining to deliver the event.
    screen.getByTestId('sections-canvas-section-0').dispatchEvent(paletteDragEvent('drop'));
    screen.getByTestId('section-empty-1').dispatchEvent(paletteDragEvent('drop'));

    expect(onCardMove).not.toHaveBeenCalled();
    expect(onCardSelect).not.toHaveBeenCalled();
    // The rendered card count is unchanged: one card in section 0, none in 1.
    expect(screen.getAllByTestId('canvas-card')).toHaveLength(1);
    expect(screen.getByTestId('section-empty-1')).toBeInTheDocument();
  });

  it('DOES accept the same dragover once the callback is supplied (the discriminator)', () => {
    // The other half of the control: without this, every assertion above would
    // also pass against an implementation that never accepts anything at all.
    renderCanvas({ onPaletteCardDrop: vi.fn() });

    const event = paletteDragEvent('dragover');
    screen.getByTestId('sections-canvas-section-0').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('routes an accepted drop to the callback with the section address', () => {
    const onPaletteCardDrop = vi.fn();
    renderCanvas({ onPaletteCardDrop });

    screen.getByTestId('section-empty-1').dispatchEvent(paletteDragEvent('drop'));

    // The empty-section placeholder carries no handler of its own — this proves
    // the event bubbles to the section body, which is why the empty-section case
    // needed no new element.
    expect(onPaletteCardDrop).toHaveBeenCalledTimes(1);
    expect(onPaletteCardDrop).toHaveBeenCalledWith('markdown', { sectionIndex: 1, cardIndex: 0 });
  });

  it('discards a malformed payload silently — no callback, no throw (AC 17)', () => {
    const onPaletteCardDrop = vi.fn();
    renderCanvas({ onPaletteCardDrop });

    const section = screen.getByTestId('sections-canvas-section-0');
    section.dispatchEvent(paletteDragEvent('drop', 'not json at all'));
    section.dispatchEvent(paletteDragEvent('drop', JSON.stringify({})));
    section.dispatchEvent(paletteDragEvent('drop', JSON.stringify({ cardType: 'no-such-card' })));

    expect(onPaletteCardDrop).not.toHaveBeenCalled();
  });
});
