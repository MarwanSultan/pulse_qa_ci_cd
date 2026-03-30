import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.fedramp.gov/events/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  const links = await page.getByRole('link').allTextContents();
  console.log('--- ALL LINKS ON EVENTS PAGE ---');
  console.log(links.map(l => l.trim()).filter(Boolean).join(' | '));
  const h1 = await page.locator('h1').allTextContents();
  console.log('--- H1s ON EVENTS PAGE ---');
  console.log(h1);
  await browser.close();
})();
