import { Router } from 'express';
import { RiskFlag, AttendanceRecord } from '../db/models/index.js';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';

export const flagsRouter = Router();

flagsRouter.post('/evaluate/:studentId', allowRoles('mentor','admin'), auditSensitive('risk_flag.evaluate','risk_flag'), async (req, res) => {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const absences = await AttendanceRecord.countDocuments({ studentId: req.params.studentId, status: 'absent', attendedOn: { $gte: fourteenDaysAgo }, $or: [{ reason: null }, { reason: '' }] });
  if (absences < 3) return res.json({ created: false, explanation: 'No support prompt generated — fewer than 3 unexplained absences in the last 14 days.' });
  const explanation = `${absences} unexplained absences in the last 14 days. A mentor must review this before any support action.`;
  const flag = await RiskFlag.create({ studentId: req.params.studentId, ruleKey: 'unexplained_absences_14_days', ruleVersion: 1, explanation });
  res.status(201).json({ created: true, id: String(flag._id), explanation: flag.explanation, status: flag.status });
});

flagsRouter.get('/:studentId', allowRoles('mentor','counsellor','admin','student'), auditSensitive('risk_flag.read','risk_flag'), async (req, res) => {
  const flags = await RiskFlag.find({ studentId: req.params.studentId }).sort({ createdAt: -1 }).select('explanation status createdAt').lean();
  res.json(flags);
});

flagsRouter.post('/:id/review', allowRoles('mentor','counsellor','admin'), auditSensitive('risk_flag.review','risk_flag'), async (req, res) => {
  const flag = await RiskFlag.findByIdAndUpdate(req.params.id, { status: req.body.status, reviewedBy: req.user!.id, reviewedAt: new Date() }, { new: true }).lean();
  if (!flag) return res.status(404).json({ error: 'Flag not found.' });
  res.json(flag);
});
