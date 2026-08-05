import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardPalette } from '../../src/components/CardPalette';
import {
  CapabilityProfileProvider,
  useRefreshCapabilityProfile,
} from '../../src/contexts/CapabilityProfileContext';

// ⚠ F4 REWIRED, NOT REWRITTEN. The palette no longer fetches the profile itself
// — a `useEffect(..., [])` that ran once at mount was EXPORT-04's propagation
// defect, because a capture taken mid-session never reached an open palette. The
// fetch moved to `CapabilityProfileProvider`, so these tests now render the
// palette inside it. Every assertion below is unchanged: this file's job is and
// remains "does a connected profile mark the right cards", and it still answers
// exactly that question against the same stubbed profile.
const renderPalette = () =>
  render(
    <CapabilityProfileProvider>
      <CardPalette onCardAdd={() => {}} />
    </CapabilityProfileProvider>,
  );

// A CONNECTED profile (I4): HA 2026.7.2, button-card installed, gauge-card-pro not.
// Before I4 the palette ignored the profile, so the "Not Available" assertion is RED.
beforeEach(() => {
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    capabilityGetProfile: vi.fn().mockResolvedValue({
      profile: {
        haVersion: '2026.7.2',
        capturedAt: '2026-07-22T00:00:00.000Z',
        installedElements: ['custom:button-card'],
        installedFolders: ['button-card'],
        versions: {},
        cardModPresent: false,
        userOverrides: {},
      },
    }),
  };
});

afterEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

const search = (term: string) =>
  fireEvent.change(screen.getByTestId('card-search'), { target: { value: term } });

describe('CardPalette three-state availability (I4)', () => {
  it('marks an absent custom card "Not Available" (connected profile)', async () => {
    renderPalette();
    search('custom:gauge-card-pro');
    expect(screen.getByText('custom:gauge-card-pro')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Not Available')).toBeInTheDocument());
  });

  it('marks an installed custom card Available (no "Not Available" badge)', async () => {
    renderPalette();
    // Let the profile load, then assert the installed card carries no availability badge.
    await waitFor(() => expect(window.electronAPI.capabilityGetProfile).toHaveBeenCalled());
    search('custom:button-card');
    expect(screen.getByText('custom:button-card')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Not Available')).toBeNull());
  });

  // ⭐⭐⭐ EXPORT-04 DEFECT 1 — THE PROPAGATION LEG. This is the whole card in
  // miniature: the user opens the palette while disconnected (permissive, nothing
  // marked, CORRECT), then connects — and HAVDM captures a profile that says
  // gauge-card-pro is not installed. Before F4 the palette went on showing the
  // never-connected answer until a restart, because its fetch lived in a
  // `useEffect(..., [])` with an empty dependency array.
  //
  // ⚠ The stub returns the NEVER-CONNECTED profile first and the captured one
  // second, so the assertion can only pass if the SECOND read reached the
  // rendered palette. A test that seeded the captured profile up front would
  // pass on the broken build and certify nothing.
  it('a capture taken mid-session reaches an ALREADY-OPEN palette', async () => {
    const neverConnected = {
      haVersion: null,
      capturedAt: null,
      installedElements: [],
      installedFolders: [],
      versions: {},
      cardModPresent: false,
      userOverrides: {},
    };
    const captured = {
      haVersion: '2026.7.4',
      capturedAt: '2026-08-04T00:00:00.000Z',
      installedElements: ['custom:button-card'],
      installedFolders: ['button-card'],
      versions: {},
      cardModPresent: true,
      userOverrides: {},
    };
    const getProfile = vi
      .fn()
      .mockResolvedValueOnce({ profile: neverConnected })
      .mockResolvedValue({ profile: captured });
    (window as unknown as { electronAPI: unknown }).electronAPI = {
      capabilityGetProfile: getProfile,
    };

    // A stand-in for App, which is the real holder of the refresh handle.
    const Refresher: React.FC = () => {
      const refresh = useRefreshCapabilityProfile();
      return (
        <button data-testid="probe-capture" onClick={() => void refresh()}>
          capture
        </button>
      );
    };

    render(
      <CapabilityProfileProvider>
        <Refresher />
        <CardPalette onCardAdd={() => {}} />
      </CapabilityProfileProvider>,
    );

    // Leg 1 — the never-connected state IS permissive, and that is correct.
    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(1));
    search('custom:gauge-card-pro');
    expect(screen.getByText('custom:gauge-card-pro')).toBeInTheDocument();
    expect(screen.queryByText('Not Available')).toBeNull();

    // Leg 2 — a capture lands mid-session and the OPEN palette must follow it.
    fireEvent.click(screen.getByTestId('probe-capture'));
    await waitFor(() => expect(screen.getByText('Not Available')).toBeInTheDocument());
  });

  // ⭐ R1's freshness note. Once a capture exists the marks reflect that capture
  // and keep doing so after a disconnect (ruling R1), so the honest thing is to
  // say WHEN — a mark can be arbitrarily old and still look authoritative.
  it('names when the profile was captured once one exists', async () => {
    renderPalette();
    await waitFor(() =>
      expect(screen.getByTestId('palette-availability-freshness')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('palette-availability-freshness')).toHaveTextContent(
      /as of the last capture/i,
    );
    // CONTROL: the never-connected notice is the OTHER state and must not also
    // be on screen — the two are mutually exclusive, not stacked.
    expect(screen.queryByTestId('palette-availability-notice')).toBeNull();
  });
});
