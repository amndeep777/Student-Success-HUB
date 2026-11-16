import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  subjectId: Types.ObjectId;
  unit: number;
  topic: string;
  difficulty: string;
  questionType: 'mcq' | 'short_answer' | 'long_answer';
  prompt: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  rubric?: unknown;
  createdBy: Types.ObjectId;
}

const QuestionSchema = new Schema<IQuestion>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  unit: { type: Number, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'short_answer', 'long_answer'], required: true },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: String,
  explanation: String,
  rubric: { type: Schema.Types.Mixed },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Question = model<IQuestion>('Question', QuestionSchema);
