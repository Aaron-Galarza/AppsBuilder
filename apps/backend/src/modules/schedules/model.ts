import mongoose, { Schema } from 'mongoose';
import type { RainConfig, Schedule } from '@saas/types';

export interface DeliveryRangeDoc {
  _id: mongoose.Types.ObjectId;
  minKm: number;
  maxKm: number;
  cost: number;
}

export interface StoreConfigDoc extends mongoose.Document {
  isOpen: boolean;
  emergencyClosed: boolean;
  bannerUrl?: string;
  rain: RainConfig;
  schedule: Schedule;
  deliveryRanges: DeliveryRangeDoc[];
}

const dayScheduleSchema = new Schema(
  {
    day: { type: String, required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const deliveryRangeSchema = new Schema(
  {
    minKm: { type: Number, required: true, min: 0 },
    maxKm: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const DEFAULT_SCHEDULE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
].map((day) => ({ day, openTime: '20:00', closeTime: '23:59', closed: false }));

/**
 * Config singleton del local (solo hay un documento).
 * getOrCreateConfig() garantiza que exista.
 */
const storeConfigSchema = new Schema<StoreConfigDoc>(
  {
    isOpen: { type: Boolean, default: true },
    emergencyClosed: { type: Boolean, default: false },
    bannerUrl: { type: String, default: '' },
    rain: {
      enabled: { type: Boolean, default: false },
      extraCost: { type: Number, default: 0 },
      _id: false,
    },
    schedule: {
      timezone: { type: String, default: 'America/Argentina/Buenos_Aires' },
      days: { type: [dayScheduleSchema], default: DEFAULT_SCHEDULE_DAYS },
      _id: false,
    },
    deliveryRanges: { type: [deliveryRangeSchema], default: [] },
  },
  { timestamps: true }
);

storeConfigSchema.statics.getOrCreateConfig = async function (): Promise<StoreConfigDoc> {
  const existing = await this.findOne().exec();
  if (existing) return existing;
  return this.create({});
};

interface StoreConfigModel extends mongoose.Model<StoreConfigDoc> {
  getOrCreateConfig(): Promise<StoreConfigDoc>;
}

export const StoreConfig = mongoose.model<StoreConfigDoc, StoreConfigModel>(
  'StoreConfig',
  storeConfigSchema
);
