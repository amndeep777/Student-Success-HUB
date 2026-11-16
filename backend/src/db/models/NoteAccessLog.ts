import { Schema, model, Document, Types } from 'mongoose';

export interface INoteAccessLog extends Document {
  noteId: Types.ObjectId;
  userId: Types.ObjectId;
  action: 'view' | 'download';
  occurredAt: Date;
}

const NoteAccessLogSchema = new Schema<INoteAccessLog>({
  noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['view', 'download'], required: true },
  occurredAt: { type: Date, default: Date.now },
});

export const NoteAccessLog = model<INoteAccessLog>('NoteAccessLog', NoteAccessLogSchema);
