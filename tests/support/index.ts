/**
 * Test Support - Main Export
 *
 * Single entry point for all test utilities.
 * Import this in your test files to get the full DSL API.
 *
 * Usage:
 *   import { launch, close, TestContext } from '../support';
 *   const ctx = await launch();
 *   const { app, dashboard, palette, canvas, properties } = ctx;
 */

import * as electron from './electron';
import { AppDSL } from './dsl/app';
import { DashboardDSL } from './dsl/dashboard';
import { CardPaletteDSL } from './dsl/cardPalette';
import { CanvasDSL } from './dsl/canvas';
import { PropertiesPanelDSL } from './dsl/propertiesPanel';
import { YamlEditorDSL } from './dsl/yamlEditor';
import { EntityBrowserDSL } from './dsl/entityBrowser';
import { SettingsDSL } from './dsl/settings';
import { ColorPickerDSL } from './dsl/colorPicker';

// Re-export electron launcher
export { launch, close } from './electron';

// Re-export entity cache helpers
export { seedEntityCache, clearEntityCache } from './dsl/entityBrowser';

// Re-export assertion helpers
export * as yamlAssertions from './assertions/yaml';
export * as propertiesAssertions from './assertions/properties';

/**
 * Complete test context with all DSL helpers
 */
export interface TestContext extends electron.ElectronTestContext {
  // DSL helpers (note: 'app' and 'window' are inherited from ElectronTestContext)
  appDSL: AppDSL;
  dashboard: DashboardDSL;
  palette: CardPaletteDSL;
  canvas: CanvasDSL;
  properties: PropertiesPanelDSL;
  yamlEditor: YamlEditorDSL;
  entityBrowser: EntityBrowserDSL;
  settings: SettingsDSL;
  colorPicker: ColorPickerDSL;
}

/**
 * Launch Electron with full DSL context
 * This is the ONLY way to start tests
 */
export async function launchWithDSL(): Promise<TestContext> {
  const electronCtx = await electron.launch();

  return {
    ...electronCtx,
    appDSL: new AppDSL(electronCtx.window),
    dashboard: new DashboardDSL(electronCtx.window),
    palette: new CardPaletteDSL(electronCtx.window),
    canvas: new CanvasDSL(electronCtx.window),
    properties: new PropertiesPanelDSL(electronCtx.window),
    yamlEditor: new YamlEditorDSL(electronCtx.window),
    entityBrowser: new EntityBrowserDSL(electronCtx.window),
    settings: new SettingsDSL(electronCtx.window),
    colorPicker: new ColorPickerDSL(electronCtx.window),
  };
}
