import { Router } from 'express';
import { User, Student } from '../db/models/index.js';
import { auditSensitive } from '../middleware/audit.js';

export const authRouter = Router();

// Demo accounts list for fast sign in
authRouter.get('/demo-users', async (_req, res) => {
  try {
    const users = await User.find({}).sort({ role: 1, email: 1 }).limit(15).lean();
    const students = await Student.find({}).lean();
    const studentMap = new Map<string, any>();
    for (const s of students) studentMap.set(String(s.userId), s);

    const enriched = users.map((u: any) => ({
      id: String(u._id),
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      studentId: studentMap.get(String(u._id)) ? String(studentMap.get(String(u._id))._id) : undefined,
      courseCode: studentMap.get(String(u._id))?.courseCode,
      rollNumber: studentMap.get(String(u._id))?.rollNumber,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve demo users.' });
  }
});

// POST /register
authRouter.post('/register', auditSensitive('user.register', 'user'), async (req, res) => {
  const { email, displayName, role = 'student', courseCode, rollNumber, batch = '2026', dateOfBirth } = req.body;

  if (!email || !displayName) {
    return res.status(400).json({ error: 'Email and full name are required.' });
  }

  const validRoles = ['student', 'mentor', 'interviewer', 'counsellor', 'admin', 'data-steward'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      email,
      displayName,
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    let studentRecord: any = null;
    if (role === 'student') {
      const generatedRoll = rollNumber || `SH${Math.floor(100 + Math.random() * 900)}`;
      studentRecord = await Student.create({
        userId: user._id,
        rollNumber: generatedRoll,
        courseCode: courseCode || 'CSE301',
        batch,
      });
    }

    res.status(201).json({
      success: true,
      user: {
        id: String(user._id),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        studentId: studentRecord ? String(studentRecord._id) : undefined,
        courseCode: studentRecord?.courseCode,
        rollNumber: studentRecord?.rollNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// POST /login
authRouter.post('/login', auditSensitive('user.login', 'user'), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ error: 'No account found with this university email.' });
    }

    let studentRecord: any = null;
    if ((user as any).role === 'student') {
      studentRecord = await Student.findOne({ userId: (user as any)._id }).lean();
    }

    res.json({
      success: true,
      user: {
        id: String((user as any)._id),
        email: (user as any).email,
        displayName: (user as any).displayName,
        role: (user as any).role,
        studentId: studentRecord ? String(studentRecord._id) : undefined,
        courseCode: studentRecord?.courseCode,
        rollNumber: studentRecord?.rollNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
});
