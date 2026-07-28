/**
 * Regression coverage for the v1.0.0 UAT round-1 defects behind FILE-01 (High),
 * SHELL-03's canvas half and HA-06 — "the colours don't work, there is too much
 * dark on dark", and "the canvas does not repaint when the theme changes".
 *
 * ⭐ THE ROOT CAUSE THESE TESTS PIN: `isDarkTheme` lived only in App state and
 * fed exactly one consumer — antd's `ConfigProvider` algorithm. antd restyles
 * antd components and nothing else, so every hand-styled surface was blind to
 * the theme. The canvas `<Content>` hardcoded `background: '#141414'` and
 * `color: 'white'`, which is why switching to light left it black.
 *
 * ⚠⚠ WHY THIS FILE EXISTS WHEN A THEME TEST ALREADY DID. `tests/e2e/menu-actions.spec.ts`
 * asserts that View > Toggle Theme ANNOUNCES alternating directions, and it
 * passed throughout the period the canvas never repainted — the toast said
 * "Switched to light theme" while the canvas stayed black. **An announcement is
 * not an outcome.** These tests read computed styles off the real DOM instead.
 *
 * ⚠ Deliberately NO screenshots here. Asserting on computed colour keeps this
 * suite independent of the 51 visual baselines, which RC4 is required to leave
 * unmoved.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const sendMenu = async (ctx: Ctx, channel: string) => {
  await ctx.app.evaluate(({ BrowserWindow }, ch) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(ch);
  }, channel);
};

/** Perceived lightness of a CSS colour, 0 (black) to 1 (white). */
const luminanceOf = (css: string): number => {
  const nums = css.match(/[\d.]+/g);
  if (!nums || nums.length < 3) throw new Error(`Unparseable colour: "${css}"`);
  const [r, g, b] = nums.slice(0, 3).map(Number);
  // Rec. 709 luma, good enough to answer "is this light or dark?".
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const readTheme = (ctx: Ctx) =>
  ctx.window.evaluate(() => document.documentElement.getAttribute('data-theme'));

const readCanvasColours = (ctx: Ctx) =>
  ctx.window.evaluate(() => {
    const el = document.querySelector('[data-testid="canvas-surface"]');
    if (!el) throw new Error('canvas surface not found');
    const s = getComputedStyle(el);
    return { background: s.backgroundColor, text: s.color };
  });

test.describe('Theme reaches non-antd chrome (RC4)', () => {
  test('exposes the active theme on the DOM so hand-styled surfaces can follow it', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // ⭐ RED BEFORE THE FIX: no body class, no data-theme — `isDarkTheme` was
      // reflected nowhere in the DOM at all, so this attribute did not exist.
      expect(await readTheme(ctx)).toBe('dark');

      await sendMenu(ctx, 'menu:toggle-theme');
      await expect.poll(() => readTheme(ctx)).toBe('light');

      await sendMenu(ctx, 'menu:toggle-theme');
      await expect.poll(() => readTheme(ctx)).toBe('dark');
    } finally {
      await close(ctx);
    }
  });

  test('repaints the canvas when the theme changes, instead of staying dark', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      const dark = await readCanvasColours(ctx);
      // Control leg: the surface is observable and genuinely dark to start with,
      // so a later "it changed" assertion cannot pass against an unstyled node.
      expect(luminanceOf(dark.background)).toBeLessThan(0.5);

      await sendMenu(ctx, 'menu:toggle-theme');

      // ⭐ THE DEFECT: this stayed '#141414' forever. UAT SHELL-03 and HA-06.
      await expect
        .poll(async () => luminanceOf((await readCanvasColours(ctx)).background))
        .toBeGreaterThan(0.5);
    } finally {
      await close(ctx);
    }
  });

  test('keeps canvas text readable against the canvas background in BOTH themes', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // The owner's rule, stated verbatim in the round-1 direction: "if dark
      // background then must be light text and vice versa".
      const assertContrasts = async (label: string) => {
        const { background, text } = await readCanvasColours(ctx);
        const gap = Math.abs(luminanceOf(background) - luminanceOf(text));
        expect(gap, `${label}: background ${background} vs text ${text}`).toBeGreaterThan(0.4);
      };

      await assertContrasts('dark theme');
      await sendMenu(ctx, 'menu:toggle-theme');
      await expect.poll(() => readTheme(ctx)).toBe('light');
      // ⭐ Before the fix this was the failure: the canvas kept `color: 'white'`
      // AND `background: '#141414'`, so flipping to light produced white text on
      // a black panel inside an otherwise light application.
      await assertContrasts('light theme');
    } finally {
      await close(ctx);
    }
  });
});
