/**
 * EXPORT-04 defect 3 / Codex N1 — a PLACED not-installed card must carry the
 * same honesty the palette does.
 *
 * The UAT card's Expected 4 is "Once placed, the card carries a visible 'won't
 * render on your instance' style". Before F4 the ONLY such string anywhere in
 * `src/` was the palette tooltip (`CardPalette.tsx:300`), so the warning existed
 * at the moment of choosing and never again: a dashboard full of cards that will
 * not render looked exactly like one that will.
 *
 * ⚠ RED-LEG NOTE. These assertions ARE red-leggable — `BaseCard` and its
 * `conditional-visibility-wrapper` both exist on base, so the legs below fail on
 * base by finding no badge rather than by failing to find their harness. That is
 * deliberate: `[STATE]`'s red-leg limit (2) says to assert through controls that
 * exist on base, and limit (6) is avoided here precisely because no new module
 * is required to reach the assertion.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseCard } from '../../src/components/BaseCard';
import { CapabilityProfileProvider } from '../../src/contexts/CapabilityProfileContext';
import { HAEntityProvider } from '../../src/contexts/HAEntityContext';
import type { Card } from '../../src/types/dashboard';

const CAPTURED_WITHOUT_GAUGE_PRO = {
  haVersion: '2026.7.4',
  capturedAt: '2026-08-04T00:00:00.000Z',
  installedElements: ['custom:button-card'],
  installedFolders: ['button-card'],
  versions: {},
  cardModPresent: true,
  userOverrides: {},
};

const NEVER_CONNECTED = {
  haVersion: null,
  capturedAt: null,
  installedElements: [],
  installedFolders: [],
  versions: {},
  cardModPresent: false,
  userOverrides: {},
};

const stubProfile = (profile: unknown) => {
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    capabilityGetProfile: vi.fn().mockResolvedValue({ profile }),
  };
};

const placed = (type: string): Card => ({ id: 'card-1', type }) as unknown as Card;

// ⚠ `HAEntityProvider` is a PRE-EXISTING requirement of BaseCard, not something
// F4 introduced — `useHAEntities` throws without it. `enabled={false}` keeps it
// inert (no IPC, no subscription) so these legs measure availability marking and
// nothing else.
//
// ⭐ This is also the concrete reason `useCapabilityProfile` deliberately does
// NOT throw when there is no provider: BaseCard is reachable from several bare
// harnesses, and a second mandatory provider would have turned a behaviour
// change into a test-infrastructure migration.
const renderPlaced = (card: Card, onClick?: () => void) =>
  render(
    <HAEntityProvider enabled={false}>
      <CapabilityProfileProvider>
        <BaseCard card={card} isSelected={false} onClick={onClick ?? (() => {})} />
      </CapabilityProfileProvider>
    </HAEntityProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('BaseCard placed-card availability marking (EXPORT-04 / N1)', () => {
  it('marks a placed card that is NOT installed on the captured instance', async () => {
    stubProfile(CAPTURED_WITHOUT_GAUGE_PRO);
    renderPlaced(placed('custom:gauge-card-pro'));
    expect(await screen.findByTestId('placed-card-unavailable-badge')).toBeInTheDocument();
  });

  it('CONTROL: an INSTALLED card is not marked', async () => {
    stubProfile(CAPTURED_WITHOUT_GAUGE_PRO);
    const { findByTestId } = renderPlaced(placed('custom:button-card'));
    // Wait for the profile to land before asserting an ABSENCE, or this passes
    // for the wrong reason — nothing is marked before the first read resolves.
    await findByTestId('conditional-visibility-wrapper');
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByTestId('placed-card-unavailable-badge')).toBeNull();
  });

  // ⭐⭐ THE VISION LEG. Never-connected is PERMISSIVE by ratified design
  // (vision answer 5) — nothing being marked here is CORRECT, not a defect, and
  // a "fix" that marked every custom card offline would look like progress while
  // making the product lie to a user who has never connected.
  it('CONTROL: marks NOTHING when HAVDM has never connected', async () => {
    stubProfile(NEVER_CONNECTED);
    renderPlaced(placed('custom:gauge-card-pro'));
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByTestId('placed-card-unavailable-badge')).toBeNull();
  });

  // ⚠⚠ THE CONSTRAINT THE CARD STATES EXPLICITLY: marking must never become
  // disabling. HAVDM is a SUPERSET design tool — you are allowed to design with
  // a card you have not installed yet, and a guard that blocked authoring here
  // would be a worse defect than the one this slice fixes.
  it('a marked card is still fully selectable — marking is not disabling', async () => {
    stubProfile(CAPTURED_WITHOUT_GAUGE_PRO);
    const onClick = vi.fn();
    renderPlaced(placed('custom:gauge-card-pro'), onClick);
    await screen.findByTestId('placed-card-unavailable-badge');

    // ⚠ Click the RENDERED CARD, not the visibility wrapper. `BaseCard` omits
    // `onClick` from the props it spreads onto the wrapper and hands it to the
    // card renderer instead, so a click on the wrapper lands on nothing and this
    // leg would fail against a perfectly interactive card — an instrument error,
    // not a product one (discriminator lesson (i)).
    const rendered = screen.getByTestId('conditional-visibility-wrapper').firstElementChild;
    expect(rendered, 'the marked card must still render its content').not.toBeNull();
    fireEvent.click(rendered as Element);
    expect(onClick).toHaveBeenCalled();
  });
});
