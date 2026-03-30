## Playwright + TypeScript Enterprise Test Platform

This repo is an evolved, production-grade Playwright framework suitable for **UI + API + data-driven + lightweight performance** testing, with CI sharding and compliance-friendly practices (no hardcoded secrets, structured artifacts, deterministic retries).

### 1) Architecture (what lives where)
- **`src/pages/`**: Page Object Model (POM)
  - `BasePage` shared POM behavior
  - `home/` page + component-level sections (header/marketplace/updates/events/footer)
- **`src/api/`**: API service layer
  - `ApiClient` wraps `APIRequestContext` with optional auth + schema validation hooks
  - `FedrampPublicService` is an example “service” (public endpoints)
- **`src/testData/`**: test-data factories + readers (JSON/CSV)
- **`tests/`**: spec files grouped by intent
  - `tests/ui/`: UI coverage mapped to `Test_Plan.md` (F1–F10)
  - `tests/api/`: pure HTTP/API checks
  - `tests/data/`: data-driven tests (JSON + CSV)
  - `tests/performance/`: Playwright-based perf budget assertions
  - `tests/fixtures/`: typed fixtures (POM + service injection)

### 2) Step-by-step usage
#### Install
```bash
npm ci
npx playwright install --with-deps
```

#### Configure environment (no secrets in repo)
Copy `.env.example` to `.env` (kept out of git by `.gitignore`) and adjust:
```bash
STAGE=qa
PLAYWRIGHT_BASE_URL=https://www.fedramp.gov/
```

#### Run tests
```bash
npm test           # all
npm run test:ui    # UI suite
npm run test:api   # API suite
npm run test:data  # data-driven suite
npm run perf:pw    # Playwright perf budget tests
```

### 3) Deliverable code examples (real files)

#### A) Data-driven test (JSON)
`tests/data/01_data_driven_navigation.spec.ts` loads `test-data/navigation-links.json` and generates assertions dynamically.

#### B) Data-driven test (CSV)
`tests/data/02_data_driven_api_endpoints.spec.ts` reads `test-data/http-endpoints.csv` and validates status ranges.

#### C) API test with service-layer abstraction + schema validation hooks
`src/api/ApiClient.ts` + `src/api/FedrampPublicService.ts` show the pattern:
- Keep HTTP details in a **service**
- Use Zod for validation where JSON contracts exist
- Support optional auth via env (Bearer token / static headers)

#### D) UI test using POM + fixtures
`tests/ui/*` specs use the `homePage` fixture from `tests/fixtures/testFixtures.ts`.

#### E) Performance tests
- **Playwright perf**: `tests/performance/01_homepage_budget.spec.ts` uses Navigation Timing to enforce a budget.
- **k6 (optional)**: `perf/k6/homepage.js` is a lightweight smoke script with thresholds.

### 4) CI/CD (GitHub Actions)
`.github/workflows/playwright.yml` demonstrates:
- **Dependency caching**
- **Test sharding** (`--shard`)
- **Sharded report merge** (`playwright merge-reports` via blob reporter)
- **Artifacts upload** (`playwright-report/`, `test-results/`)
- **Optional k6 step** (single shard)
- **Snowflake publishing job** (main/master pushes only)

### 4.1) Snowflake reporting (modern enterprise reporting)
This framework publishes a **flattened, dashboard-ready test dataset** to Snowflake from the merged Playwright JSON report:
- Publisher script: `scripts/snowflake/publishPlaywrightToSnowflake.js`
- Input: `test-results/playwright-report.json` (generated/merged in CI)
- Output table: `${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.${SNOWFLAKE_TABLE}`

**Required GitHub Secrets**
- `SNOWFLAKE_ACCOUNT`
- `SNOWFLAKE_USER`
- `SNOWFLAKE_WAREHOUSE`
- `SNOWFLAKE_DATABASE`
- `SNOWFLAKE_SCHEMA`
- `SNOWFLAKE_TABLE`
- **Auth (choose one)**:
  - Recommended: `SNOWFLAKE_PRIVATE_KEY` (PEM string for key-pair auth)
  - Fallback: `SNOWFLAKE_PASSWORD` (rotate frequently)

**What gets written**
- One row per test (per project), including `RUN_ID`, `STAGE`, `PROJECT`, `STATUS`, `DURATION_MS`, `RETRY_ATTEMPT`, plus file/line metadata.
This is ideal for building a Snowflake-backed quality dashboard (flake rate, p95 duration, failure hotspots by spec/suite, etc.).

### 5) Observability & debugging (enterprise-friendly)
- **Artifacts by default**: screenshots/video on failure, traces on first retry.
- **Reports**:
  - HTML: `playwright-report/`
  - JUnit: `test-results/junit.xml` (CI integration)
  - Allure results: `test-results/allure-results/` (dashboard-friendly)
  - Structured NDJSON: `test-results/logs/playwright-tests.ndjson`

### 6) Design decisions (and why)
- **Fixtures as DI**: `tests/fixtures/testFixtures.ts` injects POM + service clients, so specs are thin and composable.
- **Component-level POM**: reduces locator duplication and supports modular page refactors.
- **Data isolation**:
  - Prefer generating unique values (`src/testData/*Factory.ts`) for inputs.
  - Store only non-sensitive, reusable datasets under `test-data/`.
- **Flake management**:
  - Retries only in CI + trace on retry.
  - Avoid hard waits; use role/locator assertions and explicit navigation waits.

### 7) Tradeoffs & alternatives
- **Playwright vs k6**:
  - Use Playwright perf budgets for **real-user, browser-measured** smoke signals.
  - Use k6 for **load/latency** characterization at scale (more stable + cheaper than browsers).
- **API layer**:
  - `APIRequestContext` is usually enough; Axios is only needed if you must share a client outside Playwright or need interceptors beyond PW.
- **Allure**:
  - Great for dashboards, but adds some overhead; keep it if your org standardizes on Allure.

### 8) Scaling to large organizations (practical suggestions)
- **Contract tests**: version your Zod schemas per API version and validate in CI.
- **Tagging strategy**: add `@smoke`, `@regression`, `@perf` tags; run different pipelines per tag.
- **Ownership model**: each domain team owns its `src/pages/<domain>` + `src/api/<domain>` modules.
- **Quarantine workflow**: isolate flaky tests via a tag + separate CI lane; require an owner + expiry date.

