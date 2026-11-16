import { Schema, model, Document, Types } from 'mongoose';

export interface IConsent extends Document {
  studentId: Types.ObjectId;
  purpose: 'attendance_marks_sharing' | 'interview_recording' | 'interview_feedback_counsellor_sharing';
  status: 'granted' | 'denied' | 'withdrawn';
  textVersion: number;
  approvedVersion: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
}

const ConsentSchema = new Schema<IConsent>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  purpose: { type: String, enum: ['attendance_marks_sharing', 'interview_recording', 'interview_feedback_counsellor_sharing'], required: true },
  status: { type: String, enum: ['granted', 'denied', 'withdrawn'], required: true },
  textVersion: { type: Number, required: true },
  approvedVersion: { type: Boolean, required: true },
  grantedAt: Date,
  withdrawnAt: Date,
});

ConsentSchema.index({ studentId: 1, purpose: 1 }, { unique: true });

export const Consent = model<IConsent>('Consent', ConsentSchema);
