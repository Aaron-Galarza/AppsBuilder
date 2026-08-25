import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/** Middleware de validación con zod: body válido → sigue; inválido → 400 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}
