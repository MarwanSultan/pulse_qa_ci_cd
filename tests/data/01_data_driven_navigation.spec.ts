import { test, expect } from '../fixtures/testFixtures';
import { z } from 'zod';
import { readJsonFile } from '../../src/testData/dataReaders';

const NavDataSchema = z.object({
  name: z.string(),
  links: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['link', 'button']),
      nameRegex: z.string(),
    }),
  ),
});

test.describe('Data-driven: critical homepage links are visible', () => {
  test('JSON-driven UI checks', async ({ page }) => {
    const data = await readJsonFile('test-data/navigation-links.json', NavDataSchema);

    for (const link of data.links) {
      const locator =
        link.role === 'link'
          ? page.getByRole('link', { name: new RegExp(link.nameRegex, 'i') })
          : page.getByRole('button', { name: new RegExp(link.nameRegex, 'i') });

      await expect(locator.first(), `Missing critical control: ${link.id}`).toBeVisible();
    }
  });
});

