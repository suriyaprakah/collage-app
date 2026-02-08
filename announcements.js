const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// simple disk storage for uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

// GET /announcements
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC').all();
  // convert filePath to URL if present
  const hostBase = req.protocol + '://' + req.get('host');
  const out = rows.map(r => ({ ...r, fileUrl: r.filePath ? (r.filePath.startsWith('/') ? hostBase + r.filePath : hostBase + '/uploads/' + path.basename(r.filePath)) : null }));
  res.json(out);
});

// POST /announcements (teacher only) - supports optional file upload (field name: file)
router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.user || req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can post announcements' });
  const { text, college, dept } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });
  const date = new Date().toISOString().split('T')[0];
  const filePath = req.file ? '/uploads/' + req.file.filename : null;
  const stmt = db.prepare('INSERT INTO announcements (text, author, date, college, dept, filePath) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(text, req.user.id, date, college || null, dept || null, filePath);
  res.json({ id: info.lastInsertRowid, fileUrl: filePath ? (req.protocol + '://' + req.get('host') + filePath) : null });
});

// PUT /announcements/:id - update announcement (teacher only)
router.put('/:id', auth, upload.single('file'), (req, res) => {
  if (!req.user || req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can edit announcements' });
  const id = Number(req.params.id);
  const ex = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
  if (!ex) return res.status(404).json({ error: 'Not found' });
  const { text, college, dept } = req.body;
  let filePath = ex.filePath;
  if (req.file) {
    // delete old file if exists
    try { if (filePath) fs.unlinkSync(path.join(__dirname, '..', filePath)); } catch (e) { /* ignore */ }
    filePath = '/uploads/' + req.file.filename;
  }
  db.prepare('UPDATE announcements SET text = ?, college = ?, dept = ?, filePath = ? WHERE id = ?').run(text || ex.text, college || ex.college, dept || ex.dept, filePath, id);
  res.json({ ok: true });
});

// DELETE /announcements/:id - delete announcement (teacher only)
router.delete('/:id', auth, (req, res) => {
  if (!req.user || req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can delete announcements' });
  const id = Number(req.params.id);
  const ex = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
  if (!ex) return res.status(404).json({ error: 'Not found' });
  if (ex.filePath) {
    try { fs.unlinkSync(path.join(__dirname, '..', ex.filePath)); } catch (e) { /* ignore */ }
  }
  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;

module.exports = router;