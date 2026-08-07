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
 * ⚠⚠⚠ CLASSIFICATION — CORRECTED, AND THE CORRECTION MATTERS MORE THAN THE
 * CLASSIFICATION. An earlier version of this docblock said that with `src/`
 * stashed "the import resolves" and every assertion here would pass on base,
 * i.e. that this file is an OBSERVED green-on-base control. **THAT IS
 * STATICALLY IMPOSSIBLE AND WAS NEVER EXECUTED.** Measured:
 *
 *     git show main:src/components/CardPalette.tsx   | rg 'PALETTE_CARD_MIME'
 *     git show main:src/components/SectionsCanvas.tsx | rg 'onPaletteCardDrop'
 *
 * both return NO MATCH, so restoring base `src/` makes this file fail at IMPORT,
 * before any behavioural assertion runs. There is no base run of this file to
 * report, and none was ever performed.
 *
 * ⭐ WHAT IS ACTUALLY EXECUTED, AND WHAT IT PROVES. Every result below is a
 * BRANCH-SIDE observation. Their evidential value comes from the pair of cases
 * that DISAGREE with one another on the same input: the same dragover on the
 * same element is REFUSED without `onPaletteCardDrop` and ACCEPTED with it. A
 * component that accepted everything unconditionally, or refused everything
 * unconditionally, fails one of the two. That is ALTERNATIVE EVIDENCE for AC 19
 * — a within-branch discriminator — and it is deliberately NOT the same thing as
 * a control leg observed green on base.
 *
 * The failure it discriminates against is real and has a precedent in this
 * repository: `GridCanvas` `preventDefault()`s unconditionally and only checks
 * `if (!onCardDrop)` at drop time, so it accepts a gesture and then drops it on
 * the floor — the silent-gesture failure VIEWS-04 is about.
 *
 * ⚠ A NEW FILE IMPORTING A NEW SYMBOL CANNOT BE RED-LEGGED AT ALL. This is the
 * fifth consecutive slice to hit that limit (#125, #126, #127, #129, and now
 * F5); treat it as a property of every new-surface slice rather than a surprise.
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

  it('discards an EMPTY payload silently — the third shape AC 17 names', () => {
    // ⚠ AC 17 names malformed, EMPTY and unknown-card-type payloads, and the
    // empty one has its OWN production branch (`if (!raw)` in
    // `paletteCardTypeFrom`) that the case above never reaches: `{}` is a
    // well-formed object with no `cardType` and exits two branches later. The
    // inventory read as complete while one named shape had no case at all.
    const onPaletteCardDrop = vi.fn();
    renderCanvas({ onPaletteCardDrop });

    const event = paletteDragEvent('drop', '');
    // Both MIMEs are present but empty, so acceptance still happens on the
    // marker's membership in `types` and the refusal is the PAYLOAD's, not the
    // gate's — otherwise this case would pass for the wrong reason.
    expect(
      (event as unknown as { dataTransfer: { types: string[] } }).dataTransfer.types,
    ).toContain(PALETTE_CARD_MIME);
    screen.getByTestId('sections-canvas-section-0').dispatchEvent(event);

    expect(onPaletteCardDrop).not.toHaveBeenCalled();
    // The drop is still ACCEPTED at the gate (the marker was there); it is the
    // payload that is discarded. That distinction is the point of the case.
    expect(event.defaultPrevented).toBe(true);
  });
});
