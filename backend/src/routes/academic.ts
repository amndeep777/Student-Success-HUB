import { Router } from 'express';
import { AttendanceRecord, AssessmentScore, MentorObservation } from '../db/models/index.js';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';
import { requireConsent } from '../middleware/consent.js';

export const academicRouter = Router();

academicRouter.get('/students/:studentId/attendance', allowRoles('student','mentor','counsellor','admin'), requireConsent('attendance_marks_sharing'), auditSensitive('attendance.read','attendance'), async (req, res) => {
  const records = await AttendanceRecord.find({ studentId: req.params.studentId }).sort({ attendedOn: -1 }).select('attendedOn status reason').lean();
  res.json(records);
});

academicRouter.post('/students/:studentId/attendance', allowRoles('mentor','admin'), auditSensitive('attendance.write','attendance'), async (req, res) => {
  const record = await AttendanceRecord.create({ studentId: req.params.studentId, attendedOn: req.body.attendedOn, status: req.body.status, reason: req.body.reason ?? null, recordedBy: req.user!.id });
  res.status(201).json(record);
});

academicRouter.get('/students/:studentId/assessments', allowRoles('student','mentor','counsellor','admin'), requireConsent('attendance_marks_sharing'), auditSensitive('assessment.read','assessment'), async (req, res) => {
  const scores = await AssessmentScore.find({ studentId: req.params.studentId }).sort({ assessedAt: -1 }).select('subject assessmentName score assessedAt').lean();
  res.json(scores);
});

academicRouter.post('/students/:studentId/assessments', allowRoles('mentor','admin'), auditSensitive('assessment.write','assessment'), async (req, res) => {
  const score = await AssessmentScore.create({ studentId: req.params.studentId, subject: req.body.subject, assessmentName: req.body.assessmentName, score: req.body.score, assessedAt: req.body.assessedAt, recordedBy: req.user!.id });
  res.status(201).json(score);
});

academicRouter.get('/students/:studentId/observations', allowRoles('student','mentor','counsellor','admin'), auditSensitive('observation.read','mentor_observation'), async (req, res) => {
  const obs = await MentorObservation.find({ studentId: req.params.studentId }).sort({ observedAt: -1 }).lean();
  res.json(obs);
});

academicRouter.post('/students/:studentId/observations', allowRoles('mentor','admin'), auditSensitive('observation.write','mentor_observation'), async (req, res) => {
  const obs = await MentorObservation.create({ studentId: req.params.studentId, mentorId: req.user!.id, observation: req.body.observation });
  res.status(201).json(obs);
});
