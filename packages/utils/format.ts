import { ARGENTINA_TIMEZONE } from './timezone';

/**
 * Formatea un precio en pesos argentinos. Ej: 1200 → "$1.200"
 * (sin centavos, como en todos los proyectos gastro)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price);
}

/** Formatea kilómetros. Ej: 4.5 → "4.5 km", 4.0 → "4 km" */
export function formatDistance(km: number): string {
  return `${km.toFixed(1).replace('.0', '')} km`;
}

/**
 * Número de pedido a 4 dígitos con "#". Ej: "42" → "#0042".
 * Acepta el string/number directo o el objeto orden completo
 * (usa orderNumber, con fallback a los últimos 4 chars del _id).
 */
export function formatOrderNumber(
  num: string | number | { orderNumber?: string | number; _id?: string }
): string {
  const raw =
    typeof num === 'object'
      ? String(num.orderNumber ?? num._id?.slice(-4) ?? '0')
      : String(num);
  return `#${raw.padStart(4, '0')}`;
}

/** Fecha legible es-AR. Ej: "24/08/2026" */
export function formatDate(date: Date, timezone: string = ARGENTINA_TIMEZONE): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: timezone,
  }).format(date);
}

/** Hora legible 24hs. Ej: "14:35" */
export function formatTime(date: Date, timezone: string = ARGENTINA_TIMEZONE): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(date);
}
