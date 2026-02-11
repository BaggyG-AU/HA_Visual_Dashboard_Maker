import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const BASE_YAML = `type: custom:swiper-card
pagination:
  type: bullets
  clickable: true
navigation: true
autoplay:
  enabled: false
  delay: 500
  pause_on_interaction: true
effect: slide
slides_per_view: 1
space_between: 16
loop: false
direction: horizontal
slides:
  - alignment: center
    allow_navigation: true
    cards:
      - type: markdown
        content: "Slide One"
  - alignment: center
    allow_navigation: true
    cards:
      - type: markdown
        content: "Slide Two"
  - alignment: center
    allow_navigation: true
    cards:
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

      await palette.addCard('custom:swiper-card', testInfo);
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

      await palette.addCard('custom:swiper-card', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML.replace('enabled: false', 'enabled: true'), 'properties');
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

      await palette.addCard('custom:swiper-card', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await carousel.setPaginationType('fraction');
      await carousel.expectPaginationType('fraction', 0);

      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent();
      expect(yamlText).toContain('custom:swiper-card');
      expect(yamlText).toContain('type: fraction');
    } finally {
      await close(ctx);
    }
  });
});
