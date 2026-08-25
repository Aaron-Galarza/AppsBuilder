import mongoose, { Schema } from 'mongoose';

export interface AddonCategoryDoc extends mongoose.Document {
  name: string;
  active: boolean;
}

/** Agrupador de adicionales (ej: "Extras", "Salsas") */
const addonCategorySchema = new Schema<AddonCategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AddonCategory = mongoose.model<AddonCategoryDoc>(
  'AddonCategory',
  addonCategorySchema
);
