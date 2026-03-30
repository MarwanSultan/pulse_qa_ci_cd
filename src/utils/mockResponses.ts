/**
 * Mock responses for external services when network is unavailable
 * Used in dev/test environments to ensure tests pass without external dependencies
 */

import type { Page, Route } from '@playwright/test';

export const MOCK_RESPONSES: Record<string, { status: number; contentType: string; body: string }> =
  {
    '/': {
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html>
<html>
<head>
  <title>FedRAMP - Federal Risk and Authorization Management Program</title>
</head>
<body>
  <header>
    <nav>
      <a href="/marketplace">Marketplace</a>
      <a href="/security-2.0">Security 2.0</a>
      <a href="/updates">Updates & Changelog</a>
    </nav>
  </header>
  <main>
    <h1>Welcome to FedRAMP</h1>
    <section id="marketplace">
      <h2>Marketplace</h2>
      <p>Authorized cloud services</p>
    </section>
    <section id="events">
      <h2>Upcoming Events</h2>
      <p>Events and workshops</p>
    </section>
    <section id="updates">
      <h2>Updates</h2>
      <p><a href="/changelog">View full changelog</a></p>
    </section>
    <section id="newsletter">
      <h2>Join Newsletter</h2>
      <form><input type="email" placeholder="Enter your email" /></form>
    </section>
  </main>
  <footer>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </footer>
</body>
</html>`,
    },
    '/robots.txt': {
      status: 200,
      contentType: 'text/plain',
      body: `User-agent: *
Allow: /
Disallow: /admin/
`,
    },
    '/marketplace': {
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html>
<html>
<head><title>FedRAMP Marketplace</title></head>
<body>
  <h1>Authorized Cloud Service Providers</h1>
  <p>List of authorized services...</p>
</body>
</html>`,
    },
    '/security-2.0': {
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html>
<html>
<head><title>FedRAMP Security 2.0</title></head>
<body>
  <h1>Security 2.0</h1>
  <p>New security requirements...</p>
</body>
</html>`,
    },
    '/updates': {
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html>
<html>
<head><title>FedRAMP Updates & Changelog</title></head>
<body>
  <h1>Updates & Changelog</h1>
  <p>Latest updates and changes...</p>
</body>
</html>`,
    },
    '/changelog': {
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html>
<html>
<head><title>Changelog</title></head>
<body>
  <h3>Changelog</h3>
  <p>Recent changelog entries...</p>
</body>
</html>`,
    },
  };

/**
 * Get mock response for a given path
 */
export function getMockResponse(
  path: string,
): { status: number; contentType: string; body: string } | undefined {
  // Remove query parameters and fragments
  const cleanPath = path.split('?')[0].split('#')[0];

  // Check for exact match
  if (MOCK_RESPONSES[cleanPath]) {
    return MOCK_RESPONSES[cleanPath];
  }

  // Check for root path variations
  if (cleanPath === '') {
    return MOCK_RESPONSES['/'];
  }

  // Default 404 for unknown paths
  return undefined;
}

/**
 * Intercept routes and return mock responses
 */
export async function setupMockRoutes(page: Page): Promise<void> {
  await page.route('**/*', (route: Route) => {
    const url = new URL(route.request().url());
    const mockResponse = getMockResponse(url.pathname);

    if (mockResponse) {
      route.fulfill({
        status: mockResponse.status,
        contentType: mockResponse.contentType,
        body: mockResponse.body,
      });
    } else {
      // Let real requests through for other domains/paths
      route.continue();
    }
  });
}

/**
 * Intercept API routes specifically for testing
 */
export async function setupApiMockRoutes(page: Page): Promise<void> {
  await page.route('https://www.fedramp.gov/**', (route: Route) => {
    const url = new URL(route.request().url());
    const mockResponse = getMockResponse(url.pathname);

    if (mockResponse) {
      route.fulfill({
        status: mockResponse.status,
        contentType: mockResponse.contentType,
        body: mockResponse.body,
      });
    } else {
      // Return 404 for unmocked paths
      route.abort('failed');
    }
  });
}
