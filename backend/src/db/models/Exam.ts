import { Schema, model, Document, Types } from 'mongoose';

export interface IExamQuestion {
  questionId: Types.ObjectId;
  position: number;
}

export interface IExam extends Document {
  subjectId: Types.ObjectId;
  name: string;
  mode: 'mid_term' | 'end_term' | 'topic_quiz';
  durationSeconds: number;
  published: boolean;
  questions: IExamQuestion[];
}

const ExamSchema = new Schema<IExam>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  name: { type: String, required: true },
  mode: { type: String, enum: ['mid_term', 'end_term', 'topic_quiz'], required: true },
  durationSeconds: { type: Number, required: true },
  published: { type: Boolean, default: false },
  questions: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    position: { type: Number, required: true },
  }],
});

export const Exam = model<IExam>('Exam', ExamSchema);
