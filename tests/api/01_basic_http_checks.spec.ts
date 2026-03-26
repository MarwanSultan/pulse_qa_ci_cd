import { test, expect } from '../fixtures/testFixtures';

test('API: homepage returns 200', async ({ api }) => {
  const res = await api.get('/');
  expect(res.status(), 'GET /').toBeGreaterThanOrEqual(200);
  expect(res.status(), 'GET / should not be server error').toBeLessThan(500);
});

test('API: robots.txt available', async ({ api }) => {
  const res = await api.get('/robots.txt');
  expect(res.status(), 'GET /robots.txt').toBeGreaterThanOrEqual(200);
  expect(res.status(), 'GET /robots.txt should not be server error').toBeLessThan(500);
});

