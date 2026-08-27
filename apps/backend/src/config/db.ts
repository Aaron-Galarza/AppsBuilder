import mongoose from 'mongoose';
import { getEnv } from './env';
import { activateMock } from '../mock/store';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Conexión a MongoDB con reintentos.
 * NO es fatal: el server arranca igual para servir /api/health y
 * endpoints que no dependen de DB; los handlers devuelven 503 si no hay DB.
 */
export async function connectDB(): Promise<boolean> {
  const { mongoUri } = getEnv();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
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
  console.error('[db] Activando mock store con datos de data.json...');
  activateMock();
  return false;
}

/** true si la conexión está lista para operar */
export function isDBReady(): boolean {
  return mongoose.connection.readyState === 1;
}
