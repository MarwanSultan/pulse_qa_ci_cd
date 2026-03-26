import { z } from 'zod';

const StageSchema = z.enum(['dev', 'qa', 'staging', 'prod']);

const stage = StageSchema.safeParse(process.env.STAGE ?? 'qa').success
  ? (process.env.STAGE as z.infer<typeof StageSchema>)
  : 'qa';

// Centralized environment configuration.
// Important: do not hardcode secrets here; only use non-sensitive defaults.
const envSchema = z.object({
  STAGE: StageSchema.default(stage),

  // For federal/enterprise setups, keep this overrideable per environment.
  // Example: PLAYWRIGHT_BASE_URL=https://fedramp.gov (prod) or internal mirror (qa)
  PLAYWRIGHT_BASE_URL: z.string().url().default('https://www.fedramp.gov/'),

  // Operational tuning: timeouts & performance thresholds.
  ACTION_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  NAVIGATION_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  EXPECT_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  MAX_PAGE_LOAD_MS: z.coerce.number().int().positive().default(10_000),

  // Security/compliance: never store secrets in code.
  API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.parse({
  STAGE: process.env.STAGE ?? stage,
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://www.fedramp.gov/',
  ACTION_TIMEOUT_MS: process.env.ACTION_TIMEOUT_MS,
  NAVIGATION_TIMEOUT_MS: process.env.NAVIGATION_TIMEOUT_MS,
  EXPECT_TIMEOUT_MS: process.env.EXPECT_TIMEOUT_MS,
  MAX_PAGE_LOAD_MS: process.env.MAX_PAGE_LOAD_MS,
  API_BASE_URL: process.env.API_BASE_URL,
});

export const env = {
  stage: parsed.STAGE,
  baseUrl: parsed.PLAYWRIGHT_BASE_URL,
  actionTimeoutMs: parsed.ACTION_TIMEOUT_MS,
  navigationTimeoutMs: parsed.NAVIGATION_TIMEOUT_MS,
  expectTimeoutMs: parsed.EXPECT_TIMEOUT_MS,
  maxPageLoadMs: parsed.MAX_PAGE_LOAD_MS,
  apiBaseUrl: parsed.API_BASE_URL,
};

