import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { isDBReady } from '../config/db';

interface ErrorWithCode extends Error {
  code?: number | string;
  errors?: Record<string, { message: string }>;
}

/** Traduce errores técnicos a respuestas HTTP limpias con envelope de error */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 503 cuando el error viene de Mongoose y no hay conexión activa
  if (!isDBReady() && err instanceof Error && err.name.startsWith('Mongoose')) {
    res.status(503).json({ success: false, error: 'Servicio sin base de datos disponible' });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const first = err.issues[0];
    const path = first?.path?.join('.') ?? '';
    res.status(400).json({
      success: false,
      error: `Datos inválidos${path ? ` en ${path}` : ''}: ${first?.message ?? 'revisar payload'}`,
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, error: `ID inválido: ${err.value}` });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors ?? {}).map((e) => e.message);
    res.status(400).json({ success: false, error: messages.join('. ') || 'Datos inválidos' });
    return;
  }

  const e = err as ErrorWithCode;

  if (e?.code === 11000) {
    res.status(409).json({ success: false, error: 'El recurso ya existe (valor duplicado)' });
    return;
  }

  if (e instanceof SyntaxError && 'body' in e) {
    res.status(400).json({ success: false, error: 'JSON malformado en el body' });
    return;
  }

  console.error('[error] No manejado:', e);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
}
