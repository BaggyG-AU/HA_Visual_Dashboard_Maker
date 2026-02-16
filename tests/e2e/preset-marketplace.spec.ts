import { test } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const AVAILABLE_ENTITIES = [
  {
    entity_id: 'light.marketplace_lamp_local',
    state: 'on',
    attributes: { friendly_name: 'Marketplace Lamp Local' },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'a', parent_id: null, user_id: null },
  },
  {
    entity_id: 'sensor.marketplace_temperature_local',
    state: '21',
    attributes: { friendly_name: 'Marketplace Temperature Local' },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'b', parent_id: null, user_id: null },
  },
];

test.describe('Preset Marketplace', () => {
  test('supports browse preview and import workflow', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, entityContext, presetMarketplace, entityRemapping } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(AVAILABLE_ENTITIES);

      await presetMarketplace.open();
      await presetMarketplace.expectVisible();
      await presetMarketplace.selectPresetById('starter-room-overview');
      await presetMarketplace.expectPreviewTitle('Starter Room Overview');
      await presetMarketplace.importSelected();

      await entityRemapping.expectModalVisible();
      await entityRemapping.autoMapAll();
      await entityRemapping.apply();
    } finally {
      await close(ctx);
    }
  });
});
