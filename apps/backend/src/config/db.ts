import mongoose from 'mongoose';
import { getEnv } from './env';

const MAX_RETRIES = Number(process.env.MONGODB_MAX_RETRIES ?? 5);
const RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS ?? 3000);
const SELECTION_TIMEOUT_MS = Number(process.env.MONGODB_SELECTION_TIMEOUT_MS ?? 5000);

/**
 * Conexión a MongoDB con reintentos.
 * Sin DB el server arranca igual (sirve /api/health y devuelve 503 en los
 * handlers que dependen de datos); NO hay fallback mock: los datos solo
 * se consultan a la instancia real de MongoDB.
 */
export async function connectDB(): Promise<boolean> {
  const { mongoUri } = getEnv();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: SELECTION_TIMEOUT_MS });
      console.log(`[db] MongoDB conectado (${mongoose.connection.name})`);
      return true;
    } catch (err) {
      console.error(
        `[db] Intento ${attempt}/${MAX_RETRIES} falló: ${err instanceof Error ? err.message : err}`
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  console.error('[db] No se pudo conectar a MongoDB. El server sigue arriba sin DB.');
  return false;
}

/** true si la conexión está lista para operar */
export function isDBReady(): boolean {
  return mongoose.connection.readyState === 1;
}