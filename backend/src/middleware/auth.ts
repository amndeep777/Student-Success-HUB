import type { NextFunction, Request, Response } from 'express';

export function demoAuth(req: Request, _res: Response, next: NextFunction) {
  const id = req.header('x-user-id');
  const role = req.header('x-user-role');
  const studentId = req.header('x-student-id');
  if (id && role) req.user = { id, role, studentId: studentId ?? undefined };
  next();
}

export function allowRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission for this action.' });
    next();
  };
}
