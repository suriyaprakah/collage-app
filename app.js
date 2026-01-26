// Mobile hamburger menu toggle
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    if (nav) {
        nav.classList.toggle('mobile-open');
    }
}

let currentUser = null;
let users = {};
function saveUsers() {
    localStorage.setItem('ch_users', JSON.stringify(users));
}
function normalizeStr(s) { if (!s) return null; try { return String(s).trim().toLowerCase(); } catch (e) { return null; } }
function pretty(s) { if (!s) return '—'; return String(s).split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }

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
    // ensure demo user exists for testing
    if (!users['CS21B001']) {
        users['CS21B001'] = { password: '21012005', name: 'John Doe (Demo)', role: 'teacher', college: null, dept: null, semester: '3rd Year' };
        saveUsers();
    }
}
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
        // teacher actions
        const isTeacher = currentUser && users[currentUser] && users[currentUser].role === 'teacher';
        const actions = [];
        if (isTeacher) {
            actions.push(`<button onclick="startEditAnnouncement('${a.id}')">Edit</button>`);
            actions.push(`<button onclick="deleteAnnouncement('${a.id}')" class="btn-danger">Delete</button>`);
        }
        d.innerHTML = `<div style="font-size:0.95em;color:#333">${a.text}${fileHtml}</div><div style="font-size:0.85em;color:#666;margin-top:8px">By: ${a.author} • ${a.date}${scope ? ' • ' + scope : ''}</div><div style="margin-top:8px">${actions.join(' ')}</div>`;
        list.appendChild(d);
    });
}
let _editingAnnouncementId = null;

function addAnnouncement() {
    if (!currentUser || !users[currentUser] || users[currentUser].role !== 'teacher') { alert('Only teachers can post announcements.'); return; }
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
        if (_editingAnnouncementId) {
            // update existing
            const idx = announcements.findIndex(a => a.id === _editingAnnouncementId);
            if (idx !== -1) {
                announcements[idx] = { ...announcements[idx], ...obj };
            }
            _editingAnnouncementId = null;
            if (document.getElementById('announcePostBtn')) document.getElementById('announcePostBtn').innerText = 'Post Announcement';
        } else {
            announcements.push(obj);
        }
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
    const a = announcements.find(x => x.id === id);
    if (!a) return;
    _editingAnnouncementId = id;
    document.getElementById('announceText').value = a.text || '';
    if (document.getElementById('announceCollege')) document.getElementById('announceCollege').value = a.college || '';
    if (document.getElementById('announceDept')) document.getElementById('announceDept').value = a.dept || '';
    const curFile = document.getElementById('announceCurrentFile');
    if (curFile) {
        if (a.fileName) { curFile.style.display = 'block'; curFile.innerText = 'Current file: ' + a.fileName; }
        else if (a.fileUrl) { curFile.style.display = 'block'; curFile.innerText = 'Current poster attached'; }
        else { curFile.style.display = 'none'; curFile.innerText = ''; }
    }
    if (document.getElementById('announcePostBtn')) document.getElementById('announcePostBtn').innerText = 'Update Announcement';
}

function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    const idx = announcements.findIndex(a => a.id === id);
    if (idx === -1) return;
    announcements.splice(idx, 1);
    saveAnnouncements();
    renderAnnouncements();
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
    if (!currentUser || !users[currentUser] || users[currentUser].role !== 'teacher') { alert('Only teachers can add fees.'); return; }
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
    const isTeacher = currentUser && users[currentUser] && users[currentUser].role === 'teacher';
    Object.keys(users).forEach(k => {
        if (users[k].role && users[k].role === 'student') {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            const actions = [];
            actions.push(`<button onclick="viewStudent('${k}')">View</button>`);
            if (isTeacher) actions.push(`<button onclick="deleteUser('${k}')" class="btn-danger">Delete</button>`);
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
    if (!currentUser || !users[currentUser] || users[currentUser].role !== 'teacher') { alert('Only teachers can delete other accounts.'); return; }
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
    const mc = document.getElementById('materialsControls');
    if (mc) {
        if (currentUser && users[currentUser] && users[currentUser].role === 'teacher') mc.style.display = 'flex';
        else mc.style.display = 'none';
    }
    const ac = document.getElementById('announceControls');
    if (ac) {
        if (currentUser && users[currentUser] && users[currentUser].role === 'teacher') ac.style.display = 'block';
        else ac.style.display = 'none';
    }
    const fc = document.getElementById('feesControls');
    if (fc) {
        if (currentUser && users[currentUser] && users[currentUser].role === 'teacher') fc.style.display = 'flex';
        else fc.style.display = 'none';
    }
    const navStudents = document.getElementById('navStudents');
    if (navStudents) {
        if (currentUser && users[currentUser] && users[currentUser].role === 'teacher') navStudents.style.display = 'inline-block';
        else navStudents.style.display = 'none';
    }
}
// load announcements and fees now
loadAnnouncements();
loadFees();

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
    if (sectionId !== 'login' && !currentUser) {
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
}

function login() {
    const regNo = document.getElementById('regNo').value;
    const pwd = document.getElementById('password').value;
    const status = document.getElementById('loginStatus');
    if (users[regNo] && users[regNo].password === pwd) {
        currentUser = regNo;
        const displayName = users[regNo].name || regNo;
        status.innerHTML = `Welcome, ${displayName}! Logged in successfully.`;
        status.className = 'status success';
        // show header user badge and logout button
        const userBadge = document.getElementById('userBadge');
        const logoutBtn = document.getElementById('logoutBtn');
        const role = users[regNo] && users[regNo].role ? users[regNo].role : 'student';
        if (userBadge) { userBadge.innerText = `Logged in as ${displayName} (${role})`; userBadge.style.display = 'inline-block'; }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        const loginSemEl = document.getElementById('loginSem');
        if (loginSemEl) loginSemEl.innerText = (role === 'student' && users[regNo] && users[regNo].semester) ? `Semester: ${users[regNo].semester}` : '';
        updateProfile();
        showSection('profile');
    } else {
        const loginRole = document.getElementById('loginRole') ? document.getElementById('loginRole').value : 'student';
        const idLabelLogin = loginRole === 'teacher' ? 'Username' : 'Register No';
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
    const idLabelProfile = u.role === 'teacher' ? 'Username' : 'Register No';
    const semesterLine = u.role === 'teacher' ? '' : `Semester: ${u.semester || '—'}<br>`;
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
    const filtered = materials.filter(m => {
        // public material
        if (!currentUser) return !m.college && !m.dept;
        // if material scoped to a college and doesn't match user's college -> hide
        if (m.college && u.college && m.college !== u.college) return false;
        if (m.dept && u.dept && m.dept !== u.dept) return false;
        // if material scoped but user lacks that info -> hide
        if (m.college && !u.college) return false;
        if (m.dept && !u.dept) return false;
        return true;
    });
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
        list.appendChild(li);
    });
    const info = document.getElementById('materialsInfo');
    if (currentUser && users[currentUser] && users[currentUser].role === 'teacher') {
        if (info) info.innerText = 'You can upload materials here.';
    } else {
        if (info) info.innerText = 'Materials view-only. Only teachers can upload materials.';
    }
    updateUI();
}
function uploadFile() {
    if (!currentUser || !users[currentUser] || users[currentUser].role !== 'teacher') {
        alert('Only teachers can upload materials.');
        return;
    }
    const fileInput = document.getElementById('fileUpload');
    const files = Array.from(fileInput.files);
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
                if (document.getElementById('materialDept')) document.getElementById('materialDept').value = '';
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

function submitSuggestion() {
    const text = document.getElementById('suggestionText').value;
    if (text) {
        document.getElementById('suggestionStatus').innerHTML = 'Suggestion submitted anonymously.';
        document.getElementById('suggestionStatus').className = 'status success';
        document.getElementById('suggestionText').value = '';
    }
}

function logout() {
    currentUser = null;
    const userBadge = document.getElementById('userBadge');
    const logoutBtn = document.getElementById('logoutBtn');
    if (userBadge) userBadge.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    const delBtn = document.getElementById('deleteAccountBtn'); if (delBtn) delBtn.style.display = 'none';
    const loginSemEl = document.getElementById('loginSem'); if (loginSemEl) loginSemEl.innerText = '';
    const status = document.getElementById('loginStatus');
    status.innerHTML = 'Logged out successfully.';
    status.className = 'status success';
    updateUI();
    showSection('login');
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
    if (role === 'teacher') {
        regEl.placeholder = 'Username (e.g., dr.smith)';
        if (semEl) semEl.style.display = 'none';
    } else {
        regEl.placeholder = 'Register Number (e.g., CS21B002)';
        if (semEl) semEl.style.display = 'inline-block';
    }
}

function onLoginRoleChange() {
    const roleSel = document.getElementById('loginRole');
    const regEl = document.getElementById('regNo');
    const header = document.getElementById('loginHeader');
    const loginSemEl = document.getElementById('loginSem');
    if (!roleSel || !regEl) return;
    const role = roleSel.value;
    if (role === 'teacher') {
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
    const confirm = document.getElementById('signupPasswordConfirm').value;
    const status = document.getElementById('signupStatus');
    const idLabel = role === 'teacher' ? 'Username' : 'Register Number';
    if (!regNo) { status.innerHTML = `Enter a ${idLabel}.`; status.className = 'status error'; return; }
    if (users[regNo]) { status.innerHTML = `${idLabel} already exists.`; status.className = 'status error'; return; }
    if (pwd.length < 6) { status.innerHTML = 'Password must be at least 6 characters.'; status.className = 'status error'; return; }
    if (pwd !== confirm) { status.innerHTML = 'Passwords do not match.'; status.className = 'status error'; return; }
    users[regNo] = { password: pwd, name: name || regNo, role: role, college: normalizeStr(college) || null, dept: normalizeStr(dept) || null, semester: semester || null };
    saveUsers();
    console.info('Signup:', regNo, 'role=', role, 'college=', users[regNo].college, 'dept=', users[regNo].dept);
    status.innerHTML = 'Account created and logged in.';
    status.className = 'status success';
    toggleSignup(false);
    document.getElementById('regNo').value = regNo;
    document.getElementById('password').value = pwd;
    login();
}
