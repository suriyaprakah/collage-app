# College Hub - Complete Account Reference

## 👥 All Pre-created Accounts

### 🎓 DEMO STUDENT ACCOUNTS

| Register No | Name | Password | College | Department | Semester |
|------------|------|----------|---------|-----------|----------|
| **CS21B001** | Rahul Sharma | 21012005 | Technology Institute | Computer Science | 3rd Year |
| **BE21B002** | Priya Patel | 01011999 | Business School | - | 2nd Year |
| **CE21B003** | Amit Kumar | 15051998 | Engineering College | Civil Engineering | 4th Year |

**How to Login as Student:**
1. Go to Login section
2. Select: **"Student"**
3. Username: `CS21B001` (or BE21B002, CE21B003)
4. Password: `21012005` (or their respective passwords)
5. Click Login

---

### 👨‍🏫 DEMO TEACHER ACCOUNTS

| Username | Name | Password | College | Department |
|----------|------|----------|---------|-----------|
| **dr.smith** | Dr. James Smith | teacher123 | Technology Institute | Computer Science |
| **dr.rajesh** | Dr. Rajesh Kumar | teacher123 | Business School | - |
| **prof.sharma** | Prof. Sharma | teacher123 | Engineering College | Mechanical Engineering |

**How to Login as Teacher:**
1. Go to Login section
2. Select: **"Teacher"**
3. Username: `dr.smith` (or dr.rajesh, prof.sharma)
4. Password: `teacher123`
5. Click Login

**Teacher Permissions:**
- Post announcements
- Upload study materials
- Manage fees
- View all students
- Everything a student can do

---

### 🏫 COLLEGE PRINCIPAL/ADMIN ACCOUNTS [NEW]

These are **College-level Admins** - each college has its own principal who manages that college only.

| Username | Name | Password | College | Role |
|----------|------|----------|---------|------|
| **principal.tech** | Dr. Vikram Singh | principal123 | Technology Institute | Principal |
| **principal.business** | Dr. Anjali Verma | principal123 | Business School | Principal |
| **principal.engineering** | Dr. Ravi Patel | principal123 | Engineering College | Principal |
| **principal** | Principal (Test) | principal123 | Technology Institute | Principal |

**How to Login as College Principal:**
1. Go to Login section
2. Select: **"College Principal"**
3. Username: `principal.tech` (or principal.business, principal.engineering)
4. Password: `principal123`
5. Click Login
6. After login, click **"Principal"** button to see dashboard

**Principal Permissions (College-Specific):**
- ✅ View all teachers in their college
- ✅ See teacher activity (announcements, materials uploaded)
- ✅ View college-specific statistics
- ✅ Monitor real-time activities from their college
- ✅ See today's login count for their college
- ❌ Cannot see other colleges' data
- ❌ Cannot see system-wide statistics

**Use Case:** Principal of Technology Institute can see:
- All teachers working at Technology Institute
- What Tech Institute teachers posted/uploaded
- How many students from Tech Institute logged in today
- Activity feed from Tech Institute only

**NOT See:**
- Business School's data
- Engineering College's data
- System-wide monitoring

---

### ⚙️ SYSTEM ADMIN ACCOUNT [NEW]

**Single System-wide Admin Account**

| Username | Name | Password | Role |
|----------|------|----------|------|
| **admin** | System Administrator | admin123 | System Admin |

**How to Login as System Admin:**
1. Go to Login section
2. Select: **"System Admin"**
3. Username: `admin`
4. Password: `admin123`
5. Click Login
6. After login, click **"Admin"** button to see dashboard

**Admin Permissions (System-Wide):**
- ✅ View activities from ALL colleges combined
- ✅ See college-wise comparison
  - Teachers per college
  - Students per college
  - Logins per college
- ✅ System-wide statistics
  - Total users (all roles)
  - Online users estimate
  - Total logins today
  - Total activities logged
- ✅ Export complete app data (JSON backup)
- ✅ Clear activity logs
- ✅ Clear all data (emergency reset)
- ✅ Full system management

**Use Case:** Admin can:
- See "Technology Institute had 45 logins, Business School had 38, Engineering had 22"
- Monitor which college is most active
- View real-time system-wide activity
- Export data for backup
- Reset system if needed

---

## 🎯 Role Hierarchy

```
┌─────────────────────────────────────────────┐
│         SYSTEM ADMIN (admin)                │
│  Manages entire app, all colleges           │
│  Can see/do everything                      │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼────┐  ┌─▼────────┐ ┌──▼──────────┐
│ Principal  │  │Principal │ │ Principal   │
│ Tech Inst. │  │Business  │ │ Engineering │
│(college    │  │(college  │ │ (college    │
│ level)     │  │ level)   │ │ level)      │
└──────┬─────┘  └───┬──────┘ └──┬─────────┘
       │            │           │
  ┌────┴─┬──────┐   │           │
  │      │      │   │           │
 Teach  Teach  Teach Teach      Teach
Student  │
```

---

## 📊 Comparison Table

| Feature | Student | Teacher | Principal | Admin |
|---------|---------|---------|-----------|-------|
| **View own profile** | ✅ | ✅ | ✅ | ✅ |
| **View announcements** | ✅ | ✅ | ✅ | ✅ |
| **Post announcements** | ❌ | ✅ | ✅ | ✅ |
| **Upload materials** | ❌ | ✅ | ✅ | ✅ |
| **Manage fees** | ❌ | ✅ | ✅ | ✅ |
| **View all students** | ❌ | ✅ | ✅ | ✅ |
| **View college teachers** | ❌ | ❌ | ✅ | ✅ |
| **Principal Dashboard** | ❌ | ❌ | ✅ | ✅ |
| **Admin Dashboard** | ❌ | ❌ | ❌ | ✅ |
| **See own college activity** | ❌ | ❌ | ✅ | ✅ |
| **See all colleges activity** | ❌ | ❌ | ❌ | ✅ |
| **College-wise comparison** | ❌ | ❌ | ❌ | ✅ |
| **Export data** | ❌ | ❌ | ❌ | ✅ |
| **Manage system** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start - Test All Accounts

### Step 1: Test as Student
```
Login: CS21B001 / 21012005 (Student)
✓ See your profile
✓ View announcements
✓ Download materials
✓ Check fees
```

### Step 2: Test as Teacher
```
Login: dr.smith / teacher123 (Teacher)
✓ Post an announcement
✓ Upload a material
✓ View all students
✓ See "Students" button in nav
```

### Step 3: Test as College Principal
```
Login: principal.tech / principal123 (College Principal)
✓ Click "Principal" button
✓ See all teachers in Technology Institute
✓ View teacher activity
✓ See college statistics
✓ Cannot see Business School or Engineering data
```

### Step 4: Test as System Admin
```
Login: admin / admin123 (System Admin)
✓ Click "Admin" button
✓ See ALL system activities
✓ View college-wise statistics
✓ See comparison between all 3 colleges
✓ Try "Export App Data"
```

---

## 🏢 Multi-College Setup

The system supports **3 colleges** with demo data:

### 1. **Technology Institute**
- Principal: `principal.tech` / principal123
- Teacher: `dr.smith` / teacher123
- Student: `CS21B001` / 21012005
- Department: Computer Science

### 2. **Business School**
- Principal: `principal.business` / principal123
- Teacher: `dr.rajesh` / teacher123
- Student: `BE21B002` / 01011999
- Department: Business Administration

### 3. **Engineering College**
- Principal: `principal.engineering` / principal123
- Teacher: `prof.sharma` / teacher123
- Student: `CE21B003` / 15051998
- Department: Civil Engineering

---

## 📝 Creating New Accounts

### Create New Student Account
```
1. Go to Login section
2. Click "Create account"
3. Fill details:
   - Register No: CS21B050
   - Name: Your Name
   - Role: Student
   - College: Technology Institute
   - Semester: 3rd Year
   - Department: Computer Science
   - Password: mypassword
4. Click "Sign Up"
→ Account created, automatically logged in
```

### Create New Teacher Account
```
1. Go to Login section
2. Click "Create account"
3. Fill details:
   - Username: dr.newteacher
   - Name: Dr. New Teacher
   - Role: Teacher
   - College: Technology Institute
   - Password: mypassword
4. Click "Sign Up"
→ Account created, automatically logged in
```

### Create New Principal Account
```
1. Cannot be created from UI (security)
2. System Admin must update localStorage OR
3. Modify loadUsers() in app.js to add new principal
4. Format:
   if (!users['principal.newcollege']) {
       users['principal.newcollege'] = { 
           password: 'principal123',
           name: 'Dr. Name (Principal - New College)',
           role: 'principal',
           college: 'new college',
           dept: null,
           semester: null
       };
       saveUsers();
   }
```

---

## 🔐 Password Security

### Default Passwords
- **Student:** Birth date or ID-related (CS21B001 = 21012005)
- **Teacher:** `teacher123`
- **Principal:** `principal123`
- **Admin:** `admin123`

### Change Password
1. Currently no in-app password change feature
2. To change: Admin must manually edit localStorage
3. Future: Will add password change feature

---

## 💡 Testing Scenarios

### Scenario 1: Principal Monitoring Teachers
```
1. Login as Principal (principal.tech)
2. Go to Principal Dashboard
3. See Dr. Smith and teachers
4. Check their announcements/materials count
5. View recent activities from Technology Institute
6. Logout
```

### Scenario 2: Admin Comparing Colleges
```
1. Login as Admin (admin)
2. Go to Admin Dashboard
3. View "College-wise Logins" section
4. See:
   - Tech Institute: 45 logins today
   - Business School: 38 logins today
   - Engineering: 22 logins today
5. View system-wide activity
6. Export data for backup
```

### Scenario 3: Multi-College Day
```
1. Login as Admin
2. Throughout the day, see activities:
   - 9:00 AM: Tech Institute principal logs in
   - 9:05 AM: Business School teacher posts announce
   - 9:10 AM: 50 engineering students log in
   - 9:15 AM: All activities mixed in Admin feed
3. Can filter by college in statistics
```

---

## 📱 Mobile Access

All accounts work on mobile:
- Students can check fees and materials
- Teachers can post from mobile
- Principals can monitor while on the go
- Admin can check system status anytime

---

## ✅ Account Checklist

### Verify All Accounts Exist:
- [ ] **CS21B001** (Student - Tech) - Can login
- [ ] **BE21B002** (Student - Business) - Can login
- [ ] **CE21B003** (Student - Engineering) - Can login
- [ ] **dr.smith** (Teacher - Tech) - Can login
- [ ] **dr.rajesh** (Teacher - Business) - Can login
- [ ] **prof.sharma** (Teacher - Engineering) - Can login
- [ ] **principal.tech** (Principal - Tech) - Can login & see Principal dashboard
- [ ] **principal.business** (Principal - Business) - Can login & see Principal dashboard
- [ ] **principal.engineering** (Principal - Engineering) - Can login & see Principal dashboard
- [ ] **admin** (System Admin) - Can login & see Admin dashboard

---

## 🎯 Access Rules

### Students Can:
- Login with their register number
- View announcements (college-specific)
- Download materials (college-specific)
- Check their fees
- Mark attendance
- Submit suggestions

### Teachers Can:
- Do everything students can do
- Post announcements (college-wide)
- Upload materials (college-specific)
- Manage fees for students
- View all students
- Delete student accounts

### Principals Can:
- Do everything teachers can do
- **PLUS:** See all teachers in their college
- **PLUS:** View college-specific dashboard
- **PLUS:** Monitor college activities
- **PLUS:** See college statistics
- ❌ Cannot see other colleges

### Admin Can:
- Do everything everyone can do
- **PLUS:** See system-wide dashboard
- **PLUS:** Monitor all colleges
- **PLUS:** Compare college statistics
- **PLUS:** Export system data
- **PLUS:** Clear activity logs
- **PLUS:** Full system management

---

## 📞 Support

**Q: I don't see the Principal dashboard button**
A: Make sure you logged in as "College Principal" role (not Teacher)

**Q: Admin dashboard doesn't show activities**
A: Need users to perform actions (login, post content) first

**Q: Can I create more colleges?**
A: Yes, in app.js loadUsers() function, add more colleges following the pattern

**Q: How do I add more principals?**
A: Edit loadUsers() function to add new principal.newcollege accounts

**Q: Lost password?**
A: No recovery feature yet. Edit browser localStorage or contact system admin

---

**Last Updated:** February 4, 2026  
**Account System Version:** 2.0  
**Total Demo Accounts:** 10 (across 3 colleges)
