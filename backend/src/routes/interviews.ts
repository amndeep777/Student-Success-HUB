import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';
import { requireConsent } from '../middleware/consent.js';
import { Interview, InterviewFeedback, Student, User } from '../db/models/index.js';

function isUnder18(dob: Date | null | undefined): boolean {
  if (!dob) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  if (today.getUTCMonth() < dob.getUTCMonth() || (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate())) age--;
  return age < 18;
}

export const interviewsRouter = Router();

interviewsRouter.post('/', allowRoles('interviewer','admin'), auditSensitive('interview.schedule','interview'), async (req, res) => {
  const student = await Student.findById(req.body.studentId).lean();
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  const interview = await Interview.create({ studentId: req.body.studentId, interviewerId: req.user!.id, kind: req.body.kind ?? 'mock', scheduledStart: req.body.scheduledStart, scheduledEnd: req.body.scheduledEnd, googleEventUrl: req.body.googleEventUrl ?? null, providerRoomId: `successhub-${randomUUID()}` });
  res.status(201).json({ id: String(interview._id), scheduledStart: interview.scheduledStart, scheduledEnd: interview.scheduledEnd, providerRoomId: interview.providerRoomId });
});

interviewsRouter.get('/', allowRoles('student','interviewer','admin'), auditSensitive('interview.list','interview'), async (req, res) => {
  const filter = req.user!.role === 'student' ? { studentId: req.user!.studentId } : { interviewerId: req.user!.id };
  const interviews = await Interview.find(filter).sort({ scheduledStart: 1 }).lean();
  res.json(interviews);
});

interviewsRouter.post('/:id/recording/start', allowRoles('interviewer','admin'), async (req, res, next) => {
  const interview = await Interview.findById(req.params.id).populate({ path: 'studentId', populate: { path: 'userId', model: 'User', select: 'dateOfBirth' } }).lean();
  if (!interview) return res.status(404).json({ error: 'Interview not found.' });
  const dob = (interview as any).studentId?.userId?.dateOfBirth;
  if (isUnder18(dob)) return res.status(403).json({ error: 'Recording is unavailable for students under 18 in the MVP.' });
  next();
}, requireConsent('interview_recording'), auditSensitive('interview.recording.start','interview'), async (req, res) => {
  const updated = await Interview.findByIdAndUpdate(req.params.id, { recordingKey: `recordings/${randomUUID()}.webm` }, { new: true }).lean();
  res.json({ recording: 'started', id: req.params.id, recordingKey: (updated as any)?.recordingKey });
});

interviewsRouter.post('/:id/feedback', allowRoles('interviewer','admin'), auditSensitive('interview.feedback.write','interview_feedback'), async (req, res) => {
  const feedback = await InterviewFeedback.create({ interviewId: req.params.id, interviewerId: req.user!.id, communicationScore: req.body.communicationScore, communicationComment: req.body.communicationComment, technicalScore: req.body.technicalScore, technicalComment: req.body.technicalComment, problemSolvingScore: req.body.problemSolvingScore, problemSolvingComment: req.body.problemSolvingComment, confidenceScore: req.body.confidenceScore, confidenceComment: req.body.confidenceComment, overallComment: req.body.overallComment ?? null });
  res.status(201).json(feedback);
});

interviewsRouter.get('/:id/feedback', allowRoles('student','interviewer'), auditSensitive('interview.feedback.read','interview_feedback'), async (req, res) => {
  const feedback = await InterviewFeedback.findOne({ interviewId: req.params.id }).lean();
  res.json(feedback ?? null);
});
