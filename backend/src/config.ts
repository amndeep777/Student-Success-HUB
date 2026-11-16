import 'dotenv/config';

function resolveCorsOrigin(origin?: string): string | string[] | boolean {
  if (!origin || origin === '*') return '*';
  if (origin.includes(',')) {
    return origin.split(',').map((o) => o.trim());
  }
  return origin;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/successhub',
  corsOrigin: resolveCorsOrigin(process.env.CORS_ORIGIN),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? ''
} as const;
