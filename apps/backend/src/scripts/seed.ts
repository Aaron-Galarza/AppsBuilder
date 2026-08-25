import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { validateEnv } from '../config/env';
import { connectDB } from '../config/db';
import { User } from '../modules/users/model';
import { StoreConfig } from '../modules/schedules/model';

/**
 * Seed inicial: crea el usuario admin y la config del local si no existen.
 * Uso: pnpm --filter @saas/backend seed
 */
async function seed(): Promise<void> {
  validateEnv();
  const ok = await connectDB();
  if (!ok) {
    console.error('[seed] Sin DB no hay nada que sembrar.');
    process.exit(1);
  }

  // Admin por defecto (cambiar la contraseña en producción)
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

  if (!(await User.findOne({ email }).exec())) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: 'admin' });
    console.log(`[seed] Usuario admin creado: ${email} / ${password}`);
  } else {
    console.log(`[seed] El admin ${email} ya existe`);
  }

  // Config singleton con horarios por defecto
  const config = await StoreConfig.getOrCreateConfig();
  console.log(`[seed] Config lista (${config.schedule.days.length} días configurados)`);

  await mongoose.disconnect();
  console.log('[seed] Listo');
  process.exit(0);
}

void seed();
