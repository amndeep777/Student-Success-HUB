import { Schema, model, Document, Types } from 'mongoose';

export interface IFollowUp extends Document {
  interventionId: Types.ObjectId;
  dueOn: Date;
  notes?: string;
  completedAt?: Date;
}

const FollowUpSchema = new Schema<IFollowUp>({
  interventionId: { type: Schema.Types.ObjectId, ref: 'Intervention', required: true },
  dueOn: { type: Date, required: true },
  notes: String,
  completedAt: Date,
});

export const FollowUp = model<IFollowUp>('FollowUp', FollowUpSchema);
