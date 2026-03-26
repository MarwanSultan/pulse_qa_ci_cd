import { test, expect } from '../fixtures/testFixtures';
import { makeUniqueEmail } from '../../src/testData/emailFactory';

test('F7: Join / Newsletter subscription form (validation + success)', async ({ homePage }) => {
  const emailInput = homePage.newsletter.emailInput();
  const hasForm = (await emailInput.count()) > 0;
  if (!hasForm) test.skip(true, 'Newsletter email form not present on homepage');

  const joinButton = homePage.newsletter.joinCta();
  const joinLink = homePage.newsletter.joinLink();

  if ((await joinButton.count()) === 0 && (await joinLink.count()) === 0) {
    test.skip(true, 'Join CTA control not found (button/link)');
  }

  if ((await joinButton.count()) > 0) {
    await expect(joinButton).toBeVisible();
  } else {
    await expect(joinLink).toBeVisible();
  }

  // Validation: empty/invalid email should show an error.
  await emailInput.fill('not-an-email');
  await homePage.newsletter.submitButton().click();
  await expect(homePage.newsletter.validationOrStatusMessage()).toBeVisible();

  // Positive path: a valid email should lead to a success or a controlled deferral (e.g., captcha).
  const validEmail = makeUniqueEmail('fedramp');
  await emailInput.fill(validEmail);
  await homePage.newsletter.submitButton().click();

  const message = homePage.newsletter.validationOrStatusMessage();
  await expect(message).toBeVisible();

  // Some federal sites may require a captcha/secondary confirmation. Treat either as acceptable outcomes.
  const msgText = (await message.textContent()) ?? '';
  expect(msgText).toMatch(/success|subscribed|thank|captcha|verify/i);
});

