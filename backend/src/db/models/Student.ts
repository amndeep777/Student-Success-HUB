import { Schema, model, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId: Types.ObjectId;
  rollNumber: string;
  courseCode: string;
  batch: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  rollNumber: { type: String, unique: true, required: true },
  courseCode: { type: String, required: true },
  batch: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Student = model<IStudent>('Student', StudentSchema);
