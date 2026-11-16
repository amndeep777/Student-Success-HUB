import { Schema, model, Document, Types } from 'mongoose';

export interface IExamAttempt extends Document {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: 'active' | 'submitted' | 'timed_out';
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
}

const ExamAttemptSchema = new Schema<IExamAttempt>({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['active', 'submitted', 'timed_out'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  score: Number,
});

export const ExamAttempt = model<IExamAttempt>('ExamAttempt', ExamAttemptSchema);
