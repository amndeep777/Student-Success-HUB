import { Schema, model, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  providerSubscriptionId: string;
  status: string;
  currentPeriodEnd?: Date;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  providerSubscriptionId: { type: String, unique: true, required: true },
  status: { type: String, required: true },
  currentPeriodEnd: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Subscription = model<ISubscription>('Subscription', SubscriptionSchema);
