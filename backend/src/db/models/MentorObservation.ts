import { Schema, model, Document, Types } from 'mongoose';

export interface IMentorObservation extends Document {
  studentId: Types.ObjectId;
  mentorId: Types.ObjectId;
  observation: string;
  observedAt: Date;
}

const MentorObservationSchema = new Schema<IMentorObservation>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  observation: { type: String, required: true },
  observedAt: { type: Date, default: Date.now },
});

export const MentorObservation = model<IMentorObservation>('MentorObservation', MentorObservationSchema);
