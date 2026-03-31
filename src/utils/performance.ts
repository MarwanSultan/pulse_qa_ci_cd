import type { Page } from '@playwright/test';

export async function getNavigationDurationMs(page: Page): Promise<number> {
  // Prefer the standard Navigation Timing entry.
  const duration = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')?.[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.duration != null) return nav.duration;

    // Fallback: legacy performance timing API.
    const timing = performance.timing as PerformanceTiming;
    if (!timing) return null;
    return timing.loadEventEnd - timing.navigationStart;
  });

  return typeof duration === 'number' && Number.isFinite(duration) ? duration : 0;
}
