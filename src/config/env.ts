import { z } from 'zod';

// Allowed stages
const StageSchema = z.enum(['dev', 'qa', 'staging', 'prod']);

// Centralized environment configuration
const envSchema = z.object({
  STAGE: StageSchema.default('qa'), // default if not set

  PLAYWRIGHT_BASE_URL: z.string().url().default('https://www.fedramp.gov/'),

  ACTION_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  NAVIGATION_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  EXPECT_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  MAX_PAGE_LOAD_MS: z.coerce.number().int().positive().default(10_000),

  API_BASE_URL: z.string().url().optional(),
});

// Parse environment variables
const parsed = envSchema.parse(process.env); // <-- pass all envs directly

// Export cleaned config
export const env = {
  stage: parsed.STAGE,
  baseUrl: parsed.PLAYWRIGHT_BASE_URL,
  actionTimeoutMs: parsed.ACTION_TIMEOUT_MS,
  navigationTimeoutMs: parsed.NAVIGATION_TIMEOUT_MS,
  expectTimeoutMs: parsed.EXPECT_TIMEOUT_MS,
  maxPageLoadMs: parsed.MAX_PAGE_LOAD_MS,
  apiBaseUrl: parsed.API_BASE_URL,
};