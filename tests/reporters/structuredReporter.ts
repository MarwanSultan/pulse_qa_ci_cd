import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

interface StructuredTestPayload {
  test: string;
  status: TestResult['status'];
  durationMs: number;
  configuredRetries: number;
  retryAttempt: number;
  timestamp: string;
}

export default class StructuredReporter implements Reporter {
  private stream: fs.WriteStream | null = null;

  onBegin(config: FullConfig, suite: Suite): void {
    void config;
    void suite;
    const logDir = path.resolve(process.cwd(), 'test-results', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = path.join(logDir, 'playwright-tests.ndjson');
    this.stream = fs.createWriteStream(logPath, { flags: 'a' });

    this.stream.on('error', (error) => {
      console.error('❌ StructuredReporter stream error:', error);
    });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.stream) return;

    const payload: StructuredTestPayload = {
      test: test.titlePath().join(' > '),
      status: result.status,
      durationMs: result.duration,
      configuredRetries: test.retries,
      retryAttempt: result.retry,
      timestamp: new Date().toISOString(),
    };

    try {
      this.stream.write(`${JSON.stringify(payload)}\n`);
    } catch (error) {
      console.error('❌ Failed to write to structured log:', error);
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    void result;
    if (this.stream) {
      return new Promise((resolve) => {
        this.stream?.end(() => {
          this.stream = null;
          resolve();
        });
      });
    }
  }
}
