import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorUserId?: Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: String,
  outcome: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  occurredAt: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
