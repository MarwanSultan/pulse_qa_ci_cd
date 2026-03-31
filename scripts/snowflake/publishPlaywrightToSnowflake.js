/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const snowflake = require('snowflake-sdk');

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function opt(name) {
  return process.env[name];
}

function loadJsonReport() {
  const p = path.resolve(process.cwd(), 'test-results', 'playwright-report.json');
  if (!fs.existsSync(p)) throw new Error(`Missing report: ${p}`);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function flatten(report) {
  const rows = [];
  const runId = opt('CI_RUN_ID') || opt('GITHUB_RUN_ID') || `local-${Date.now()}`;
  const stage = opt('STAGE') || 'qa';
  const baseUrl = opt('PLAYWRIGHT_BASE_URL') || opt('BASE_URL') || '';

  function walkSuite(suite, suitePath) {
    const nextSuitePath = suite.title ? [...suitePath, suite.title] : suitePath;

    for (const spec of suite.specs || []) {
      const specTitle = spec.title;
      for (const t of spec.tests || []) {
        // Each "t" can have multiple results (retries)
        const final = (t.results || []).slice(-1)[0];
        const durationMs = final?.duration ?? 0;
        const retryAttempt = final?.retry ?? 0;
        const projectName = t.projectName || '';
        const status = t.status || 'unknown'; // expected/unexpected/flaky/skipped

        rows.push({
          run_id: runId,
          stage,
          base_url: baseUrl,
          project: projectName,
          suite: nextSuitePath.join(' > '),
          spec: specTitle,
          test_id: spec.id,
          status,
          duration_ms: durationMs,
          retry_attempt: retryAttempt,
          file: spec.file,
          line: spec.line,
          column: spec.column,
          // emitted_at used as ingestion timestamp; authoritative timestamps can be added if needed
          emitted_at: new Date().toISOString(),
        });
      }
    }

    for (const child of suite.suites || []) {
      walkSuite(child, nextSuitePath);
    }
  }

  for (const suite of report.suites || []) walkSuite(suite, []);
  return rows;
}

async function connect() {
  // Prefer key-pair auth for enterprise usage when available.
  // If you use password auth, keep it in GitHub Secrets and rotate frequently.
  const account = must('SNOWFLAKE_ACCOUNT');
  const username = must('SNOWFLAKE_USER');
  const warehouse = must('SNOWFLAKE_WAREHOUSE');
  const database = must('SNOWFLAKE_DATABASE');
  const schema = must('SNOWFLAKE_SCHEMA');
  const role = opt('SNOWFLAKE_ROLE');

  const privateKey = opt('SNOWFLAKE_PRIVATE_KEY'); // PEM string (recommended)
  const password = opt('SNOWFLAKE_PASSWORD'); // fallback

  const connection = snowflake.createConnection({
    account,
    username,
    warehouse,
    database,
    schema,
    role,
    ...(privateKey ? { privateKey } : {}),
    ...(!privateKey && password ? { password } : {}),
  });

  await new Promise((resolve, reject) => {
    connection.connect((err) => (err ? reject(err) : resolve()));
  });

  return connection;
}

async function exec(connection, sql, binds = []) {
  return await new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      binds,
      complete: (err, _stmt, rows) => (err ? reject(err) : resolve(rows)),
    });
  });
}

async function ensureSchema(connection) {
  const table = must('SNOWFLAKE_TABLE');
  const fqtn = `"${must('SNOWFLAKE_DATABASE')}"."${must('SNOWFLAKE_SCHEMA')}"."${table}"`;
  await exec(
    connection,
    `CREATE TABLE IF NOT EXISTS ${fqtn} (
      RUN_ID STRING,
      STAGE STRING,
      BASE_URL STRING,
      PROJECT STRING,
      SUITE STRING,
      SPEC STRING,
      TEST_ID STRING,
      STATUS STRING,
      DURATION_MS NUMBER,
      RETRY_ATTEMPT NUMBER,
      FILE STRING,
      LINE NUMBER,
      COLUMN NUMBER,
      EMITTED_AT TIMESTAMP_NTZ
    )`,
  );
  return fqtn;
}

async function insertRows(connection, fqtn, rows) {
  if (!rows.length) return 0;
  // Chunk inserts to keep statements reasonable.
  const chunkSize = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values = chunk
      .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TO_TIMESTAMP_NTZ(?))`)
      .join(', ');

    const sql = `INSERT INTO ${fqtn}
      (RUN_ID, STAGE, BASE_URL, PROJECT, SUITE, SPEC, TEST_ID, STATUS, DURATION_MS, RETRY_ATTEMPT, FILE, LINE, COLUMN, EMITTED_AT)
      VALUES ${values}`;

    const binds = chunk.flatMap((r) => [
      r.run_id,
      r.stage,
      r.base_url,
      r.project,
      r.suite,
      r.spec,
      r.test_id,
      r.status,
      r.duration_ms,
      r.retry_attempt,
      r.file,
      r.line,
      r.column,
      r.emitted_at,
    ]);

    await exec(connection, sql, binds);
    inserted += chunk.length;
  }

  return inserted;
}

async function main() {
  const report = loadJsonReport();
  const rows = flatten(report);

  console.log(`Snowflake publish: flatten produced ${rows.length} rows.`);

  const connection = await connect();
  try {
    const fqtn = await ensureSchema(connection);
    const inserted = await insertRows(connection, fqtn, rows);
    console.log(`Inserted ${inserted} rows into ${fqtn}.`);
  } finally {
    connection.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
