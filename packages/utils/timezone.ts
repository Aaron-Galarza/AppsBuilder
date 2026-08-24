export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Devuelve "YYYY-MM-DD" en hora Argentina, sin importar la timezone del servidor */
export function argDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: ARGENTINA_TIMEZONE });
}

/** Medianoche Argentina → Date UTC (Argentina siempre UTC-3, sin horario de verano) */
export function argToUTC(dateStr: string): Date {
  return new Date(`${dateStr}T03:00:00.000Z`);
}

/** Día actual en Argentina como clave en inglés (ej: "monday"), compatible con Schedule.days */
export function argWeekday(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ARGENTINA_TIMEZONE,
    weekday: 'long',
  })
    .format(d)
    .toLowerCase();
}

export function isArgNowBetween(openTime: string, closeTime: string, d: Date = new Date()): boolean {
  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: ARGENTINA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return now >= openTime && now < closeTime;
}
