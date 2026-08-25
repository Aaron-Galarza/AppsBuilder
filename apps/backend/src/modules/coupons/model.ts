import mongoose, { Schema } from 'mongoose';
import type { Coupon as CouponType } from '@saas/types';

export interface CouponDoc extends Omit<CouponType, '_id'>, mongoose.Document {}

const couponSchema = new Schema<CouponDoc>(
  {
    code: {
      type: String,
      required: [true, 'El código es requerido'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'El tipo de descuento es requerido'],
    },
    discountValue: {
      type: Number,
      required: [true, 'El valor del descuento es requerido'],
      min: [0.01, 'El valor debe ser mayor a cero'],
    },
    active: { type: Boolean, default: true },
    validDays: { type: [Number], default: undefined },
    validPaymentMethods: { type: [String], default: undefined },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<CouponDoc>('Coupon', couponSchema);
