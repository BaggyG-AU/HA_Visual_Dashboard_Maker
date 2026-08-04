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

  // ⚠ EXPLICIT TEST TIMEOUT — required, and the reason is product behaviour.
  //
  // `DeployDialog.tsx` paces its deploy steps with deliberate
  // `await new Promise((resolve) => setTimeout(resolve, 500))` calls labelled
  // "Wait a bit for visual feedback" (currently three; TWO of them run before
  // `haWsSaveDashboardConfig` is reached). So ~1000 ms of this test's runtime is
  // irreducible product pacing, not test overhead, and it cannot be removed
  // without changing what the user sees during a deploy.
  //
  // Measured runtime of this test: ~2.2 s isolated on an idle machine, ~3.0–3.3 s
  // isolated on a loaded one. Under a full `npm run test:unit` run — where jsdom
  // render cost rises with suite-wide `environment` overhead — it exceeded
  // vitest's 5000 ms DEFAULT and failed four consecutive times, while continuing
  // to pass isolated every time. Diagnosed 2026-07-27 during the Phase 7 Medium
  // Gate; see `phase-7-ecosystem-future-growth-medium-gate.md` → Residual Risk.
  //
  // 15000 ms is ~4.5x the worst isolated measurement and ~3x the runtime at which
  // it actually failed. It is NOT a round number chosen to make a red test green:
  // it is sized so the inner `waitFor(…, { timeout: 5000 })` below can genuinely
  // expire and report *what* did not happen, instead of the whole test dying at
  // the budget boundary with a bare "Test timed out in 5000ms".
  //
  // Per TESTING_STANDARDS.md §6 this test uses NO `waitForTimeout`-style sleep for
  // synchronisation — every wait here is state-based.
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
  }, 15000);

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

  // Slice B8: a plain-language pre-deploy summary of what the export boundary
  // adjusted. RED-BEFORE-GREEN: the summary Alert does not exist on main
  // (confirmed by reverting src/components/DeployDialog.tsx in the same checkout).
  describe('export summary (B8)', () => {
    it('shows a plain-language summary of the export warnings', () => {
      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={haReadyConfig}
          dashboardTitle="My Dashboard"
          warnings={[
            {
              category: 'placeholder',
              reason: 'canvas-only-type',
              cardType: 'custom:popup-card',
              keys: ['type'],
              message: 'x',
            },
          ]}
        />,
      );
      expect(screen.getByTestId('export-summary')).toBeInTheDocument();
      expect(screen.getByText(/adjusted for Home Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Card Not Available/i)).toBeInTheDocument();
    });

    it('shows no summary when there are no warnings', () => {
      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={haReadyConfig}
          dashboardTitle="My Dashboard"
          warnings={[]}
        />,
      );
      expect(screen.queryByTestId('export-summary')).not.toBeInTheDocument();
    });
  });

  /**
   * F1 — the shared view-type validator (UAT defect HA-07).
   *
   * ⭐⭐ THESE ARE THE RED LEGS THAT ACTUALLY MEASURE THE BUG, and they are here
   * rather than in `dashboardValidation.spec.ts` for one reason: this component
   * EXISTS ON BASE. Reverting `src/` in the same checkout makes the validator
   * module vanish, so a spec importing it fails at import — and a red leg that
   * fails for the wrong reason measures nothing. Reverted, these tests fail
   * where it counts, with the product's own defect message.
   *
   * Verified on base (`git stash push -u src/`, same checkout): every test in
   * this block fails, the first four with
   * `View "Energy" must have a "cards" array (can be empty).` and its siblings.
   */
  /**
   * ⚠⚠ WAIT FOR THE DEPLOY TO SETTLE EITHER WAY — SENT *OR* REFUSED.
   *
   * The obvious `waitFor(() => expect(saveSpy).toHaveBeenCalled())` is the wrong
   * instrument for a red leg, and reverting `src/` proves it: the deploy never
   * happens, so the wait simply expires and the failure reads
   * "Test timed out in 5000ms" — which names nothing. A red leg that fails for
   * the wrong reason measures nothing, and a bare timeout is barely a reason at
   * all. Settling on EITHER outcome lets the assertions quote the product's own
   * refusal, so the failure names the defect.
   */
  const settle = async () => {
    await waitFor(
      () => {
        const refused = screen.queryAllByText(/Deployment failed/i).length > 0;
        expect(refused || saveSpy.mock.calls.length > 0).toBe(true);
      },
      { timeout: 5000 },
    );
  };

  /** What the dialog is showing, for use in an assertion message. */
  const dialogText = () => document.body.textContent ?? '';

  describe('F1: deploys the view shapes Home Assistant actually accepts', () => {
    const deployAndExpectSent = async (config: unknown) => {
      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={config as DashboardConfig}
          dashboardTitle="My Dashboard"
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /deploy/i }));
      await settle();
      expect(
        saveSpy,
        `the deploy dialog REFUSED this dashboard instead of sending it. It said: "${dialogText()}"`,
      ).toHaveBeenCalledTimes(1);
      return saveSpy.mock.calls[0][1];
    };

    // ⭐ HA-07 IN ONE TEST: HAVDM refusing to deploy a dashboard HAVDM authored.
    // The shape is the FR-04 artifact's "Energy" view — six cards, none of them
    // at the top level. Measured on a real instance: HA renders it as
    // `hui-sections-view` with two grid sections and zero error cards.
    it('a SECTIONS view deploys — its cards live under `sections[].cards`', async () => {
      const deployed = await deployAndExpectSent({
        title: 'Internal',
        views: [
          {
            title: 'Energy',
            type: 'sections',
            sections: [
              { type: 'grid', cards: [{ type: 'markdown', content: 'a' }] },
              { type: 'grid', cards: [{ type: 'tile', entity: 'sensor.x' }] },
            ],
          },
        ],
      });
      // Sent VERBATIM: the validator did not quietly graft a `cards: []` on to
      // make its own old rule pass (slice B0 — this object reaches HA as-is).
      expect(deployed.views[0]).not.toHaveProperty('cards');
      expect(deployed.views[0].sections).toHaveLength(2);
    }, 15000);

    it('an UNTITLED view deploys — Lovelace does not require a view title', async () => {
      const deployed = await deployAndExpectSent({
        title: 'Internal',
        views: [{ cards: [{ type: 'markdown', content: 'a' }] }],
      });
      expect(deployed.views[0]).not.toHaveProperty('title');
    }, 15000);

    it('a STRATEGY view deploys — Home Assistant generates its cards', async () => {
      const deployed = await deployAndExpectSent({
        title: 'Internal',
        views: [{ title: 'Generated', strategy: { type: 'original-states' } }],
      });
      expect(deployed.views[0].strategy).toEqual({ type: 'original-states' });
      expect(deployed.views[0]).not.toHaveProperty('cards');
    }, 15000);

    it('a DASHBOARD-level strategy deploys — it has no `views` at all', async () => {
      const deployed = await deployAndExpectSent({ strategy: { type: 'original-states' } });
      expect(deployed.strategy).toEqual({ type: 'original-states' });
    }, 15000);

    it('a genuinely malformed view still fails, and the message names what is wrong', async () => {
      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={
            {
              title: 'Internal',
              views: [{ title: 'Energy', cards: 'not a list' }],
            } as unknown as DashboardConfig
          }
          dashboardTitle="My Dashboard"
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /deploy/i }));

      await settle();
      expect(dialogText(), 'the dialog did not name the malformed `cards` property').toContain(
        'View "Energy" has a "cards" property that is not a list of cards.',
      );
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  /**
   * F1 defect 4 — the deploy dialog used to answer EVERY failure with "Please
   * check your connection and try again", including a validation failure raised
   * before a single byte was sent. Blaming the wrong cause is worse than
   * silence: it sends the user to inspect a connection that was never broken.
   */
  describe('F1: a validation failure never blames the connection', () => {
    it('says nothing reached Home Assistant, and does not mention the connection', async () => {
      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={
            {
              title: 'Internal',
              views: [{ title: 'Energy', cards: 'not a list' }],
            } as unknown as DashboardConfig
          }
          dashboardTitle="My Dashboard"
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /deploy/i }));

      // ⚠ ASSERTED ON TEXT, NOT ON A TESTID, AND DELIBERATELY. Reverting `src/`
      // in the same checkout removes any testid this branch added, so a red leg
      // built on one would fail by not finding its locator rather than by
      // finding the wrong text. Both strings below exist on base — that is what
      // makes the swap between them the measurement.
      await settle();
      expect(
        dialogText(),
        'the failure sub-line did not tell the user that nothing reached Home Assistant',
      ).toContain('Nothing was sent to Home Assistant. Fix the dashboard and try again.');
      expect(
        dialogText(),
        'a pure validation failure STILL blames the connection — this is the F1 defect',
      ).not.toContain('Please check your connection and try again.');
      // Only now the branch-added testid — after both discriminating text
      // assertions, so reverting `src/` fails this test on the TEXT rather than
      // on a locator that does not exist yet.
      expect(screen.getByTestId('deploy-failure-hint')).toHaveTextContent(
        'Nothing was sent to Home Assistant',
      );
    });

    it('CONTROL: a real connection failure still says to check the connection', async () => {
      // ⭐⭐ THE CONTROL LEG, AND IT IS DESIGNED TO PASS ON BASE AS WELL AS ON
      // THIS BRANCH. Two things follow from that. First, deleting the sub-line
      // outright — which would satisfy the test above — fails here instead, so
      // the pair measures "the hint became CONDITIONAL", not "the hint went
      // away". Second, a leg that is green both sides proves the change is
      // surgical: the connection-failure path is untouched, and only the
      // validation path moved. It therefore asserts on TEXT ONLY, with no
      // branch-added locator to muddy the base run.
      (window as any).electronAPI.haWsConnect = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'WebSocket refused' });

      render(
        <DeployDialog
          visible
          onClose={() => {}}
          dashboardConfig={haReadyConfig}
          dashboardTitle="My Dashboard"
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /deploy/i }));

      await settle();
      expect(dialogText(), 'a genuine connection failure lost its connection hint').toContain(
        'Please check your connection and try again.',
      );
      expect(saveSpy).not.toHaveBeenCalled();
    }, 15000);
  });
});
