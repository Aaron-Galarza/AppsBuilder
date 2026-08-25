import { Response } from 'express';

/** Respuesta de éxito con envelope uniforme: { success: true, data } */
export function sendSuccess<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}
