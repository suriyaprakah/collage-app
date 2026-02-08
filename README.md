# College Hub - Server

This is a minimal Node.js + Express backend for the College Hub app.

Features:
- SQLite (better-sqlite3) for storage
- Authentication (signup/login) with bcrypt + JWT
- Announcements endpoints (GET, POST — teacher-only)
- Four-tier user role system with activity monitoring

## Getting started:
1. cd server
2. cp .env.example .env and edit `JWT_SECRET`
3. npm install
4. npm run dev (requires nodemon)

## User Roles & Dashboards:

The app now features **4 distinct user roles** with different permissions and dashboards:

### 1. **Student** 👨‍🎓
- Default Login: `CS21B001` / `21012005`
- Can view profile, announcements, materials, fees
- Can mark attendance and submit suggestions

### 2. **Teacher** 👨‍🏫
- Default Login: `dr.smith` / `teacher123`
- All student features
- Can post announcements
- Can upload study materials
- Can manage fees
- Can view all students

### 3. **College Principal** 🏫
- Default Login: `principal` / `principal123`
- **Dashboard Features:**
  - View all teachers in their college
  - See teacher's posted announcements and materials count
  - Monitor college-specific activities in real-time
  - View college statistics (teacher count, student count, logins)
  - Cannot see data from other colleges

### 4. **System Admin** ⚙️
- Default Login: `admin` / `admin123`
- **Dashboard Features:**
  - System-wide activity monitoring
  - Real-time logs of ALL user actions
  - College-wise statistics and login tracking
  - View activities from any college
  - Export complete app data as JSON backup
  - Clear activity logs
  - Full system management (⚠️ Clear all data - irreversible)

## 🔍 Activity Logging System:

Every user action is automatically logged with:
- **Timestamp** - When the action occurred
- **User Info** - Who did it (name, role, college)
- **Activity Type** - login, logout, announcement_posted, material_uploaded, etc.
- **Details** - Additional context about the action

### Who Can See:
- **Principal**: Activities from their college only (in Principal Dashboard)
- **Admin**: ALL activities from ALL colleges (in Admin Dashboard)

## 🏢 College-wise Monitoring (Admin Only):

Admin dashboard displays:
- Teachers per college
- Students per college
- Today's login count per college
- Compare performance across multiple colleges
- Identify usage patterns

## 📊 Real-time Dashboards:

### Principal Dashboard
- List of all teachers (name, dept, announcements, materials)
- College statistics (counts and today's logins)
- Recent activity feed filtered to college only
- Responsive design for mobile access

### Admin Dashboard
- System-wide activity feed (last 30 activities)
- College-wise breakdown
- System statistics
- Action buttons for data management

## 📥 Data Export Feature:

Admin can export complete backup including:
- All users (encrypted passwords)
- All announcements
- All study materials
- All fee records
- All departments
- All activity logs

Export format: JSON
Export triggers: Automatically logged as admin activity

## ⚠️ Data Management:

### Clear Activity Log (Admin Only)
- Removes all past activity logs
- Keeps all users, content, and fees intact
- Safe to do periodically for performance
- Logs the action itself

### Clear All Data (Admin Only)
- ⚠️ **IRREVERSIBLE**
- Deletes: Users, Announcements, Materials, Fees, Activity Logs
- Requires password confirmation
- Should backup with "Export Data" first
- Use only in emergencies

## Notes:
- DB file `data.db` is created automatically in `backend/`.
- Activity log is stored in browser localStorage (max 500 recent activities)
- The server exposes `POST /auth/signup`, `POST /auth/login`, `GET /announcements`, `POST /announcements`.
- Frontend automatically tracks and displays activities
- All logins and logouts are tracked
- All content creation is logged with user info and college

## 🚀 Multi-College Support:

The system supports multiple colleges seamlessly:
- Each user is assigned to a college
- Principal can only see their college's data
- Admin sees all colleges combined
- Statistics are calculated per college
- Activities are tagged with college information
- Enables multi-campus management from single dashboard
