import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  paymentId: Types.ObjectId;
  invoiceNumber: string;
  amountPaise: number;
  currency: string;
  issuedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  invoiceNumber: { type: String, unique: true, required: true },
  amountPaise: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  issuedAt: { type: Date, default: Date.now },
});

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
