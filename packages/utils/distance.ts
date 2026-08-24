const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Distancia entre dos coordenadas en km (fórmula de Haversine).
 * Línea recta: útil para validaciones y fallbacks locales.
 * El costo real de envío lo calcula el backend con Mapbox Directions.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const distance = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));

  return Math.round(distance * 100) / 100;
}
