import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getEnv } from './config/env';
import { rateLimiter } from './middlewares/rateLimit';
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/error';
import mainRouter from './routes';

export function createApp(): Application {
  const env = getEnv();

  const app = express();

  app.set('trust proxy', 1);

  // Seguridad básica
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS: allowlist desde CLIENT_URL + localhost en dev
  const allowedOrigins = [
    ...env.clientUrls,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permitir requests sin origin (curl, healthchecks, apps nativas)
        if (!origin || allowedOrigins.includes(origin) || env.nodeEnv !== 'production') {
          return callback(null, true);
        }
        callback(new Error(`Origen no permitido: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get('/', (_req, res) => {
    res.json({ success: true, data: { message: 'API funcionando', version: '1.0.0' } });
  });

  app.use('/api', mainRouter);

  // 404 para rutas desconocidas
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  });

  // errorHandler SIEMPRE último
  app.use(errorHandler);

  return app;
}
