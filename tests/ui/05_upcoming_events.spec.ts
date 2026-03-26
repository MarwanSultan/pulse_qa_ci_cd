import { test, expect } from '../fixtures/testFixtures';

test('F6: Upcoming Events list and detail navigation', async ({ page, homePage }) => {
  await expect(page.getByRole('heading', { name: /Upcoming Events/i })).toBeVisible();

  const eventText = await homePage.events.firstEventText();
  expect(eventText, 'Expected at least one event link with text').not.toBeNull();

  const keyword = (eventText ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  const firstEventLink = homePage.events.firstEventLink();
  await expect(firstEventLink).toBeVisible();

  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    firstEventLink.click(),
  ]);

  // Destination should contain the event title (or a strong textual subset).
  await expect(page.getByRole('heading', { name: new RegExp(keyword, 'i') })).toBeVisible();
});

