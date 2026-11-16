import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId;
  attendedOn: Date;
  status: 'present' | 'absent' | 'excused';
  reason?: string;
  recordedBy: Types.ObjectId;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  attendedOn: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'excused'], required: true },
  reason: String,
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const AttendanceRecord = model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
