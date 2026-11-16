import { Schema, model, Document } from 'mongoose';

export interface IPlan extends Document {
  code: string;
  name: string;
  description?: string;
  active: boolean;
}

const PlanSchema = new Schema<IPlan>({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  active: { type: Boolean, default: true },
});

export const Plan = model<IPlan>('Plan', PlanSchema);
