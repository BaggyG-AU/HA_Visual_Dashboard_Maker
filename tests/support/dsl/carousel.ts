/**
 * Carousel DSL
 *
 * Swiper carousel interactions: navigation, pagination, swipe, autoplay.
 */

import { Page, expect } from '@playwright/test';

export class CarouselDSL {
  constructor(private window: Page) {}

  private getCard(cardIndex = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  private getCarousel(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('swiper-carousel');
  }

  private getSlide(index: number, cardIndex = 0) {
    return this.getCarousel(cardIndex).getByTestId(`swiper-slide-${index}`);
  }

  private getPagination(cardIndex = 0) {
    return this.getCarousel(cardIndex).getByTestId('swiper-pagination');
  }

  private getPrevButton(cardIndex = 0) {
    return this.getCarousel(cardIndex).getByTestId('swiper-prev');
  }

  private getNextButton(cardIndex = 0) {
    return this.getCarousel(cardIndex).getByTestId('swiper-next');
  }

  async expectVisible(cardIndex = 0): Promise<void> {
    await expect(this.getCarousel(cardIndex)).toBeVisible();
  }

  async expectPaginationVisible(cardIndex = 0): Promise<void> {
    await expect(this.getPagination(cardIndex)).toBeVisible();
  }

  async expectNavigationVisible(cardIndex = 0): Promise<void> {
    await expect(this.getPrevButton(cardIndex)).toBeVisible();
    await expect(this.getNextButton(cardIndex)).toBeVisible();
  }

  async clickNext(cardIndex = 0): Promise<void> {
    const button = this.getNextButton(cardIndex);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickPrev(cardIndex = 0): Promise<void> {
    const button = this.getPrevButton(cardIndex);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickPaginationBullet(index: number, cardIndex = 0): Promise<void> {
    const pagination = this.getPagination(cardIndex);
    await expect(pagination).toBeVisible();
    const bullet = pagination.locator('.swiper-pagination-bullet').nth(index);
    await expect(bullet).toBeVisible();
    await bullet.click();
  }

  async expectActiveSlide(index: number, cardIndex = 0): Promise<void> {
    await expect.poll(async () => await this.getActiveSlideIndex(cardIndex), { timeout: 5000 }).toBe(index);
  }

  async getActiveSlideIndex(cardIndex = 0): Promise<number | null> {
    const active = this.getCarousel(cardIndex).locator('.swiper-slide-active').first();
    const visible = await active.isVisible().catch(() => false);
    if (!visible) return null;
    const attr = await active.getAttribute('data-slide-index');
    if (!attr) return null;
    const parsed = Number(attr);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async swipeNext(cardIndex = 0): Promise<void> {
    const carousel = this.getCarousel(cardIndex);
    await expect(carousel).toBeVisible();
    const box = await carousel.boundingBox();
    if (!box) throw new Error('Carousel bounding box unavailable');

    // Use 90%→10% range to exceed Swiper's longSwipesRatio (0.5) even after
    // Playwright IPC latency causes the last few pixels to be lost.
    const startX = box.x + box.width * 0.9;
    const endX = box.x + box.width * 0.1;
    const y = box.y + box.height * 0.5;

    await this.window.mouse.move(startX, y);
    await this.window.mouse.down();
    // Step through intermediate positions so Swiper registers the full drag
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      await this.window.mouse.move(x, y);
    }
    await this.window.mouse.up();
  }

  async expectPaginationType(type: 'bullets' | 'fraction' | 'progressbar' | 'custom', cardIndex = 0): Promise<void> {
    await expect.poll(async () => {
      const pagination = this.getPagination(cardIndex);
      const visible = await pagination.isVisible().catch(() => false);
      if (!visible) return '';
      return (await pagination.getAttribute('class')) ?? '';
    }, { timeout: 5000 }).toMatch(new RegExp(`swiper-pagination-${type}`));
  }

  async setPaginationType(type: 'bullets' | 'fraction' | 'progressbar' | 'custom'): Promise<void> {
    const select = this.window.getByTestId('swiper-pagination-type');
    const labelByType: Record<typeof type, string> = {
      bullets: 'Bullets',
      fraction: 'Fraction',
      progressbar: 'Progress Bar',
      custom: 'Custom',
    };

    await expect(select).toBeVisible();
    await select.click();

    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const option = dropdown.locator('.ant-select-item-option', {
      hasText: new RegExp(`^${labelByType[type]}$`, 'i'),
    }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }

  async toggleAutoplay(enabled: boolean): Promise<void> {
    const toggle = this.window.getByTestId('swiper-autoplay-toggle');
    await expect(toggle).toBeVisible();
    const isChecked = await toggle.getAttribute('aria-checked');
    if ((isChecked === 'true') !== enabled) {
      await toggle.click();
    }
  }

  async setAutoplayDelay(delayMs: number): Promise<void> {
    const input = this.window.getByTestId('swiper-autoplay-delay').locator('input');
    await expect(input).toBeVisible();
    await input.fill(String(delayMs));
    await input.blur();
  }

  async setEffect(effect: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip'): Promise<void> {
    const select = this.window.getByTestId('swiper-effect');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${effect}$`, 'i') });
    await expect(option).toBeVisible();
    await option.click();
    await expect(select).toContainText(new RegExp(effect, 'i'));
  }

  async setSlidesPerView(value: 'auto' | number): Promise<void> {
    const select = this.window.getByTestId('swiper-slides-per-view');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${value}$`, 'i') });
    await expect(option).toBeVisible();
    await option.click();
    await expect(select).toContainText(new RegExp(String(value), 'i'));
  }

  async addSlide(): Promise<void> {
    const button = this.window.getByTestId('swiper-slide-add');
    await expect(button).toBeVisible();
    await button.click();
  }

  async pressArrowKey(direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'): Promise<void> {
    await this.window.keyboard.press(direction);
  }

  private async disableAnimations(): Promise<void> {
    await this.window.evaluate(() => {
      document.body.classList.add('e2e-disable-animations');
      if (!document.getElementById('e2e-disable-animations-style')) {
        const style = document.createElement('style');
        style.id = 'e2e-disable-animations-style';
        style.textContent = `
          .e2e-disable-animations *,
          .e2e-disable-animations *::before,
          .e2e-disable-animations *::after {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  async expectSlideScreenshot(index: number, name: string, cardIndex = 0): Promise<void> {
    const slide = this.getSlide(index, cardIndex);
    await expect(slide).toBeVisible();
    await this.disableAnimations();
    await expect(slide).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      // Allow minor anti-aliasing/subpixel differences across compositor runs.
      maxDiffPixels: 2500,
    });
  }

  async expectPaginationScreenshot(name: string, cardIndex = 0): Promise<void> {
    const pagination = this.getPagination(cardIndex);
    await expect(pagination).toBeVisible();
    await this.disableAnimations();
    await expect(pagination).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      // Allow minimal pixel drift from subpixel centering/antialiasing in pagination dots.
      maxDiffPixels: 10,
    });
  }
}
