import { Schema, model, Document, Types } from 'mongoose';

export interface IOutcome extends Document {
  interventionId: Types.ObjectId;
  summary: string;
  recordedAt: Date;
}

const OutcomeSchema = new Schema<IOutcome>({
  interventionId: { type: Schema.Types.ObjectId, ref: 'Intervention', required: true },
  summary: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now },
});

export const Outcome = model<IOutcome>('Outcome', OutcomeSchema);
