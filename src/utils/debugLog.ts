type DebugPayload = {
  sessionId: '4d7df6';
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
};

// Lightweight debug logger for this session.
// IMPORTANT: Do not log secrets/PII.
export function debugLog(payload: Omit<DebugPayload, 'sessionId' | 'timestamp'> & { timestamp?: number }) {
  // #region agent log
  fetch('http://127.0.0.1:7250/ingest/5caea2f0-08f2-458f-aa2e-39116a061d27', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '4d7df6' },
    body: JSON.stringify({
      sessionId: '4d7df6',
      timestamp: payload.timestamp ?? Date.now(),
      runId: payload.runId,
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data ?? {},
    }),
  }).catch(() => {});
  // #endregion
}

