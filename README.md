# College Hub - Server

This is a minimal Node.js + Express backend for the College Hub app.

Features:
- SQLite (better-sqlite3) for storage
- Authentication (signup/login) with bcrypt + JWT
- Announcements endpoints (GET, POST — teacher-only)

Getting started:
1. cd server
2. cp .env.example .env and edit `JWT_SECRET`
3. npm install
4. npm run dev (requires nodemon)

Notes:
- DB file `data.db` is created automatically in `server/`.
- The server exposes `POST /auth/signup`, `POST /auth/login`, `GET /announcements`, `POST /announcements`.
- I can add more endpoints (materials, fees, users) and frontend integration next.
