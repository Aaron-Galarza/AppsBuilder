import http from 'http';
import { validateEnv } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';
import { initSocket } from './socket/socket';

async function main(): Promise<void> {
  // Fallar rápido si falta config crítica
  const env = validateEnv();

  // DB con reintentos: activa mock si MongoDB no está disponible
  await connectDB();

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
