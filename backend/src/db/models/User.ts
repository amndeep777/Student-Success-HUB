import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  role: 'student' | 'mentor' | 'counsellor' | 'interviewer' | 'admin' | 'data-steward';
  dateOfBirth?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor', 'counsellor', 'interviewer', 'admin', 'data-steward'], required: true },
  dateOfBirth: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const User = model<IUser>('User', UserSchema);
