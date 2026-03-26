import fs from 'fs';
import path from 'path';
import type { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

type AnyRecord = Record<string, unknown>;

export default class StructuredReporter implements Reporter {
  private stream: fs.WriteStream | null = null;

  onBegin(config: FullConfig, suite: Suite): void {
    void config;
    void suite;
    const logDir = path.resolve(process.cwd(), 'test-results', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, 'playwright-tests.ndjson');
    this.stream = fs.createWriteStream(logPath, { flags: 'a' });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.stream) return;

    const payload: AnyRecord = {
      test: test.titlePath().join(' > '),
      status: result.status,
      durationMs: result.duration,
      configuredRetries: test.retries,
      retryAttempt: result.retry,
      timestamp: new Date().toISOString(),
    };

    this.stream.write(`${JSON.stringify(payload)}\n`);
  }

  onEnd(): void {
    this.stream?.end();
    this.stream = null;
  }
}

