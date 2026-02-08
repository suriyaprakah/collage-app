const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Recommended pragmas
try { db.pragma('journal_mode = WAL'); } catch (e) { console.warn('Could not set PRAGMA', e); }

function init() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password TEXT,
    name TEXT,
    role TEXT,
    college TEXT,
    dept TEXT,
    semester TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    author TEXT,
    date TEXT,
    college TEXT,
    dept TEXT
  )`).run();
  // add filePath column if missing (safe to run repeatedly)
  try { db.prepare("ALTER TABLE announcements ADD COLUMN filePath TEXT").run(); } catch (e) { /* likely already exists */ }

  db.prepare(`CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    uploader TEXT,
    date TEXT,
    path TEXT,
    college TEXT,
    dept TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regNo TEXT,
    type TEXT,
    amount TEXT,
    status TEXT,
    due TEXT
  )`).run();
}

init();

// Ensure a default admin account exists (id: ADMIN_ID, password: ADMIN_PASSWORD)
// Default password is 'admin123' unless overridden via environment variable.
try {
  const ADMIN_ID = process.env.ADMIN_ID || 'admin';
  const ADMIN_PWD = process.env.ADMIN_PASSWORD || 'admin123';
  const adminExists = db.prepare('SELECT id FROM users WHERE id = ?').get(ADMIN_ID);
  if (!adminExists) {
    const hash = bcrypt.hashSync(ADMIN_PWD, 10);
    db.prepare('INSERT INTO users (id, password, name, role, college, dept, semester) VALUES (?,?,?,?,?,?,?)')
      .run(ADMIN_ID, hash, 'Administrator', 'admin', null, null, null);
    console.info('Created default admin user:', ADMIN_ID);
  }
} catch (e) {
  console.warn('Failed to ensure default admin user:', e);
}

module.exports = db;