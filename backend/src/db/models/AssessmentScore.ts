import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessmentScore extends Document {
  studentId: Types.ObjectId;
  subject: string;
  assessmentName: string;
  score: number;
  assessedAt: Date;
  recordedBy: Types.ObjectId;
}

const AssessmentScoreSchema = new Schema<IAssessmentScore>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  assessmentName: { type: String, required: true },
  score: { type: Number, required: true },
  assessedAt: { type: Date, required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const AssessmentScore = model<IAssessmentScore>('AssessmentScore', AssessmentScoreSchema);
