import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const BASE_YAML = `type: custom:swipe-card
start_card: 1
parameters:
  pagination:
    type: bullets
    clickable: true
  navigation: true
  effect: slide
  slidesPerView: 1
  spaceBetween: 16
  loop: false
  direction: horizontal
cards:
  - type: markdown
    content: "Slide One"
  - type: markdown
    content: "Slide Two"
  - type: markdown
    content: "Slide Three"
`;

const AUTOPLAY_YAML = `type: custom:swipe-card
start_card: 1
parameters:
  pagination:
    type: bullets
    clickable: true
  navigation: true
  autoplay:
    delay: 500
    disableOnInteraction: true
  effect: slide
  slidesPerView: 1
  spaceBetween: 16
  loop: false
  direction: horizontal
cards:
  - type: markdown
    content: "Slide One"
  - type: markdown
    content: "Slide Two"
  - type: markdown
    content: "Slide Three"
`;

test.describe('Carousel (Swiper)', () => {
  test('navigates via arrows, swipe, pagination, and keyboard', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, carousel } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:swipe-card', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await carousel.expectVisible(0);
      await carousel.expectNavigationVisible(0);
      await carousel.expectPaginationVisible(0);

      await carousel.expectActiveSlide(0, 0);
      await carousel.clickNext(0);
      await carousel.expectActiveSlide(1, 0);
      await carousel.clickPrev(0);
      await carousel.expectActiveSlide(0, 0);

      await carousel.clickPaginationBullet(2, 0);
      await carousel.expectActiveSlide(2, 0);
      await carousel.clickPrev(0);
      await carousel.expectActiveSlide(1, 0);

      await carousel.swipeNext(0);
      await carousel.expectActiveSlide(2, 0);

      await carousel.expectActiveSlide(2, 0);
      await carousel.pressArrowKey('ArrowLeft');
      await carousel.expectActiveSlide(1, 0);
    } finally {
      await close(ctx);
    }
  });

  test('autoplay advances slides when not selected', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, carousel } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:swipe-card', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(AUTOPLAY_YAML, 'properties');
      await properties.switchTab('Form');

      await carousel.expectActiveSlide(0, 0);

      await canvas.deselectCard();

      const initialIndex = await carousel.getActiveSlideIndex(0);
      await expect.poll(async () => await carousel.getActiveSlideIndex(0), { timeout: 4000 }).not.toBe(initialIndex);
    } finally {
      await close(ctx);
    }
  });

  test('property changes reflect in preview and YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, carousel } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:swipe-card', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await carousel.setPaginationType('fraction');
      await carousel.expectPaginationType('fraction', 0);

      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).toContain('custom:swipe-card');
      expect(yamlText).toContain('type: fraction');
      expect(yamlText).toContain('parameters:');
    } finally {
      await close(ctx);
    }
  });
});
