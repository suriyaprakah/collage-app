# College Hub - Admin/App Owner Login Guide

## 🚀 Quick Start: Admin Login

### Default Admin Credentials
```
Username: admin
Password: admin123
Role: App Owner / Admin
```

## 📋 Step-by-Step Login Instructions

1. **Open the College Hub App**
2. **Go to Login Section**
3. **Select Role:**
   - Click on the role dropdown menu
   - Choose **"App Owner / Admin"** (this changed from just "Admin")
4. **Enter Credentials:**
   - Username: `admin`
   - Password: `admin123`
5. **Click Login**

You'll see the message: *"Welcome, Administrator! Logged in successfully."*

## 🎛️ Admin Dashboard Features

Once logged in as Admin, you'll see:

### 1. **Admin Navigation Button**
   - New "Admin" button appears in the navigation menu
   - Click it to access the Admin Dashboard

### 2. **App Statistics Panel**
   - **Total Users:** Shows total registered users in the system
   - **Students:** Count of student accounts
   - **Teachers:** Count of teacher accounts
   - **Announcements:** Total announcements posted
   - **Materials:** Total study materials uploaded

### 3. **User Management Panel**
   - View all users in the system
   - Each user shows:
     - Full name
     - Username/Register Number
     - Role (Student/Teacher/Admin)
     - College and Department (if applicable)
   - **Actions per user:**
     - **Reset Password:** Set a new password for any user
     - **Delete:** Permanently remove a user account

### 4. **Administrative Actions**
   - **Reset Admin Password:** Securely change your admin password
   - **Export App Data:** Download complete app backup as JSON file
   - **Clear All Data:** Wipe all data and reset to defaults (⚠️ IRREVERSIBLE)

## 🔒 Security Tips

### First Login
1. ✅ Login with default credentials
2. ✅ Immediately go to Admin Dashboard
3. ✅ Click "Reset Admin Password"
4. ✅ Enter current password: `admin123`
5. ✅ Enter a new secure password
6. ✅ Share the new password securely with other admins

### Regular Maintenance
- **Weekly:** Review user list for inactive accounts
- **Monthly:** Export and backup app data
- **As needed:** Reset compromised user passwords

### Password Reset for Users
1. Go to Admin Dashboard
2. Find the user in "Manage Users"
3. Click "Reset Password"
4. Set temporary password (share with user)
5. User can change it after login

### Data Backup
1. Go to Admin Dashboard
2. Click "Export App Data"
3. A JSON file downloads automatically
4. Save it safely (Google Drive, backup drive, etc.)

### Emergency: Clear All Data
⚠️ **WARNING: This is IRREVERSIBLE!**
1. Click "Clear All Data"
2. Read the warning carefully
3. Confirm twice with passwords
4. **All users, announcements, materials, and fees will be DELETED**

---

## 📱 Using Admin Features

### Managing Users

**To reset a user's password:**
```
1. Login as admin
2. Go to Admin Dashboard → Manage Users
3. Find the user
4. Click "Reset Password"
5. Enter new password (min 6 characters)
6. Confirm new password
7. Share password with user
```

**To delete a user account:**
```
1. Login as admin
2. Go to Admin Dashboard → Manage Users
3. Find the user
4. Click "Delete"
5. Confirm deletion (cannot be undone)
```

### Viewing Statistics
- Check the "App Statistics" panel to monitor:
  - System growth (user counts)
  - Content metrics (announcements, materials)
  - Usage patterns

### Exporting Data
```
1. Admin Dashboard → Actions
2. Click "Export App Data"
3. JSON file automatically downloads
4. File name format: college-hub-export-YYYY-MM-DD.json
5. Contains all users, announcements, materials, fees, departments
```

---

## ⚙️ Admin vs Other Roles

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Login | ✅ | ✅ | ✅ |
| View Profile | ✅ | ✅ | ✅ |
| Post Announcements | ✅ | ✅ | ❌ |
| Upload Materials | ✅ | ✅ | ❌ |
| Manage Fees | ✅ | ✅ | ❌ |
| View All Students | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Admin Dashboard | ✅ | ❌ | ❌ |
| Export Data | ✅ | ❌ | ❌ |
| Reset Passwords | ✅ | ❌ | ❌ |
| Clear All Data | ✅ | ❌ | ❌ |

---

## 🆘 Troubleshooting

### "Invalid Username or Password"
- Double-check username is exactly: `admin`
- Verify password (case-sensitive)
- Make sure "App Owner / Admin" is selected in role dropdown

### "Admin Dashboard not showing"
- Confirm you logged in as Admin role
- Page should automatically show "Admin" button in navigation
- Try refreshing the page (Ctrl+R or Cmd+R)

### Can't reset password/export data
- Verify you're logged in as admin
- Check browser console for errors (F12)
- Try clearing browser cache

### Lost admin password
- Unfortunately, without the password, you'll need to:
  1. Use browser DevTools to clear localStorage
  2. Refresh page to reset to defaults
  3. Login again with `admin` / `admin123`
  4. **This will also reset all user data**

---

## 📞 Support

For issues or questions:
1. Check the Admin Dashboard
2. Review app statistics
3. Ensure backups are current
4. Contact development team with:
   - What you were trying to do
   - What error you received
   - Current admin user count
