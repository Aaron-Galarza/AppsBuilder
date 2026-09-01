import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { validateEnv } from '../config/env';
import { connectDB } from '../config/db';
import { User } from '../modules/users/model';
import { StoreConfig } from '../modules/schedules/model';
import { Category } from '../modules/categories/model';
import { Product } from '../modules/products/model';
import { Addon } from '../modules/adicionales/model';
import { AddonCategory } from '../modules/adicionales/model.category';
import { Order } from '../modules/orders/model';
import { Coupon } from '../modules/coupons/model';
import { Daily } from '../modules/analytics/model';
import { GalleryImage } from '../modules/gallery/service';

type RawDoc = Record<string, unknown> & { _id?: unknown };
type SeedData = Record<string, unknown> & {
  users?: RawDoc[];
  categories?: RawDoc[];
  addonCategories?: RawDoc[];
  addons?: RawDoc[];
  products?: RawDoc[];
  orders?: RawDoc[];
  coupons?: RawDoc[];
  schedules?: RawDoc[];
  deliveryRanges?: RawDoc[];
  daily?: RawDoc[];
  gallery?: RawDoc[];
};

const DATA_PATH = join(__dirname, 'data.json');
const DEFAULT_PASSWORD_HASH = '$2a$10$XFE/UQEHkPKQSaQjVCqkMO8z3KxqKJ1s3KjYqZqZqZqZqZqZqZqZq';
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function readSeedData(): SeedData {
  if (!existsSync(DATA_PATH)) {
    console.warn(`[seed] No existe ${DATA_PATH}; se creara solo admin + config default.`);
    return {};
  }

  return JSON.parse(readFileSync(DATA_PATH, 'utf-8')) as SeedData;
}

function objectId(id: unknown): Types.ObjectId | undefined {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return undefined;
  return new Types.ObjectId(id);
}

function withObjectId(doc: RawDoc): Record<string, unknown> {
  const next: Record<string, unknown> = { ...doc };
  const _id = objectId(doc._id);
  if (_id) next._id = _id;
  return next;
}

async function upsertMany(model: mongoose.Model<any>, docs: RawDoc[] | undefined, label: string): Promise<void> {
  const normalized = (docs ?? [])
    .map(withObjectId)
    .filter((doc): doc is Record<string, unknown> & { _id: Types.ObjectId } => doc._id instanceof Types.ObjectId);

  if (normalized.length === 0) {
    console.log(`[seed] ${label}: 0 documentos`);
    return;
  }

  await model.bulkWrite(
    normalized.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  console.log(`[seed] ${label}: ${normalized.length} documentos listos`);
}

function normalizeUsers(users: RawDoc[] | undefined): RawDoc[] {
  return (users ?? []).map((user) => ({
    ...withObjectId(user),
    email: String(user.email ?? 'admin@local.dev').toLowerCase(),
    passwordHash: String(user.passwordHash ?? user.password ?? DEFAULT_PASSWORD_HASH),
    role: user.role ?? 'admin',
  }));
}

function normalizeAddons(addons: RawDoc[] | undefined): RawDoc[] {
  return (addons ?? []).map((addon) => ({
    ...withObjectId(addon),
    categories: Array.isArray(addon.categories)
      ? addon.categories
          .map((category) => objectId((category as RawDoc)._id ?? category))
          .filter(Boolean)
      : [],
  }));
}

function normalizeProducts(products: RawDoc[] | undefined): RawDoc[] {
  return (products ?? []).map((product) => ({
    ...withObjectId(product),
    addons: Array.isArray(product.addons)
      ? product.addons.map(objectId).filter(Boolean)
      : [],
  }));
}

function normalizeOrders(orders: RawDoc[] | undefined): RawDoc[] {
  return (orders ?? []).map((order) => ({
    ...withObjectId(order),
    items: Array.isArray(order.items)
      ? order.items.map((item) => {
          const rawItem = item as RawDoc;
          return {
            ...rawItem,
            productId: objectId(rawItem.productId),
            addons: Array.isArray(rawItem.addons)
              ? rawItem.addons.map((addon) => {
                  const rawAddon = addon as RawDoc;
                  return { ...rawAddon, addonId: objectId(rawAddon.addonId) };
                })
              : [],
          };
        })
      : [],
  }));
}

function normalizeGallery(gallery: RawDoc[] | undefined): RawDoc[] {
  return (gallery ?? []).map((image) => ({
    ...withObjectId(image),
    publicId: image.publicId ?? image._id ?? `seed-${Date.now()}`,
  }));
}

function normalizeScheduleDays(days: unknown): Array<{ day: string; openTime: string; closeTime: string; closed: boolean }> {
  const rawDays = (Array.isArray(days) ? days : []) as RawDoc[];
  const byDay = new Map<number, RawDoc>();

  for (const day of rawDays) {
    const dayIndex = Number(day.day);
    if (!byDay.has(dayIndex)) byDay.set(dayIndex, day);
  }

  return DAY_KEYS.map((day, index) => {
    const raw = byDay.get(index);
    return {
      day,
      openTime: String(raw?.open ?? raw?.openTime ?? '20:00'),
      closeTime: String(raw?.close ?? raw?.closeTime ?? '23:59'),
      closed: raw ? raw.active === false || raw.closed === true : false,
    };
  });
}

async function seedStoreConfig(data: SeedData): Promise<void> {
  const schedule = data.schedules?.[0] ?? {};
  const deliveryRanges = (data.deliveryRanges ?? []).map((range) => ({
    minKm: Number(range.minKm ?? 0),
    maxKm: Number(range.maxKm ?? 0),
    cost: Number(range.cost ?? range.price ?? 0),
  }));

  const config = await StoreConfig.getOrCreateConfig();
  config.set({
    isOpen: schedule.emergencyClosed ? false : true,
    emergencyClosed: schedule.emergencyClosed === true,
    bannerUrl: String(schedule.bannerUrl ?? ''),
    rain: schedule.rain ?? { enabled: false, extraCost: 0 },
    schedule: {
      timezone: String(schedule.timezone ?? 'America/Argentina/Buenos_Aires'),
      days: normalizeScheduleDays(schedule.days),
    },
    deliveryRanges,
  });
  await config.save();

  console.log(`[seed] Config lista (${config.schedule.days.length} dias, ${config.deliveryRanges.length} rangos de delivery)`);
}

/**
 * Seed inicial: crea admin, config del local y datos demo completos si existe data.json.
 * Uso: pnpm --filter @saas/backend seed
 */
async function seed(): Promise<void> {
  validateEnv();
  const ok = await connectDB();
  if (!ok) {
    console.error('[seed] Sin DB no hay nada que sembrar.');
    process.exit(1);
  }

  const data = readSeedData();

  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  if (!(await User.findOne({ email }).exec())) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: 'admin' });
    console.log(`[seed] Usuario admin creado: ${email} / ${password}`);
  } else {
    console.log(`[seed] El admin ${email} ya existe`);
  }

  await upsertMany(User, normalizeUsers(data.users), 'users');
  await upsertMany(Category, data.categories, 'categories');
  await upsertMany(AddonCategory, data.addonCategories, 'addonCategories');
  await upsertMany(Addon, normalizeAddons(data.addons), 'addons');
  await upsertMany(Product, normalizeProducts(data.products), 'products');
  await upsertMany(Order, normalizeOrders(data.orders), 'orders');
  await upsertMany(Coupon, data.coupons, 'coupons');
  await upsertMany(Daily, data.daily, 'daily');
  await upsertMany(GalleryImage, normalizeGallery(data.gallery), 'gallery');
  await seedStoreConfig(data);

  await mongoose.disconnect();
  console.log('[seed] Listo');
  process.exit(0);
}

void seed();