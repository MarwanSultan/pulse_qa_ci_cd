/**
 * Mock API request handler for testing
 * Wraps APIRequestContext to intercept and mock certain requests
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { MOCK_RESPONSES } from './mockResponses';

/**
 * Create a mock APIResponse for testing
 */
export function createMockResponse(status: number, contentType: string, body: string): APIResponse {
  const mockResponse = {
    status: () => status,
    statusText: () => (status >= 200 && status < 300 ? 'OK' : 'Error'),
    headers: () => ({ 'content-type': contentType }),
    url: () => '',
    ok: () => status >= 200 && status < 300,
    text: async () => body,
    json: async () => {
      try {
        return JSON.parse(body);
      } catch {
        throw new Error('Failed to parse JSON from mock response');
      }
    },
    allHeaders: () => ({ 'content-type': contentType }),
  };

  return mockResponse as unknown as APIResponse;
}

/**
 * Get mock response for an API endpoint
 */
export function getMockApiResponse(pathOrUrl: string): APIResponse | undefined {
  const urlObj = new URL(pathOrUrl, 'https://www.fedramp.gov');
  const path = urlObj.pathname;

  const mock = MOCK_RESPONSES[path];
  if (mock) {
    return createMockResponse(mock.status, mock.contentType, mock.body);
  }

  return undefined;
}

/**
 * Wrap APIRequestContext to intercept FedRAMP calls and return mocks
 */
export function wrapRequestContextWithMocks(request: APIRequestContext): APIRequestContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy<any>(request, {
    get(target: APIRequestContext, prop: string | symbol) {
      // Intercept common HTTP methods
      if (
        prop === 'get' ||
        prop === 'post' ||
        prop === 'put' ||
        prop === 'delete' ||
        prop === 'head' ||
        prop === 'patch'
      ) {
        return async function (
          urlOrRequest: string | { url: string },
          options?: Record<string, unknown>,
        ) {
          const raw = typeof urlOrRequest === 'string' ? urlOrRequest : urlOrRequest.url;

          // Resolve relative paths against configured base URL so mocks catch calls like `api.get('/')`.
          const resolvedUrl = /^(https?:)?\/\//i.test(raw)
            ? raw
            : new URL(raw, env.baseUrl).toString();

          // Check if this targets the FedRAMP host (or the configured base host)
          try {
            const hostname = new URL(resolvedUrl).hostname;
            if (hostname.includes('fedramp.gov') || hostname === new URL(env.baseUrl).hostname) {
              const mockResponse = getMockApiResponse(resolvedUrl);
              if (mockResponse) return mockResponse;
            }
          } catch {
            // Ignore parse errors and continue to real request
          }

          // For non-FedRAMP URLs or unmocked endpoints, use the real request
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const method = (target as any)[prop];
          if (typeof method === 'function') {
            return method.call(target, urlOrRequest, options);
          }
          return undefined;
        };
      }

      // For other properties, just return the original
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prop_value = (target as any)[prop];
      if (typeof prop_value === 'function') {
        return prop_value.bind(target);
      }
      return prop_value;
    },
  });
}
