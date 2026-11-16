import { Schema, model, Document } from 'mongoose';

export interface ISubject extends Document {
  code: string;
  name: string;
}

const SubjectSchema = new Schema<ISubject>({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
});

export const Subject = model<ISubject>('Subject', SubjectSchema);
