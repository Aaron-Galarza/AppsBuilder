import http from 'http';
import { validateEnv } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';
import { initSocket } from './socket/socket';
import { ensureSeeded } from './scripts/seed';
import { syncStatusModeFromEnv } from './modules/schedules/service';

async function main(): Promise<void> {
  // Fallar rápido si falta config crítica
  const env = validateEnv();

  // DB con reintentos: sin MongoDB no hay fallback mock, solo arranca sin datos
  const dbOk = await connectDB();

  // Si la instancia está totalmente vacía, sembrar datos demo automáticamente
  if (dbOk) {
    try {
      await ensureSeeded();
    } catch (err) {
      console.error('[server] Auto-seed falló:', err);
    }

    // STATUS_MODE del .env manda mientras el dueño no lo haya cambiado a mano.
    // Sin esto, una base ya sembrada queda en 'schedule' y basic no abre nunca.
    try {
      await syncStatusModeFromEnv();
    } catch (err) {
      console.error('[server] No se pudo aplicar STATUS_MODE:', err);
    }
  }

  const app = createApp();
  const server = http.createServer(app);

  // WebSockets para notificar pedidos nuevos a los admins
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`[server] Escuchando en http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Cierre ordenado
  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} recibido, cerrando...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
