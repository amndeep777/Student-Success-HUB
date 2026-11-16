import { Router } from 'express';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';
import { Exam, ExamAttempt, Answer, Result, Question } from '../db/models/index.js';

export const examsRouter = Router();

// GET /
examsRouter.get('/', allowRoles('student','mentor','admin'), auditSensitive('exam.list','exam'), async (_req, res) => {
  const exams = await Exam.find({ published: true }).select('name mode durationSeconds').lean();
  res.json(exams);
});

// GET /:id/questions
examsRouter.get('/:id/questions', allowRoles('student','mentor','admin'), auditSensitive('exam.questions.read','exam'), async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate({ path: 'questions.questionId', select: 'prompt options questionType topic unit difficulty' }).lean();
  if (!exam) return res.status(404).json({ error: 'Exam not found.' });
  const questions = (exam as any).questions.map((q: any) => ({ position: q.position, ...q.questionId }));
  res.json(questions);
});

// POST /:id/attempts
examsRouter.post('/:id/attempts', allowRoles('student'), auditSensitive('exam.start','exam_attempt'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  const exam = await Exam.findOne({ _id: req.params.id, published: true }).lean();
  if (!exam) return res.status(404).json({ error: 'Published exam not found.' });
  const attempt = await ExamAttempt.create({ examId: req.params.id, studentId: req.user.studentId });
  res.status(201).json({ id: String(attempt._id), startedAt: attempt.startedAt });
});

// PUT /attempts/:attemptId/answers/:questionId
examsRouter.put('/attempts/:attemptId/answers/:questionId', allowRoles('student'), auditSensitive('exam.answer.save','answer'), async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.attemptId, studentId: req.user!.studentId, status: 'active' }).lean();
  if (!attempt) return res.status(403).json({ error: 'Attempt not found or no longer active.' });
  const answer = await Answer.findOneAndUpdate(
    { attemptId: req.params.attemptId, questionId: req.params.questionId },
    { answerText: req.body.answerText ?? null, timeSpentSeconds: Number(req.body.timeSpentSeconds ?? 0), savedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json(answer);
});

// POST /attempts/:attemptId/submit
examsRouter.post('/attempts/:attemptId/submit', allowRoles('student'), auditSensitive('exam.submit','exam_attempt'), async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.attemptId, studentId: req.user!.studentId, status: 'active' });
  if (!attempt) return res.status(403).json({ error: 'Attempt not found or already submitted.' });

  // Load exam questions for scoring
  const exam = await Exam.findById(attempt.examId).populate('questions.questionId').lean();
  const questionMap = new Map<string, any>();
  for (const q of (exam as any).questions) questionMap.set(String(q.questionId._id), q.questionId);

  // Score answers
  const answers = await Answer.find({ attemptId: req.params.attemptId });
  let totalMarks = 0;
  const topicCorrect: Record<string, number> = {};
  const topicTotal: Record<string, number> = {};
  const questionExplanations: Record<string, string> = {};
  for (const answer of answers) {
    const q = questionMap.get(String(answer.questionId));
    if (!q) continue;
    const correct = answer.answerText === q.correctAnswer;
    answer.isCorrect = correct;
    answer.awardedMarks = correct ? 1 : 0;
    if (correct) totalMarks++;
    const topic = q.topic;
    topicTotal[topic] = (topicTotal[topic] ?? 0) + 1;
    if (correct) topicCorrect[topic] = (topicCorrect[topic] ?? 0) + 1;
    questionExplanations[String(answer.questionId)] = q.explanation;
    await answer.save();
  }
  attempt.status = 'submitted'; attempt.submittedAt = new Date(); attempt.score = totalMarks;
  await attempt.save();

  // Build result
  const topicSummary: Record<string, any> = {};
  for (const topic of Object.keys(topicTotal)) topicSummary[topic] = { correct: topicCorrect[topic] ?? 0, total: topicTotal[topic] };
  const weakTopicReasons = Object.entries(topicSummary).filter(([, v]: any) => (v.correct / v.total) < 0.5).map(([t, v]: any) => ({ topic: t, correct: v.correct, total: v.total }));
  await Result.create({ attemptId: req.params.attemptId, topicSummary, questionExplanations, weakTopicReasons });
  res.json({ submitted: true, score: totalMarks });
});

// GET /attempts/:attemptId/result
examsRouter.get('/attempts/:attemptId/result', allowRoles('student','mentor','counsellor','admin'), auditSensitive('exam.result.read','result'), async (req, res) => {
  const attempt = await ExamAttempt.findById(req.params.attemptId).select('score submittedAt status').lean();
  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
  const result = await Result.findOne({ attemptId: req.params.attemptId }).lean();
  res.json({ ...attempt, ...(result ?? {}) });
});
