import { Schema, model, Document, Types } from 'mongoose';

export interface IGovernanceConfig extends Document {
  configKey: string;
  version: number;
  value: unknown;
  approved: boolean;
  required: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
}

const GovernanceConfigSchema = new Schema<IGovernanceConfig>({
  configKey: { type: String, required: true },
  version: { type: Number, required: true },
  value: { type: Schema.Types.Mixed },
  approved: { type: Boolean, default: false },
  required: { type: Boolean, default: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
});

GovernanceConfigSchema.index({ configKey: 1, version: 1 }, { unique: true });

export const GovernanceConfig = model<IGovernanceConfig>('GovernanceConfig', GovernanceConfigSchema);
