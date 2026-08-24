import { CartItem } from './cart';
import { Coupon } from './coupon';
import { DeliveryType, DeliveryCoordinates } from './delivery';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

/**
 * Item de una orden. Se genera a partir del carrito al confirmar el pedido,
 * por lo que comparte la forma de CartItem.
 */
export type OrderItem = CartItem;

export interface OrderCustomer {
  name: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryCoordinates?: DeliveryCoordinates;
  deliveryCost: number;
  paymentMethod: string;
  coupon?: Coupon;
  subtotal: number;
  discount: number;
  /** Recargo por pago con crédito (15%) */
  surcharge: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
}
