// Mobile hamburger menu toggle
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    const btn = document.getElementById('mobileMenuBtn');
    if (nav) {
        const isOpen = nav.classList.toggle('mobile-open');
        if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}

// Open mobile nav (idempotent)
function openMobileMenu() {
    const nav = document.getElementById('nav');
    const btn = document.getElementById('mobileMenuBtn');
    if (!nav) return;
    if (!nav.classList.contains('mobile-open')) nav.classList.add('mobile-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
}

// Close mobile nav (idempotent)
function closeMobileMenu() {
    const nav = document.getElementById('nav');
    const btn = document.getElementById('mobileMenuBtn');
    if (!nav) return;
    if (nav.classList.contains('mobile-open')) nav.classList.remove('mobile-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

let currentUser = null;
let users = {};
let activityLog = []; // Track all user activities
function saveUsers() {
    localStorage.setItem('ch_users', JSON.stringify(users));
}
function saveActivityLog() {
    localStorage.setItem('ch_activity_log', JSON.stringify(activityLog.slice(-500))); // Keep last 500 activities
}
function loadActivityLog() {
    const raw = localStorage.getItem('ch_activity_log');
    if (raw) {
        try { activityLog = JSON.parse(raw); } catch (e) { activityLog = []; }
    }
}
function logActivity(type, details) {
    const activity = {
        id: 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: type, // 'login', 'logout', 'announcement', 'material_upload', etc.
        userId: currentUser,
        userName: currentUser && users[currentUser] ? users[currentUser].name : 'Unknown',
        userRole: currentUser && users[currentUser] ? users[currentUser].role : 'unknown',
        userCollege: currentUser && users[currentUser] ? users[currentUser].college : null,
        details: details
    };
    activityLog.push(activity);
    saveActivityLog();
    console.info('Activity logged:', type, details);
}
function normalizeStr(s) { if (!s) return null; try { return String(s).trim().toLowerCase(); } catch (e) { return null; } }
function pretty(s) { if (!s) return '—'; return String(s).split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }

// Helper: returns true for teacher or principal users (but not admin)
function isStaff(userId) {
    return userId && users[userId] && (users[userId].role === 'teacher' || users[userId].role === 'principal');
}

// Helper: returns true only for principal
function isPrincipal(userId) {
    return userId && users[userId] && users[userId].role === 'principal';
}

// Helper: returns true only for admin
function isAdmin(userId) {
    return userId && users[userId] && users[userId].role === 'admin';
}

// API base and token helpers for backend auth
const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : window.location.origin);
function getToken() { return localStorage.getItem('ch_token'); }
function setToken(t) { if (t) localStorage.setItem('ch_token', t); else localStorage.removeItem('ch_token'); }
function setSessionUser(user) { if (user && user.id) { users[user.id] = user; saveUsers(); localStorage.setItem('ch_user', JSON.stringify(user)); } }
function clearSessionUser() { localStorage.removeItem('ch_user'); }

async function apiFetch(path, opts = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
    return res;
}

// Departments persistence
let departments = [];
function saveDepartments() { localStorage.setItem('ch_departments', JSON.stringify(departments)); }
function loadDepartments() {
    const raw = localStorage.getItem('ch_departments');
    if (raw) {
        try { departments = JSON.parse(raw); } catch (e) { departments = []; }
    }
    if (!departments || departments.length === 0) {
        // seed departments
        departments = ['computer science','mechanical engineering','electrical engineering','civil engineering'].map(normalizeStr);
        saveDepartments();
    }
    // normalize
    departments = departments.map(normalizeStr).filter(Boolean);
    // render to any selects present
    renderDeptOptions('signupDeptSelect');
    renderDeptOptions('announceDeptSelect');
    renderDeptOptions('materialDeptSelect');
}
function addDepartment(name) {
    const n = normalizeStr(name);
    if (!n) return false;
    if (departments.indexOf(n) !== -1) return false;
    departments.push(n);
    saveDepartments();
    renderDeptOptions('signupDeptSelect');
    renderDeptOptions('announceDeptSelect');
    renderDeptOptions('materialDeptSelect');
    console.info('Department added:', n);
    return true;
}
function renderDeptOptions(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">-- Select Department --</option>' + departments.map(d => `<option value="${d}">${pretty(d)}</option>`).join('');
    if (cur) sel.value = cur; // try to keep selection
}

function loadUsers() {
    const raw = localStorage.getItem('ch_users');
    if (raw) {
        try { users = JSON.parse(raw); } catch (e) { users = {}; }
    }
    // normalize existing user college/dept fields
    Object.keys(users).forEach(k => {
        if (users[k].college) users[k].college = normalizeStr(users[k].college);
        if (users[k].dept) users[k].dept = normalizeStr(users[k].dept);
    });
    
    // ========== DEMO STUDENTS ==========
    if (!users['CS21B001']) {
        users['CS21B001'] = { password: '21012005', name: 'Rahul Sharma (Demo Student)', role: 'student', college: 'technology institute', dept: 'computer science', semester: '3rd Year' };
        saveUsers();
    }
    if (!users['BE21B002']) {
        users['BE21B002'] = { password: '01011999', name: 'Priya Patel (Demo Student)', role: 'student', college: 'business school', dept: null, semester: '2nd Year' };
        saveUsers();
    }
    if (!users['CE21B003']) {
        users['CE21B003'] = { password: '15051998', name: 'Amit Kumar (Demo Student)', role: 'student', college: 'engineering college', dept: 'civil engineering', semester: '4th Year' };
        saveUsers();
    }
    
    // ========== DEMO TEACHERS ==========
    if (!users['dr.smith']) {
        users['dr.smith'] = { password: 'teacher123', name: 'Dr. James Smith (Teacher)', role: 'teacher', college: 'technology institute', dept: 'computer science', semester: null };
        saveUsers();
    }
    if (!users['dr.rajesh']) {
        users['dr.rajesh'] = { password: 'teacher123', name: 'Dr. Rajesh Kumar (Teacher)', role: 'teacher', college: 'business school', dept: null, semester: null };
        saveUsers();
    }
    if (!users['prof.sharma']) {
        users['prof.sharma'] = { password: 'teacher123', name: 'Prof. Sharma (Teacher)', role: 'teacher', college: 'engineering college', dept: 'mechanical engineering', semester: null };
        saveUsers();
    }
    
    // ========== COLLEGE PRINCIPALS/ADMINS ==========
    if (!users['principal.tech']) {
        users['principal.tech'] = { password: 'principal123', name: 'Dr. Vikram Singh (Principal - Technology Institute)', role: 'principal', college: 'technology institute', dept: null, semester: null };
        saveUsers();
    }
    if (!users['principal.business']) {
        users['principal.business'] = { password: 'principal123', name: 'Dr. Anjali Verma (Principal - Business School)', role: 'principal', college: 'business school', dept: null, semester: null };
        saveUsers();
    }
    if (!users['principal.engineering']) {
        users['principal.engineering'] = { password: 'principal123', name: 'Dr. Ravi Patel (Principal - Engineering College)', role: 'principal', college: 'engineering college', dept: null, semester: null };
        saveUsers();
    }
    
    // ========== SYSTEM ADMIN ==========
    if (!users['admin']) {
        users['admin'] = { password: 'admin123', name: 'System Administrator', role: 'admin', college: null, dept: null, semester: null };
        saveUsers();
    }
    
    // Legacy principal account (kept for backward compatibility)
    if (!users['principal']) {
        users['principal'] = { password: 'principal123', name: 'Principal (Test Account)', role: 'principal', college: 'technology institute', dept: null, semester: null };
        saveUsers();
    }
}
loadUsers();
loadActivityLog();
loadUsers();
// initialize in-memory stores (declared early so handlers don't hit TDZ)
let materials = [];
let fees = [];
// load departments first (used by signup/teacher controls)
loadDepartments();
// load materials after users are available
loadMaterials();
// --- Announcements persistence & UI ---
let announcements = [];
function saveAnnouncements() { localStorage.setItem('ch_announcements', JSON.stringify(announcements)); }
function loadAnnouncements() {
    const raw = localStorage.getItem('ch_announcements');
    if (raw) {
        try { announcements = JSON.parse(raw); } catch (e) { announcements = []; }
    }
    if (announcements.length === 0) {
        announcements.push({ text: 'Welcome to Semester 2025! Exam dates updated.', author: 'Admin', date: '2025-12-01', college: null, dept: null });
        announcements.push({ text: 'Cultural Fest on Dec 25th - Register now!', author: 'Admin', date: '2025-11-20', college: null, dept: null });
        saveAnnouncements();
    }
    // normalize announcement scopes and ensure ids
    announcements.forEach(a => {
        if (a.college) a.college = normalizeStr(a.college);
        if (a.dept) a.dept = normalizeStr(a.dept);
        if (!a.id) a.id = 'a_' + (a.date ? a.date.replace(/[^0-9]/g,'') : Date.now()) + '_' + Math.floor(Math.random()*10000);
    });
    renderAnnouncements();
}
function renderAnnouncements() {
    const list = document.getElementById('announceList');
    if (!list) return;
    list.innerHTML = '';
    const u = currentUser ? (users[currentUser] || {}) : null;
    console.info('renderAnnouncements: user=', currentUser, 'u.college=', u ? u.college : null, 'u.dept=', u ? u.dept : null, 'announcements=', announcements.length);
    const filtered = announcements.slice().reverse().filter(a => {
        if (!currentUser) return !a.college && !a.dept; // anonymous - only public announcements
        if (a.college && u.college && a.college !== u.college) return false;
        if (a.dept && u.dept && a.dept !== u.dept) return false;
        // if announcement has college/dept set but user doesn't have those fields, still show only if public or matching
        if (a.college && !u.college) return false;
        if (a.dept && !u.dept) return false;
        return true;
    });
    console.info('renderAnnouncements: filtered=', filtered.length);
    filtered.forEach(a => {
        const d = document.createElement('div');
        d.className = 'card';
        let scope = '';
        if (a.college) scope += `College: ${a.college}`;
        if (a.dept) scope += (scope ? ' • ' : '') + `Dept: ${a.dept}`;
        // build file link if present (supports local dataUrl or server fileUrl/filePath)
        let fileHtml = '';
        if (a.fileDataUrl && a.fileName) {
            fileHtml = `<div style="margin-top:6px"><a href="${a.fileDataUrl}" download="${a.fileName}">Download ${a.fileName}</a></div>`;
        } else if (a.fileUrl) {
            fileHtml = `<div style="margin-top:6px"><a href="${a.fileUrl}" target="_blank" rel="noopener">Download poster</a></div>`;
        }
        // staff actions (teachers or admins)
        const isStaffUser = isStaff(currentUser);
        const actions = [];
        // Teachers may only delete announcements (no inline edit from UI)
        if (isStaffUser) {
            actions.push(`<button onclick="deleteAnnouncement('${a.id}')" class="btn-danger">Delete</button>`);
        }
        d.innerHTML = `<div style="font-size:0.95em;color:#333">${a.text}${fileHtml}</div><div style="font-size:0.85em;color:#666;margin-top:8px">By: ${a.author} • ${a.date}${scope ? ' • ' + scope : ''}</div><div style="margin-top:8px">${actions.join(' ')}</div>`;
        list.appendChild(d);
    });
}
let _editingAnnouncementId = null;

function addAnnouncement() {
    if (!isStaff(currentUser)) { alert('Only teachers or admins can post announcements.'); return; }
    const txtEl = document.getElementById('announceText');
    const txt = txtEl.value.trim();
    const college = document.getElementById('announceCollege') ? normalizeStr(document.getElementById('announceCollege').value) : null;
    const deptSel = document.getElementById('announceDeptSelect');
    const deptNew = document.getElementById('announceDeptNew') ? document.getElementById('announceDeptNew').value.trim() : '';
    const dept = deptNew ? normalizeStr(deptNew) : (deptSel && deptSel.value ? normalizeStr(deptSel.value) : null);
    if (!txt) { alert('Enter announcement text'); return; }
    const nCollege = college || null;
    const nDept = dept || null;

    const fileInput = document.getElementById('announceFile');
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    function finishPush(obj) {
        // Always create a new announcement; editing announcements is disabled.
        announcements.push(obj);
        saveAnnouncements();
        renderAnnouncements();
        txtEl.value = '';
        if (document.getElementById('announceCollege')) document.getElementById('announceCollege').value = '';
        if (document.getElementById('announceDept')) document.getElementById('announceDept').value = '';
        if (fileInput) fileInput.value = '';
        const curFile = document.getElementById('announceCurrentFile'); if (curFile) { curFile.style.display = 'none'; curFile.innerText = ''; }
    }

    const base = { id: 'a_' + Date.now() + '_' + Math.floor(Math.random()*1000), text: txt, author: users[currentUser].name || currentUser, date: new Date().toISOString().split('T')[0], college: nCollege, dept: nDept };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = e.target.result;
            finishPush({ ...base, fileDataUrl: fileData, fileName: file.name });
        };
        reader.onerror = function() { alert('Error reading file'); };
        reader.readAsDataURL(file);
    } else {
        finishPush(base);
    }
}

function startEditAnnouncement(id) {
    // Editing announcements via UI is disabled. Teachers may only delete announcements.
    alert('Editing announcements is disabled; teachers can only delete announcements.');
}

function deleteAnnouncement(id) {
    if (!currentUser || !users[currentUser] || users[currentUser].role !== 'teacher') {
        alert('Only teachers can delete announcements.');
        return;
    }
    if (!confirm('Delete this announcement?')) return;
    
    // Find the numeric ID from the announcement
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;
    
    // For backend: use numeric id if available, otherwise use the local id
    const numericId = announcement.backendId || announcement.id;
    
    // Call backend API
    apiFetch(`/announcements/${numericId}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) {
                alert('Failed to delete announcement');
                return;
            }
            // Remove from local list
            const idx = announcements.findIndex(a => a.id === id);
            if (idx !== -1) {
                announcements.splice(idx, 1);
                saveAnnouncements();
                renderAnnouncements();
            }
            logActivity('announcement_deleted', { announcementId: id });
        })
        .catch(e => {
            console.error('Delete announcement error:', e);
            alert('Error deleting announcement');
        });
}
// --- Fees persistence & UI ---
fees = fees || [];
function saveFees() { localStorage.setItem('ch_fees', JSON.stringify(fees)); }
function loadFees() {
    const raw = localStorage.getItem('ch_fees');
    if (raw) {
        try { fees = JSON.parse(raw); } catch (e) { fees = []; }
    }
    if (fees.length === 0) {
        fees.push({ regNo: 'CS21B001', type: 'Tuition', amount: '25000', status: 'Paid', due: '2025-12-01' });
        fees.push({ regNo: 'CS21B002', type: 'Library', amount: '2000', status: 'Pending', due: '2025-12-31' });
        saveFees();
    }
    renderFees();
}
function renderFees(filterRegNo) {
    const tbody = document.getElementById('feesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let list = fees;
    if (filterRegNo) list = fees.filter(f => f.regNo === filterRegNo);
    else if (currentUser && users[currentUser] && users[currentUser].role === 'student') list = fees.filter(f => f.regNo === currentUser);
    list.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${f.regNo}</td><td>${f.type}</td><td>${f.amount}</td><td>${f.status}</td><td>${f.due}</td>`;
        tbody.appendChild(tr);
    });
}
function addFee() {
    if (!isStaff(currentUser)) { alert('Only teachers or admins can add fees.'); return; }
    const regNo = document.getElementById('feeRegNo').value.trim();
    if (!regNo) { alert('Enter Register No'); return; }
    const type = document.getElementById('feeType').value.trim();
    const amount = document.getElementById('feeAmount').value;
    const status = document.getElementById('feeStatus').value;
    const due = document.getElementById('feeDueDate').value;
    fees.push({ regNo, type, amount, status, due });
    saveFees();
    renderFees();
    document.getElementById('feeRegNo').value = '';
    document.getElementById('feeType').value = '';
    document.getElementById('feeAmount').value = '';
    document.getElementById('feeDueDate').value = '';
}
// --- Students list & view ---
function renderUsersList() {
    const list = document.getElementById('studentsList');
    if (!list) return;
    list.innerHTML = '';
    const isStaffUser = isStaff(currentUser);
    Object.keys(users).forEach(k => {
        if (users[k].role && users[k].role === 'student') {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            const actions = [];
            actions.push(`<button onclick="viewStudent('${k}')">View</button>`);
            if (isStaffUser) actions.push(`<button onclick="deleteUser('${k}')" class="btn-danger">Delete</button>`);
            div.innerHTML = `<div><b>${users[k].name}</b><div style="font-size:0.9em;color:#666">${k}</div></div><div>${actions.join(' ')}</div>`;
            list.appendChild(div);
        }
    });
}

function deleteAccount() {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    const wasCurrent = currentUser;
    delete users[currentUser];
    saveUsers();
    alert('Your account was deleted. You will be logged out.');
    // ensure UI reflects deletion
    logout();
}

function deleteUser(regNo) {
    if (!isStaff(currentUser)) { alert('Only teachers or admins can delete other accounts.'); return; }
    if (!users[regNo]) { alert('User not found.'); return; }
    if (!confirm(`Delete account ${regNo}? This cannot be undone.`)) return;
    delete users[regNo];
    saveUsers();
    renderUsersList();
    alert(`Account ${regNo} deleted.`);
}
function viewStudent(regNo) {
    if (!users[regNo]) return;
    const info = document.getElementById('profileInfo');
    info.innerHTML = `Register No: ${regNo}<br>Name: ${users[regNo].name || regNo}<br>Role: ${users[regNo].role || 'student'}`;
    info.className = 'status success';
    showSection('profile');
    renderFees(regNo);
}

function updateUI() {
    // If no user is logged in, show only Login and Suggestions
    if (!currentUser) {
        // Show only Login and Suggestions
        document.getElementById('navLogin').style.display = 'inline-block';
        document.getElementById('navSuggestions').style.display = 'inline-block';
        // Hide all other buttons
        document.getElementById('navProfile').style.display = 'none';
        document.getElementById('navAnnouncements').style.display = 'none';
        document.getElementById('navAttendance').style.display = 'none';
        document.getElementById('navMaterials').style.display = 'none';
        document.getElementById('navFees').style.display = 'none';
        document.getElementById('navStudents').style.display = 'none';
        document.getElementById('navTeacher').style.display = 'none';
        document.getElementById('navPrincipal').style.display = 'none';
        document.getElementById('navAdmin').style.display = 'none';
        // Hide all staff controls
        const mc = document.getElementById('materialsControls');
        if (mc) mc.style.display = 'none';
        const ac = document.getElementById('announceControls');
        if (ac) ac.style.display = 'none';
        const fc = document.getElementById('feesControls');
        if (fc) fc.style.display = 'none';
        return;
    }
    
    // For Admin: Show only Admin section
    if (isAdmin(currentUser)) {
        // Show Login, Suggestions, Admin
        document.getElementById('navLogin').style.display = 'inline-block';
        document.getElementById('navSuggestions').style.display = 'inline-block';
        document.getElementById('navAdmin').style.display = 'inline-block';
        // Hide all other buttons
        document.getElementById('navProfile').style.display = 'none';
        document.getElementById('navAnnouncements').style.display = 'none';
        document.getElementById('navAttendance').style.display = 'none';
        document.getElementById('navMaterials').style.display = 'none';
        document.getElementById('navFees').style.display = 'none';
        document.getElementById('navStudents').style.display = 'none';
        document.getElementById('navTeacher').style.display = 'none';
        document.getElementById('navPrincipal').style.display = 'none';
        return;
    }
    
    // For Principal: Show Principal section
    if (isPrincipal(currentUser)) {
        // Show Login, Suggestions, Principal
        document.getElementById('navLogin').style.display = 'inline-block';
        document.getElementById('navSuggestions').style.display = 'inline-block';
        document.getElementById('navPrincipal').style.display = 'inline-block';
        // Hide all other buttons
        document.getElementById('navProfile').style.display = 'none';
        document.getElementById('navAnnouncements').style.display = 'none';
        document.getElementById('navAttendance').style.display = 'none';
        document.getElementById('navMaterials').style.display = 'none';
        document.getElementById('navFees').style.display = 'none';
        document.getElementById('navStudents').style.display = 'none';
        document.getElementById('navTeacher').style.display = 'none';
        document.getElementById('navAdmin').style.display = 'none';
        renderPrincipalDashboard();
        return;
    }
    
    // For Teachers: Show all except Admin and Principal
    const u = currentUser && users[currentUser] ? users[currentUser] : null;
    const isTeacher = u && u.role === 'teacher';
    
    if (isTeacher) {
        // Show all regular buttons including Students and Manage Announcements
        document.getElementById('navLogin').style.display = 'inline-block';
        document.getElementById('navProfile').style.display = 'inline-block';
        document.getElementById('navAnnouncements').style.display = 'inline-block';
        document.getElementById('navAttendance').style.display = 'inline-block';
        document.getElementById('navMaterials').style.display = 'inline-block';
        document.getElementById('navFees').style.display = 'inline-block';
        document.getElementById('navStudents').style.display = 'inline-block';
        document.getElementById('navTeacher').style.display = 'inline-block';
        document.getElementById('navSuggestions').style.display = 'inline-block';
        // Hide Admin and Principal
        document.getElementById('navAdmin').style.display = 'none';
        document.getElementById('navPrincipal').style.display = 'none';
        // Show teacher controls
        const mc = document.getElementById('materialsControls');
        if (mc) mc.style.display = 'flex';
        const ac = document.getElementById('announceControls');
        if (ac) ac.style.display = 'block';
        const fc = document.getElementById('feesControls');
        if (fc) fc.style.display = 'flex';
        return;
    }
    
    // For Students: Show regular buttons except Students, Manage Announcements, Admin, Principal
    const isStudent = u && u.role === 'student';
    
    if (isStudent) {
        // Show basic buttons for students
        document.getElementById('navLogin').style.display = 'inline-block';
        document.getElementById('navProfile').style.display = 'inline-block';
        document.getElementById('navAnnouncements').style.display = 'inline-block';
        document.getElementById('navAttendance').style.display = 'inline-block';
        document.getElementById('navMaterials').style.display = 'inline-block';
        document.getElementById('navFees').style.display = 'inline-block';
        document.getElementById('navSuggestions').style.display = 'inline-block';
        // Hide staff-only buttons
        document.getElementById('navStudents').style.display = 'none';
        document.getElementById('navTeacher').style.display = 'none';
        document.getElementById('navAdmin').style.display = 'none';
        document.getElementById('navPrincipal').style.display = 'none';
        // Hide staff controls
        const mc = document.getElementById('materialsControls');
        if (mc) mc.style.display = 'none';
        const ac = document.getElementById('announceControls');
        if (ac) ac.style.display = 'none';
        const fc = document.getElementById('feesControls');
        if (fc) fc.style.display = 'none';
        return;
    }
}
// load announcements and fees now
loadAnnouncements();
loadFees();
loadSuggestions();

// --- Debug console helpers ---
const _origConsole = { log: console.log.bind(console), info: console.info.bind(console), warn: console.warn.bind(console), error: console.error.bind(console) };
function debugSafeString(args) {
    try { return args.map(a => { if (typeof a === 'object') return JSON.stringify(a); return String(a); }).join(' '); } catch (e) { return String(args); }
}
function debugLog(level, ...args) {
    try {
        const body = document.getElementById('debugBody');
        if (!body) { _origConsole[level](...args); return; }
        const div = document.createElement('div');
        div.className = 'debug-msg debug-' + (level === 'log' ? 'log' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error');
        const ts = new Date().toLocaleTimeString();
        div.innerText = `[${ts}] ${level.toUpperCase()}: ${debugSafeString(args)}`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        _origConsole[level](...args);
    } catch (e) {
        _origConsole.error('debugLog failed', e);
    }
}
function debugClear() { const body = document.getElementById('debugBody'); if (body) body.innerHTML = ''; console.clear(); }
function toggleDebug(show) {
    const panel = document.getElementById('debugPanel');
    const toggle = document.getElementById('debugToggle');
    if (typeof show === 'boolean') { panel.style.display = show ? 'block' : 'none'; toggle.style.display = show ? 'none' : 'flex'; return; }
    if (panel.style.display === 'none') { panel.style.display = 'block'; toggle.style.display = 'none'; } else { panel.style.display = 'none'; toggle.style.display = 'flex'; }
}
function debugInit() {
    // override console methods
    console.log = function(...args){ debugLog('log', ...args); };
    console.info = function(...args){ debugLog('info', ...args); };
    console.warn = function(...args){ debugLog('warn', ...args); };
    console.error = function(...args){ debugLog('error', ...args); };

    // capture global errors
    window.onerror = function(message, source, lineno, colno, error) {
        debugLog('error', `${message} at ${source}:${lineno}:${colno}`);
    };
    window.addEventListener('unhandledrejection', function(e){ debugLog('error', 'Unhandled Rejection:', e.reason || e); });

    // small message
    debugLog('info', 'Debug console initialized');
}

// initialize debug console
try { debugInit(); } catch (e) { _origConsole.error('Failed to init debug console', e); }



function showSection(sectionId) {
    // allow the Suggestions page to be opened even when not logged in
    if (sectionId !== 'login' && sectionId !== 'suggestions' && !currentUser) {
        // require login to access other sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById('login').classList.add('active');
        const status = document.getElementById('loginStatus');
        status.innerHTML = 'Please login to access this section.';
        status.className = 'status error';
        return;
    }
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    // when opening materials, refresh list for current user
    if (sectionId === 'materials') {
        try { renderMaterials(); } catch (e) { console.error('renderMaterials failed on showSection', e); }
    }
    // when opening suggestions, show student's own complaints if they're logged in + start polling
    if (sectionId === 'suggestions') {
        try { renderStudentSuggestions(); startSuggestionPolling(); } catch (e) { console.error('renderStudentSuggestions failed', e); }
    } else {
        stopSuggestionPolling();
    }
    // when opening teacher management, refresh announcements list
    if (sectionId === 'teacherManagement') {
        try { renderTeacherAnnouncements(); } catch (e) { console.error('renderTeacherAnnouncements failed', e); }
    }
    // when opening principal dashboard, start polling
    if (sectionId === 'principal') {
        try { startPrincipalPolling(); } catch (e) { console.error('startPrincipalPolling failed', e); }
    } else {
        stopPrincipalPolling();
    }
}

function login() {
    const regNo = document.getElementById('regNo').value;
    const pwd = document.getElementById('password').value;
    const status = document.getElementById('loginStatus');
    if (users[regNo] && users[regNo].password === pwd) {
        // Prevent multiple principals from same college logging in simultaneously
        if (users[regNo].role === 'principal') {
            const loggedInUsers = getLoggedInUsers();
            const principalCollege = users[regNo].college;
            const otherPrincipalLogged = Object.keys(users).find(k => 
                k !== regNo && 
                users[k].role === 'principal' && 
                users[k].college === principalCollege && 
                loggedInUsers[k] === true
            );
            if (otherPrincipalLogged) {
                status.innerHTML = `Another principal from ${principalCollege} is already logged in. Only one principal per college allowed.`;
                status.className = 'status error';
                return;
            }
        }

        currentUser = regNo;
        const displayName = users[regNo].name || regNo;
        const role = users[regNo].role || 'student';
        
        status.innerHTML = `Welcome, ${displayName}! Logged in successfully.`;
        status.className = 'status success';
        
        // Log the login activity
        logActivity('login', { 
            action: 'User logged in',
            college: users[regNo].college || 'N/A'
        });
        
        // show header user badge and logout button
        const userBadge = document.getElementById('userBadge');
        const logoutBtn = document.getElementById('logoutBtn');
        if (userBadge) { userBadge.innerText = `Logged in as ${displayName} (${role})`; userBadge.style.display = 'inline-block'; }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        updateUI();
        
        // For Admin: Go directly to admin dashboard (skip profile)
        if (role === 'admin') {
            showSection('admin');
        } else if (role === 'principal') {
            // For Principal: Go directly to principal dashboard to see logged-in teachers
            showSection('principal');
        } else {
            // For students and teachers: Show profile first
            updateProfile();
            const loginSemEl = document.getElementById('loginSem');
            if (loginSemEl) loginSemEl.innerText = (role === 'student' && users[regNo] && users[regNo].semester) ? `Semester: ${users[regNo].semester}` : '';
            showSection('profile');
        }
        
        try { renderMaterials(); } catch(e) { console.error('renderMaterials failed on login', e); }
        // If on a small screen, open the mobile nav so the menu bar is visible after login
        try {
            if (window && window.innerWidth && window.innerWidth <= 768) openMobileMenu();
        } catch (e) { /* ignore */ }
    } else {
        const loginRole = document.getElementById('loginRole') ? document.getElementById('loginRole').value : 'student';
        const idLabelLogin = (loginRole === 'teacher' || loginRole === 'principal' || loginRole === 'admin') ? 'Username' : 'Register No';
        status.innerHTML = `Invalid ${idLabelLogin} or Password.`;
        status.className = 'status error';
        updateUI();
    }
}

function updateProfile() {
    const u = users[currentUser] || {};
    const name = u.name ? u.name : 'John Doe (Demo)';
    const role = u.role ? u.role : 'student';
    const college = u.college ? u.college : '—';
    const dept = u.dept ? u.dept : '—';
    const idLabelProfile = (u.role === 'teacher' || u.role === 'admin') ? 'Username' : 'Register No';
    const semesterLine = (u.role === 'teacher' || u.role === 'admin') ? '' : `Semester: ${u.semester || '—'}<br>`;
    
    // Update profile header based on role
    const profileHeader = document.getElementById('profileHeader');
    if (profileHeader) {
        if (role === 'teacher') {
            profileHeader.innerText = '👨‍🏫 Teacher Profile';
        } else if (role === 'principal') {
            profileHeader.innerText = '🏫 Principal Profile';
        } else if (role === 'admin') {
            profileHeader.innerText = '⚙️ Admin Profile';
        } else {
            profileHeader.innerText = '👤 Student Profile';
        }
    }
    
    document.getElementById('profileInfo').innerHTML = `
        ${idLabelProfile}: ${currentUser}<br>
        Name: ${name}<br>
        Role: ${role}<br>
        College: ${college}<br>
        Department: ${dept}<br>
        ${semesterLine}
    `;
    document.getElementById('profileInfo').className = 'status success';
    const userBadge = document.getElementById('userBadge');
    const logoutBtn = document.getElementById('logoutBtn');
    const delBtn = document.getElementById('deleteAccountBtn');
    if (userBadge) { userBadge.innerText = `Logged in as ${name} (${role})`; userBadge.style.display = 'inline-block'; }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (delBtn) delBtn.style.display = 'inline-block';
    updateUI();
}

function markAttendance() {
    const status = document.getElementById('attendanceStatus');
    status.innerHTML = 'Attendance Marked! (GPS: On Campus)';
    status.className = 'status success';
    const tbody = document.querySelector('#attendanceTable tbody');
    const row = tbody.insertRow();
    row.innerHTML = `<td>${new Date().toISOString().split('T')[0]}</td><td>Web Dev</td><td>Present</td><td>97%</td>`;
}

materials = materials || [];
function saveMaterials() { localStorage.setItem('ch_materials', JSON.stringify(materials)); }
function loadMaterials() {
    const raw = localStorage.getItem('ch_materials');
    if (raw) {
        try { materials = JSON.parse(raw); } catch (e) { materials = []; }
    }
    if (materials.length === 0) {
        materials.push({ name: 'AI Notes - Unit 1.pdf', uploader: users['CS21B001'] ? users['CS21B001'].name || 'CS21B001' : 'CS21B001', date: '2025-12-20', college: null, dept: null });
        saveMaterials();
    }
    // normalize existing material scopes
    materials.forEach(m => { if (m.college) m.college = normalizeStr(m.college); if (m.dept) m.dept = normalizeStr(m.dept); });
    renderMaterials();
}
function renderMaterials() {
    const list = document.getElementById('fileList');
    list.innerHTML = '';
    const u = currentUser ? (users[currentUser] || {}) : null;
    console.info('renderMaterials: user=', currentUser, 'u.college=', u ? u.college : null, 'u.dept=', u ? u.dept : null, 'materials=', materials.length);
    // Students should see only public materials or those targeted at their college/department.
    // Anonymous users see only public materials. Staff see materials scoped to their college/dept.
    const isStudent = currentUser && users[currentUser] && users[currentUser].role === 'student';
    let filtered = [];
    if (!currentUser) {
        filtered = materials.filter(m => !m.college && !m.dept);
    } else if (isStudent) {
        // Only show public or matching college/dept materials to students
        filtered = materials.filter(m => {
            if (!m.college && !m.dept) return true; // public
            if (m.college && u.college && m.college !== u.college) return false;
            if (m.dept && u.dept && m.dept !== u.dept) return false;
            if (m.college && !u.college) return false;
            if (m.dept && !u.dept) return false;
            return true;
        });
    } else {
        // Staff/admin view: show public and items that match their college/dept (or all for admin)
        filtered = materials.filter(m => {
            if (!m.college && !m.dept) return true;
            if (m.college && u.college && m.college !== u.college) return false;
            if (m.dept && u.dept && m.dept !== u.dept) return false;
            if (m.college && !u.college) return false;
            if (m.dept && !u.dept) return false;
            return true;
        });
    }
    console.info('renderMaterials: filtered=', filtered.length);
    filtered.forEach((m, idx) => {
        const li = document.createElement('li');
        let scope = '';
        if (m.college) scope += `College: ${m.college}`;
        if (m.dept) scope += (scope ? ' • ' : '') + `Dept: ${m.dept}`;
        if (m.dataUrl) {
            li.innerHTML = `${m.name} <span style="font-size:0.9em;color:#666">(${m.uploader} - ${m.date})</span>${scope ? ' <span style="font-size:0.85em;color:#666">• ' + scope + '</span>' : ''} <a href="${m.dataUrl}" download="${m.name}">Download</a>`;
        } else {
            li.innerHTML = `${m.name} <span style="font-size:0.9em;color:#666">(${m.uploader} - ${m.date})</span>${scope ? ' <span style="font-size:0.85em;color:#666">• ' + scope + '</span>' : ''} <button onclick="downloadMaterial(${idx})">Download</button>`;
        }
        // If staff, add delete control for materials
        if (isStaff(currentUser)) {
            const delBtn = document.createElement('button');
            delBtn.innerText = 'Delete';
            delBtn.className = 'btn-danger';
            delBtn.style.marginLeft = '8px';
            delBtn.onclick = function() { deleteMaterial(idx); };
            li.appendChild(delBtn);
        }
        list.appendChild(li);
    });
    const info = document.getElementById('materialsInfo');
    if (isStaff(currentUser)) {
        if (info) info.innerText = 'You can upload materials here.';
    } else {
        if (info) info.innerText = 'Materials view-only. Only teachers or admins can upload materials.';
    }
    updateUI();
}
function uploadFile() {
    if (!isStaff(currentUser)) {
        alert('Only teachers or admins can upload materials.');
        return;
    }
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput) { alert('Upload control not found.'); return; }
    const files = Array.from(fileInput.files || []);
    const targetCollege = document.getElementById('materialCollege') ? normalizeStr(document.getElementById('materialCollege').value) : null;
    const deptSel = document.getElementById('materialDeptSelect');
    const deptNew = document.getElementById('materialDeptNew') ? document.getElementById('materialDeptNew').value.trim() : '';
    const targetDept = deptNew ? normalizeStr(deptNew) : (deptSel && deptSel.value ? normalizeStr(deptSel.value) : null);
    const nCollege = targetCollege || null;
    const nDept = targetDept || null;
    if (files.length === 0) { alert('Select files to upload.'); return; }
    let uploaded = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            materials.push({ name: file.name, uploader: users[currentUser].name || currentUser, date: new Date().toISOString().split('T')[0], dataUrl: e.target.result, college: nCollege, dept: nDept });
            console.info('Material uploaded:', file.name, 'college=', nCollege, 'dept=', nDept);
            uploaded++;
            saveMaterials();
            renderMaterials();
            if (uploaded === files.length) {
                alert(`${uploaded} files uploaded and saved.`);
                fileInput.value = '';
                if (document.getElementById('materialCollege')) document.getElementById('materialCollege').value = '';
                // clear both dept select and new dept input
                const mSel = document.getElementById('materialDeptSelect'); if (mSel) mSel.value = '';
                const mNew = document.getElementById('materialDeptNew'); if (mNew) mNew.value = '';
            }
        };
        reader.onerror = function() {
            alert('Error reading file '+file.name);
        };
        reader.readAsDataURL(file);
    });
}
function downloadMaterial(index) {
    const m = materials[index];
    if (!m) return;
    if (m.dataUrl) {
        // create temporary link
        const a = document.createElement('a');
        a.href = m.dataUrl;
        a.download = m.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        alert(`${m.name} downloaded! (Demo)`);
    }
}

// --- Suggestions persistence & UI ---
let suggestions = [];
let suggestionPollingInterval = null;
const SUGGESTION_POLL_INTERVAL = 2000; // Poll every 2 seconds for real-time updates

function saveSuggestions() { localStorage.setItem('ch_suggestions', JSON.stringify(suggestions)); }
function loadSuggestions() {
    const raw = localStorage.getItem('ch_suggestions');
    if (raw) {
        try { suggestions = JSON.parse(raw); } catch (e) { suggestions = []; }
    }
}

// Start polling for suggestion updates (real-time)
function startSuggestionPolling() {
    if (suggestionPollingInterval) return; // Already running
    suggestionPollingInterval = setInterval(() => {
        const raw = localStorage.getItem('ch_suggestions');
        if (raw) {
            try {
                const fresh = JSON.parse(raw);
                suggestions = fresh;
                // Refresh the current view if on suggestions section
                const activeSection = document.querySelector('.section.active');
                if (activeSection && activeSection.id === 'suggestions') {
                    renderStudentSuggestions();
                }
            } catch (e) { /* ignore */ }
        }
    }, SUGGESTION_POLL_INTERVAL);
}

// Stop polling for suggestions
function stopSuggestionPolling() {
    if (suggestionPollingInterval) {
        clearInterval(suggestionPollingInterval);
        suggestionPollingInterval = null;
    }
}

// Start polling for principal dashboard updates (real-time)
function startPrincipalPolling() {
    if (window._principalPollingInterval) return; // Already running
    window._principalPollingInterval = setInterval(() => {
        if (isPrincipal(currentUser)) {
            const activeSection = document.querySelector('.section.active');
            if (activeSection && activeSection.id === 'principal') {
                const raw = localStorage.getItem('ch_suggestions');
                if (raw) {
                    try {
                        const fresh = JSON.parse(raw);
                        suggestions = fresh;
                        renderPrincipalDashboard();
                    } catch (e) { /* ignore */ }
                }
            }
        }
    }, SUGGESTION_POLL_INTERVAL);
}

// Stop polling for principal dashboard
function stopPrincipalPolling() {
    if (window._principalPollingInterval) {
        clearInterval(window._principalPollingInterval);
        window._principalPollingInterval = null;
    }
}
loadSuggestions();

function submitSuggestion() {
    try {
        console.log('submitSuggestion called');
        const ta = document.getElementById('suggestionText');
        const text = ta ? (ta.value || '').trim() : '';
        if (!text) {
            const statusEl = document.getElementById('suggestionStatus');
            if (statusEl) { statusEl.innerText = 'Please enter a suggestion or complaint.'; statusEl.className = 'status error'; }
            return;
        }
        
        // Get suggestion type (suggestion or complaint)
        const typeRadios = document.getElementsByName('suggestionType');
        let suggestionType = 'suggestion';
        for (let radio of typeRadios) {
            if (radio.checked) {
                suggestionType = radio.value;
                break;
            }
        }
        
        console.log('Suggestion type:', suggestionType);
        
        const u = currentUser && users[currentUser] ? users[currentUser] : null;
        const userCollege = currentUser && u ? normalizeStr(u.college) : null;
        const suggestion = {
            id: 'sug_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: text,
            type: suggestionType,
            timestamp: new Date().toISOString(),
            submittedBy: currentUser ? (users[currentUser].name || currentUser) : 'Anonymous',
            submittedById: currentUser,
            submittedByRole: currentUser ? (users[currentUser].role || 'unknown') : 'anonymous',
            college: userCollege,
            status: 'new',
            principalReply: null,
            replyTimestamp: null
        };
        
        console.log('Suggestion object created:', suggestion);
        
        // Save suggestion
        suggestions.push(suggestion);
        saveSuggestions();
        
        console.log('Suggestion saved. Total suggestions:', suggestions.length);
        
        const statusEl = document.getElementById('suggestionStatus');
        
        // If complaint, show redirect message to principal login
        if (suggestionType === 'complaint') {
            console.log('Complaint detected, redirecting to principal login');
            if (statusEl) { 
                statusEl.innerHTML = '✓ <strong>Complaint submitted!</strong><br>Redirecting to Principal Login to review your complaint...'; 
                statusEl.className = 'status success'; 
            }
            if (ta) ta.value = '';
            
            // Redirect to principal login after 2 seconds
            setTimeout(function() {
                try {
                    // Set login role to principal
                    const roleSelect = document.getElementById('loginRole');
                    if (roleSelect) roleSelect.value = 'principal';
                    // Trigger role change to update placeholders
                    onLoginRoleChange();
                    // Show login section
                    showSection('login');
                    // Clear any existing form data
                    const regNo = document.getElementById('regNo');
                    const password = document.getElementById('password');
                    if (regNo) regNo.value = '';
                    if (password) password.value = '';
                    if (statusEl) statusEl.innerHTML = '';
                } catch (e) {
                    console.error('Error during complaint redirect:', e);
                }
            }, 2000);
        } else {
            // For suggestions
            console.log('Suggestion submitted');
            if (statusEl) { 
                statusEl.innerHTML = '✓ Suggestion submitted successfully!'; 
                statusEl.className = 'status success'; 
            }
            if (ta) ta.value = '';
        }
        
        // Refresh student's suggestions view if function exists (non-critical)
        try {
            if (typeof renderStudentSuggestions === 'function') {
                renderStudentSuggestions();
            }
        } catch (e) {
            console.warn('renderStudentSuggestions error (non-critical):', e);
            // Don't show error to user - this is optional
        }
        
        console.log('submitSuggestion completed successfully');
    } catch (e) {
        console.error('Critical error in submitSuggestion:', e);
        const statusEl = document.getElementById('suggestionStatus');
        if (statusEl) { 
            statusEl.innerHTML = '❌ Critical error: ' + e.message; 
            statusEl.className = 'status error'; 
        }
    }
}

function renderStudentSuggestions() {
    const u = currentUser && users[currentUser] ? users[currentUser] : null;
    if (!u || u.role !== 'student') return; // Only for students
    
    // Find or create suggestions list container
    let list = document.getElementById('studentSuggestionsList');
    if (!list) {
        list = document.createElement('div');
        list.id = 'studentSuggestionsList';
        list.style.marginTop = '30px';
        const suggestionSection = document.getElementById('suggestions');
        if (suggestionSection) {
            suggestionSection.appendChild(list);
        }
    }
    
    list.innerHTML = '';
    
    // Get this student's suggestions
    const myCollege = u.college || null;
    const mySuggestions = suggestions
        .filter(s => s.submittedById === currentUser)
        .reverse();
    
    if (mySuggestions.length === 0) {
        list.innerHTML = '<p class="empty-state">You haven\'t submitted any complaints yet.</p>';
        return;
    }
    
    const title = document.createElement('h3');
    title.style.marginTop = '30px';
    title.style.color = '#333';
    title.innerHTML = '📋 Your Submitted Complaints & Replies';
    list.appendChild(title);
    
    mySuggestions.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        const timestamp = new Date(sug.timestamp).toLocaleString();
        
        let statusBadge = '';
        let statusColor = '#ff9800';
        if (sug.status === 'new') {
            statusBadge = '<span class="badge" style="background: #ff9800;">🆕 Pending</span>';
        } else if (sug.status === 'replied') {
            statusBadge = '<span class="badge" style="background: #4CAF50;">✓ Replied</span>';
        } else {
            statusBadge = '<span class="badge" style="background: #2196F3;">👁️ Seen</span>';
        }
        
        let replySection = '';
        if (sug.principalReply) {
            replySection = `
                <div class="suggestion-reply">
                    <strong style="color: #667eea;">📋 Principal's Response:</strong>
                    <p>${sug.principalReply}</p>
                    <span style="font-size: 0.8em; color: #999;">Replied: ${new Date(sug.replyTimestamp).toLocaleString()}</span>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="suggestion-header">
                <div>
                    <strong>Your Complaint</strong>
                    ${statusBadge}
                </div>
                <span style="font-size: 0.85em; color: #666;">${timestamp}</span>
            </div>
            <div class="suggestion-body">
                <p>${sug.text}</p>
            </div>
            ${replySection}
        `;
        list.appendChild(card);
    });
}

function logout() {
    try {
        console.log('Logout called - currentUser:', currentUser);
        
        // Clear current user immediately
        currentUser = null;
        console.log('CurrentUser cleared:', currentUser);
        
        // Stop all polling before logout
        try { stopSuggestionPolling(); } catch (e) { console.error('Error stopping suggestion polling:', e); }
        try { stopPrincipalPolling(); } catch (e) { console.error('Error stopping principal polling:', e); }
        
        // Log the activity
        try { logActivity('logout', { action: 'User logged out' }); } catch (e) { console.error('Error logging activity:', e); }
        
        // Hide header elements
        const userBadge = document.getElementById('userBadge');
        const logoutBtn = document.getElementById('logoutBtn');
        const delBtn = document.getElementById('deleteAccountBtn');
        
        if (userBadge) { userBadge.style.display = 'none'; }
        if (logoutBtn) { logoutBtn.style.display = 'none'; }
        if (delBtn) { delBtn.style.display = 'none'; }
        
        console.log('Header elements hidden');
        
        // Clear login form fields
        const regNo = document.getElementById('regNo');
        const password = document.getElementById('password');
        if (regNo) regNo.value = '';
        if (password) password.value = '';
        
        // Clear semester display
        const loginSemEl = document.getElementById('loginSem');
        if (loginSemEl) loginSemEl.innerText = '';
        
        // Show logout message
        const status = document.getElementById('loginStatus');
        if (status) {
            status.innerHTML = 'Logged out successfully.';
            status.className = 'status success';
        }
        
        console.log('UI updated, calling updateUI()');
        
        // Update UI to hide staff-only sections
        updateUI();
        
        // Try to render materials (will be empty for logged out user)
        try { renderMaterials(); } catch(e) { console.error('renderMaterials error:', e); }
        
        // Close mobile nav
        try { closeMobileMenu(); } catch (e) { console.error('closeMobileMenu error:', e); }
        
        console.log('Showing login section');
        
        // Show login section
        showSection('login');
        
        console.log('Logout complete');
    } catch (e) {
        console.error('Critical error in logout function:', e);
        // Force logout even if there's an error
        currentUser = null;
        alert('Logout error, but session cleared. Please refresh the page if needed.');
    }
}

function toggleSignup(show) {
    const form = document.getElementById('signupForm');
    const showBtn = document.getElementById('showSignupBtn');
    if (form) form.style.display = show ? 'block' : 'none';
    if (showBtn) showBtn.style.display = show ? 'none' : 'inline-block';
    const sStatus = document.getElementById('signupStatus'); if (sStatus) { sStatus.innerHTML = ''; sStatus.className = ''; }
}

function onSignupRoleChange() {
    const roleSel = document.getElementById('signupRole');
    const regEl = document.getElementById('signupRegNo');
    const semEl = document.getElementById('signupSemester');
    if (!roleSel || !regEl) return;
    const role = roleSel.value;
    const nameEl = document.getElementById('signupName');
    const deptSel = document.getElementById('signupDeptSelect');
    const deptNew = document.getElementById('signupDeptNew');
    const pwdConfirm = document.getElementById('signupPasswordConfirm');
    const collegeEl = document.getElementById('signupCollege');

    if (role === 'teacher') {
        regEl.placeholder = 'Username (e.g., dr.smith)';
        if (semEl) semEl.style.display = 'none';
        // show other teacher fields
        if (nameEl) nameEl.style.display = 'block';
        if (deptSel) deptSel.style.display = 'inline-block';
        if (deptNew) deptNew.style.display = 'inline-block';
        if (pwdConfirm) pwdConfirm.style.display = 'block';
        if (collegeEl) collegeEl.style.display = 'inline-block';
    } else if (role === 'principal') {
        regEl.placeholder = 'Username (e.g., principal.tech)';
        if (semEl) semEl.style.display = 'none';
        // For principal show only: username, password, college
        if (nameEl) nameEl.style.display = 'none';
        if (deptSel) deptSel.style.display = 'none';
        if (deptNew) deptNew.style.display = 'none';
        if (pwdConfirm) pwdConfirm.style.display = 'none';
        if (collegeEl) collegeEl.style.display = 'inline-block';
    } else {
        regEl.placeholder = 'Register Number (e.g., CS21B002)';
        if (semEl) semEl.style.display = 'inline-block';
        // show standard student fields
        if (nameEl) nameEl.style.display = 'block';
        if (deptSel) deptSel.style.display = 'inline-block';
        if (deptNew) deptNew.style.display = 'inline-block';
        if (pwdConfirm) pwdConfirm.style.display = 'block';
        if (collegeEl) collegeEl.style.display = 'inline-block';
    }
}


function onLoginRoleChange() {
    const roleSel = document.getElementById('loginRole');
    const regEl = document.getElementById('regNo');
    const header = document.getElementById('loginHeader');
    const loginSemEl = document.getElementById('loginSem');
    if (!roleSel || !regEl) return;
    const role = roleSel.value;
    if (role === 'principal') {
        regEl.placeholder = 'Username (e.g., principal)';
        if (header) header.innerText = '🏫 College Principal Login';
        if (loginSemEl) loginSemEl.innerText = '';
    } else if (role === 'admin') {
        regEl.placeholder = 'Username (admin)';
        if (header) header.innerText = '⚙️ App Admin Login';
        if (loginSemEl) loginSemEl.innerText = '';
    } else if (role === 'teacher') {
        regEl.placeholder = 'Username (e.g., dr.smith)';
        if (header) header.innerText = '🔐 Teacher Login';
        if (loginSemEl) loginSemEl.innerText = '';
    } else {
        regEl.placeholder = 'Register Number (e.g., CS21B001)';
        if (header) header.innerText = '🔐 Student Login';
        // keep existing loginSem until actual login populates it
    }
}

// initialize role placeholders on load
try { onSignupRoleChange(); } catch (e) {}
try { onLoginRoleChange(); } catch (e) {}

function signup() {
    const regNo = document.getElementById('signupRegNo').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const role = document.getElementById('signupRole') ? document.getElementById('signupRole').value : 'student';
    const college = document.getElementById('signupCollege') ? normalizeStr(document.getElementById('signupCollege').value) : null;
    const deptSel = document.getElementById('signupDeptSelect');
    const deptNew = document.getElementById('signupDeptNew') ? document.getElementById('signupDeptNew').value.trim() : '';
    const dept = deptNew ? normalizeStr(deptNew) : (deptSel && deptSel.value ? normalizeStr(deptSel.value) : null);
    const semester = document.getElementById('signupSemester') ? document.getElementById('signupSemester').value : null;
    const pwd = document.getElementById('signupPassword').value;
    const confirmEl = document.getElementById('signupPasswordConfirm');
    const confirm = confirmEl ? confirmEl.value : '';
    const status = document.getElementById('signupStatus');
    const idLabel = (role === 'teacher' || role === 'principal' || role === 'admin') ? 'Username' : 'Register Number';
    if (!regNo) { status.innerHTML = `Enter a ${idLabel}.`; status.className = 'status error'; return; }
    if (users[regNo]) { status.innerHTML = `${idLabel} already exists.`; status.className = 'status error'; return; }
    if (pwd.length < 6) { status.innerHTML = 'Password must be at least 6 characters.'; status.className = 'status error'; return; }
    // For principal signup we accept single password field (no confirm). For other roles require confirmation.
    if (role !== 'principal' && pwd !== confirm) { status.innerHTML = 'Passwords do not match.'; status.className = 'status error'; return; }

    // Require college for principal accounts
    if (role === 'principal' && (!college || String(college).trim() === '')) {
        status.innerHTML = 'College is required for principal accounts.'; status.className = 'status error'; return;
    }

    // Prevent more than one principal per college
    if (role === 'principal') {
        const desiredCollege = normalizeStr(college);
        const existing = Object.keys(users).find(k => users[k] && users[k].role === 'principal' && users[k].college === desiredCollege);
        if (existing) {
            status.innerHTML = `A principal account already exists for this college (${existing}).`; status.className = 'status error'; return;
        }
    }
    users[regNo] = { password: pwd, name: name || regNo, role: role, college: normalizeStr(college) || null, dept: normalizeStr(dept) || null, semester: semester || null };
    saveUsers();
    
    // Log account creation activity
    logActivity('account_created', { 
        action: 'Account created',
        newAccountId: regNo,
        newAccountRole: role,
        newAccountCollege: normalizeStr(college) || null
    });
    
    console.info('Signup:', regNo, 'role=', role, 'college=', users[regNo].college, 'dept=', users[regNo].dept);
    status.innerHTML = 'Account created and logged in.';
    status.className = 'status success';
    toggleSignup(false);
    document.getElementById('regNo').value = regNo;
    document.getElementById('password').value = pwd;
    login();
}

function deleteMaterial(index) {
    if (!isStaff(currentUser)) { alert('Only teachers or admins can delete materials.'); return; }
    const m = materials[index];
    if (!m) { alert('Material not found.'); return; }
    if (!confirm(`Delete material "${m.name}"? This cannot be undone.`)) return;
    materials.splice(index, 1);
    saveMaterials();
    renderMaterials();
    alert('Material deleted.');
}

// ============= PRINCIPAL DASHBOARD =============
function getLoggedInUsers() {
    // Get list of currently logged-in users based on latest activity
    const loggedIn = {};
    
    // Group activities by user ID
    const userActivities = {};
    activityLog.forEach(activity => {
        if (!userActivities[activity.userId]) {
            userActivities[activity.userId] = [];
        }
        userActivities[activity.userId].push(activity);
    });
    
    // Check latest activity for each user
    Object.keys(userActivities).forEach(userId => {
        const activities = userActivities[userId];
        if (activities.length > 0) {
            const latestActivity = activities[activities.length - 1];
            loggedIn[userId] = latestActivity.type === 'login'; // true if latest is login, false if logout
        }
    });
    
    return loggedIn;
}

function renderPrincipalDashboard() {
    if (!isPrincipal(currentUser)) return;
    const principalCollege = users[currentUser].college;
    
    // Get teachers in this college who are CURRENTLY LOGGED IN
    const loggedInUsers = getLoggedInUsers();
    const loggedInTeachers = Object.keys(users).filter(k => 
        users[k].role === 'teacher' && 
        users[k].college === principalCollege &&
        loggedInUsers[k] === true // Only teachers who are logged in
    );
    
    // Render teachers list (only logged-in teachers)
    renderPrincipalTeachersList(loggedInTeachers, principalCollege);
    
    // Render student complaints/suggestions
    renderPrincipalSuggestions(principalCollege);
}

function renderPrincipalTeachersList(teacherIds, college) {
    const list = document.getElementById('principalTeachersList');
    if (!list) return;
    list.innerHTML = '';
    
    if (teacherIds.length === 0) {
        list.innerHTML = '<p class="empty-state">No teachers found in your college</p>';
        return;
    }
    
    teacherIds.forEach(teacherId => {
        const teacher = users[teacherId];
        const div = document.createElement('div');
        div.className = 'user-card';
        div.style.cursor = 'pointer';
        
        // Count their announcements and materials
        const teacherAnnouncements = announcements.filter(a => a.author === teacher.name || a.author === teacherId).length;
        const teacherMaterials = materials.filter(m => m.uploader === teacher.name || m.uploader === teacherId).length;
        
        div.innerHTML = `
            <div class="card-header">
                <b>${teacher.name || teacherId}</b>
                <span class="badge">${teacher.role}</span>
            </div>
            <div class="card-body">
                <p><strong>ID:</strong> ${teacherId}</p>
                <p><strong>Department:</strong> ${teacher.dept ? pretty(teacher.dept) : 'N/A'}</p>
                <p><strong>Announcements:</strong> ${teacherAnnouncements}</p>
                <p><strong>Materials Uploaded:</strong> ${teacherMaterials}</p>
                <p style="margin-top: 10px; color: #667eea; font-size: 0.9em;"><strong>👁️ Click to view profile & activity</strong></p>
            </div>
        `;
        div.onclick = function() {
            viewPrincipalTeacherProfile(teacherId);
        };
        list.appendChild(div);
    });
}

function viewPrincipalTeacherProfile(teacherId) {
    if (!isPrincipal(currentUser)) return;
    
    const teacher = users[teacherId];
    const principalCollege = users[currentUser].college;
    
    // Verify teacher belongs to principal's college
    if (teacher.college !== principalCollege) {
        alert('Cannot view teacher from another college');
        return;
    }
    
    // Show teacher profile modal/section
    const modal = document.getElementById('principalTeacherModal');
    if (!modal) {
        // Create modal if it doesn't exist
        const newModal = document.createElement('div');
        newModal.id = 'principalTeacherModal';
        newModal.className = 'modal';
        newModal.style.display = 'none';
        document.body.appendChild(newModal);
    }
    
    const profileDiv = document.getElementById('principalTeacherProfile');
    if (!profileDiv) {
        const newDiv = document.createElement('div');
        newDiv.id = 'principalTeacherProfile';
        document.body.appendChild(newDiv);
    }
    
    // Get teacher's activities
    const teacherActivities = activityLog.filter(a => a.userId === teacherId).reverse();
    
    // Build profile HTML
    const teacherAnnouncements = announcements.filter(a => a.author === teacher.name || a.author === teacherId);
    const teacherMaterials = materials.filter(m => m.uploader === teacher.name || m.uploader === teacherId);
    
    let activitiesHTML = '';
    teacherActivities.slice(0, 15).forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        activitiesHTML += `
            <div class="activity-item" style="margin-bottom: 10px;">
                <div class="activity-time">${time}</div>
                <div class="activity-action"><strong>${activity.type}</strong>: ${activity.details ? JSON.stringify(activity.details) : 'N/A'}</div>
            </div>
        `;
    });
    
    let announcementsHTML = '<p style="color: #666;">No announcements posted</p>';
    if (teacherAnnouncements.length > 0) {
        announcementsHTML = teacherAnnouncements.map(a => `
            <div style="background: #f0f4ff; padding: 10px; margin: 5px 0; border-radius: 5px;">
                <strong>${a.text.substring(0, 100)}${a.text.length > 100 ? '...' : ''}</strong>
                <br><span style="font-size: 0.85em; color: #666;">Posted: ${a.date}</span>
            </div>
        `).join('');
    }
    
    let materialsHTML = '<p style="color: #666;">No materials uploaded</p>';
    if (teacherMaterials.length > 0) {
        materialsHTML = teacherMaterials.map(m => `
            <div style="background: #f0f4ff; padding: 10px; margin: 5px 0; border-radius: 5px;">
                <strong>📄 ${m.name}</strong>
                <br><span style="font-size: 0.85em; color: #666;">Uploaded: ${m.date}</span>
            </div>
        `).join('');
    }
    
    const profileHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="closePrincipalTeacherProfile()">
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 900px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">👁️ Teacher Profile & Activity</h2>
                    <button onclick="closePrincipalTeacherProfile()" style="background: #ff6b6b; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 1em;">✕ Close</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: #f7fafc; padding: 15px; border-radius: 10px;">
                        <h3 style="color: #667eea; margin-top: 0;">📋 Profile Information</h3>
                        <p><strong>Name:</strong> ${teacher.name || 'N/A'}</p>
                        <p><strong>ID:</strong> ${teacherId}</p>
                        <p><strong>Department:</strong> ${teacher.dept ? pretty(teacher.dept) : 'N/A'}</p>
                        <p><strong>College:</strong> ${teacher.college ? pretty(teacher.college) : 'N/A'}</p>
                        <p><strong>Role:</strong> <span class="badge">${teacher.role}</span></p>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 15px; border-radius: 10px;">
                        <h3 style="color: #667eea; margin-top: 0;">📊 Statistics</h3>
                        <p><strong>Announcements Posted:</strong> ${teacherAnnouncements.length}</p>
                        <p><strong>Materials Uploaded:</strong> ${teacherMaterials.length}</p>
                        <p><strong>Total Activities Logged:</strong> ${teacherActivities.length}</p>
                        <p><strong>Last Activity:</strong> ${teacherActivities.length > 0 ? new Date(teacherActivities[0].timestamp).toLocaleString() : 'Never'}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f0f4ff; padding: 15px; border-radius: 10px;">
                        <h4 style="color: #667eea; margin-top: 0;">📣 Recent Announcements</h4>
                        ${announcementsHTML}
                    </div>
                    
                    <div style="background: #f0f4ff; padding: 15px; border-radius: 10px;">
                        <h4 style="color: #667eea; margin-top: 0;">📚 Materials Uploaded</h4>
                        ${materialsHTML}
                    </div>
                    
                    <div style="background: #f0f4ff; padding: 15px; border-radius: 10px;">
                        <h4 style="color: #667eea; margin-top: 0;">🔍 Recent Activities (Last 15)</h4>
                        ${activitiesHTML || '<p style="color: #666;">No activities</p>'}
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="closePrincipalTeacherProfile()" style="background: #667eea; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-size: 1em;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('principalTeacherProfile').innerHTML = profileHTML;
    document.getElementById('principalTeacherProfile').style.display = 'block';
}

function closePrincipalTeacherProfile() {
    const profileDiv = document.getElementById('principalTeacherProfile');
    if (profileDiv) profileDiv.style.display = 'none';
}

function renderPrincipalAccountCreators(college) {
    const div = document.getElementById('principalAccountCreators');
    if (!div) return;
    div.innerHTML = '';
    
    // Get all account creation activities from this college by teachers/HOD from the same college
    const createdAccounts = activityLog
        .filter(a => 
            a.type === 'account_created' && 
            a.userCollege === college &&
            (users[a.userId] && (users[a.userId].role === 'teacher' || users[a.userId].role === 'hod') && users[a.userId].college === college)
        )
        .reverse();
    
    if (createdAccounts.length === 0) {
        div.innerHTML = '<p class="empty-state">No accounts created by teachers/HOD yet</p>';
        return;
    }
    
    // Group by creator
    const creatorMap = {};
    createdAccounts.forEach(activity => {
        const creator = activity.userId;
        if (!creatorMap[creator]) {
            creatorMap[creator] = [];
        }
        creatorMap[creator].push(activity);
    });
    
    // Display each creator and their created accounts
    Object.keys(creatorMap).forEach(creator => {
        const accounts = creatorMap[creator];
        const creatorUser = users[creator];
        
        const card = document.createElement('div');
        card.className = 'creator-card';
        card.innerHTML = `
            <div class="creator-header">
                <strong>${creatorUser.name || creator}</strong>
                <span class="badge">${creatorUser.role}</span>
            </div>
            <div class="creator-body">
                <p><strong>Created ${accounts.length} account${accounts.length > 1 ? 's' : ''}:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
        `;
        
        accounts.forEach(activity => {
            const newAccountId = activity.details.newAccountId;
            const newAccountRole = activity.details.newAccountRole;
            const timestamp = new Date(activity.timestamp).toLocaleString();
            card.innerHTML += `
                <li style="margin: 5px 0; font-size: 0.9em;">
                    <strong>${newAccountId}</strong> (${newAccountRole})
                    <br><span style="color: #666; font-size: 0.85em;">${timestamp}</span>
                </li>
            `;
        });
        
        card.innerHTML += `
                </ul>
            </div>
        `;
        div.appendChild(card);
    });
}

function renderPrincipalSuggestions(college) {
    const div = document.getElementById('principalSuggestions');
    if (!div) return;
    div.innerHTML = '';
    
    // Get all student complaints/suggestions from this college
    const collegeSuggestions = suggestions
        .filter(s => s.college === college && s.submittedByRole === 'student')
        .reverse();
    
    if (collegeSuggestions.length === 0) {
        div.innerHTML = '<p class="empty-state">No student complaints/suggestions yet</p>';
        return;
    }
    
    collegeSuggestions.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        const timestamp = new Date(sug.timestamp).toLocaleString();
        let statusBadge = '';
        if (sug.status === 'new') {
            statusBadge = '<span class="badge" style="background: #ff9800;">NEW</span>';
        } else if (sug.status === 'replied') {
            statusBadge = '<span class="badge" style="background: #4CAF50;">✓ REPLIED</span>';
        } else {
            statusBadge = '<span class="badge" style="background: #2196F3;">SEEN</span>';
        }
        
        let replySection = '';
        if (sug.principalReply) {
            replySection = `
                <div class="suggestion-reply">
                    <strong style="color: #667eea;">📋 Principal's Response:</strong>
                    <p>${sug.principalReply}</p>
                    <span style="font-size: 0.8em; color: #999;">Replied: ${new Date(sug.replyTimestamp).toLocaleString()}</span>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="suggestion-header">
                <div>
                    <strong>${sug.submittedBy}</strong>
                    ${statusBadge}
                </div>
                <span style="font-size: 0.85em; color: #666;">${timestamp}</span>
            </div>
            <div class="suggestion-body">
                <p>${sug.text}</p>
            </div>
            ${replySection}
            <div class="suggestion-actions">
                <input type="text" id="reply_${sug.id}" placeholder="Type your response..." class="reply-input" style="flex: 1;">
                <button onclick="addReplyToSuggestion('${sug.id}')" class="btn-small" style="background: #667eea;">Reply</button>
                <button onclick="markSuggestionSeen('${sug.id}')" class="btn-small" style="background: #2196F3;">Seen</button>
            </div>
        `;
        div.appendChild(card);
    });
}

function markSuggestionSeen(suggestionId) {
    const sug = suggestions.find(s => s.id === suggestionId);
    if (sug) {
        sug.status = 'seen';
        saveSuggestions();
        renderPrincipalDashboard();
    }
}

function addReplyToSuggestion(suggestionId) {
    const replyText = document.getElementById('reply_' + suggestionId).value.trim();
    if (!replyText) {
        alert('Please type a response');
        return;
    }
    
    const sug = suggestions.find(s => s.id === suggestionId);
    if (sug) {
        sug.principalReply = replyText;
        sug.replyTimestamp = new Date().toISOString();
        sug.status = 'replied';
        saveSuggestions();
        // Immediately refresh the views
        renderPrincipalDashboard();
        // Force student view to refresh if they're viewing it
        try { renderStudentSuggestions(); } catch(e) {}
    }
}

function renderPrincipalActivity(college) {
    const list = document.getElementById('principalActivityList');
    if (!list) return;
    list.innerHTML = '';
    
    // Get recent activities from this college (last 20)
    const collegeActivities = activityLog
        .filter(a => a.userCollege === college)
        .reverse()
        .slice(0, 20);
    
    if (collegeActivities.length === 0) {
        list.innerHTML = '<p class="empty-state">No recent activities</p>';
        return;
    }
    
    collegeActivities.forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-time">${time}</div>
            <div class="activity-content">
                <strong>${activity.userName}</strong> (${activity.userRole})
                <br><span class="activity-action">${activity.type}: ${activity.details ? JSON.stringify(activity.details) : ''}</span>
            </div>
        `;
        list.appendChild(div);
    });
}

// ============= ADMIN DASHBOARD =============
function renderAdminDashboard() {
    if (!isAdmin(currentUser)) return;
    
    // System-wide statistics
    const totalUsers = Object.keys(users).length;
    const students = Object.keys(users).filter(k => users[k].role === 'student').length;
    const teachers = Object.keys(users).filter(k => users[k].role === 'teacher').length;
    const principals = Object.keys(users).filter(k => users[k].role === 'principal').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogins = activityLog.filter(a => a.type === 'login' && a.timestamp.startsWith(today)).length;
    
    document.getElementById('statAdminTotal').innerText = totalUsers;
    document.getElementById('statAdminOnline').innerText = (students + teachers + principals + 1);
    document.getElementById('statAdminLogins').innerText = todayLogins;
    document.getElementById('statAdminActivities').innerText = activityLog.length;
    
    // Render college-wise stats
    renderCollegeStats();
    
    // Render system-wide LOGIN activities ONLY (not other activities)
    renderAdminLoginDetails();
}

function renderAdminLoginDetails() {
    const list = document.getElementById('adminActivityList');
    if (!list) return;
    list.innerHTML = '';
    
    // Get ONLY login/logout activities system-wide (last 50)
    const loginActivities = activityLog
        .filter(a => a.type === 'login' || a.type === 'logout')
        .reverse()
        .slice(0, 50);
    
    if (loginActivities.length === 0) {
        list.innerHTML = '<p class="empty-state">No login/logout activities</p>';
        return;
    }
    
    loginActivities.forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        const div = document.createElement('div');
        div.className = 'activity-item admin-activity';
        
        const statusColor = activity.type === 'login' ? '#4CAF50' : '#9C27B0';
        const statusText = activity.type === 'login' ? '🔓 LOGIN' : '🔒 LOGOUT';
        
        div.innerHTML = `
            <div class="activity-time">${time}</div>
            <div class="activity-badge" style="background: ${statusColor}">${statusText}</div>
            <div class="activity-content">
                <strong>${activity.userName}</strong> (${activity.userRole})
                <br><span class="activity-college">${pretty(activity.userCollege || 'System')}</span>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderCollegeStats() {
    const div = document.getElementById('adminCollegeStats');
    if (!div) return;
    div.innerHTML = '';
    
    // Group users by college
    const collegeMap = {};
    Object.keys(users).forEach(k => {
        const college = users[k].college || 'Not Specified';
        if (!collegeMap[college]) {
            collegeMap[college] = { teachers: 0, students: 0, principals: 0, logins: 0 };
        }
        if (users[k].role === 'teacher') collegeMap[college].teachers++;
        if (users[k].role === 'principal') collegeMap[college].principals++;
        if (users[k].role === 'student') collegeMap[college].students++;
    });
    
    // Count logins per college today
    const today = new Date().toISOString().split('T')[0];
    Object.keys(collegeMap).forEach(college => {
        const collegeLogins = activityLog.filter(a => 
            a.type === 'login' && 
            a.timestamp.startsWith(today) && 
            (a.userCollege === college || (a.userCollege === null && college === 'Not Specified'))
        ).length;
        collegeMap[college].logins = collegeLogins;
    });
    
    // Display colleges
    Object.keys(collegeMap).forEach(college => {
        const stats = collegeMap[college];
        const card = document.createElement('div');
        card.className = 'college-stat-card';
        card.innerHTML = `
            <h4>${pretty(college)}</h4>
            <div class="stat-line">👨‍💼 Principals: ${stats.principals}</div>
            <div class="stat-line">👨‍🏫 Teachers: ${stats.teachers}</div>
            <div class="stat-line">👨‍🎓 Students: ${stats.students}</div>
            <div class="stat-line">🔓 Today's Logins: ${stats.logins}</div>
        `;
        div.appendChild(card);
    });
}

function getActivityColor(type) {
    const colors = {
        'login': '#4CAF50',
        'logout': '#9C27B0',
        'announcement': '#2196F3',
        'material_upload': '#FF9800',
        'fee_added': '#F44336',
        'default': '#607D8B'
    };
    return colors[type] || colors['default'];
}

function clearActivityLog() {
    if (!isAdmin(currentUser)) { alert('Only admins can clear activity log.'); return; }
    
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    
    activityLog = [];
    saveActivityLog();
    alert('Activity log cleared.');
    renderAdminDashboard();
}

function exportAppData() {
    if (!isAdmin(currentUser)) {
        alert('Only admins can export data.');
        return;
    }
    
    const data = {
        exportDate: new Date().toISOString(),
        users: users,
        announcements: announcements,
        materials: materials,
        fees: fees,
        departments: departments,
        activityLog: activityLog
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-hub-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logActivity('export', { action: 'App data exported' });
    alert('App data exported successfully!');
}


// --- Teacher Management for Announcements ---
function renderTeacherAnnouncements() {
    if (!isStaff(currentUser)) return;
    
    const list = document.getElementById('teacherAnnouncementsList');
    if (!list) return;
    
    // Populate filter dropdowns
    const collegeFilterSel = document.getElementById('teacherFilterCollege');
    const deptFilterSel = document.getElementById('teacherFilterDept');
    
    if (collegeFilterSel && collegeFilterSel.options.length === 1) {
        const colleges = new Set();
        announcements.forEach(a => {
            if (a.college) colleges.add(a.college);
        });
        Array.from(colleges).sort().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = pretty(c);
            collegeFilterSel.appendChild(opt);
        });
    }
    
    // Filter announcements
    const searchText = (document.getElementById('teacherFilterText') || {}).value || '';
    const filterCollege = (document.getElementById('teacherFilterCollege') || {}).value || '';
    const filterDept = (document.getElementById('teacherFilterDept') || {}).value || '';
    
    const filtered = announcements.filter(a => {
        const matchesText = !searchText || a.text.toLowerCase().includes(searchText.toLowerCase()) || a.author.toLowerCase().includes(searchText.toLowerCase());
        const matchesCollege = !filterCollege || (a.college === filterCollege);
        const matchesDept = !filterDept || (a.dept === filterDept);
        return matchesText && matchesCollege && matchesDept;
    });
    
    list.innerHTML = '';
    if (filtered.length === 0) {
        list.innerHTML = '<p class="status info" style="padding: 16px;">No announcements found.</p>';
        return;
    }
    
    filtered.slice().reverse().forEach(a => {
        const d = document.createElement('div');
        d.className = 'card';
        
        let scope = '';
        if (a.college) scope += `College: ${pretty(a.college)}`;
        if (a.dept) scope += (scope ? ' • ' : '') + `Dept: ${pretty(a.dept)}`;
        
        let fileHtml = '';
        if (a.fileDataUrl && a.fileName) {
            fileHtml = `<div style="margin-top:6px"><a href="${a.fileDataUrl}" download="${a.fileName}">📎 ${a.fileName}</a></div>`;
        } else if (a.fileUrl) {
            fileHtml = `<div style="margin-top:6px"><a href="${a.fileUrl}" target="_blank" rel="noopener">📎 Download File</a></div>`;
        }
        
        d.innerHTML = `<div style="font-size:0.95em;color:#333"><strong>${a.text}</strong>${fileHtml}</div><div style="font-size:0.85em;color:#666;margin-top:8px">By: ${a.author} • ${a.date}${scope ? ' • ' + scope : ''}</div><div style="margin-top:12px"><button onclick="deleteAnnouncement('${a.id}')" class="btn-danger">🗑️ Delete</button></div>`;
        list.appendChild(d);
    });
}

function filterTeacherAnnouncements() {
    renderTeacherAnnouncements();
}

function resetTeacherFilters() {
    document.getElementById('teacherFilterText').value = '';
    document.getElementById('teacherFilterCollege').value = '';
    document.getElementById('teacherFilterDept').value = '';
    renderTeacherAnnouncements();
}

function clearAllData() {
    if (!isAdmin(currentUser)) {
        alert('Only admins can clear data.');
        return;
    }
    
    const confirm1 = confirm('⚠️ WARNING: This will delete ALL data including users, announcements, materials, and fees. Are you sure?');
    if (!confirm1) return;
    
    const confirm2 = confirm('This action CANNOT be undone. All data will be permanently lost. Continue?');
    if (!confirm2) return;
    
    const finalPassword = prompt('Enter admin password to confirm deletion:');
    if (finalPassword === null) return;
    if (users['admin'].password !== finalPassword) { alert('Incorrect password. Deletion cancelled.'); return; }
    
    // Clear all data
    localStorage.removeItem('ch_users');
    localStorage.removeItem('ch_announcements');
    localStorage.removeItem('ch_materials');
    localStorage.removeItem('ch_fees');
    localStorage.removeItem('ch_departments');
    localStorage.removeItem('ch_activity_log');
    
    // Reinitialize
    users = {};
    announcements = [];
    materials = [];
    fees = [];
    departments = [];
    activityLog = [];
    
    loadUsers();
    loadDepartments();
    loadAnnouncements();
    loadFees();
    loadMaterials();
    loadActivityLog();
    loadSuggestions();
    
    alert('All app data has been cleared and reset to defaults.');
    logout();
}