# College Hub - Login Roles & Dashboards Guide

## 🎯 Four User Roles

### 1. **Student Login** 👨‍🎓
- **Who Can Use:** Students enrolled in college
- **Login Credentials:**
  - Username: `CS21B001` (register number)
  - Password: `21012005`
- **Can Access:**
  - View their profile
  - View announcements (college/department specific)
  - View study materials
  - Check fees status
  - Mark attendance
  - Submit suggestions

---

### 2. **Teacher Login** 👨‍🏫
- **Who Can Use:** Faculty members
- **Login Credentials:**
  - Username: `dr.smith`
  - Password: `teacher123`
- **Can Access:**
  - All student features
  - Post announcements
  - Upload study materials
  - Manage fees
  - View all students in system
  - Post feedback

---

### 3. **College Principal Login** 🏫
- **Who Can Use:** Principal or Head of College
- **Login Credentials:**
  - Username: `principal`
  - Password: `principal123`
- **Dashboard Features:**
  - **View All Teachers:** See all teachers working in your college
    - Teacher name and ID
    - Department assignment
    - Number of announcements posted
    - Number of materials uploaded
  - **College Statistics:**
    - Total teachers in college
    - Total students in college
    - Today's login count
  - **Monitor Activities:** Real-time activity log
    - Who logged in (time & date)
    - What actions were taken
    - Filtered by your college only
- **Access:** Click "Principal" button in navigation after login

**Purpose:** Principal can monitor teacher activities and college performance without seeing system-wide data from other colleges.

---

### 4. **System Admin Login** ⚙️
- **Who Can Use:** App administrator/owner
- **Login Credentials:**
  - Username: `admin`
  - Password: `admin123`
- **Dashboard Features:**
  - **System-Wide Activity Monitor:** Real-time log of ALL activities
    - Every login across ALL colleges
    - Every action (announcements, materials, fees)
    - Timestamp and user details
    - Color-coded by activity type
  
  - **College-wise Monitoring:**
    - View statistics for EACH college
    - Teachers per college
    - Students per college
    - Today's logins per college
    - Compare colleges at a glance
  
  - **System Statistics:**
    - Total users (all roles)
    - Estimated online users
    - Total logins today
    - Total activities logged
  
  - **Admin Actions:**
    - **Export App Data:** Download complete backup (JSON)
    - **Clear Activity Log:** Remove all past activity logs
    - **Clear All Data:** Complete system reset (⚠️ IRREVERSIBLE)

- **Access:** Click "Admin" button in navigation after login

**Purpose:** Admin has complete visibility into system operations and can manage the entire application.

---

## 📊 Dashboard Comparison

| Feature | Student | Teacher | Principal | Admin |
|---------|---------|---------|-----------|-------|
| **View Profile** | ✅ | ✅ | ✅ | ✅ |
| **Post Announcements** | ❌ | ✅ | ✅ | ✅ |
| **Upload Materials** | ❌ | ✅ | ✅ | ✅ |
| **View Students** | ❌ | ✅ | ✅ | ✅ |
| **See Teacher Activities** | ❌ | ❌ | ✅ | ✅ |
| **Principal Dashboard** | ❌ | ❌ | ✅ | ✅ |
| **Admin Dashboard** | ❌ | ❌ | ❌ | ✅ |
| **System-wide Activity** | ❌ | ❌ | ❌ | ✅ |
| **College-wise Stats** | ❌ | ❌ | ❌ | ✅ |
| **Export Data** | ❌ | ❌ | ❌ | ✅ |
| **Clear Data** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Activity Logging System

Every action is automatically logged:

### Activities Tracked:
- ✅ User Login
- ✅ User Logout
- ✅ Announcements Posted
- ✅ Materials Uploaded
- ✅ Fees Added
- ✅ Data Exported
- ✅ Other system actions

### Information Captured:
- **Timestamp:** When the action happened
- **User:** Who performed the action
- **User Role:** Student/Teacher/Principal/Admin
- **College:** Which college the user belongs to
- **Activity Type:** What type of action
- **Details:** Additional information

### Who Can See:
- **Principal:** Activities from their college only
- **Admin:** ALL activities from ALL colleges

---

## 🏫 Real-World Example

### Scenario: Principal Dashboard

**Monday 9:00 AM**
- Principal logs in
- Sees 5 teachers in college today
- Sees 120 students registered
- Views recent activities:
  - 9:15 AM: Dr. Smith posted announcement about exam dates
  - 9:20 AM: Dr. Johnson uploaded notes for CS101
  - 9:25 AM: 15 students logged in to download materials

### Scenario: Admin Dashboard

**Monday 9:00 AM**
- Admin logs in
- Sees system-wide statistics:
  - 450 total users
  - 45 logins today across all colleges
  - 12 new announcements posted
  
- Views college-wise breakdown:
  - **Technology Institute:** 200 students, 20 teachers, 15 logins today
  - **Business School:** 150 students, 12 teachers, 18 logins today
  - **Engineering College:** 100 students, 8 teachers, 12 logins today
  
- Recent system activities (all colleges):
  - 9:10 AM: Tech Institute - Dr. Smith (teacher) logged in
  - 9:12 AM: Business School - Principal logged in
  - 9:15 AM: Tech Institute - 20 students logged in
  - 9:18 AM: Engineering - Dr. Johnson posted announcement

---

## 🔐 Security Best Practices

### For Principals:
1. Change default password on first login
2. Regularly review teacher activities
3. Report suspicious activities to admin
4. Keep college data confidential

### For Admin:
1. **IMMEDIATELY** change default admin password
2. Never share admin credentials
3. Regular data backups using Export feature
4. Monitor for unusual activity patterns
5. Clear old activity logs quarterly for performance
6. Only clear all data in emergencies

### Password Requirements:
- Minimum 6 characters
- Case-sensitive
- Unique per user
- Change periodically

---

## 📝 How to Create Test Accounts

### Create a New Teacher:
1. Go to Login section
2. Click "Create account"
3. Enter Register Number (e.g., "dr.rajesh")
4. Select "Teacher" role
5. Enter college name
6. Set password
7. Create account → Automatically logged in

### Create a New Principal:
1. Contact Admin
2. Admin must create principal account manually OR
3. Use backup/restore feature with pre-created principal

### Create New Students:
1. Go to Login section
2. Click "Create account"
3. Enter Register Number (e.g., "CS21B050")
4. Enter Name
5. Select "Student" role
6. Enter College
7. Select Semester
8. Set password
9. Create account → Automatically logged in

---

## 🎯 Use Cases

### Use Case 1: College Principal
**Goal:** Monitor if teachers are actively posting materials

**Steps:**
1. Login as Principal
2. Go to Principal Dashboard
3. Click "Recent Activities"
4. Scan for "announcement" and "material_upload" actions
5. See which teachers are active

### Use Case 2: System Admin
**Goal:** Check which college had most logins today

**Steps:**
1. Login as Admin
2. Go to Admin Dashboard
3. View "College-wise Logins" panel
4. See login count per college
5. Compare performance

### Use Case 3: System Admin
**Goal:** Backup data before major update

**Steps:**
1. Login as Admin
2. Go to Admin Dashboard
3. Click "Export App Data"
4. Save JSON file to safe location
5. (Optional) Clear activity log to free space

---

## ⚠️ Important Notes

### The "Clear All Data" Button
- ❌ DO NOT CLICK unless absolutely necessary
- 🔒 Requires admin password confirmation
- 💥 IRREVERSIBLE - Cannot be undone
- 📊 Wipes: Users, Announcements, Materials, Fees, Activity Logs
- ✅ Better alternative: Export data first, then selectively delete

### Activity Log
- Automatically grows as users interact with app
- Use "Clear Activity Log" to manage size
- Only clears logs, doesn't affect users/content
- Safe to clear periodically

### Data Export
- Creates complete backup of entire system
- Includes all users, content, activities
- Saved as JSON file
- Can be used for data analysis
- Recommended: Weekly backups

---

## 📞 Quick Reference

| Login Type | Username | Password | Dashboard |
|-----------|----------|----------|-----------|
| **Student** | CS21B001 | 21012005 | Profile, Materials, Fees |
| **Teacher** | dr.smith | teacher123 | All student features + Post content |
| **Principal** | principal | principal123 | See college teachers + Activities |
| **Admin** | admin | admin123 | System-wide monitoring + Data management |

**CHANGE ALL PASSWORDS ON FIRST SETUP!**
