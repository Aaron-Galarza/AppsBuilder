import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';

let io: IOServer | null = null;

/** Inicializa Socket.io con JWT en el handshake; los admins entran al room 'admins' */
export function initSocket(httpServer: HttpServer): IOServer {
  const env = getEnv();

  io = new IOServer(httpServer, {
    cors: {
      origin: env.clientUrls,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('No autorizado'));
      jwt.verify(token, env.jwtSecret);
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.join('admins');
    socket.join('public'); // Room para notificaciones de estado (emergency close, etc.)
    console.log(`[socket] Admin conectado (${socket.id})`);

    socket.on('disconnect', () => {
      console.log(`[socket] Admin desconectado (${socket.id})`);
    });
  });

  return io;
}

/** Instancia global; lanza si initSocket no corrió todavía */
export function getIO(): IOServer {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}

/** Notifica a todos los admins un pedido nuevo */
export function emitNewOrder(order: unknown): void {
  getIO().to('admins').emit('new-order', order);
}
