/**
 * Debug Test: Inspect Application State
 *
 * This test helps you see what's actually rendered in the app.
 * Run with: npx playwright test tests/debug-app.spec.ts --headed
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';

test.describe('Debug: Application Inspection', () => {
  test('inspect application DOM and take screenshots', async () => {
    const { app, window } = await launchElectronApp();

    try {
      console.log('=== Starting App Inspection ===');

      await waitForAppReady(window);

      // 1. Get window title
      const title = await window.title();
      console.log('Window title:', title);

      // 2. Get viewport size
      const size = await window.viewportSize();
      console.log('Viewport size:', size);

      // 3. Take full screenshot
      await window.screenshot({
        path: 'test-results/screenshots/debug-full-page.png',
        fullPage: true,
      });
      console.log('Screenshot saved: debug-full-page.png');

      // 4. Get full HTML
      const html = await window.content();
      console.log('HTML length:', html.length);

      // Save HTML to file for inspection
      const fs = require('fs');
      const path = require('path');
      const htmlPath = path.join(__dirname, '../../test-results/debug-page.html');
      fs.writeFileSync(htmlPath, html);
      console.log('HTML saved:', htmlPath);

      // 5. Count elements
      const divCount = await window.locator('div').count();
      const buttonCount = await window.locator('button').count();
      const inputCount = await window.locator('input').count();

      console.log('Element counts:');
      console.log('  - Divs:', divCount);
      console.log('  - Buttons:', buttonCount);
      console.log('  - Inputs:', inputCount);

      // 6. Look for specific components by class patterns
      const components = {
        'Card Palette': await window.locator('[class*="CardPalette"], [class*="card-palette"]').count(),
        'Canvas/Grid': await window.locator('[class*="Canvas"], [class*="Grid"], .react-grid-layout').count(),
        'Properties Panel': await window.locator('[class*="Properties"], [class*="properties"]').count(),
        'Allotment': await window.locator('.split-view-container, [class*="Allotment"]').count(),
        'Ant Design': await window.locator('[class*="ant-"]').count(),
      };

      console.log('Component detection:');
      for (const [name, count] of Object.entries(components)) {
        console.log(`  - ${name}: ${count} elements`);
      }

      // 7. Get visible text
      const bodyText = await window.locator('body').textContent();
      console.log('Visible text (first 500 chars):', bodyText?.substring(0, 500));

      // 8. Check for error elements
      const errorElements = await window.locator('[class*="error"], [class*="Error"]').count();
      console.log('Error elements found:', errorElements);

      // 9. List all unique class names (for debugging selectors)
      const classNames = await window.evaluate(() => {
        const classes = new Set<string>();
        document.querySelectorAll('*').forEach((el) => {
          el.classList.forEach((cls) => classes.add(cls));
        });
        return Array.from(classes).sort();
      });
      console.log('Unique class names (first 50):',classNames.slice(0, 50));

      // 10. Wait a bit for user to see in headed mode
      console.log('Waiting 3 seconds for inspection (if running in headed mode)...');
      await window.waitForTimeout(3000);

      console.log('=== Inspection Complete ===');

      // Basic assertion - app should have loaded something
      expect(divCount).toBeGreaterThan(0);
      expect(html.length).toBeGreaterThan(100);

    } finally {
      await closeElectronApp(app);
    }
  });
});
