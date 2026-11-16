import { Schema, model, Document, Types } from 'mongoose';

export interface IIntervention extends Document {
  studentId: Types.ObjectId;
  flagId: Types.ObjectId;
  ownerId: Types.ObjectId;
  plan: string;
  createdAt: Date;
}

const InterventionSchema = new Schema<IIntervention>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  flagId: { type: Schema.Types.ObjectId, ref: 'RiskFlag', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Intervention = model<IIntervention>('Intervention', InterventionSchema);
