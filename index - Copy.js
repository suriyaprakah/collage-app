require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const announcementsRoutes = require('./routes/announcements');

const app = express();
app.use(cors());
app.use(express.json());

// static uploads (if used later)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/announcements', announcementsRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'College Hub API' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server listening on port', port));