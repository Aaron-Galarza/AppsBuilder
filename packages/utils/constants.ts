import type { OrderStatus, PaymentMethod, DeliveryType } from '@saas/types';

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending',    label: 'Pendiente',  color: '#f59e0b' },
  { value: 'confirmed',  label: 'Confirmado', color: '#3b82f6' },
  { value: 'preparing',  label: 'En preparación', color: '#8b5cf6' },
  { value: 'ready',      label: 'Listo',      color: '#06b6d4' },
  { value: 'delivered',  label: 'Entregado',  color: '#22c55e' },
  { value: 'cancelled',  label: 'Cancelado',  color: '#ef4444' },
];

/** Transiciones de estado permitidas (mismo orden que STATUS_TRANSITIONS del backend) */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',          label: 'Efectivo' },
  { value: 'debito',        label: 'Débito' },
  { value: 'credito',       label: 'Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
];

export const DELIVERY_TYPES: { value: DeliveryType; label: string }[] = [
  { value: 'delivery', label: 'Envío a domicilio' },
  { value: 'pickup',   label: 'Retiro en local' },
];

/** Recargo aplicado cuando el pago es con crédito */
export const CREDIT_SURCHARGE_RATE = 0.15;
