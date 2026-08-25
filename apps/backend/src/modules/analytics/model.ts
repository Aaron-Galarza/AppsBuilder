import mongoose, { Schema } from 'mongoose';

export interface DailyTopProduct {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
}

export interface DailyDoc extends mongoose.Document {
  /** "YYYY-MM-DD" en timezone Argentina */
  date: string;
  orders: number;
  revenue: number;
  delivered: number;
  cancelled: number;
  byPaymentMethod: {
    cash: number;
    debito: number;
    credito: number;
    transferencia: number;
  };
  topProducts: DailyTopProduct[];
}

const dailySchema = new Schema<DailyDoc>(
  {
    date: { type: String, required: true, unique: true },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    byPaymentMethod: {
      cash: { type: Number, default: 0 },
      debito: { type: Number, default: 0 },
      credito: { type: Number, default: 0 },
      transferencia: { type: Number, default: 0 },
      _id: false,
    },
    topProducts: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export const Daily = mongoose.model<DailyDoc>('Daily', dailySchema);
