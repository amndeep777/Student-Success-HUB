import { Router } from 'express';
import { GovernanceConfig } from '../db/models/index.js';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';

export const governanceRouter = Router();

governanceRouter.get('/configs', allowRoles('admin','data-steward'), auditSensitive('governance.read','governance_config'), async (_req, res) => {
  const configs = await GovernanceConfig.find().sort('configKey version').lean();
  res.json(configs);
});

governanceRouter.post('/configs/:key/:version/approve', allowRoles('admin','data-steward'), auditSensitive('governance.approve','governance_config'), async (req, res) => {
  const doc = await GovernanceConfig.findOneAndUpdate(
    { configKey: req.params.key, version: Number(req.params.version) },
    { approved: true, approvedBy: req.user!.id, approvedAt: new Date() },
    { new: true }
  ).lean();
  if (!doc) return res.status(404).json({ error: 'Configuration version not found.' });
  res.json({ configKey: (doc as any).configKey, version: (doc as any).version, approved: (doc as any).approved });
});
