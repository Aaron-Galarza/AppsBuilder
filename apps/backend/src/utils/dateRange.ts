import { argDate, argToUTC } from '@saas/utils';

export const VALID_RANGES = ['hoy', 'ayer', 'semana', 'mes'] as const;
export type AnalyticsRange = (typeof VALID_RANGES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Devuelve [from, to) en UTC real para un rango de días calendario en
 * America/Argentina/Buenos_Aires. `to` siempre es "ahora" (o fin del día para ayer).
 */
export function getRangeBounds(range: AnalyticsRange): { from: Date; to: Date } {
  const now = new Date();

  if (range === 'hoy') {
    return { from: argToUTC(`${argDate(now)}T00:00`), to: now };
  }

  if (range === 'ayer') {
    const yesterdayDate = argDate(new Date(now.getTime() - DAY_MS));
    return {
      from: argToUTC(`${yesterdayDate}T00:00`),
      to: argToUTC(`${yesterdayDate}T23:59:59`),
    };
  }

  // semana: últimos 7 días calendario; mes: últimos 30
  const daysBack = range === 'semana' ? 6 : 29;
  const fromDate = argDate(new Date(now.getTime() - daysBack * DAY_MS));
  return { from: argToUTC(`${fromDate}T00:00`), to: now };
}

/** Valida el query param ?range= y cae a 'hoy' si viene inválido */
export function parseRange(raw?: unknown): AnalyticsRange {
  return VALID_RANGES.includes(raw as AnalyticsRange) ? (raw as AnalyticsRange) : 'hoy';
}
