import { Schema, model, Document, Types } from 'mongoose';

export interface IResult extends Document {
  attemptId: Types.ObjectId;
  topicSummary: Record<string, unknown>;
  questionExplanations: Record<string, unknown>;
  weakTopicReasons: unknown[];
  generatedAt: Date;
}

const ResultSchema = new Schema<IResult>({
  attemptId: { type: Schema.Types.ObjectId, ref: 'ExamAttempt', unique: true, required: true },
  topicSummary: { type: Schema.Types.Mixed, default: {} },
  questionExplanations: { type: Schema.Types.Mixed, default: {} },
  weakTopicReasons: { type: [Schema.Types.Mixed], default: [] },
  generatedAt: { type: Date, default: Date.now },
});

export const Result = model<IResult>('Result', ResultSchema);
