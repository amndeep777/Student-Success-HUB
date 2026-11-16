import { Schema, model, Document, Types } from 'mongoose';

export interface INoteBookmark extends Document {
  studentId: Types.ObjectId;
  noteId: Types.ObjectId;
  createdAt: Date;
}

const NoteBookmarkSchema = new Schema<INoteBookmark>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

NoteBookmarkSchema.index({ studentId: 1, noteId: 1 }, { unique: true });

export const NoteBookmark = model<INoteBookmark>('NoteBookmark', NoteBookmarkSchema);
