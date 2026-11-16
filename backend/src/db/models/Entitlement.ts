import { Schema, model, Document, Types } from 'mongoose';

export interface IEntitlement extends Document {
  userId: Types.ObjectId;
  entitlementKey: string;
  sourceType: string;
  sourceId: string;
  validFrom: Date;
  validUntil?: Date;
}

const EntitlementSchema = new Schema<IEntitlement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entitlementKey: { type: String, required: true },
  sourceType: { type: String, required: true },
  sourceId: { type: String, required: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
});

EntitlementSchema.index({ userId: 1, entitlementKey: 1, sourceId: 1 }, { unique: true });

export const Entitlement = model<IEntitlement>('Entitlement', EntitlementSchema);
