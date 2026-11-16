import type { NextFunction, Request, Response } from 'express';
import { AuditLog } from '../db/models/index.js';

export function auditSensitive(action: string, resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalEnd = res.end;
    res.end = function(this: Response, ...args: Parameters<Response['end']>) {
      void AuditLog.create({
        actorUserId: req.user?.id ?? null,
        action, resourceType,
        resourceId: req.params.id ?? null,
        outcome: res.statusCode < 400 ? 'success' : 'denied',
        metadata: { method: req.method, path: req.path },
      }).catch(() => undefined);
      return originalEnd.apply(this, args);
    } as Response['end'];
    next();
  };
}

declare global {
  namespace Express { interface Request { user?: { id: string; role: string; studentId?: string }; } }
}
