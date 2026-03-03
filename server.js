// ─────────────────────────────────────────────
//  CareSync Backend  –  Node.js / Express
//  In-memory store (replace with MySQL/MongoDB)
// ─────────────────────────────────────────────
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

// Stripe – use your real secret key from https://dashboard.stripe.com/apikeys
// Set env var: STRIPE_SECRET_KEY=sk_test_xxx
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_KEY_HERE';
let stripe = null;
try { stripe = require('stripe')(STRIPE_SECRET); } catch(e) { console.warn('stripe package not found - run: npm install stripe'); }

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'medibook_secret_2025';

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, JPG, and PNG files are allowed'));
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// ══════════════════════════════════════════════
//  IN-MEMORY DATABASE  (mirrors your schema)
// ══════════════════════════════════════════════
const DB = {
  patients: [],
  doctors: [
    { doctor_id:'d1', name:'Dr. Rajesh Sharma',   email:'rajesh@medibook.com',   password: bcrypt.hashSync('doctor123',10), specialization:'Cardiologist',      experience:12, available_time:'9:00 AM,11:00 AM,2:00 PM,4:30 PM', rating:4.8, reviews:[], emoji:'👨‍⚕️', approved:true },
    { doctor_id:'d2', name:'Dr. Priya Patel',     email:'priya@medibook.com',   password: bcrypt.hashSync('doctor123',10), specialization:'Neurologist',       experience:9,  available_time:'10:00 AM,1:00 PM,3:00 PM,5:00 PM',  rating:4.5, reviews:[], emoji:'👩‍⚕️', approved:true },
    { doctor_id:'d3', name:'Dr. Anjali Gupta',   email:'anjali@medibook.com',  password: bcrypt.hashSync('doctor123',10), specialization:'Dermatologist',     experience:7,  available_time:'8:30 AM,11:30 AM,2:30 PM,4:00 PM',  rating:4.7, reviews:[], emoji:'👩‍⚕️', approved:true },
    { doctor_id:'d4', name:'Dr. Vikram Singh',   email:'vikram@medibook.com',    password: bcrypt.hashSync('doctor123',10), specialization:'Orthopedic',        experience:15, available_time:'9:00 AM,12:00 PM,3:30 PM,5:30 PM',  rating:4.9, reviews:[], emoji:'👨‍⚕️', approved:true },
    { doctor_id:'d5', name:'Dr. Sunita Reddy',  email:'sunita@medibook.com',  password: bcrypt.hashSync('doctor123',10), specialization:'Pediatrician',      experience:10, available_time:'8:00 AM,10:30 AM,1:30 PM,4:00 PM',  rating:4.6, reviews:[], emoji:'👩‍⚕️', approved:true },
    { doctor_id:'d6', name:'Dr. Arun Kumar',   email:'arun@medibook.com',  password: bcrypt.hashSync('doctor123',10), specialization:'General Physician', experience:5,  available_time:'9:00 AM,11:00 AM,2:00 PM,5:00 PM',  rating:4.3, reviews:[], emoji:'👨‍⚕️', approved:true },
  ],
  appointments: [],
  payments: [],
  admins: [
    { admin_id:'a1', username:'admin', password: bcrypt.hashSync('admin123',10) }
  ]
};

// ══════════════════════════════════════════════
//  MIDDLEWARE  –  JWT Auth
// ══════════════════════════════════════════════
function authMiddleware(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
      const decoded = jwt.verify(token, SECRET);
      if (role && decoded.role !== role) return res.status(403).json({ error: 'Access denied' });
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// ══════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════

// Patient Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, age, password } = req.body;
  if (!name || !email || !phone || !age || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (DB.patients.find(p => p.email === email))
    return res.status(409).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const patient = { patient_id: uuidv4(), name, email, phone, age: parseInt(age), password: hashed, created_at: new Date().toISOString() };
  DB.patients.push(patient);
  const token = jwt.sign({ id: patient.patient_id, role: 'patient', name: patient.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: patient.patient_id, name, email, phone, age, role: 'patient' } });
});

// Patient Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const patient = DB.patients.find(p => p.email === email);
  if (!patient || !(await bcrypt.compare(password, patient.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: patient.patient_id, role: 'patient', name: patient.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: patient.patient_id, name: patient.name, email, phone: patient.phone, age: patient.age, role: 'patient' } });
});

// Doctor Login
app.post('/api/auth/doctor-login', async (req, res) => {
  const { email, password } = req.body;
  const doctor = DB.doctors.find(d => d.email === email);
  if (!doctor || !(await bcrypt.compare(password, doctor.password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: doctor.doctor_id, role: 'doctor', name: doctor.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: doctor.doctor_id, name: doctor.name, email, specialization: doctor.specialization, role: 'doctor' } });
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;
  const admin = DB.admins.find(a => a.username === username);
  if (!admin || !(await bcrypt.compare(password, admin.password)))
    return res.status(401).json({ error: 'Invalid admin credentials' });
  const token = jwt.sign({ id: admin.admin_id, role: 'admin', name: 'Administrator' }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: admin.admin_id, name: 'Administrator', role: 'admin' } });
});

// Doctor Registration with file upload
app.post('/api/auth/doctor-register', upload.fields([
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, password, specialization, experience, registrationNumber, degrees, fee, bio } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password || !specialization || !experience || !registrationNumber || !degrees || !fee) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Check if email already exists
    const existingDoctor = DB.doctors.find(d => d.email === email);
    if (existingDoctor) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Parse degrees
    const parsedDegrees = JSON.parse(degrees);
    
    // Get uploaded files info
    const files = req.files;
    const documents = {
      degreeCertificate: files.degreeCertificate ? files.degreeCertificate[0].filename : null,
      registrationCertificate: files.registrationCertificate ? files.registrationCertificate[0].filename : null,
      idProof: files.idProof ? files.idProof[0].filename : null,
      profilePhoto: files.profilePhoto ? files.profilePhoto[0].filename : null
    };
    
    // Create new doctor
    const newDoctor = {
      doctor_id: uuidv4(),
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      specialization,
      experience: parseInt(experience),
      registration_number: registrationNumber,
      degrees: parsedDegrees,
      fee: parseInt(fee),
      bio: bio || '',
      documents,
      status: 'pending', // Pending admin approval
      emoji: '👨‍⚕️',
      rating: 0,
      reviews: [],
      available_time: '9:00 AM, 11:00 AM, 2:00 PM, 4:30 PM',
      created_at: new Date().toISOString()
    };
    
    DB.doctors.push(newDoctor);
    
    res.status(201).json({ 
      message: 'Doctor registration submitted successfully. Pending admin approval.',
      doctor_id: newDoctor.doctor_id 
    });
    
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════
//  DOCTOR ROUTES
// ══════════════════════════════════════════════

// Get all doctors (public)
app.get('/api/doctors', (req, res) => {
  const { search, specialization } = req.query;
  let list = DB.doctors.map(({ password, ...d }) => d);
  if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));
  if (specialization) list = list.filter(d => d.specialization === specialization);
  res.json(list);
});

// Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  const doc = DB.doctors.find(d => d.doctor_id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const { password, ...safe } = doc;
  res.json(safe);
});

// Doctor: get own appointments
app.get('/api/doctor/appointments', authMiddleware('doctor'), (req, res) => {
  const appts = DB.appointments
    .filter(a => a.doctor_id === req.user.id)
    .map(a => {
      const patient = DB.patients.find(p => p.patient_id === a.patient_id);
      return { ...a, patient_name: patient?.name || 'Unknown', patient_phone: patient?.phone || '' };
    });
  res.json(appts);
});

// Doctor: approve/reject appointment
app.patch('/api/doctor/appointments/:id', authMiddleware('doctor'), (req, res) => {
  const { status } = req.body;
  const appt = DB.appointments.find(a => a.appointment_id === req.params.id && a.doctor_id === req.user.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  if (!['approved','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  appt.status = status;
  appt.updated_at = new Date().toISOString();
  res.json(appt);
});

// Add review for doctor
app.post('/api/doctors/:id/review', authMiddleware('patient'), (req, res) => {
  const { rating, comment } = req.body;
  const doc = DB.doctors.find(d => d.doctor_id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const review = { id: uuidv4(), patient_id: req.user.id, patient_name: req.user.name, rating: parseInt(rating), comment, created_at: new Date().toISOString() };
  doc.reviews.push(review);
  doc.rating = parseFloat((doc.reviews.reduce((s,r) => s + r.rating, 0) / doc.reviews.length).toFixed(1));
  res.json({ message: 'Review added', rating: doc.rating });
});

// ══════════════════════════════════════════════
//  APPOINTMENT ROUTES
// ══════════════════════════════════════════════

// Book appointment
app.post('/api/appointments', authMiddleware('patient'), (req, res) => {
  const { doctor_id, date, time } = req.body;
  if (!doctor_id || !date || !time) return res.status(400).json({ error: 'doctor_id, date, time required' });

  const doctor = DB.doctors.find(d => d.doctor_id === doctor_id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const conflict = DB.appointments.find(a => a.doctor_id === doctor_id && a.date === date && a.time === time && a.status !== 'cancelled');
  if (conflict) return res.status(409).json({ error: 'This slot is already booked' });

  // Confirmation probability based on doctor load
  const doctorAppts = DB.appointments.filter(a => a.doctor_id === doctor_id && a.date === date && a.status !== 'cancelled').length;
  const slots = doctor.available_time.split(',').length;
  const confirmationProbability = Math.max(20, Math.round(100 - (doctorAppts / slots) * 80));

  const appointment = {
    appointment_id : uuidv4(),
    patient_id     : req.user.id,
    doctor_id,
    doctor_name    : doctor.name,
    doctor_spec    : doctor.specialization,
    doctor_emoji   : doctor.emoji,
    patient_name   : req.user.name,
    date, time,
    status         : 'pending',
    confirmation_probability: confirmationProbability,
    created_at     : new Date().toISOString(),
    updated_at     : new Date().toISOString()
  };
  DB.appointments.push(appointment);
  res.status(201).json(appointment);
});

// Patient: get own appointments
app.get('/api/appointments', authMiddleware('patient'), (req, res) => {
  const appts = DB.appointments.filter(a => a.patient_id === req.user.id);
  res.json(appts);
});

// Cancel appointment (patient)
app.patch('/api/appointments/:id/cancel', authMiddleware('patient'), (req, res) => {
  const appt = DB.appointments.find(a => a.appointment_id === req.params.id && a.patient_id === req.user.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  appt.status = 'cancelled';
  appt.updated_at = new Date().toISOString();
  res.json(appt);
});

// ══════════════════════════════════════════════
//  PATIENT PROFILE ROUTES
// ══════════════════════════════════════════════
app.get('/api/profile', authMiddleware('patient'), (req, res) => {
  const p = DB.patients.find(x => x.patient_id === req.user.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { password, ...safe } = p;
  res.json(safe);
});

app.put('/api/profile', authMiddleware('patient'), async (req, res) => {
  const p = DB.patients.find(x => x.patient_id === req.user.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { name, phone, age, password } = req.body;
  if (name)  p.name  = name;
  if (phone) p.phone = phone;
  if (age)   p.age   = parseInt(age);
  if (password) p.password = await bcrypt.hash(password, 10);
  const { password: _, ...safe } = p;
  res.json(safe);
});

// ══════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════
app.get('/api/admin/stats', authMiddleware('admin'), (req, res) => {
  res.json({
    totalPatients    : DB.patients.length,
    totalDoctors     : DB.doctors.length,
    totalAppointments: DB.appointments.length,
    pending          : DB.appointments.filter(a => a.status === 'pending').length,
    approved         : DB.appointments.filter(a => a.status === 'approved').length,
    cancelled        : DB.appointments.filter(a => a.status === 'cancelled').length,
  });
});

app.get('/api/admin/appointments', authMiddleware('admin'), (req, res) => {
  res.json(DB.appointments);
});

app.get('/api/admin/patients', authMiddleware('admin'), (req, res) => {
  res.json(DB.patients.map(({ password, ...p }) => p));
});

app.get('/api/admin/doctors', authMiddleware('admin'), (req, res) => {
  res.json(DB.doctors.map(({ password, ...d }) => d));
});

app.patch('/api/admin/appointments/:id', authMiddleware('admin'), (req, res) => {
  const appt = DB.appointments.find(a => a.appointment_id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  appt.status = req.body.status;
  appt.updated_at = new Date().toISOString();
  res.json(appt);
});

app.delete('/api/admin/doctors/:id', authMiddleware('admin'), (req, res) => {
  const idx = DB.doctors.findIndex(d => d.doctor_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  DB.doctors.splice(idx, 1);
  res.json({ message: 'Doctor removed' });
});


// ══════════════════════════════════════════════
//  PAYMENT ROUTES  (Stripe)
// ══════════════════════════════════════════════

// Consultation fees by specialization
const FEES = {
  'Cardiologist':      2500,
  'Neurologist':       2200,
  'Dermatologist':     1500,
  'Orthopedic':        2000,
  'Pediatrician':      1200,
  'General Physician': 800,
};

// Create Stripe Payment Intent
app.post('/api/payments/create-intent', authMiddleware('patient'), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payment service unavailable. Add your Stripe key.' });
  const { appointment_id, doctor_id } = req.body;
  const appt   = DB.appointments.find(a => a.appointment_id === appointment_id && a.patient_id === req.user.id);
  const doctor = DB.doctors.find(d => d.doctor_id === doctor_id);
  if (!appt || !doctor) return res.status(404).json({ error: 'Appointment or doctor not found' });

  const amount = (FEES[doctor.specialization] || 1000) * 100; // in paisa/cents
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'pkr',
      metadata: { appointment_id, patient_id: req.user.id, doctor_name: doctor.name },
    });
    res.json({ clientSecret: intent.client_secret, amount, doctor: doctor.name, specialization: doctor.specialization });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simulate payment (for demo without real Stripe keys)
app.post('/api/payments/simulate', authMiddleware('patient'), (req, res) => {
  const { appointment_id, doctor_id, card_number, card_name, expiry, cvv, method } = req.body;

  const appt   = DB.appointments.find(a => a.appointment_id === appointment_id && a.patient_id === req.user.id);
  const doctor = DB.doctors.find(d => d.doctor_id === doctor_id);
  if (!appt || !doctor) return res.status(404).json({ error: 'Appointment or doctor not found' });

  // Basic validation
  if (method === 'card') {
    if (!card_number || card_number.replace(/\s/g,'').length < 16) return res.status(400).json({ error: 'Invalid card number' });
    if (!expiry || !cvv || !card_name) return res.status(400).json({ error: 'All card fields required' });
  }

  const amount = FEES[doctor.specialization] || 1000;
  const payment = {
    payment_id     : uuidv4(),
    appointment_id,
    patient_id     : req.user.id,
    doctor_id,
    amount,
    currency       : 'Rs',
    method         : method || 'card',
    status         : 'paid',
    transaction_ref: 'TXN-' + Math.random().toString(36).substring(2,10).toUpperCase(),
    paid_at        : new Date().toISOString(),
  };
  DB.payments.push(payment);

  // Mark appointment as approved after payment
  appt.status = 'approved';
  appt.payment_id = payment.payment_id;
  appt.updated_at = new Date().toISOString();

  res.json({ success: true, payment });
});

// Get payment receipt
app.get('/api/payments/:appointment_id', authMiddleware('patient'), (req, res) => {
  const payment = DB.payments.find(p => p.appointment_id === req.params.appointment_id && p.patient_id === req.user.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

// Admin: all payments
app.get('/api/admin/payments', authMiddleware('admin'), (req, res) => {
  const enriched = DB.payments.map(p => {
    const patient = DB.patients.find(x => x.patient_id === p.patient_id);
    const doctor  = DB.doctors.find(x => x.doctor_id === p.doctor_id);
    return { ...p, patient_name: patient?.name, doctor_name: doctor?.name };
  });
  res.json(enriched);
});

// Get consultation fee for a doctor
app.get('/api/payments/fee/:doctor_id', (req, res) => {
  const doc = DB.doctors.find(d => d.doctor_id === req.params.doctor_id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  res.json({ fee: FEES[doc.specialization] || 1000, currency: 'Rs', specialization: doc.specialization });
});

// ══════════════════════════════════════════════
//  SERVE FRONTEND (index.html for all non-API routes)
// ══════════════════════════════════════════════
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ══════════════════════════════════════════════
//  START SERVER
// ══════════════════════════════════════════════
app.listen(PORT, () => console.log(`✅ CareSync API running on http://localhost:${PORT}`));
