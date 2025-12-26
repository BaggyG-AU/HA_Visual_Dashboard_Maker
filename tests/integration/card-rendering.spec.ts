/**
 * Integration Test: Card Rendering
 *
 * Tests that different card types render correctly on the canvas.
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';

test.describe('Card Rendering', () => {
  test('should render entities card correctly', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Add entities card
      const entitiesCard = window.locator('text=Entities Card').first();
      await entitiesCard.click();
      await window.waitForTimeout(500);

      // Verify card appears on canvas
      const cardOnCanvas = window.locator('.react-grid-item').first();
      await cardOnCanvas.waitFor({ state: 'visible' });

      // Verify card has expected structure
      const cardContent = await cardOnCanvas.locator('[class*="EntitiesCard"]').count();
      expect(cardContent).toBeGreaterThan(0);

      // Take screenshot for visual verification
      await window.screenshot({ path: 'test-results/screenshots/entities-card-render.png' });
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should render button card correctly', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Add button card
      const buttonCard = window.locator('text=Button Card').first();
      await buttonCard.click();
      await window.waitForTimeout(500);

      // Verify card appears
      const cardOnCanvas = window.locator('.react-grid-item').first();
      await cardOnCanvas.waitFor({ state: 'visible' });

      // Verify button element exists
      const hasButton = await cardOnCanvas.locator('button, .ant-btn').count();
      expect(hasButton).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should render markdown card correctly', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Add markdown card
      const markdownCard = window.locator('text=Markdown Card').first();
      await markdownCard.click();
      await window.waitForTimeout(500);

      // Verify card appears
      const cardOnCanvas = window.locator('.react-grid-item').first();
      await cardOnCanvas.waitFor({ state: 'visible' });

      // Verify card has text content area
      const hasContent = await cardOnCanvas.textContent();
      expect(hasContent).toBeTruthy();
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should render glance card correctly', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Add glance card
      const glanceCard = window.locator('text=Glance Card').first();
      await glanceCard.click();
      await window.waitForTimeout(500);

      // Verify card appears
      const cardOnCanvas = window.locator('.react-grid-item').first();
      await cardOnCanvas.waitFor({ state: 'visible' });

      // Take screenshot
      await window.screenshot({ path: 'test-results/screenshots/glance-card-render.png' });
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should render custom cards with placeholders', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Search for a custom card
      const searchInput = window.locator('input[placeholder*="Search"]');
      await searchInput.fill('apex');
      await window.waitForTimeout(500);

      // Add ApexCharts card (should show placeholder)
      const apexCard = window.locator('text*=ApexCharts').first();
      const apexExists = await apexCard.count();

      if (apexExists > 0) {
        await apexCard.click();
        await window.waitForTimeout(500);

        // Verify placeholder is shown
        const cardOnCanvas = window.locator('.react-grid-item').first();
        const placeholderText = await cardOnCanvas.textContent();
        expect(placeholderText).toContain('ApexCharts' || 'Custom Card');
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should render stack cards with nested content', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Search for horizontal stack
      const searchInput = window.locator('input[placeholder*="Search"]');
      await searchInput.fill('horizontal');
      await window.waitForTimeout(500);

      // Add horizontal stack card
      const stackCard = window.locator('text*=Horizontal Stack').first();
      const stackExists = await stackCard.count();

      if (stackExists > 0) {
        await stackCard.click();
        await window.waitForTimeout(500);

        // Verify card appears
        const cardOnCanvas = window.locator('.react-grid-item').first();
        await cardOnCanvas.waitFor({ state: 'visible' });
      }
    } finally {
      await closeElectronApp(app);
    }
  });
});
