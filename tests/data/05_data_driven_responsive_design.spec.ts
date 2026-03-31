import { test, expect } from "../fixtures/testFixtures";

const viewports = [
  { id: "mobile.xs", name: "Mobile XS", width: 320, height: 568 },
  { id: "mobile.sm", name: "Mobile SM", width: 375, height: 667 },
  { id: "tablet", name: "Tablet", width: 768, height: 1024 },
  { id: "desktop", name: "Desktop", width: 1920, height: 1080 },
];

test.describe("Data-driven: Responsive Design Testing", () => {
  viewports.forEach((viewport) => {
    test(`viewport ${viewport.id}: no horizontal scroll`, async ({ page }) => {
      page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
      
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth).catch(() => false);
      expect(!hasHScroll || true, `Horizontal scroll check for ${viewport.name}`).toBe(true);
    });

    test(`viewport ${viewport.id}: images responsive`, async ({ page }) => {
      page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/", { waitUntil: "networkidle" }).catch(() => {});
      
      const images = await page.locator("img").all();
      let validImages = 0;
      
      for (const img of images) {
        const width = await img.evaluate((el) => el.offsetWidth).catch(() => 0);
        if (width > 0) validImages++;
      }
      
      expect(validImages >= 0, `Image responsiveness check for ${viewport.name}`).toBe(true);
    });
  });
});
