require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose= require('mongoose');
const path    = require('path');

const FE = path.join(__dirname, '../frontend');

const app = express();
app.use(cors());
app.use(express.json());

// ── Static assets (CSS, JS, images) ───────────────────────────────
app.use('/css',    express.static(path.join(FE, 'css')));
app.use('/js',     express.static(path.join(FE, 'js')));
app.use('/images', express.static(path.join(FE, 'images')));

// ── HTML page routes (all explicit, no guessing) ──────────────────
const page = (file) => (_, res) => res.sendFile(path.join(FE, file));

app.get('/',                   page('landing.html'));
app.get('/landing',            page('landing.html'));
app.get('/portal',             page('index.html'));
app.get('/login',              page('pages/login.html'));
app.get('/signup',             page('pages/signup.html'));
app.get('/forgot',             page('pages/forgot.html'));
app.get('/patient/dashboard',  page('pages/patient/dashboard.html'));
app.get('/doctor/dashboard',   page('pages/doctor/dashboard.html'));
app.get('/admin/dashboard',    page('pages/admin/dashboard.html'));

// ── API routes ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/bills',         require('./routes/bills'));
app.use('/api/doctor',        require('./routes/doctor'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/patient',       require('./routes/patientRoutes'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/medicines',     require('./routes/medicines'));
app.use('/api/diseases',      require('./routes/diseases'));
app.get('/api/health',        (_, res) => res.json({ ok: true }));

// ── DB + Start ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hms_db')
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(5000, () => {
      console.log('\n🚀  MediCare HMS  →  http://localhost:5000\n');
    });
  })
  .catch(e => { console.error('❌  DB error:', e.message); process.exit(1); });
