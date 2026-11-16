import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  purchaseId: Types.ObjectId;
  providerPaymentId: string;
  providerSignature?: string;
  amountPaise: number;
  status: string;
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPayment>({
  purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase', required: true },
  providerPaymentId: { type: String, unique: true, required: true },
  providerSignature: String,
  amountPaise: { type: Number, required: true },
  status: { type: String, required: true },
  paidAt: Date,
});

export const Payment = model<IPayment>('Payment', PaymentSchema);
