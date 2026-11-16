import { Schema, model, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  priceId: Types.ObjectId;
  providerOrderId?: string;
  amountPaise: number;
  currency: string;
  status: string;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priceId: { type: Schema.Types.ObjectId, ref: 'Price', required: true },
  providerOrderId: { type: String, unique: true, sparse: true },
  amountPaise: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'created' },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema);
