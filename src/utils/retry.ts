export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    baseDelayMs?: number;
    factor?: number;
    shouldRetry?: (error: unknown) => boolean;
  },
): Promise<T> {
  const { retries, baseDelayMs = 250, factor = 2, shouldRetry = () => true } = options;

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (attempt > retries || !shouldRetry(err)) throw err;

      const delayMs = Math.round(baseDelayMs * Math.pow(factor, attempt - 1));
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // Unreachable, but keeps TypeScript happy.
  throw new Error('retryAsync: exhausted retries');
}
