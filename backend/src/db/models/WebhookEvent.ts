import { Schema, model, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  provider: string;
  providerEventId: string;
  eventType: string;
  payload: unknown;
  processedAt?: Date;
  status: string;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  provider: { type: String, required: true },
  providerEventId: { type: String, unique: true, required: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  processedAt: Date,
  status: { type: String, default: 'received' },
});

export const WebhookEvent = model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
