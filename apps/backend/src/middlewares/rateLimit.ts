import { NextFunction, Request, Response } from 'express';
import { getEnv } from '../config/env';

interface Bucket {
  hits: number[];
}

/** Ventana deslizante in-memory por IP (suficiente para esta escala; sin Redis) */
const buckets = new Map<string, Bucket>();

// Limpieza periódica para no acumular memoria
setInterval(() => {
  const cutoff = Date.now() - getEnv().rateLimitWindowMs;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}, 60_000).unref();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const { rateLimitWindowMs, rateLimitMax } = getEnv();
  const key = req.ip ?? 'unknown';
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > now - rateLimitWindowMs);

  if (bucket.hits.length >= rateLimitMax) {
    const retryAfterSec = Math.ceil(rateLimitWindowMs / 1000);
    res.set('Retry-After', String(retryAfterSec));
    res.status(429).json({
      success: false,
      error: `Demasiadas solicitudes. Reintentá en ${retryAfterSec}s`,
    });
    return;
  }

  bucket.hits.push(now);
  next();
}
