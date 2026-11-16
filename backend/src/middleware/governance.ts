import type { NextFunction, Request, Response } from 'express';
import { GovernanceConfig } from '../db/models/index.js';

export async function assertGovernanceApproved(): Promise<void> {
  const missing = await GovernanceConfig.find({ required: true, approved: false }).select('configKey').lean();
  if (missing.length) {
    throw new Error(`Governance approval is missing for: ${missing.map((m: any) => m.configKey).join(', ')}`);
  }
}

export async function enforceGovernanceRelease(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') return next();

  // Allow health checks, governance administration, and API docs even when awaiting approvals
  const publicPaths = ['/health', '/api/governance', '/api/docs'];
  if (publicPaths.some((p) => req.path === p || req.path.startsWith(`${p}/`))) {
    return next();
  }

  try {
    await assertGovernanceApproved();
  } catch {
    return res.status(503).json({
      error: 'Production is blocked until governance approval is complete. Administrators can approve pending items at /api/governance.',
    });
  }
  next();
}
