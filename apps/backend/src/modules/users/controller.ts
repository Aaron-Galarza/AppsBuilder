import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { User } from './model';

/** POST /api/users/login → { token } */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (!user) {
      // Mensaje genérico para no filtrar si el email existe
      throw new AppError(401, 'Credenciales inválidas');
    }

    const ok = await user.comparePassword(password);
    if (!ok) throw new AppError(401, 'Credenciales inválidas');

    const env = getEnv();
    const token = jwt.sign(
      { id: String(user._id), email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    sendSuccess(res, {
      message: 'Login exitoso',
      token,
      user: { id: String(user._id), email: user.email, role: user.role },
    });
  }
);
