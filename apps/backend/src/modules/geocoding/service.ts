import { getEnv } from '../../config/env';

export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
}

/* Presupuesto mensual in-memory (protección de costo de la API) */
let monthKey = '';
let monthlyCalls = 0;

function checkBudget(): void {
  const now = new Date();
  const current = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  if (current !== monthKey) {
    monthKey = current;
    monthlyCalls = 0;
  }

  if (monthlyCalls >= getEnv().geocodingBudgetMonthly) {
    throw new Error('PRESUPUESTO_AGOTADO');
  }
  monthlyCalls += 1;
}

const MAPBOX_TIMEOUT_MS = 5000;

async function mapboxGet(url: string): Promise<MapboxResponse> {
  checkBudget();
  const res = await fetch(url, { signal: AbortSignal.timeout(MAPBOX_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Mapbox HTTP ${res.status}`);
  return (await res.json()) as MapboxResponse;
}

interface MapboxResponse {
  features?: Array<{
    place_name?: string;
    text?: string;
    center?: [number, number];
  }>;
}

/** Búsqueda por texto → sugerencias */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  const token = getEnv().mapboxToken;
  if (!token) return [];

  const { storeLat, storeLng } = getEnv();
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?limit=5&language=es&proximity=${storeLng},${storeLat}&access_token=${encodeURIComponent(token)}`;

  const body = await mapboxGet(url);

  return (body.features ?? [])
    .filter((f) => f.center)
    .map((f) => ({
      address: f.place_name ?? f.text ?? query,
      lat: f.center![1],
      lng: f.center![0],
    }));
}

/** Coordenadas → dirección legible (reverse) */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  const token = getEnv().mapboxToken;
  if (!token) return null;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?limit=1&language=es&access_token=${encodeURIComponent(token)}`;

  try {
    const body = await mapboxGet(url);
    const feature = body.features?.[0];
    if (!feature?.center) return null;
    return {
      address: feature.place_name ?? '',
      lat: feature.center[1],
      lng: feature.center[0],
    };
  } catch (err) {
    console.warn('[geocoding] reverse falló:', err instanceof Error ? err.message : err);
    return null;
  }
}
