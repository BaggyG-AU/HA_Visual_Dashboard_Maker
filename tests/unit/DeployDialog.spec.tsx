/**
 * Unit tests for DeployDialog — slice B0 of the export-boundary work.
 *
 * B0 makes deploy send the already-sanitised config OBJECT directly, instead of
 * re-serialising it to YAML and parsing it back (which re-ran the import mappers
 * and re-inflated HAVDM-internal keys). These tests guard that wiring: the
 * object handed to the dialog must reach `haWsSaveDashboardConfig` verbatim
 * (only the title is overridden from the form), with no re-inflation.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeployDialog } from '../../src/components/DeployDialog';
import type { DashboardConfig } from '../../src/types/dashboard';

vi.mock('../../src/services/haConnectionService', () => ({
  haConnectionService: {
    isConnected: () => true,
    getConfig: () => ({ url: 'http://ha.local:8123', token: 'tok' }),
  },
}));

// A sanitised, HA-ready swipe card: it has `parameters` but NOT the internal
// `slides` / `slides_per_view` keys. If deploy ever re-parsed its input, the
// import mapper would put those keys back — so their absence in the deployed
// payload is the assertion that B0 holds.
const haReadyConfig: DashboardConfig = {
  title: 'Internal Title',
  views: [
    {
      title: 'View',
      path: 'v',
      cards: [
        {
          type: 'custom:swipe-card',
          parameters: { pagination: true },
          cards: [{ type: 'markdown', content: 'A' }],
        } as any,
      ],
    } as any,
  ],
};

describe('DeployDialog (B0: deploy the object, no re-parse)', () => {
  let saveSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    saveSpy = vi.fn().mockResolvedValue({ success: true });
    (window as any).electronAPI = {
      haWsConnect: vi.fn().mockResolvedValue({ success: true }),
      haWsCreateDashboard: vi.fn().mockResolvedValue({ success: true }),
      haWsSaveDashboardConfig: saveSpy,
    };
  });

  it('sends the sanitised config object to Home Assistant unchanged (bar title)', async () => {
    render(
      <DeployDialog
        visible
        onClose={() => {}}
        dashboardConfig={haReadyConfig}
        dashboardTitle="My Dashboard"
      />,
    );

    // The form ships with valid defaults (title from dashboardTitle,
    // urlKey "new-dashboard"), so a single click reaches the deploy call.
    fireEvent.click(screen.getByRole('button', { name: /deploy/i }));

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1), { timeout: 5000 });

    const [, deployedConfig] = saveSpy.mock.calls[0];
    const swipe = deployedConfig.views[0].cards[0];

    // The object passed through verbatim — no import re-inflation.
    expect(swipe.type).toBe('custom:swipe-card');
    expect(swipe).not.toHaveProperty('slides');
    expect(swipe).not.toHaveProperty('slides_per_view');
    expect(swipe.parameters).toEqual({ pagination: true });

    // Title comes from the form, everything else from the config object.
    expect(deployedConfig.title).toBe('My Dashboard');
    expect(deployedConfig.views).toHaveLength(1);
  });

  it('errors clearly when there is no config to deploy', async () => {
    render(
      <DeployDialog
        visible
        onClose={() => {}}
        dashboardConfig={null}
        dashboardTitle="My Dashboard"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /deploy/i }));

    // Assert on the unique error string (the generic "Deployment failed" label
    // appears twice, which would make getByText ambiguous).
    await waitFor(
      () => expect(screen.getByText(/no dashboard configuration to deploy/i)).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
