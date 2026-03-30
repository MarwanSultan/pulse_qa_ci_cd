import type { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';
import { env } from '../config/env';
import { logger } from '../logging/logger';
import { debugLog } from '../utils/debugLog';
import { getMockApiResponse } from '../utils/mockApiContext';

export type AuthStrategy =
  | { kind: 'none' }
  | { kind: 'bearer'; tokenEnvVar: string }
  | { kind: 'staticHeaders'; headers: Record<string, string> };

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly options?: {
      baseUrl?: string;
      auth?: AuthStrategy;
    },
  ) {}

  private buildHeaders(): Record<string, string> {
    const auth = this.options?.auth ?? { kind: 'none' as const };
    if (auth.kind === 'none') return {};
    if (auth.kind === 'staticHeaders') return { ...auth.headers };
    if (auth.kind === 'bearer') {
      const token = process.env[auth.tokenEnvVar];
      if (!token) throw new Error(`Missing required auth token in env var ${auth.tokenEnvVar}`);
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private resolveUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const base = this.options?.baseUrl ?? env.baseUrl;
    return new URL(pathOrUrl, base).toString();
  }

  async get(
    pathOrUrl: string,
    init?: Parameters<APIRequestContext['get']>[1],
  ): Promise<APIResponse> {
    const url = this.resolveUrl(pathOrUrl);

    // Check for mock responses first if enabled
    if (env.useHttpMocks) {
      const mockResponse = getMockApiResponse(url);
      if (mockResponse) {
        debugLog({
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'src/api/ApiClient.ts:get',
          message: 'API GET (mocked)',
          data: { url },
        });
        logger.debug({ url, mocked: true }, 'API GET');
        return mockResponse;
      }
    }

    const baseHeaders = this.buildHeaders();
    const initHeaders = init?.headers ?? {};
    const headers = { ...baseHeaders, ...initHeaders };
    debugLog({
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'src/api/ApiClient.ts:get',
      message: 'API GET',
      data: { url },
    });
    logger.debug({ url }, 'API GET');
    return await this.request.get(url, { ...init, headers });
  }

  async post(
    pathOrUrl: string,
    init?: Parameters<APIRequestContext['post']>[1],
  ): Promise<APIResponse> {
    const url = this.resolveUrl(pathOrUrl);

    // Check for mock responses first if enabled
    if (env.useHttpMocks) {
      const mockResponse = getMockApiResponse(url);
      if (mockResponse) {
        debugLog({
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'src/api/ApiClient.ts:post',
          message: 'API POST (mocked)',
          data: { url },
        });
        logger.debug({ url, mocked: true }, 'API POST');
        return mockResponse;
      }
    }

    const baseHeaders = this.buildHeaders();
    const initHeaders = init?.headers ?? {};
    const headers = { ...baseHeaders, ...initHeaders };
    logger.debug({ url }, 'API POST');
    return await this.request.post(url, { ...init, headers });
  }

  async expectJson<TSchema extends z.ZodTypeAny>(
    response: APIResponse,
    schema: TSchema,
  ): Promise<z.infer<TSchema>> {
    const ct = response.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) {
      throw new Error(`Expected JSON response but got content-type=${ct}`);
    }
    const json = await response.json();
    return schema.parse(json);
  }
}
