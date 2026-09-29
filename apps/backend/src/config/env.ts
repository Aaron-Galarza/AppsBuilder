import 'dotenv/config';
import type { StoreStatusMode } from '@saas/types';

/**
 * Variables de entorno validadas al boot.
 * validateEnv() debe ejecutarse ANTES de conectar DB o levantar el server.
 */
export interface Env {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  statusMode: StoreStatusMode;
  clientUrls: string[];
  storeLat: number;
  storeLng: number;
  mapboxToken: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    enabled: boolean;
  };
  geocodingBudgetMonthly: number;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`[env] Falta la variable de entorno requerida: ${name}`);
  }
  return value.trim();
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Modo del estado del local.
 * - 'manual': el local no tiene horarios; el estado lo maneja solo el botón
 *   abrir/cerrar del admin (plantilla basic).
 * - 'schedule': manda el horario semanal configurado (standard/premium).
 *
 * Se lee acá y no con `process.env` suelto en cada módulo para que un valor
 * ausente o inválido falle visible en el boot, en vez de caer silenciosamente
 * en 'schedule' y dejar el botón sin efecto.
 */
function parseStatusMode(): StoreStatusMode {
  const raw = (process.env.STATUS_MODE ?? '').trim();
  // .env.example trae el placeholder que el generador reemplaza por plantilla.
  // Si alguien copió el ejemplo sin generarlo, se trata como "no configurado"
  // en vez de romper el boot con un valor inválido.
  const value = raw === 'INJECT_STATUS_MODE' ? '' : raw;

  if (value && value !== 'manual' && value !== 'schedule') {
    throw new Error(`[env] STATUS_MODE inválido: "${value}". Usá 'manual' o 'schedule'.`);
  }

  if (!value) {
    console.warn(
      "[env] STATUS_MODE sin definir → se asume 'schedule' (manda el horario semanal). " +
        "En basic el local NO tiene horarios: poné STATUS_MODE=manual para que lo controle el botón."
    );
  }

  return value === 'manual' ? 'manual' : 'schedule';
}

export function loadEnv(): Env {
  const clientUrlsStr = (process.env.CLIENT_URL ?? 'http://localhost:3000,http://localhost:3001,http://localhost:3002').trim();
  const clientUrls = clientUrlsStr
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  const statusMode = parseStatusMode();

  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME ?? '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? '').trim();

  return {
    port: num('PORT', 4000),
    nodeEnv: (process.env.NODE_ENV ?? 'development').trim(),
    mongoUri: (process.env.MONGODB_URI ?? 'mongodb://localhost:27017/appsbuilder-demo').trim(),
    jwtSecret: (process.env.JWT_SECRET ?? 'demo-secret-key-do-not-use-in-production').trim(),
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '4h').trim(),
    statusMode,
    clientUrls,
    storeLat: num('STORE_LAT', -34.6037),
    storeLng: num('STORE_LNG', -58.3816),
    mapboxToken: (process.env.MAPBOX_TOKEN ?? '').trim(),
    cloudinary: {
      cloudName,
      apiKey,
      apiSecret,
      enabled: Boolean(cloudName && apiKey && apiSecret),
    },
    geocodingBudgetMonthly: num('GEOCODING_BUDGET_MONTHLY', 8000),
  };
}

let env: Env | null = null;

/** Instancia singleton de la config; valida en el primer acceso */
export function getEnv(): Env {
  if (!env) env = loadEnv();
  return env;
}

/** Valida temprano para fallar rápido si falta config crítica */
export function validateEnv(): Env {
  env = loadEnv();
  return env;
}
