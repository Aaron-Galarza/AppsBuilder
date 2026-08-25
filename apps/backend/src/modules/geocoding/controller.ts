import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { reverseGeocode, searchAddress } from './service';

/**
 * POST /api/geocoding
 * {query} → sugerencias (forward) | {lat,lng} → dirección (reverse)
 * Sin MAPBOX_TOKEN devuelve lista vacía / null sin romper el flujo.
 */
export const geocode = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { query?: string; lat?: number; lng?: number };

  if (body.query) {
    try {
      const results = await searchAddress(body.query);
      sendSuccess(res, results);
      return;
    } catch (err) {
      console.warn('[geocoding] forward falló:', err instanceof Error ? err.message : err);
      sendSuccess(res, []);
      return;
    }
  }

  // Reverse garantizado por el schema (lat+lng presentes si no hay query)
  const result = await reverseGeocode(body.lat!, body.lng!);
  sendSuccess(res, result ? [result] : []);
});
