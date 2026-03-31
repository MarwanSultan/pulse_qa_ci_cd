import { test, expect } from '../fixtures/testFixtures';
import { z } from 'zod';
import { readCsvFile } from '../../src/testData/dataReaders';

const EndpointRowSchema = z.object({
  id: z.string(),
  path: z.string(),
  expectedMinStatus: z.coerce.number().int(),
  expectedMaxStatus: z.coerce.number().int(),
});

test('CSV-driven API endpoint checks', async ({ api }) => {
  const rows = await readCsvFile('test-data/http-endpoints.csv', EndpointRowSchema);

  for (const row of rows) {
    const res = await api.get(row.path);
    expect(
      res.status(),
      `${row.id} expected ${row.expectedMinStatus}-${row.expectedMaxStatus}`,
    ).toBeGreaterThanOrEqual(row.expectedMinStatus);
    expect(
      res.status(),
      `${row.id} expected ${row.expectedMinStatus}-${row.expectedMaxStatus}`,
    ).toBeLessThanOrEqual(row.expectedMaxStatus);
  }
});
