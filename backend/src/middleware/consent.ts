import type { NextFunction, Request, Response } from 'express';
import { Consent, Interview } from '../db/models/index.js';
import { config } from '../config.js';

export function requireConsent(purpose: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let studentId: string | undefined = req.user?.studentId ?? (typeof req.params.studentId === 'string' ? req.params.studentId : undefined);
    if (!studentId && purpose === 'interview_recording' && req.params.id) {
      const interview = await Interview.findById(req.params.id).select('studentId').lean();
      studentId = interview ? String((interview as any).studentId) : undefined;
    }
    if (!studentId) return res.status(400).json({ error: 'A student context is required.' });
    const consent = await Consent.findOne({ studentId, purpose, status: 'granted', withdrawnAt: null }).lean();
    if (!consent) return res.status(403).json({ error: 'Required consent has not been granted.' });
    next();
  };
}
