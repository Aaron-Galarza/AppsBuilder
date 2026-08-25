import mongoose, { Schema } from 'mongoose';
import { ORDER_STATUSES } from '@saas/utils';

export interface OrderAddon {
  addonId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItemDoc {
  productId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  addons: OrderAddon[];
  itemTotal: number;
}

export interface OrderDoc extends mongoose.Document {
  orderNumber: string;
  customer: { name: string; phone: string };
  items: OrderItemDoc[];
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number };
  deliveryCost: number;
  paymentMethod: string;
  couponCode?: string;
  discount: number;
  surcharge: number;
  subtotal: number;
  total: number;
  status: string;
  notes?: string;
  source?: 'web' | 'manual';
  createdAt?: Date;
  updatedAt?: Date;
}

const orderAddonSchema = new Schema<OrderAddon>(
  {
    addonId: { type: Schema.Types.ObjectId, ref: 'Addon', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    addons: { type: [orderAddonSchema], default: [] },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const VALID_STATUSES = ORDER_STATUSES.map((s) => s.value);

const orderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      _id: false,
    },
    items: { type: [orderItemSchema], validate: (v: unknown[]) => v.length > 0 },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryAddress: { type: String },
    deliveryCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
      _id: false,
    },
    deliveryCost: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'debito', 'credito', 'transferencia'],
      required: true,
    },
    couponCode: { type: String },
    discount: { type: Number, default: 0 },
    surcharge: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'pending',
      index: true,
    },
    notes: { type: String, max: 300 },
    source: { type: String, enum: ['web', 'manual'], default: 'web' },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<OrderDoc>('Order', orderSchema);
