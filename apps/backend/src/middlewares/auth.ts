import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Exige JWT válido en el header Authorization (Bearer). Si no → 401. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    next(new AppError(401, 'Token no proporcionado'));
    return;
  }

  try {
    const payload = jwt.verify(token, getEnv().jwtSecret) as {
      id: string;
      email: string;
      role?: string;
    };
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}
