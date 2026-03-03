# MediBook - Database Design

## Overview

MediBook currently uses an in-memory database for development. This document describes the data model and provides migration guidance for production databases.

## Current Implementation (In-Memory)

### Database Structure

```javascript
const DB = {
  patients: [],
  doctors: [],
  appointments: [],
  payments: [],
  admins: []
};
```

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Patient   │       │ Appointment │       │   Doctor    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ patient_id  │◄──────┤ patient_id  │       │ doctor_id   │
│ name        │       │ doctor_id   │──────►│ name        │
│ email       │       │ date        │       │ email       │
│ phone       │       │ time        │       │ password    │
│ age         │       │ status      │       │ specialization
│ password    │       │ payment_id  │──┐    │ experience  │
│ created_at  │       └─────────────┘  │    │ available_time
└─────────────┘                        │    │ rating      │
                                       │    │ reviews     │
                                       │    │ emoji       │
                                       │    │ approved    │
                                       │    └─────────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   Payment   │
                                ├─────────────┤
                                │ payment_id  │
                                │ appointment_id
                                │ patient_id  │
                                │ doctor_id   │
                                │ amount      │
                                │ method      │
                                │ status      │
                                │ transaction_ref
                                │ paid_at     │
                                └─────────────┘
```

## Schema Definitions

### 1. Patients Collection

```javascript
{
  patient_id: "uuid",           // Primary Key
  name: "string",               // Required
  email: "string",              // Required, Unique
  phone: "string",              // Required
  age: "number",                // Required
  password: "string (hashed)",  // Required
  created_at: "ISO timestamp",
  updated_at: "ISO timestamp"
}
```

**Indexes**:
- Primary: `patient_id`
- Unique: `email`

### 2. Doctors Collection

```javascript
{
  doctor_id: "string",          // Primary Key (d1, d2, ...)
  name: "string",               // Required
  email: "string",              // Required, Unique
  password: "string (hashed)",  // Required
  specialization: "string",     // Required
  experience: "number",         // Years
  available_time: "string",     // Comma-separated
  rating: "number",             // 0-5
  reviews: [                    // Array of review objects
    {
      patient_name: "string",
      rating: "number",
      comment: "string",
      created_at: "timestamp"
    }
  ],
  emoji: "string",              // Display emoji
  approved: "boolean",          // Active status
  created_at: "ISO timestamp"
}
```

**Indexes**:
- Primary: `doctor_id`
- Unique: `email`
- Search: `specialization`

### 3. Appointments Collection

```javascript
{
  appointment_id: "uuid",       // Primary Key
  patient_id: "uuid",           // Foreign Key → Patients
  doctor_id: "string",          // Foreign Key → Doctors
  date: "string (YYYY-MM-DD)",  // Required
  time: "string (HH:MM AM/PM)", // Required
  status: "string",             // pending|approved|cancelled
  payment_id: "uuid|null",      // Foreign Key → Payments
  confirmation_probability: "number",
  created_at: "ISO timestamp",
  updated_at: "ISO timestamp"
}
```

**Indexes**:
- Primary: `appointment_id`
- Foreign: `patient_id`, `doctor_id`
- Search: `date`, `status`
- Unique Composite: `[doctor_id, date, time]` (prevent double booking)

### 4. Payments Collection

```javascript
{
  payment_id: "uuid",           // Primary Key
  appointment_id: "uuid",       // Foreign Key → Appointments
  patient_id: "uuid",           // Foreign Key → Patients
  doctor_id: "string",          // Foreign Key → Doctors
  amount: "number",             // In paisa/cents
  currency: "string",           // Rs, INR, USD
  method: "string",             // card|gpay|phonepe|paytm|upi|bank
  status: "string",             // pending|paid|failed|refunded
  transaction_ref: "string",    // TXN-XXXXXX
  card_number: "string|null",   // Masked: ****1234
  card_name: "string|null",
  expiry: "string|null",
  paid_at: "ISO timestamp|null",
  created_at: "ISO timestamp"
}
```

**Indexes**:
- Primary: `payment_id`
- Foreign: `appointment_id`, `patient_id`, `doctor_id`
- Search: `transaction_ref`, `status`

### 5. Admins Collection

```javascript
{
  admin_id: "string",           // Primary Key
  username: "string",           // Required, Unique
  password: "string (hashed)",  // Required
  name: "string",               // Display name
  role: "string",               // admin|superadmin
  created_at: "ISO timestamp"
}
```

**Indexes**:
- Primary: `admin_id`
- Unique: `username`

## Sample Data

### Doctors

```javascript
[
  {
    doctor_id: 'd1',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh@medibook.com',
    password: '$2a$10$...', // doctor123
    specialization: 'Cardiologist',
    experience: 12,
    available_time: '9:00 AM,11:00 AM,2:00 PM,4:30 PM',
    rating: 4.8,
    reviews: [],
    emoji: '👨‍⚕️',
    approved: true
  },
  // ... more doctors
]
```

### Admin

```javascript
{
  admin_id: 'a1',
  username: 'admin',
  password: '$2a$10$...', // admin123
  name: 'Administrator',
  role: 'admin'
}
```

## Fee Structure Reference

```javascript
const CONSULTATION_FEES = {
  'Cardiologist': 2500,
  'Neurologist': 2200,
  'Dermatologist': 1500,
  'Orthopedic': 2000,
  'Pediatrician': 1200,
  'General Physician': 800
};
```

## MySQL Migration Schema

```sql
-- Patients Table
CREATE TABLE patients (
    patient_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    age INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Doctors Table
CREATE TABLE doctors (
    doctor_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(50) NOT NULL,
    experience INT DEFAULT 0,
    available_time VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    emoji VARCHAR(10) DEFAULT '👨‍⚕️',
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_specialization (specialization),
    INDEX idx_approved (approved)
);

-- Appointments Table
CREATE TABLE appointments (
    appointment_id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    status ENUM('pending', 'approved', 'cancelled') DEFAULT 'pending',
    payment_id VARCHAR(36),
    confirmation_probability INT DEFAULT 85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    UNIQUE KEY unique_slot (doctor_id, date, time),
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Payments Table
CREATE TABLE payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36),
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(10) NOT NULL,
    amount INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'Rs',
    method ENUM('card', 'gpay', 'phonepe', 'paytm', 'upi', 'bank') NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_ref VARCHAR(20) UNIQUE,
    card_number VARCHAR(20),
    card_name VARCHAR(100),
    expiry VARCHAR(10),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    INDEX idx_transaction (transaction_ref),
    INDEX idx_status (status)
);

-- Admins Table
CREATE TABLE admins (
    admin_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table (Normalized)
CREATE TABLE reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(10) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    patient_name VARCHAR(100),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    INDEX idx_doctor (doctor_id)
);
```

## MongoDB Migration Schema

```javascript
// Patients Collection
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  age: Number,
  password: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Doctors Collection
{
  _id: String,  // d1, d2, etc.
  name: String,
  email: { type: String, unique: true },
  password: String,
  specialization: String,
  experience: Number,
  availableTime: [String],
  rating: { type: Number, default: 5 },
  reviews: [{
    patientName: String,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  emoji: String,
  approved: { type: Boolean, default: true }
}

// Appointments Collection
{
  _id: ObjectId,
  patientId: { type: ObjectId, ref: 'Patient' },
  doctorId: { type: String, ref: 'Doctor' },
  date: String,  // YYYY-MM-DD
  time: String,  // HH:MM AM/PM
  status: { type: String, enum: ['pending', 'approved', 'cancelled'] },
  paymentId: { type: ObjectId, ref: 'Payment' },
  confirmationProbability: Number,
  createdAt: { type: Date, default: Date.now }
}

// Payments Collection
{
  _id: ObjectId,
  appointmentId: { type: ObjectId, ref: 'Appointment' },
  patientId: { type: ObjectId, ref: 'Patient' },
  doctorId: { type: String, ref: 'Doctor' },
  amount: Number,
  currency: { type: String, default: 'Rs' },
  method: String,
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'] },
  transactionRef: { type: String, unique: true },
  cardNumber: String,
  cardName: String,
  expiry: String,
  paidAt: Date
}
```

## Data Integrity

### Constraints

1. **Unique Emails**: No duplicate emails across patients and doctors
2. **No Double Booking**: Same doctor cannot have two appointments at same time
3. **Referential Integrity**: Foreign keys must exist
4. **Valid Status**: Status must be from allowed enum values

### Validation Rules

```javascript
// Patient validation
const patientSchema = {
  name: { required: true, minLength: 2 },
  email: { required: true, format: 'email' },
  phone: { required: true },
  age: { required: true, min: 1, max: 120 },
  password: { required: true, minLength: 8 }
};

// Appointment validation
const appointmentSchema = {
  doctor_id: { required: true, exists: 'doctors' },
  date: { required: true, format: 'YYYY-MM-DD', future: true },
  time: { required: true, in: 'doctor.available_time' }
};
```

## Backup Strategy

### Current (In-Memory)
- Data lost on server restart
- No persistence

### Production
- **Daily Backups**: Automated database dumps
- **Point-in-Time Recovery**: Transaction logs
- **Replication**: Master-slave setup
- **Archival**: Old data moved to cold storage

## Migration Guide

### From In-Memory to MySQL

```javascript
// 1. Export current data
const data = {
  patients: DB.patients,
  doctors: DB.doctors,
  appointments: DB.appointments,
  payments: DB.payments
};
fs.writeFileSync('backup.json', JSON.stringify(data));

// 2. Set up MySQL connection
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'medibook',
  password: 'password',
  database: 'medibook'
});

// 3. Import data
async function migrate() {
  for (const patient of data.patients) {
    await pool.execute(
      'INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patient.patient_id, patient.name, patient.email, patient.phone, 
       patient.age, patient.password, patient.created_at, patient.updated_at]
    );
  }
  // ... migrate other collections
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025
