import { Schema, model, Document, Types } from 'mongoose';

export interface IInterview extends Document {
  studentId: Types.ObjectId;
  interviewerId: Types.ObjectId;
  kind: 'mock' | 'real';
  status: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  googleEventUrl?: string;
  providerRoomId?: string;
  recordingKey?: string;
  recordingConsentId?: Types.ObjectId;
  createdAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['mock', 'real'], required: true },
  status: { type: String, default: 'scheduled' },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  googleEventUrl: String,
  providerRoomId: String,
  recordingKey: String,
  recordingConsentId: { type: Schema.Types.ObjectId, ref: 'Consent' },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Interview = model<IInterview>('Interview', InterviewSchema);
