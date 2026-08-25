import { z } from 'zod';

/** Acepta {query: "..."} (forward) o {lat, lng} (reverse) */
export const geocodingSchema = z
  .object({
    query: z.string().trim().min(3).max(120).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .refine((body) => body.query !== undefined || (body.lat !== undefined && body.lng !== undefined), {
    message: 'Enviar "query" o "lat"+"lng"',
  });
