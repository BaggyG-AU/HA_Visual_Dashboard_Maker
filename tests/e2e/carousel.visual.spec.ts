import { test } from '@playwright/test';
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

test.describe('Carousel Visual Regression', () => {
  test('captures slide and pagination snapshots', async ({ page }, testInfo) => {
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

      await carousel.expectActiveSlide(0, 0);
      await carousel.expectSlideScreenshot(0, 'carousel-slide-first.png', 0);

      await carousel.clickPaginationBullet(1, 0);
      await carousel.expectActiveSlide(1, 0);
      await carousel.expectSlideScreenshot(1, 'carousel-slide-middle.png', 0);

      await carousel.clickPaginationBullet(2, 0);
      await carousel.expectActiveSlide(2, 0);
      await carousel.expectSlideScreenshot(2, 'carousel-slide-last.png', 0);

      await carousel.expectPaginationScreenshot('carousel-pagination-bullets.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
