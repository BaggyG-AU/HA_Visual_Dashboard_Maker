/**
 * Integration Test: the entity registry in the picker (slice 2)
 *
 * Covers the two things `config/entity_registry/list` buys the pickers —
 * integration grouping and hiding Home Assistant's diagnostic/config plumbing —
 * plus the three permissive rules that keep the cut from becoming a new way to
 * lose an entity.
 *
 * ⚠ These drive the IPC layer. The WebSocket frame underneath is asserted
 * separately in `tests/unit/haWebSocketService.registry.spec.ts`, because an
 * IPC-layer mock cannot see a wrong command name.
 */

import { test, expect } from '@playwright/test';
import {
  launchWithDSL,
  close,
  seedEntityCache,
  clearEntityCache,
  seedEntityRegistry,
  clearEntityRegistry,
} from '../support';

/** A miniature of the reference instance: two integrations, one diagnostic, one config. */
const ENTITIES = [
  {
    entity_id: 'sensor.sigen_battery_soc',
    state: '87',
    attributes: { friendly_name: 'Battery SOC', unit_of_measurement: '%' },
  },
  {
    entity_id: 'sensor.sigen_grid_power',
    state: '1200',
    attributes: { friendly_name: 'Grid Power', unit_of_measurement: 'W' },
  },
  {
    entity_id: 'sensor.bom_temperature',
    state: '21',
    attributes: { friendly_name: 'Outside Temperature', unit_of_measurement: '°C' },
  },
  {
    entity_id: 'sensor.camera_ssh_enabled',
    state: 'off',
    attributes: { friendly_name: 'SSH Enabled' },
  },
  {
    entity_id: 'update.supervisor_update',
    state: 'off',
    attributes: { friendly_name: 'Supervisor Update' },
  },
  // ⭐ No registry row — the shape that would vanish under an inner join.
  { entity_id: 'sun.sun', state: 'above_horizon', attributes: { friendly_name: 'Sun' } },
];

const REGISTRY = [
  { entity_id: 'sensor.sigen_battery_soc', platform: 'sigen', entity_category: null },
  { entity_id: 'sensor.sigen_grid_power', platform: 'sigen', entity_category: null },
  {
    entity_id: 'sensor.bom_temperature',
    platform: 'bureau_of_meteorology',
    entity_category: null,
  },
  {
    entity_id: 'sensor.camera_ssh_enabled',
    platform: 'unifiprotect',
    entity_category: 'diagnostic',
  },
  { entity_id: 'update.supervisor_update', platform: 'hassio', entity_category: 'config' },
];

/** Entities that survive the default cut. */
const SIGNAL = [
  'sensor.sigen_battery_soc',
  'sensor.sigen_grid_power',
  'sensor.bom_temperature',
  'sun.sun',
];

test.describe('Entity Browser — the entity registry', () => {
  test('hides diagnostic and config entities by default, and says how many', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const ids = await ctx.entityBrowser.getRowEntityIds();
      expect(ids.sort()).toEqual([...SIGNAL].sort());
      expect(ids).not.toContain('sensor.camera_ssh_enabled');
      expect(ids).not.toContain('update.supervisor_update');

      // ⭐ The hidden set must never be invisible. "Showing 4 of 6 (2 hidden)"
      // is what distinguishes "HAVDM filtered this" from "it does not exist".
      const countText = await ctx.entityBrowser.getVisibleCountText();
      expect(countText).toContain('4');
      expect(countText).toContain('6');
      expect(countText).toContain('hidden');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐ CONTROL: the toggle brings the hidden entities back', async () => {
    // The cut has to be reversible. A filter the user cannot undo is the
    // over-broad failure `entityCriteria.ts` warns about, shipped on purpose.
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      expect(await ctx.entityBrowser.getRowEntityIds()).toHaveLength(4);

      await ctx.entityBrowser.setShowDiagnostic(true);

      const ids = await ctx.entityBrowser.getRowEntityIds();
      expect(ids).toHaveLength(6);
      expect(ids).toContain('sensor.camera_ssh_enabled');
      expect(ids).toContain('update.supervisor_update');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐⭐⭐ keeps an entity that has NO registry row', async () => {
    // Measured on the reference instance: seven of 725 live entities have no
    // registry row, `sun.sun` among them. They must survive both the default
    // cut and integration grouping, visibly rather than quietly.
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      expect(await ctx.entityBrowser.getRowEntityIds()).toContain('sun.sun');

      await ctx.entityBrowser.setGroupBy('Integration');
      const tabs = await ctx.entityBrowser.getTabLabels();
      expect(tabs.join(' | ')).toContain('Not in the entity registry');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('groups the tab strip by integration, humanising the slug', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      // CONTROL: domain is the default axis and still works.
      const domainTabs = await ctx.entityBrowser.getTabLabels();
      expect(domainTabs.join(' | ')).toContain('sensor');

      await ctx.entityBrowser.setGroupBy('Integration');

      const tabs = await ctx.entityBrowser.getTabLabels();
      const joined = tabs.join(' | ');
      // Largest group first, and the raw slug humanised — the owner's objection
      // to `<integration>: <entity>` was partly that it surfaces `kia_uvo` raw.
      expect(joined).toContain('Sigen (2)');
      expect(joined).toContain('Bureau Of Meteorology (1)');
      expect(joined).not.toContain('bureau_of_meteorology (');
      // Diagnostic-only integrations are absent while the cut is on.
      expect(joined).not.toContain('Unifiprotect');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('an integration tab narrows the table to that integration', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.setGroupBy('Integration');
      await ctx.entityBrowser.selectDomainTab('Sigen');

      expect((await ctx.entityBrowser.getRowEntityIds()).sort()).toEqual([
        'sensor.sigen_battery_soc',
        'sensor.sigen_grid_power',
      ]);
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐⭐⭐ CONTROL: with NO registry, nothing is hidden and grouping is unavailable', async () => {
    // The never-connected user, and THE VISION's permissive default. "We do not
    // know what these entities are" must never become "we hid some of them".
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await clearEntityRegistry(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      // Every entity is offered, including the two Home Assistant would call
      // plumbing — because without the registry we have no basis to say so.
      const ids = await ctx.entityBrowser.getRowEntityIds();
      expect(ids).toHaveLength(ENTITIES.length);
      expect(ids).toContain('sensor.camera_ssh_enabled');
      expect(ids).toContain('update.supervisor_update');

      // And the count disclosure claims no hiding.
      expect(await ctx.entityBrowser.getVisibleCountText()).not.toContain('hidden');

      // Integration grouping is offered but disabled — visibly unavailable
      // rather than silently doing nothing.
      expect(await ctx.entityBrowser.isIntegrationGroupingEnabled()).toBe(false);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐⭐ the registry survives a restart while still disconnected', async () => {
    // Offline persistence, which is the half of the slice a live-connected test
    // can never demonstrate: seed, close the app, relaunch with no connection,
    // and the cut must still be in force.
    //
    // ⓘ Two full Electron launches, so the default 60 s budget is not enough
    // on this machine — the failure was the clock, never the assertion.
    test.setTimeout(180_000);

    const ctx = await launchWithDSL();
    let storagePath: string | undefined;
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();
      await ctx.entityBrowser.open();
      expect(await ctx.entityBrowser.getRowEntityIds()).toHaveLength(4);
      storagePath = ctx.userDataDir;
    } finally {
      // Keep the profile so the relaunch below reads it back FROM DISK.
      await close(ctx, { keepProfile: true });
    }

    // Relaunch against the SAME profile, so both caches are read from disk.
    const restarted = await launchWithDSL({ reuseUserDataDir: storagePath });
    try {
      await restarted.appDSL.waitUntilReady();
      await restarted.dashboard.createNew();
      await restarted.entityBrowser.open();

      const ids = await restarted.entityBrowser.getRowEntityIds();
      expect(ids.sort()).toEqual([...SIGNAL].sort());
      expect(await restarted.entityBrowser.getVisibleCountText()).toContain('hidden');
    } finally {
      await clearEntityRegistry(restarted.window);
      await clearEntityCache(restarted.window);
      await close(restarted);
    }
  });
});
