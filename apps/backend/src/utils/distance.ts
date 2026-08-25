import { haversineDistance } from '@saas/utils';
import { getEnv } from '../config/env';

export interface DistanceResult {
  distanceKm: number;
  source: 'mapbox' | 'haversine';
}

const MAPBOX_TIMEOUT_MS = 4000;

/**
 * Distancia por ruta (driving) con Mapbox Directions si hay token;
 * fallback: Haversine línea recta * 1.3 (factor vial).
 */
export async function calculateDistanceKm(lat: number, lng: number): Promise<DistanceResult> {
  const { mapboxToken } = getEnv();

  if (!mapboxToken) {
    return { distanceKm: haversineFallback(lat, lng), source: 'haversine' };
  }

  try {
    const { storeLat, storeLng } = getEnv();
    const coords = `${storeLng},${storeLat};${lng},${lat}`;
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?alternatives=false&overview=false&access_token=${encodeURIComponent(mapboxToken)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(MAPBOX_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Mapbox HTTP ${res.status}`);

    const body = (await res.json()) as { routes?: Array<{ distance?: number }> };
    const meters = body.routes?.[0]?.distance;
    if (typeof meters !== 'number' || meters <= 0) throw new Error('Respuesta sin rutas');

    return { distanceKm: Number((meters / 1000).toFixed(2)), source: 'mapbox' };
  } catch (err) {
    console.warn(
      '[distance] Mapbox falló, usando Haversine:',
      err instanceof Error ? err.message : err
    );
    return { distanceKm: haversineFallback(lat, lng), source: 'haversine' };
  }
}

function haversineFallback(lat: number, lng: number): number {
  const { storeLat, storeLng } = getEnv();
  const straightLineKm = haversineDistance(storeLat, storeLng, lat, lng);
  // Factor vial aproximado: las calles nunca son línea recta
  return Number((straightLineKm * 1.3).toFixed(2));
}
