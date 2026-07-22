import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardPalette } from '../../src/components/CardPalette';

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
    render(<CardPalette onCardAdd={() => {}} />);
    search('custom:gauge-card-pro');
    expect(screen.getByText('custom:gauge-card-pro')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Not Available')).toBeInTheDocument());
  });

  it('marks an installed custom card Available (no "Not Available" badge)', async () => {
    render(<CardPalette onCardAdd={() => {}} />);
    // Let the profile load, then assert the installed card carries no availability badge.
    await waitFor(() => expect(window.electronAPI.capabilityGetProfile).toHaveBeenCalled());
    search('custom:button-card');
    expect(screen.getByText('custom:button-card')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Not Available')).toBeNull());
  });
});
