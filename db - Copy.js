const path = require('path');
const Database = require('better-sqlite3');
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

module.exports = db;