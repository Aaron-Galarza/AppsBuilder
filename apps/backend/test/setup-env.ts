/**
 * Corre ANTES de cargar cualquier módulo de la app (setupFiles).
 * Redirige MONGODB_URI a la base de TEST dedicada, tomando el host real de
 * apps/backend/.env y cambiando el nombre de la base por `appsbuilder-test`.
 * Al estar set en process.env, dotenv (config/env) no lo pisa.
 */
import fs from 'fs';
import path from 'path';

const envFile = path.resolve(__dirname, '..', '.env');

function loadFromDotEnv(name: string): string {
  if (!fs.existsSync(envFile)) return '';
  const line = fs
    .readFileSync(envFile, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : '';
}

function swapDbName(uri: string, dbName: string): string {
  const qIdx = uri.indexOf('?');
  const base = qIdx >= 0 ? uri.slice(0, qIdx) : uri;
  const query = qIdx >= 0 ? uri.slice(qIdx) : '';
  const slash = base.lastIndexOf('/');
  const host = slash > 0 ? base.slice(0, slash + 1) : `${base}/`;
  return `${host}${dbName}${query}`;
}

const rawUri = loadFromDotEnv('MONGODB_URI') || 'mongodb://127.0.0.1:27017/appsbuilder-demo';
process.env.MONGODB_URI = swapDbName(rawUri, 'appsbuilder-test');
process.env.NODE_ENV = 'test';
process.env.TEST_DB_NAME = 'appsbuilder-test';
// Sin token de Mapbox: geocoding devuelve []/null y delivery usa Haversine (determinista, sin red)
process.env.MAPBOX_TOKEN = '';
// Cloudinary siempre "habilitado" en tests; el módulo cloudinary está mockeado en gallery.test
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';