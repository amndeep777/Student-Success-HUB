import { Schema, model, Document, Types } from 'mongoose';

export interface IInterviewFeedback extends Document {
  interviewId: Types.ObjectId;
  interviewerId: Types.ObjectId;
  communicationScore: number;
  communicationComment: string;
  technicalScore: number;
  technicalComment: string;
  problemSolvingScore: number;
  problemSolvingComment: string;
  confidenceScore: number;
  confidenceComment: string;
  overallComment: string;
  createdAt: Date;
}

const InterviewFeedbackSchema = new Schema<IInterviewFeedback>({
  interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', unique: true, required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  communicationScore: { type: Number, required: true },
  communicationComment: { type: String, required: true },
  technicalScore: { type: Number, required: true },
  technicalComment: { type: String, required: true },
  problemSolvingScore: { type: Number, required: true },
  problemSolvingComment: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  confidenceComment: { type: String, required: true },
  overallComment: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const InterviewFeedback = model<IInterviewFeedback>('InterviewFeedback', InterviewFeedbackSchema);
