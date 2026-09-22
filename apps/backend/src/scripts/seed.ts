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
import { SEED } from './seedData';

type RawDoc = Record<string, unknown> & { _id?: unknown };
type GeneratedOrder = RawDoc & {
  _id: Types.ObjectId;
  orderNumber: string;
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const ARG_TZ = 'America/Argentina/Buenos_Aires';

// ══════════════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════════════

function objectId(id: unknown): Types.ObjectId | undefined {
  if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return undefined;
  return new Types.ObjectId(id);
}

type UpsertKey = '_id' | 'email' | 'orderNumber' | 'date';

function withObjectId(doc: RawDoc): Record<string, unknown> {
  const next: Record<string, unknown> = { ...doc };
  const _id = objectId(doc._id);
  if (_id) next._id = _id;
  return next;
}

async function upsertMany(
  model: mongoose.Model<any>,
  docs: RawDoc[] | undefined,
  label: string,
  key: UpsertKey = '_id'
): Promise<void> {
  const normalized = (docs ?? [])
    .map(withObjectId)
    .filter((doc): doc is Record<string, unknown> => doc[key] != null);

  if (normalized.length === 0) {
    console.log(`[seed] ${label}: 0 documentos`);
    return;
  }

  await model.bulkWrite(
    normalized.map((doc) => {
      const $set: Record<string, unknown> = { ...doc };
      if (key !== '_id') delete $set._id;
      return {
        updateOne: {
          filter: { [key]: doc[key] } as Record<string, unknown>,
          update: { $set },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );

  console.log(`[seed] ${label}: ${normalized.length} documentos listos`);
}

/**
 * Igual que upsertMany pero escribiendo DIRECTO con la colección raw de MongoDB,
 * SIN los transform de timestamps de Mongoose. Necesario para orders/daily, donde
 * el seed debe conservar createdAt/updatedAt históricos (días pasados) y Mongoose
 * los pisa con "ahora" en bulkWrite.
 */
async function upsertManyRaw(
  model: mongoose.Model<any>,
  docs: RawDoc[] | undefined,
  label: string,
  key: UpsertKey
): Promise<void> {
  const normalized = (docs ?? [])
    .map(withObjectId)
    .filter((doc): doc is Record<string, unknown> => doc[key] != null);

  if (normalized.length === 0) {
    console.log(`[seed] ${label}: 0 documentos`);
    return;
  }

  await model.collection.bulkWrite(
    normalized.map((doc) => {
      const $set: Record<string, unknown> = { ...doc };
      delete $set._id;
      return {
        updateOne: {
          filter: { [key]: doc[key] },
          update: { $set },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );

  console.log(`[seed] ${label}: ${normalized.length} documentos listos`);
}

function normalizeUsers(users: RawDoc[] | undefined): RawDoc[] {
  return (users ?? []).map((user) => ({
    ...withObjectId(user),
    email: String(user.email ?? 'admin@local.dev').toLowerCase(),
    role: user.role ?? 'admin',
  }));
}

/**
 * Usuarios del seed: al admin se le aplica el email/password de las env
 * (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) y todos quedan con el mismo
 * passwordHash para poder loguearse con la demo.
 */
function prepareUsers(passwordHash: string): RawDoc[] {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev').toLowerCase();
  const [admin, ...rest] = normalizeUsers(SEED.users);
  return [{ ...admin, email: adminEmail, passwordHash }, ...rest.map((user) => ({ ...user, passwordHash }))];
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

// ══════════════════════════════════════════════════════════════════════════════
// Datos dinámicos: pedidos y daily relativos a hoy
// ══════════════════════════════════════════════════════════════════════════════

const CUSTOMER_NAMES = ['María López', 'Carlos García', 'Ana Martínez', 'Roberto Sánchez', 'Lucía Fernández', 'Pedro Gómez', 'Sofía Romero', 'Martín Ruiz', 'Camila Torres', 'Nicolás Aguirre'];
const CUSTOMER_PHONES = ['1155551234', '1166667890', '1177778888', '1188889999', '1199990000', '1144445555', '1166001122', '1133332211', '1122223344', '1122113344'];
const PAYMENT_METHODS = ['cash', 'debito', 'credito', 'transferencia'] as const;
const ADDRESSES = ['Av. Corrientes 1234', 'Av. Santa Fe 4567', 'Av. Libertador 800', 'Calle Uruguay 1500', 'Av. Callao 500'];
const DELIVERY_RANGE_COSTS = [0, 300, 500, 800, 1200];

function dateKeyIn(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ARG_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function hoursMinutes(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: ARG_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Genera pedidos para los últimos DAYS_TO_BACK días (incluido hoy) referenciando productos reales del seed. */
function generateOrders(): GeneratedOrder[] {
  const products = SEED.products as RawDoc[];
  const addons = SEED.addons as RawDoc[];
  const productsByOrder = [
    products[0], products[0], products[1], products[3], products[6], products[6], products[10], products[16], products[21], products[2],
  ];
  const DAYS_TO_BACK = 7;
  const orders: GeneratedOrder[] = [];
  const seqByDay = new Map<string, number>();

  for (let back = DAYS_TO_BACK - 1; back >= 0; back--) {
    const day = new Date();
    day.setDate(day.getDate() - back);

    const count = back < 2 ? 4 + (back % 2) : 2 + ((back * 7) % 4); // hoy/ayer más activos
    const dateStr = dateKeyIn(day);

    for (let i = 0; i < count; i++) {
      const isToday = back === 0;
      const now = new Date();
      let at: Date;
      if (isToday) {
        // Hoy: órdenes SIEMPRE en el pasado (últimas ~2 h) para que el rango
        // 'hoy' de analytics/orders las incluya — la hora pseudoaleatoria podía
        // caer a futuro (por ej. 23:17) y el dashboard las ignoraba.
        const seconds = (count - i) * 541 + i * 37;
        at = new Date(now.getTime() - seconds * 1000);
      } else {
        const hour = 11 + ((Math.abs(i * 3 + back * 5) * 7) % 12); // 11:00 a 22:00
        const minute = (Math.abs(i * 17 + back * 13) % 60);
        at = new Date(day);
        at.setHours(hour, minute, 0, 0);
      }

      const status = isToday
        ? (['pending', 'confirmed', 'preparing', 'ready', 'delivered'] as const)[i % 5]
        : (['delivered', 'delivered', 'delivered', 'cancelled'] as const)[i % 4];

      const deliveryType: 'pickup' | 'delivery' = i % 3 === 0 ? 'delivery' : 'pickup';
      const payment = PAYMENT_METHODS[i % PAYMENT_METHODS.length];

      const itemCount = 1 + (i % 3);
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const product = productsByOrder[(i + j * 2 + back) % productsByOrder.length] ?? products[0];
        const productId = objectId(product._id) ?? new Types.ObjectId();
        const quantity = 1 + ((i + j) % 2);
        const includeAddons = Array.isArray(product.addons) && (product.addons as unknown[]).length > 0 && i % 2 === 0;
        const selectedAddons = includeAddons
          ? (product.addons as unknown[])
              .slice(0, 1)
              .map((id) => {
                const addon = addons.find((a) => a._id === id);
                return {
                  addonId: objectId(id) ?? new Types.ObjectId(),
                  name: String(addon?.name ?? 'Adicional'),
                  price: Number(addon?.price ?? 0),
                  quantity,
                };
              })
          : [];
        const base = Number(product.price ?? 0);
        const addonTotal = selectedAddons.reduce((s, a) => s + a.price * a.quantity, 0);
        const unitTotal = round((base + addonTotal) * quantity);
        items.push({
          productId,
          title: String(product.title ?? 'Producto'),
          price: base,
          quantity,
          addons: selectedAddons,
          itemTotal: unitTotal,
        });
      }

      const subtotal = round(items.reduce((s, it) => s + it.itemTotal, 0));
      const deliveryCost = deliveryType === 'delivery' ? DELIVERY_RANGE_COSTS[i % DELIVERY_RANGE_COSTS.length] : 0;
      const surcharge = payment === 'credito' ? round(subtotal * 0.15) : 0;
      const total = round(subtotal + deliveryCost + surcharge);

      const seq = seqByDay.get(dateStr) ?? 0;
      seqByDay.set(dateStr, seq + 1);
      const orderNumber = `${dateStr.replace(/-/g, '')}-${String(seq + 1).padStart(3, '0')}`;

      orders.push({
        _id: new Types.ObjectId(),
        orderNumber,
        customer: { name: CUSTOMER_NAMES[(i + back) % CUSTOMER_NAMES.length], phone: CUSTOMER_PHONES[(i + back) % CUSTOMER_PHONES.length] },
        items,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? ADDRESSES[i % ADDRESSES.length] : undefined,
        deliveryCoordinates: deliveryType === 'delivery' ? { lat: -34.6 + (i % 5) * 0.01, lng: -58.38 + (i % 4) * 0.01 } : undefined,
        deliveryCost,
        paymentMethod: payment,
        couponCode: null,
        discount: 0,
        surcharge,
        subtotal,
        total,
        status,
        notes: i % 4 === 0 ? 'Sin cebolla en un producto' : null,
        source: i % 5 === 0 ? 'manual' : 'web',
        createdAt: at,
        updatedAt: at,
      });
    }
  }

  return orders;
}

/** Agrega pedidos generados en documentos daily por día. */
function buildDaily(orders: GeneratedOrder[]): RawDoc[] {
  const byDay = new Map<string, { orders: number; delivered: number; cancelled: number; revenue: number; byPaymentMethod: Record<string, number>; topProducts: Map<string, { qty: number; revenue: number }> }>();

  for (const order of orders) {
    const date = dateKeyIn(order.createdAt as Date);
    const acc = byDay.get(date) ?? {
      orders: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
      byPaymentMethod: { cash: 0, debito: 0, credito: 0, transferencia: 0 },
      topProducts: new Map<string, { qty: number; revenue: number }>(),
    };

    acc.orders += 1;
    if (order.status === 'delivered') acc.delivered += 1;
    if (order.status === 'cancelled') acc.cancelled += 1;
    acc.revenue = round(acc.revenue + Number(order.total ?? 0));
    acc.byPaymentMethod[String(order.paymentMethod)] = round(
      (acc.byPaymentMethod[String(order.paymentMethod)] ?? 0) + Number(order.total ?? 0)
    );

    for (const item of (order.items ?? []) as Array<{ productId: unknown; title: string; quantity: number; itemTotal: number }>) {
      const title = item.title;
      const prev = acc.topProducts.get(title) ?? { qty: 0, revenue: 0 };
      prev.qty += item.quantity;
      prev.revenue = round(prev.revenue + item.itemTotal);
      acc.topProducts.set(title, prev);
    }

    byDay.set(date, acc);
  }

  const days = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return days.map(([date, acc]) => ({
    _id: new Types.ObjectId(),
    date,
    orders: acc.orders,
    delivered: acc.delivered,
    cancelled: acc.cancelled,
    revenue: acc.revenue,
    byPaymentMethod: acc.byPaymentMethod,
    topProducts: [...acc.topProducts.entries()]
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([title, v]) => ({ productId: '', title, quantity: v.qty, revenue: v.revenue })),
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// StoreConfig
// ══════════════════════════════════════════════════════════════════════════════

async function seedStoreConfig(): Promise<void> {
  const schedule = SEED.schedules[0];
  const deliveryRanges = (SEED.deliveryRanges ?? []).map((range) => ({
    minKm: Number(range.minKm ?? 0),
    maxKm: Number(range.maxKm ?? 0),
    cost: Number(range.cost ?? range.price ?? 0),
  }));

  const config = await StoreConfig.getOrCreateConfig();
  config.set({
    isOpen: schedule.emergencyClosed ? false : true,
    emergencyClosed: schedule.emergencyClosed === true,
    bannerUrl: String(schedule.bannerUrl ?? ''),
    rain: { enabled: false, extraCost: 0 },
    schedule: {
      timezone: String(schedule.timezone ?? ARG_TZ),
      days: normalizeScheduleDays(schedule.days),
    },
    deliveryRanges,
  });
  await config.save();

  console.log(`[seed] Config lista (${config.schedule.days.length} dias, ${config.deliveryRanges.length} rangos de delivery)`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Seed principal
// ══════════════════════════════════════════════════════════════════════════════

async function seed(): Promise<void> {
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  await upsertMany(User, prepareUsers(passwordHash), 'users', 'email');
  console.log(`[seed] Admin: ${(process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev').toLowerCase()} / ${password}`);
  await upsertMany(Category, SEED.categories, 'categories');
  await upsertMany(AddonCategory, SEED.addonCategories, 'addonCategories');
  await upsertMany(Addon, normalizeAddons(SEED.addons), 'addons');
  await upsertMany(Product, normalizeProducts(SEED.products), 'products');
  await upsertMany(Coupon, SEED.coupons, 'coupons');
  await upsertMany(GalleryImage, normalizeGallery(SEED.gallery), 'gallery');
  await seedStoreConfig();

  const orders = generateOrders();

  // Los pedidos se upsertan por orderNumber (idempotente) y por la colección raw
  // para conservar createdAt/updatedAt históricos (los que usa el dashboard).
  await upsertManyRaw(Order, orders, 'orders', 'orderNumber');
  await upsertManyRaw(Daily, buildDaily(orders), 'daily', 'date');

  // Inicializa el contador atómico de números de pedido por día para que los
  // pedidos reales SIGAN después de los demo (20260918 ya usó -001..-004).
  await seedOrderCounters(orders);

  console.log(`[seed] Pedidos demo: ${orders.length} (relativos a hoy, para dashboard con datos)`);
}

/**
 * Sincroniza el contador `ordercounters` (mismo mecanismo que nextOrderNumber en
 * orders/service.ts) con el máximo secuencial generado por día. Evita que un
 * pedido real colisione con los numbers demo (E11000 en orderNumber).
 */
async function seedOrderCounters(orders: GeneratedOrder[]): Promise<void> {
  const byDay = new Map<string, number>();
  for (const order of orders) {
    const [day, seqStr] = String(order.orderNumber).split('-');
    const seq = Number(seqStr ?? 0);
    byDay.set(day, Math.max(byDay.get(day) ?? 0, seq));
  }

  const counters = mongoose.connection.db!.collection<{ _id: string; seq: number }>('ordercounters');
  for (const [day, seq] of byDay) {
    await counters.updateOne(
      { _id: day },
      { $set: { seq }, $setOnInsert: { _id: day } },
      { upsert: true }
    );
  }
  console.log(`[seed] Contador de pedidos sincronizado (${byDay.size} días)`);
}

/**
 * Auto-seed: detecta si la base está totalmente vacía y, si lo está, la puebla
 * con lo necesario para que el proyecto funcione completo.
 * NO toca nada si la base ya tiene contenido (evita pisar datos reales).
 */
export async function ensureSeeded(): Promise<void> {
  const collections = [
    { model: User, label: 'users' },
    { model: Product, label: 'products' },
    { model: Category, label: 'categories' },
    { model: Order, label: 'orders' },
    { model: StoreConfig, label: 'storeconfig' },
  ] as const;

  const counts = await Promise.all(collections.map((c) => c.model.countDocuments().exec()));
  const total = counts.reduce((s, n) => s + n, 0);

  if (total > 0) {
    console.log(`[seed] Base con contenido (${total} docs). Auto-seed omitido.`);
    return;
  }

  console.log('[seed] Base vacía detectada - sembrando datos para el proyecto completo...');
  await seed();
  console.log('[seed] Auto-seed completo.');
}

/**
 * Seed de arranque (CLI): puebla la base sin importar su estado (upsert).
 * Uso: pnpm --filter @saas/backend seed
 */
async function seedCLI(): Promise<void> {
  validateEnv();
  const ok = await connectDB();
  if (!ok) {
    console.error('[seed] Sin DB no hay nada que sembrar.');
    process.exit(1);
  }

  // SEED_REFRESH_DEMO=1: re-rola la línea de tiempo de los pedidos demo a las
  // fechas actuales. Sin esto, al pasar los días el dashboard "hoy" queda en 0
  // porque las órdenes quedaron clavadas al día de la primera siembra.
  // Úselo SOLO si los pedidos existentes son 100% demo (borra orders + daily).
  const refreshDemo = (process.env.SEED_REFRESH_DEMO ?? '').trim() === '1';
  if (refreshDemo) {
    await Order.collection.deleteMany({});
    await Daily.collection.deleteMany({});
    await mongoose.connection.db!.collection('ordercounters').deleteMany({});
    console.log('[seed] SEED_REFRESH_DEMO=1: pedidos, daily y contadores demo eliminados');
  }

  await seed();
  await mongoose.disconnect();
  console.log('[seed] Listo');
  process.exit(0);
}

// CLI: se ejecuta solo cuando se corre `pnpm --filter @saas/backend seed`
if (process.argv[1] && /seed(\.ts|\.js)?$/.test(process.argv[1])) {
  void seedCLI();
}