import mongoose, { Schema } from 'mongoose';
import type { Product as ProductType } from '@saas/types';

export interface ProductDoc extends Omit<ProductType, '_id' | 'addons'>, mongoose.Document {
  addons?: mongoose.Types.ObjectId[];
}

const productSchema = new Schema<ProductDoc>(
  {
    title: { type: String, required: [true, 'El título es requerido'], trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: [true, 'El precio es requerido'], min: [0, 'El precio no puede ser negativo'] },
    image: { type: String, default: '' },
    category: { type: String, required: [true, 'La categoría es requerida'] },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    controlStock: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    promotionalLabel: { type: String, default: '' },
    addons: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

export const Product = mongoose.model<ProductDoc>('Product', productSchema);
