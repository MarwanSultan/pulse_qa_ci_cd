import { test } from '../fixtures/testFixtures';

test('F8: Footer legal/disclaimer links resolve successfully', async ({ homePage, api }) => {
  await homePage.footer.verifyCommonFooterLinksOk(api);
});

