import { Schema, model, Document, Types } from 'mongoose';

export interface IPseudonymMapping extends Document {
  studentId: Types.ObjectId;
  createdAt: Date;
}

const PseudonymMappingSchema = new Schema<IPseudonymMapping>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', unique: true, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const PseudonymMapping = model<IPseudonymMapping>('PseudonymMapping', PseudonymMappingSchema);
