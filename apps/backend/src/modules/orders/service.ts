import { Types } from 'mongoose';
import { CREDIT_SURCHARGE_RATE } from '@saas/utils';
import { AppError } from '../../utils/AppError';
import { getRangeBounds, AnalyticsRange } from '../../utils/dateRange';
import { assertStoreOpen } from '../schedules/service';
import { StoreConfig } from '../schedules/model';
import { calculateDelivery } from '../delivery/service';
import { computeCouponDiscount, validateCouponForCart } from '../coupons/service';
import {
  incrementDaily,
  revertDaily,
  registerTopProduct,
} from '../analytics/service';
import { emitNewOrder } from '../../socket/socket';
import { Addon } from '../adicionales/model';
import { Product } from '../products/model';
import { Order, OrderDoc, OrderItemDoc } from './model';

interface IncomingAddon {
  addonId: string;
  quantity: number;
}

interface IncomingItem {
  productId: string;
  quantity: number;
  addons: IncomingAddon[];
}

/** Transiciones válidas de estado (delivered→cancelled revierte analytics) */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
};

async function buildOrderItems(incoming: IncomingItem[]): Promise<OrderItemDoc[]> {
  return Promise.all(
    incoming.map(async (item) => {
      const product = await Product.findById(item.productId).exec();
      if (!product) throw new AppError(404, `Producto no encontrado (${item.productId})`);
      if (!product.available) throw new AppError(409, `"${product.title}" no está disponible`);

      const resolvedAddons = await Promise.all(
        item.addons.map(async (inc) => {
          // El addon debe estar referenciado por el producto y estar disponible
          const referenced =
            !product.addons ||
            product.addons.length === 0 ||
            product.addons.some((a) => String(a._id) === inc.addonId);
          if (!referenced) {
            throw new AppError(409, `El adicional no pertenece a "${product.title}"`);
          }

          const addon = await Addon.findById(inc.addonId).exec();
          if (!addon || !addon.available) {
            throw new AppError(409, `Adicional no disponible en "${product.title}"`);
          }

          return {
            addonId: new Types.ObjectId(inc.addonId),
            name: addon.name,
            price: addon.price,
            quantity: inc.quantity,
          };
        })
      );

      const unitPrice =
        product.price +
        resolvedAddons.reduce((sum, a) => sum + a.price * a.quantity, 0);

      return {
        productId: product._id as Types.ObjectId,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        addons: resolvedAddons,
        itemTotal: Number((unitPrice * item.quantity).toFixed(2)),
      };    })
  );
}

async function nextOrderNumber(): Promise<string> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(3, 0, 0, 0); // medianoche Argentina
  const todayCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay },
  }).exec();

  const datePart = new Date()
    .toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })
    .replaceAll('-', '');

  return `${datePart}-${String(todayCount + 1).padStart(3, '0')}`;
}

/**
 * Crea un pedido.
 * - source 'manual' (pedido tomado por teléfono/WhatsApp): salta el check de local cerrado.
 * - delivery: calcula distancia/costo (+ lluvia) con la config del local.
 * - cupón: valida y aplica descuento. - crédito: recargo 15% sobre (subtotal - desc + envío).
 * Al guardar emite socket 'new-order' al room de admins.
 */
export async function createOrder(payload: {
  customer: { name: string; phone: string };
  items: IncomingItem[];
  deliveryType?: 'pickup' | 'delivery';
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
  delivery?: { address: string; lat?: number; lng?: number };
  source?: 'web' | 'manual';
}): Promise<OrderDoc> {
  const isManual = payload.source === 'manual';

  if (!isManual) {
    await assertStoreOpen();
  }

  // 1. Snapshot de productos + adicionales
  const items = await buildOrderItems(payload.items);
  const subtotal = Number(items.reduce((sum, i) => sum + i.itemTotal, 0).toFixed(2));

  // 2. Cupón
  let discount = 0;
  let couponCode: string | undefined;
  if (payload.couponCode) {
    const coupon = await validateCouponForCart(payload.couponCode, payload.paymentMethod as never, subtotal);
    discount = computeCouponDiscount(coupon, subtotal);
    couponCode = coupon.code;
  }

  // 3. Delivery
  const deliveryType = payload.deliveryType ?? (isManual ? 'pickup' : 'pickup');
  let deliveryCost = 0;

  if (deliveryType === 'delivery') {
    if (!payload.delivery?.address) {
      throw new AppError(400, 'Falta la dirección de entrega');
    }
    if (typeof payload.delivery.lat === 'number' && typeof payload.delivery.lng === 'number') {
      const calc = await calculateDelivery(payload.delivery.lat, payload.delivery.lng);
      deliveryCost = calc.deliveryCost;
    } else if (isManual) {
      // Pedido manual sin coordenadas: costo lo define el admin después
      deliveryCost = 0;
    } else {
      throw new AppError(
        422,
        'No pudimos ubicar tu dirección. Coordiná el envío por WhatsApp.'
      );
    }
  }

  // 4. Totales (recargo crédito igual que el frontend)
  const baseTotal = subtotal - discount + deliveryCost;
  const surcharge =
    payload.paymentMethod === 'credito'
      ? Math.round(baseTotal * CREDIT_SURCHARGE_RATE)
      : 0;
  const total = Number((baseTotal + surcharge).toFixed(2));

  // 5. Guardar
  const order = await Order.create({
    orderNumber: await nextOrderNumber(),
    customer: payload.customer,
    items,
    deliveryType,
    deliveryAddress:
      deliveryType === 'delivery' ? payload.delivery?.address : undefined,
    deliveryCoordinates:
      typeof payload.delivery?.lat === 'number' && typeof payload.delivery?.lng === 'number'
        ? { lat: payload.delivery.lat, lng: payload.delivery.lng }
        : undefined,
    deliveryCost,
    paymentMethod: payload.paymentMethod,
    couponCode,
    discount,
    surcharge,
    subtotal,
    total,
    status: 'pending',
    notes: payload.notes,
    source: isManual ? 'manual' : 'web',
  });

  // 6. Notificar a los admins conectados
  try {
    emitNewOrder(order);
  } catch (err) {
    console.warn('[orders] Socket no disponible:', err instanceof Error ? err.message : err);
  }

  return order;
}

/** Pedidos por rango (admin) */
export async function getOrdersByRange(range: AnalyticsRange): Promise<OrderDoc[]> {
  const { from, to } = getRangeBounds(range);
  return Order.find({ createdAt: { $gte: from, $lte: to } })
    .sort({ createdAt: -1 })
    .limit(500)
    .exec();
}

/**
 * Cambia el estado validando transiciones.
 * delivered → registra métricas del día; cancelado desde delivered → las revierte.
 */
export async function updateOrderStatus(id: string, nextStatus: string): Promise<OrderDoc> {
  const order = await Order.findById(id).exec();
  if (!order) throw new AppError(404, 'Pedido no encontrado');

  const allowed = STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(409, `No se puede pasar de "${order.status}" a "${nextStatus}"`);
  }

  const previous = order.status;
  order.status = nextStatus;
  await order.save();

  if (nextStatus === 'delivered') {
    await Promise.all([
      incrementDaily(order),
      registerTopProduct(order),
    ]);
  }

  if (previous === 'delivered' && nextStatus === 'cancelled') {
    await Promise.all([
      revertDaily(order),
      revertTopProduct(order),
    ]);
  }

  return order;
}

async function revertTopProduct(order: OrderDoc): Promise<void> {
  const { revertTopProducts } = await import('../analytics/service');
  await revertTopProducts(order);
}
