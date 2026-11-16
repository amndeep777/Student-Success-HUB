import { Schema, model, Document, Types } from 'mongoose';

export interface IRefund extends Document {
  paymentId: Types.ObjectId;
  providerRefundId?: string;
  amountPaise: number;
  status: string;
  reason?: string;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefund>({
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  providerRefundId: { type: String, unique: true, sparse: true },
  amountPaise: { type: Number, required: true },
  status: { type: String, default: 'requested' },
  reason: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Refund = model<IRefund>('Refund', RefundSchema);
