/** Telemetría client-side del wizard: envía eventos a /api/events (fire-and-forget). */
export function emitWizard(msg: string, data: Record<string, unknown> = {}): void {
  if (typeof fetch === 'undefined') return
  try {
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg, data }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Silencioso: la telemetría es opcional.
  }
}