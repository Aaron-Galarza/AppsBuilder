import { AnalyticsStats } from '@saas/types';
import { argDate, argToUTC } from '../../utils/timezone';
import { getRangeBounds, AnalyticsRange } from '../../utils/dateRange';
import type { OrderDoc } from '../orders/model';
import { Daily, DailyDoc, DailyTopProduct } from './model';

/* ------------------------------------------------------------------ */
/* Registro incremental (lo dispara orders.service)                    */
/* ------------------------------------------------------------------ */

async function upsertDaily(date: string): Promise<DailyDoc> {
  return (
    (await Daily.findOneAndUpdate({ date }, { $setOnInsert: { date } }, { new: true, upsert: true }).exec()) ??
    (await Daily.findOne({ date }).exec())!
  );
}

/** Pedido nuevo → suma al día */
export async function incrementDaily(order: OrderDoc): Promise<void> {
  const date = argDate(order.createdAt ?? new Date());
  const daily = await upsertDaily(date);
  const method = order.paymentMethod as keyof DailyDoc['byPaymentMethod'];

  daily.orders += 1;
  if (method in daily.byPaymentMethod) {
    daily.byPaymentMethod[method] += order.total;
  }
  await daily.save();
}

/** delivered → cuenta entrega y revenue */
export async function registerTopProduct(order: OrderDoc): Promise<void> {
  const date = argDate(order.updatedAt ?? new Date());
  const daily = await upsertDaily(date);

  daily.delivered += 1;
  daily.revenue += order.total;

  for (const item of order.items) {
    const existing = daily.topProducts.find(
      (t) => t.productId === String(item.productId)
    );
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.itemTotal;
    } else {
      daily.topProducts.push({
        productId: String(item.productId),
        title: item.title,
        quantity: item.quantity,
        revenue: item.itemTotal,
      } satisfies DailyTopProduct);
    }
  }

  invalidateCache();
  await daily.save();
}

/** Cancelado después de delivered → revierte payment breakdown y cancelled count */
export async function revertDaily(order: OrderDoc): Promise<void> {
  const date = argDate(order.createdAt ?? new Date());
  const daily = await Daily.findOne({ date }).exec();
  if (!daily) return;

  daily.cancelled += 1;

  // Revertir el monto del método de pago para que no quede inflado
  const method = order.paymentMethod as keyof DailyDoc['byPaymentMethod'];
  if (method in daily.byPaymentMethod) {
    daily.byPaymentMethod[method] = Math.max(0, daily.byPaymentMethod[method] - order.total);
  }

  await daily.save();
}

export async function revertTopProducts(order: OrderDoc): Promise<void> {
  const date = argDate(order.updatedAt ?? new Date());
  const daily = await Daily.findOne({ date }).exec();
  if (!daily) return;

  daily.delivered = Math.max(0, daily.delivered - 1);
  daily.revenue = Math.max(0, daily.revenue - order.total);

  for (const item of order.items) {
    const existing = daily.topProducts.find((t) => t.productId === String(item.productId));
    if (existing) {
      existing.quantity = Math.max(0, existing.quantity - item.quantity);
      existing.revenue = Math.max(0, existing.revenue - item.itemTotal);
    }
  }

  invalidateCache();
  await daily.save();
}

/* ------------------------------------------------------------------ */
/* Lectura agregada para el OverviewTab                                */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  data: AnalyticsStats;
  expiresAt: number;
}

/** TTL: 5 min para hoy/semana, 10 min para mes */
const cache = new Map<AnalyticsRange, CacheEntry>();
function ttlFor(range: AnalyticsRange) {
  return (range === 'mes' ? 10 : 5) * 60 * 1000;
}
function invalidateCache() {
  cache.clear();
}

function emptyPaymentBreakdown() {
  return { cash: 0, debito: 0, credito: 0, transferencia: 0 };
}

export async function getAnalytics(range: AnalyticsRange): Promise<AnalyticsStats> {
  const cached = cache.get(range);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const stats = await computeAnalytics(range).catch(async (err) => {
    console.warn('[analytics] Falló la lectura de dailies:', err instanceof Error ? err.message : err);
    // Fallback: agregación directa sobre orders (por si los dailies no existen)
    return computeAnalyticsFromOrders(range);
  });

  cache.set(range, { data: stats, expiresAt: Date.now() + ttlFor(range) });
  return stats;
}

async function computeAnalytics(range: AnalyticsRange): Promise<AnalyticsStats> {
  const { from, to } = getRangeBounds(range);

  // Fechas calendario argentinas dentro del rango
  const dates: string[] = [];
  const cursor = new Date(from.getTime());
  while (cursor <= to) {
    dates.push(argDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    cursor.setUTCHours(3, 0, 0, 0);
  }

  const dailies = await Daily.find({ date: { $in: dates } }).lean().exec();

  const byPaymentMethod = emptyPaymentBreakdown();
  let totalOrders = 0;
  let totalRevenue = 0;
  let delivered = 0;

  const productMap = new Map<string, { title: string; quantity: number; revenue: number }>();

  for (const daily of dailies) {
    totalOrders += daily.orders;
    totalRevenue += daily.revenue;
    delivered += daily.delivered;
    for (const key of Object.keys(byPaymentMethod) as Array<keyof typeof byPaymentMethod>) {
      byPaymentMethod[key] += daily.byPaymentMethod[key] ?? 0;
    }
    for (const t of daily.topProducts) {
      const acc = productMap.get(t.productId) ?? { title: t.title, quantity: 0, revenue: 0 };
      acc.quantity += t.quantity;
      acc.revenue += t.revenue;
      productMap.set(t.productId, acc);
    }
  }

  const topProducts = [...productMap.entries()]
    .map(([productId, acc]) => ({ productId, ...acc }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    totalOrders,
    totalRevenue,
    delivered,
    byPaymentMethod,
    topProducts,
  };
}

/**
 * Fallback sin dailies: agrega directo sobre la colección orders
 * (útil tras un deploy o si el registro incremental se perdió).
 */
async function computeAnalyticsFromOrders(range: AnalyticsRange): Promise<AnalyticsStats> {
  const { from, to } = getRangeBounds(range);

  const orders = await (await import('../orders/model')).Order.find({
    createdAt: { $gte: from, $lte: to },
  })
    .lean()
    .exec();

  const byPaymentMethod = emptyPaymentBreakdown();
  let totalRevenue = 0;
  let delivered = 0;
  const productMap = new Map<string, { title: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    totalRevenue += order.total;
    if (order.status === 'delivered') delivered += 1;
    const key = order.paymentMethod as keyof typeof byPaymentMethod;
    if (key in byPaymentMethod) byPaymentMethod[key] += order.total;
    for (const item of order.items) {
      const id = String(item.productId);
      const acc = productMap.get(id) ?? { title: item.title, quantity: 0, revenue: 0 };
      acc.quantity += item.quantity;
      acc.revenue += item.itemTotal;
      productMap.set(id, acc);
    }
  }

  const topProducts = [...productMap.entries()]
    .map(([productId, acc]) => ({ productId, ...acc }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    totalOrders: orders.length,
    totalRevenue,
    delivered,
    byPaymentMethod,
    topProducts,
  };
}

export { invalidateCache };
