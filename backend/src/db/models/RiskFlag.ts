import { Schema, model, Document, Types } from 'mongoose';

export interface IRiskFlag extends Document {
  studentId: Types.ObjectId;
  ruleKey: string;
  ruleVersion: number;
  explanation: string;
  status: 'pending_review' | 'reviewed' | 'dismissed' | 'support_started';
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const RiskFlagSchema = new Schema<IRiskFlag>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  ruleKey: { type: String, required: true },
  ruleVersion: { type: Number, required: true },
  explanation: { type: String, required: true },
  status: { type: String, enum: ['pending_review', 'reviewed', 'dismissed', 'support_started'], default: 'pending_review' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const RiskFlag = model<IRiskFlag>('RiskFlag', RiskFlagSchema);
