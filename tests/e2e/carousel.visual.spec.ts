import { test } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const BASE_YAML = `type: custom:swiper-card
pagination:
  type: bullets
  clickable: true
navigation: true
autoplay:
  enabled: false
  delay: 800
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

test.describe('Carousel Visual Regression', () => {
  test('captures slide and pagination snapshots', async ({ page }, testInfo) => {
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
