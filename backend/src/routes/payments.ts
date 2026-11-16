import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { config } from '../config.js';
import { Plan, Price, Purchase, Payment, Entitlement, WebhookEvent } from '../db/models/index.js';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';

export const paymentsRouter = Router();
const razorpay = config.razorpayKeyId && config.razorpayKeySecret ? new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret }) : null;

paymentsRouter.get('/prices', async (_req, res) => {
  const prices = await Price.find({ active: true }).populate({ path: 'planId', match: { active: true } }).lean();
  const filtered = prices.filter((p: any) => p.planId !== null);
  res.json({ testMode: !razorpay, prices: filtered });
});

paymentsRouter.post('/orders', allowRoles('student'), auditSensitive('payment.order.create','purchase'), async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ error: 'Sign in is required.' });
  const price = await Price.findOne({ _id: req.body.priceId, active: true }).lean();
  if (!price) return res.status(404).json({ error: 'Price not found.' });
  const receipt = `sh_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const order = razorpay ? await razorpay.orders.create({ amount: (price as any).amountPaise, currency: (price as any).currency, receipt, notes: { userId: req.user.id, priceId: req.body.priceId } }) : { id: `order_test_${receipt}`, amount: (price as any).amountPaise, currency: (price as any).currency };
  const purchase = await Purchase.create({ userId: req.user.id, priceId: req.body.priceId, providerOrderId: order.id, amountPaise: order.amount, currency: order.currency });
  res.status(201).json({ testMode: !razorpay, keyId: config.razorpayKeyId || undefined, order, purchase: { id: String(purchase._id), providerOrderId: purchase.providerOrderId, amountPaise: purchase.amountPaise, currency: purchase.currency } });
});

paymentsRouter.post('/verify', allowRoles('student'), auditSensitive('payment.verify','payment'), async (req, res) => {
  const payload = `${req.body.orderId}|${req.body.paymentId}`;
  const expected = crypto.createHmac('sha256', config.razorpayKeySecret || 'test-only-secret').update(payload).digest('hex');
  if (config.razorpayKeySecret && !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(req.body.signature)))) return res.status(400).json({ error: 'Payment signature could not be verified.' });
  const purchase = await Purchase.findOne({ providerOrderId: req.body.orderId, userId: req.user!.id }).lean();
  if (!purchase) return res.status(404).json({ error: 'Order not found.' });
  const payment = await Payment.create({ purchaseId: (purchase as any)._id, providerPaymentId: req.body.paymentId, providerSignature: req.body.signature ?? expected, amountPaise: (purchase as any).amountPaise, status: 'paid', paidAt: new Date() });
  await Entitlement.findOneAndUpdate({ userId: req.user!.id, entitlementKey: 'premium_content', sourceId: String((purchase as any)._id) }, { userId: req.user!.id, entitlementKey: 'premium_content', sourceType: 'purchase', sourceId: String((purchase as any)._id) }, { upsert: true });
  res.json({ verified: true, payment: { id: String(payment._id), status: payment.status } });
});

paymentsRouter.post('/webhooks', async (req, res) => {
  const signature = req.header('x-razorpay-signature') ?? '';
  const body = JSON.stringify(req.body);
  if (config.razorpayWebhookSecret) { const expected = crypto.createHmac('sha256', config.razorpayWebhookSecret).update(body).digest('hex'); if (signature !== expected) return res.status(400).json({ error: 'Invalid webhook signature.' }); }
  const eventId = req.header('x-razorpay-event-id') ?? crypto.createHash('sha256').update(body).digest('hex');
  const inserted = await WebhookEvent.findOneAndUpdate({ providerEventId: eventId }, { $setOnInsert: { provider: 'razorpay', providerEventId: eventId, eventType: req.body.event ?? 'unknown', payload: req.body } }, { upsert: true, new: true });
  res.json({ received: true });
});

paymentsRouter.get('/entitlements', allowRoles('student','admin'), auditSensitive('entitlement.read','entitlement'), async (req, res) => {
  const now = new Date();
  const entitlements = await Entitlement.find({ userId: req.user!.id, $or: [{ validUntil: null }, { validUntil: { $gt: now } }] }).lean();
  res.json(entitlements);
});
