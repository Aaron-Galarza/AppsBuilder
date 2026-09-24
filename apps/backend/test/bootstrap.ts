/**
 * Bootstrap común para los tests de integración del backend.
 * - createApp() ya cargado (supertest levanta el server en memoria, sin listen).
 * - Helpers: conexión a la DB de test, wipe, seed base, login admin.
 *
 * Fixtures espejan apps/backend/src/scripts/seedData.ts pero con horario
 * "abierto todo el día" para que los pedidos web no dependan de la hora ARG.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/modules/users/model';
import { StoreConfig } from '../src/modules/schedules/model';
import { Category } from '../src/modules/categories/model';
import { Product } from '../src/modules/products/model';
import { Addon } from '../src/modules/adicionales/model';
import { Coupon } from '../src/modules/coupons/model';

export const APP = createApp();

export const ADMIN_EMAIL = 'admin@local.dev';
export const ADMIN_PASSWORD = 'admin123';

/** ObjectIds fijos (espejan seedData) para fixtures deterministas */
export const IDS = {
  categoryPizzas: 'b10000000000000000000001',
  categoryEmpanadas: 'b10000000000000000000002',
  categoryCombos: 'b10000000000000000000007',
  addonMuzzarella: 'd10000000000000000000001',
  addonCheddar: 'd10000000000000000000002',
  addonPicante: 'd10000000000000000000006',
  productMuzzarella: 'c10000000000000000000001',
  productRucula: 'c10000000000000000000006',
  couponBienvenido: 'e20000000000000000000001',
  couponFijo500: 'e20000000000000000000003',
  couponVencido: 'e20000000000000000000005',
};

export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const objectId = (v: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(v);

export async function connectTestDb(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/appsbuilder-demo';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  }
}

export async function disconnectTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function wipeDb(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) {
    // deleteMany (no drop): preserva los índices únicos de las colecciones
    await c.deleteMany({}).catch(() => undefined);
  }
}

/** Seed base utilizada por todas las suites */
export async function seedBase(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    _id: objectId('a10000000000000000000001'),
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });

  await Category.insertMany([
    { _id: objectId(IDS.categoryPizzas), name: 'Pizzas', icon: 'utensils', active: true, order: 1 },
    { _id: objectId(IDS.categoryEmpanadas), name: 'Empanadas', icon: 'beef', active: true, order: 2 },
    { _id: objectId(IDS.categoryCombos), name: 'Combos', icon: 'gift', active: false, order: 3 },
  ]);

  await Addon.insertMany([
    { _id: objectId(IDS.addonMuzzarella), name: 'Extra Muzzarella', price: 800, available: true, categories: [] },
    { _id: objectId(IDS.addonCheddar), name: 'Extra Cheddar', price: 700, available: true, categories: [] },
    { _id: objectId(IDS.addonPicante), name: 'Salsa Picante', price: 0, available: true, categories: [] },
  ]);

  await Product.insertMany([
    {
      _id: objectId(IDS.productMuzzarella),
      title: 'Pizza Muzzarella',
      description: 'Salsa de tomate y muzzarella',
      price: 10500,
      category: IDS.categoryPizzas,
      available: true,
      featured: true,
      order: 1,
      addons: [objectId(IDS.addonMuzzarella), objectId(IDS.addonPicante)],
    },
    {
      _id: objectId(IDS.productRucula),
      title: 'Pizza de Rúcula',
      description: 'Rúcula, jamón crudo y parmesano',
      price: 13000,
      category: IDS.categoryPizzas,
      available: true,
      featured: false,
      order: 2,
      addons: [],
    },
    {
      _id: objectId('c10000000000000000000099'),
      title: 'Producto No Disponible',
      description: '',
      price: 1000,
      category: IDS.categoryEmpanadas,
      available: false,
      featured: false,
      order: 9,
      addons: [],
    },
  ]);

  await Coupon.insertMany([
    {
      _id: objectId(IDS.couponBienvenido),
      code: 'BIENVENIDO',
      discountType: 'percentage',
      discountValue: 10,
      active: true,
      validDays: [0, 1, 2, 3, 4, 5, 6],
      validPaymentMethods: ['cash', 'debito', 'credito', 'transferencia'],
    },
    {
      _id: objectId(IDS.couponFijo500),
      code: 'FIJO500',
      discountType: 'fixed',
      discountValue: 500,
      active: true,
      validDays: [0, 1, 2, 3, 4, 5, 6],
      validPaymentMethods: ['cash', 'debito'],
    },
    {
      _id: objectId(IDS.couponVencido),
      code: 'VENCIDO',
      discountType: 'percentage',
      discountValue: 25,
      active: false,
    },
  ]);

  await StoreConfig.create({
    isOpen: true,
    emergencyClosed: false,
    bannerUrl: '',
    rain: { enabled: false, extraCost: 0 },
    schedule: {
      timezone: 'America/Argentina/Buenos_Aires',
      days: DAY_KEYS.map((day) => ({ day, openTime: '00:00', closeTime: '23:59', closed: false })),
    },
    deliveryRanges: [
      { minKm: 0, maxKm: 2, cost: 300 },
      { minKm: 2.01, maxKm: 5, cost: 500 },
      { minKm: 5.01, maxKm: 8, cost: 800 },
      { minKm: 8.01, maxKm: 12, cost: 1200 },
    ],
  });
}

/** Reset completo: wipe + seed base. Conectar primero. */
export async function resetDb(): Promise<void> {
  await wipeDb();
  await seedBase();
}

/** Login real contra la API y devuelve el token JWT */
export async function loginAsAdmin(): Promise<string> {
  const res = await request(APP).post('/api/users/login').send({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (res.status !== 200) {
    throw new Error(`Login falló en setup: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token as string;
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const objectIdStr = () => new mongoose.Types.ObjectId().toString();