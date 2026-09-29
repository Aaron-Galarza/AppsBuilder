import { AnalyticsStats } from '@saas/types';
import { argDate } from '../../utils/timezone';
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
/* Lectura de métricas: en vivo desde orders (fuente única de verdad)  */
/* ------------------------------------------------------------------ */

function invalidateCache() {
  // Histórico: las métricas ya no se cachean, se agregan en vivo desde orders.
}

function emptyPaymentBreakdown() {
  return { cash: 0, debito: 0, credito: 0, transferencia: 0 };
}

export async function getAnalytics(range: AnalyticsRange): Promise<AnalyticsStats> {
  return computeFromOrders(range);
}

/**
 * Estados que cuentan como venta: solo los entregados. Pendiente/
 * Confirmado/En preparación/Listo son pedidos en curso y no impactan
 * en las métricas hasta ser entregados.
 */
const SOLD_STATES = new Set(['delivered']);

/**
 * Métricas en vivo desde la colección orders (fuente única de verdad).
 * Excluye cancelados y pedidos que aún no pasaron por "Listo"; así un
 * cambio de estado se refleja al instante sin depender de snapshots.
 */
async function computeFromOrders(range: AnalyticsRange): Promise<AnalyticsStats> {
  const { from, to } = getRangeBounds(range);

  const orders = await (await import('../orders/model')).Order.find({
    createdAt: { $gte: from, $lte: to },
  })
    .lean()
    .exec();

  const byPaymentMethod = emptyPaymentBreakdown();
  let totalOrders = 0;
  let totalRevenue = 0;
  let delivered = 0;
  const productMap = new Map<string, { title: string; quantity: number; revenue: number }>();

  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    if (!SOLD_STATES.has(order.status)) continue;

    totalOrders += 1;
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
    totalOrders,
    totalRevenue,
    delivered,
    byPaymentMethod,
    topProducts,
  };
}

export { invalidateCache };
