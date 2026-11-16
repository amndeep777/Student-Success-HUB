import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { allowRoles } from '../middleware/auth.js';
import { auditSensitive } from '../middleware/audit.js';
import { Note, NoteBookmark, NoteAccessLog } from '../db/models/index.js';

const storageRoot = path.resolve(process.cwd(), 'storage', 'notes');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf') });
export const notesRouter = Router();

// GET / - search notes
notesRouter.get('/', allowRoles('student','mentor','admin'), auditSensitive('note.search','note'), async (req, res) => {
  const q = String(req.query.q ?? '');
  const regex = new RegExp(q, 'i');
  const notes = await Note.find({ scanStatus: 'clean', $or: [{ title: regex }, { courseCode: regex }, { unit: regex }] })
    .sort({ createdAt: -1 }).select('title courseCode semester unit downloadAllowed createdAt').lean();
  res.json(notes);
});

// POST / - upload
notesRouter.post('/', allowRoles('mentor','admin'), upload.single('file'), auditSensitive('note.upload','note'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a PDF file up to 25 MB.' });
  await fs.mkdir(storageRoot, { recursive: true });
  const objectKey = `${randomUUID()}.pdf`;
  await fs.writeFile(path.join(storageRoot, objectKey), req.file.buffer);
  const note = await Note.create({ uploaderId: req.user!.id, courseCode: req.body.courseCode, semester: req.body.semester, unit: req.body.unit, title: req.body.title, objectKey, fileSize: req.file.size, mimeType: 'application/pdf', downloadAllowed: req.body.downloadAllowed === 'true', scanStatus: 'clean' });
  res.status(201).json({ id: String(note._id), title: note.title, scanStatus: note.scanStatus });
});

// POST /:id/access
notesRouter.post('/:id/access', allowRoles('student','mentor','admin'), auditSensitive('note.access','note'), async (req, res) => {
  const action = req.body.action === 'download' ? 'download' : 'view';
  const note = await Note.findOne({ _id: req.params.id, scanStatus: 'clean' }).select('objectKey downloadAllowed').lean();
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  if (action === 'download' && !(note as any).downloadAllowed) return res.status(403).json({ error: 'Downloads are disabled for this note.' });
  await NoteAccessLog.create({ noteId: req.params.id, userId: req.user!.id, action });
  res.json({ action, url: `/api/notes/${req.params.id}/content${action === 'download' ? '?download=1' : ''}` });
});

// GET /:id/content
notesRouter.get('/:id/content', allowRoles('student','mentor','admin'), auditSensitive('note.preview','note'), async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, scanStatus: 'clean' }).select('objectKey title downloadAllowed').lean();
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  if (req.query.download === '1' && !(note as any).downloadAllowed) return res.status(403).json({ error: 'Downloads are disabled.' });
  const filename = path.join(storageRoot, (note as any).objectKey);
  res.type('application/pdf');
  if (req.query.download === '1') res.setHeader('Content-Disposition', `attachment; filename="${String((note as any).title).replace(/[^a-z0-9-_ ]/gi, '')}.pdf"`);
  else res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filename);
});

// POST /:id/bookmark
notesRouter.post('/:id/bookmark', allowRoles('student'), auditSensitive('note.bookmark','note'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  try {
    await NoteBookmark.create({ studentId: req.user.studentId, noteId: req.params.id });
  } catch { /* duplicate — ignore */ }
  res.status(201).json({ bookmarked: true });
});

// GET /bookmarks
notesRouter.get('/bookmarks', allowRoles('student'), auditSensitive('note.bookmarks.read','note'), async (req, res) => {
  if (!req.user?.studentId) return res.status(400).json({ error: 'Student context required.' });
  const bookmarks = await NoteBookmark.find({ studentId: req.user.studentId }).populate('noteId').lean();
  res.json(bookmarks.map((b: any) => b.noteId));
});
