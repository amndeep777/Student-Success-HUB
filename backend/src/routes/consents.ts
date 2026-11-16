import { Router } from 'express';
import { Consent, GovernanceConfig } from '../db/models/index.js';
import { auditSensitive } from '../middleware/audit.js';

export const consentRouter = Router();

consentRouter.get('/me', auditSensitive('consent.read','consent'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  const consents = await Consent.find({ studentId: req.user.studentId }).sort('purpose').select('purpose status textVersion grantedAt withdrawnAt').lean();
  res.json(consents);
});

consentRouter.post('/me/:purpose', auditSensitive('consent.write','consent'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  const govConfig = await GovernanceConfig.findOne({ configKey: `consent_${req.params.purpose}` }).sort({ version: -1 }).lean();
  if (!govConfig) return res.status(404).json({ error: 'Consent configuration not found.' });
  if (process.env.NODE_ENV === 'production' && !(govConfig as any).approved) return res.status(503).json({ error: 'This consent text is awaiting approval.' });
  const status = req.body.granted === true ? 'granted' : 'denied';
  const doc = await Consent.findOneAndUpdate(
    { studentId: req.user.studentId, purpose: req.params.purpose },
    { status, textVersion: (govConfig as any).version, approvedVersion: (govConfig as any).approved, grantedAt: status === 'granted' ? new Date() : null, withdrawnAt: null },
    { upsert: true, new: true }
  ).select('purpose status textVersion').lean();
  res.status(201).json(doc);
});

consentRouter.post('/me/:purpose/withdraw', auditSensitive('consent.withdraw','consent'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  await Consent.findOneAndUpdate({ studentId: req.user.studentId, purpose: req.params.purpose, status: 'granted' }, { status: 'withdrawn', withdrawnAt: new Date() });
  res.status(204).end();
});
