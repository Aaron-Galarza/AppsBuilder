import mongoose, { Schema } from 'mongoose';
import type { Category as CategoryType } from '@saas/types';

export interface CategoryDoc extends Omit<CategoryType, '_id'>, mongoose.Document {}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: [true, 'El nombre es requerido'], trim: true },
    icon: { type: String, default: 'utensils' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });

export const Category = mongoose.model<CategoryDoc>('Category', categorySchema);
