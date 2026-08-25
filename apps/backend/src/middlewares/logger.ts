import { NextFunction, Request, Response } from 'express';

/** Log mínimo de cada request: método, ruta, status y duración */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}
