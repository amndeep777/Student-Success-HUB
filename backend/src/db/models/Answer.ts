import { Schema, model, Document, Types } from 'mongoose';

export interface IAnswer extends Document {
  attemptId: Types.ObjectId;
  questionId: Types.ObjectId;
  answerText?: string;
  isCorrect?: boolean;
  awardedMarks?: number;
  timeSpentSeconds: number;
  savedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  attemptId: { type: Schema.Types.ObjectId, ref: 'ExamAttempt', required: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: String,
  isCorrect: Boolean,
  awardedMarks: Number,
  timeSpentSeconds: { type: Number, default: 0 },
  savedAt: { type: Date, default: Date.now },
});

AnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const Answer = model<IAnswer>('Answer', AnswerSchema);
