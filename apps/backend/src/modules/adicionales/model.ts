import mongoose, { Schema, Types } from 'mongoose';
import type { Addon as AddonType } from '@saas/types';

export interface AddonDoc
  extends Omit<AddonType, '_id' | 'categories'>,
    mongoose.Document {
  categories: Types.ObjectId[];
}

const addonSchema = new Schema<AddonDoc>(
  {
    name: { type: String, required: [true, 'El nombre es requerido'], trim: true },
    price: { type: Number, required: [true, 'El precio es requerido'], min: 0 },
    available: { type: Boolean, default: true },
    categories: [
      { type: Schema.Types.ObjectId, ref: 'AddonCategory', default: [] },
    ],
  },
  { timestamps: true }
);

export const Addon = mongoose.model<AddonDoc>('Addon', addonSchema);
