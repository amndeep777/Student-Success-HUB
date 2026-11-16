import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  uploaderId: Types.ObjectId;
  subjectId: Types.ObjectId;
  courseCode: string;
  semester: string;
  unit: number;
  title: string;
  objectKey: string;
  fileSize: number;
  mimeType: string;
  downloadAllowed: boolean;
  scanStatus: 'pending' | 'clean' | 'infected';
  createdAt: Date;
}

const NoteSchema = new Schema<INote>({
  uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  courseCode: { type: String, required: true },
  semester: { type: String, required: true },
  unit: { type: Number, required: true },
  title: { type: String, required: true },
  objectKey: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  downloadAllowed: { type: Boolean, default: false },
  scanStatus: { type: String, enum: ['pending', 'clean', 'infected'], default: 'pending' },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Note = model<INote>('Note', NoteSchema);
