import { Schema, model, Document, Types } from 'mongoose';

export interface IPrice extends Document {
  planId: Types.ObjectId;
  productType: string;
  amountPaise: number;
  currency: string;
  interval?: string;
  metadata: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
}

const PriceSchema = new Schema<IPrice>({
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  productType: { type: String, required: true },
  amountPaise: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  interval: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
  active: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Price = model<IPrice>('Price', PriceSchema);
