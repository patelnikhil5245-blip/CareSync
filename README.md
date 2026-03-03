# 🩺 CareSync— Online Doctor Appointment System

A full-stack web application built with **React** (frontend) and **Node.js/Express** (backend).

---

## 📁 Project Structure

```
medibook/
├── backend/          ← Node.js + Express REST API
│   ├── server.js     ← All API routes + in-memory DB
│   └── package.json
└── frontend/         ← React application
    ├── src/
    │   ├── App.jsx             ← Router
    │   ├── api.js              ← All API calls (axios)
    │   ├── index.css           ← Global styles + dark mode
    │   ├── context/
    │   │   └── AuthContext.jsx ← JWT auth state
    │   ├── components/
    │   │   └── UI.jsx          ← Navbar, Toast, Spinner, etc.
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Auth.jsx        ← Register, Login, DoctorLogin, AdminLogin
    │       ├── Doctors.jsx     ← Search + filter doctors
    │       ├── BookAppointment.jsx ← Booking + reviews + probability
    │       ├── Appointments.jsx    ← My appointments + countdown + receipt
    │       ├── Profile.jsx         ← Edit patient profile
    │       ├── DoctorPanel.jsx     ← Doctor approval dashboard
    │       └── Admin.jsx           ← Admin dashboard
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Backend
```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email / Username           | Password   |
|---------|---------------------------|------------|
| Doctor  | sarah@medibook.com        | doctor123  |
| Doctor  | bilal@medibook.com        | doctor123  |
| Admin   | admin                     | admin123   |
| Patient | Register any new account  | (your own) |

---

## ✅ Features Implemented

### Patient Module
- ✅ Register & Login (JWT)
- ✅ Search doctors by name / specialization
- ✅ Doctor ratings & reviews
- ✅ Book appointment with time slot selection
- ✅ Confirmation probability bar
- ✅ My Appointments with countdown timer
- ✅ Print/download appointment receipt
- ✅ Cancel appointments
- ✅ Edit profile & change password

### Doctor Module
- ✅ Doctor login
- ✅ View incoming appointment requests
- ✅ Approve / Reject appointments
- ✅ Filter by status

### Admin Module
- ✅ Admin login
- ✅ Overview dashboard (stats)
- ✅ Manage all appointments (change status)
- ✅ View all patients
- ✅ View & remove doctors

### UI/UX
- ✅ Dark mode toggle (persisted)
- ✅ Mobile-friendly bottom navigation
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Separate pages for each module

---

## 🗄️ Database Schema (in-memory, replace with MySQL)

```sql
-- Patient Table
CREATE TABLE patients (
  patient_id VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(100) UNIQUE,
  phone      VARCHAR(20),
  age        INT,
  password   VARCHAR(255),  -- bcrypt hashed
  created_at DATETIME DEFAULT NOW()
);

-- Doctor Table
CREATE TABLE doctors (
  doctor_id         VARCHAR(36) PRIMARY KEY,
  name              VARCHAR(100),
  email             VARCHAR(100) UNIQUE,
  password          VARCHAR(255),
  specialization    VARCHAR(50),
  experience        INT,
  available_time    VARCHAR(200),
  rating            DECIMAL(3,1) DEFAULT 5.0
);

-- Appointment Table
CREATE TABLE appointments (
  appointment_id           VARCHAR(36) PRIMARY KEY,
  patient_id               VARCHAR(36) REFERENCES patients(patient_id),
  doctor_id                VARCHAR(36) REFERENCES doctors(doctor_id),
  date                     DATE,
  time                     VARCHAR(20),
  status                   ENUM('pending','approved','cancelled','completed') DEFAULT 'pending',
  confirmation_probability INT,
  created_at               DATETIME DEFAULT NOW(),
  updated_at               DATETIME DEFAULT NOW()
);

-- Admin Table
CREATE TABLE admins (
  admin_id  VARCHAR(36) PRIMARY KEY,
  username  VARCHAR(50) UNIQUE,
  password  VARCHAR(255)
);
```

---

## 🔮 Future Enhancements
- Connect to MySQL database
- Online payment integration
- Email/SMS notifications
- Video consultation
- AI-based doctor recommendation
- Mobile app (React Native)
>>>>>>> a6684db (Initial commit: MediBook Doctor Appointment System)
# 🩺 MediBook — Online Doctor Appointment System

A full-stack web application built with **React** (frontend) and **Node.js/Express** (backend).

---

## 📁 Project Structure

```
medibook/
├── backend/          ← Node.js + Express REST API
│   ├── server.js     ← All API routes + in-memory DB
│   └── package.json
└── frontend/         ← React application
    ├── src/
    │   ├── App.jsx             ← Router
    │   ├── api.js              ← All API calls (axios)
    │   ├── index.css           ← Global styles + dark mode
    │   ├── context/
    │   │   └── AuthContext.jsx ← JWT auth state
    │   ├── components/
    │   │   └── UI.jsx          ← Navbar, Toast, Spinner, etc.
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Auth.jsx        ← Register, Login, DoctorLogin, AdminLogin
    │       ├── Doctors.jsx     ← Search + filter doctors
    │       ├── BookAppointment.jsx ← Booking + reviews + probability
    │       ├── Appointments.jsx    ← My appointments + countdown + receipt
    │       ├── Profile.jsx         ← Edit patient profile
    │       ├── DoctorPanel.jsx     ← Doctor approval dashboard
    │       └── Admin.jsx           ← Admin dashboard
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Backend
```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email / Username           | Password   |
|---------|---------------------------|------------|
| Doctor  | sarah@medibook.com        | doctor123  |
| Doctor  | bilal@medibook.com        | doctor123  |
| Admin   | admin                     | admin123   |
| Patient | Register any new account  | (your own) |

---

## ✅ Features Implemented

### Patient Module
- ✅ Register & Login (JWT)
- ✅ Search doctors by name / specialization
- ✅ Doctor ratings & reviews
- ✅ Book appointment with time slot selection
- ✅ Confirmation probability bar
- ✅ My Appointments with countdown timer
- ✅ Print/download appointment receipt
- ✅ Cancel appointments
- ✅ Edit profile & change password

### Doctor Module
- ✅ Doctor login
- ✅ View incoming appointment requests
- ✅ Approve / Reject appointments
- ✅ Filter by status

### Admin Module
- ✅ Admin login
- ✅ Overview dashboard (stats)
- ✅ Manage all appointments (change status)
- ✅ View all patients
- ✅ View & remove doctors

### UI/UX
- ✅ Dark mode toggle (persisted)
- ✅ Mobile-friendly bottom navigation
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Separate pages for each module

---

## 🗄️ Database Schema (in-memory, replace with MySQL)

```sql
-- Patient Table
CREATE TABLE patients (
  patient_id VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(100) UNIQUE,
  phone      VARCHAR(20),
  age        INT,
  password   VARCHAR(255),  -- bcrypt hashed
  created_at DATETIME DEFAULT NOW()
);

-- Doctor Table
CREATE TABLE doctors (
  doctor_id         VARCHAR(36) PRIMARY KEY,
  name              VARCHAR(100),
  email             VARCHAR(100) UNIQUE,
  password          VARCHAR(255),
  specialization    VARCHAR(50),
  experience        INT,
  available_time    VARCHAR(200),
  rating            DECIMAL(3,1) DEFAULT 5.0
);

-- Appointment Table
CREATE TABLE appointments (
  appointment_id           VARCHAR(36) PRIMARY KEY,
  patient_id               VARCHAR(36) REFERENCES patients(patient_id),
  doctor_id                VARCHAR(36) REFERENCES doctors(doctor_id),
  date                     DATE,
  time                     VARCHAR(20),
  status                   ENUM('pending','approved','cancelled','completed') DEFAULT 'pending',
  confirmation_probability INT,
  created_at               DATETIME DEFAULT NOW(),
  updated_at               DATETIME DEFAULT NOW()
);

-- Admin Table
CREATE TABLE admins (
  admin_id  VARCHAR(36) PRIMARY KEY,
  username  VARCHAR(50) UNIQUE,
  password  VARCHAR(255)
);
```

---

## 🔮 Future Enhancements
- Connect to MySQL database
- Online payment integration
- Email/SMS notifications
- Video consultation
- AI-based doctor recommendation
- Mobile app (React Native)
=======
# 🩺 MediBook — Online Doctor Appointment System

A full-stack web application built with **React** (frontend) and **Node.js/Express** (backend).

---

## 📁 Project Structure

```
medibook/
├── backend/          ← Node.js + Express REST API
│   ├── server.js     ← All API routes + in-memory DB
│   └── package.json
└── frontend/         ← React application
    ├── src/
    │   ├── App.jsx             ← Router
    │   ├── api.js              ← All API calls (axios)
    │   ├── index.css           ← Global styles + dark mode
    │   ├── context/
    │   │   └── AuthContext.jsx ← JWT auth state
    │   ├── components/
    │   │   └── UI.jsx          ← Navbar, Toast, Spinner, etc.
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Auth.jsx        ← Register, Login, DoctorLogin, AdminLogin
    │       ├── Doctors.jsx     ← Search + filter doctors
    │       ├── BookAppointment.jsx ← Booking + reviews + probability
    │       ├── Appointments.jsx    ← My appointments + countdown + receipt
    │       ├── Profile.jsx         ← Edit patient profile
    │       ├── DoctorPanel.jsx     ← Doctor approval dashboard
    │       └── Admin.jsx           ← Admin dashboard
    └── package.json
```

---

## 🚀 Setup & Run

### 1. Backend
```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email / Username           | Password   |
|---------|---------------------------|------------|
| Doctor  | sarah@medibook.com        | doctor123  |
| Doctor  | bilal@medibook.com        | doctor123  |
| Admin   | admin                     | admin123   |
| Patient | Register any new account  | (your own) |

---

## ✅ Features Implemented

### Patient Module
- ✅ Register & Login (JWT)
- ✅ Search doctors by name / specialization
- ✅ Doctor ratings & reviews
- ✅ Book appointment with time slot selection
- ✅ Confirmation probability bar
- ✅ My Appointments with countdown timer
- ✅ Print/download appointment receipt
- ✅ Cancel appointments
- ✅ Edit profile & change password

### Doctor Module
- ✅ Doctor login
- ✅ View incoming appointment requests
- ✅ Approve / Reject appointments
- ✅ Filter by status

### Admin Module
- ✅ Admin login
- ✅ Overview dashboard (stats)
- ✅ Manage all appointments (change status)
- ✅ View all patients
- ✅ View & remove doctors

### UI/UX
- ✅ Dark mode toggle (persisted)
- ✅ Mobile-friendly bottom navigation
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Separate pages for each module

---

## 🗄️ Database Schema (in-memory, replace with MySQL)

```sql
-- Patient Table
CREATE TABLE patients (
  patient_id VARCHAR(36) PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(100) UNIQUE,
  phone      VARCHAR(20),
  age        INT,
  password   VARCHAR(255),  -- bcrypt hashed
  created_at DATETIME DEFAULT NOW()
);

-- Doctor Table
CREATE TABLE doctors (
  doctor_id         VARCHAR(36) PRIMARY KEY,
  name              VARCHAR(100),
  email             VARCHAR(100) UNIQUE,
  password          VARCHAR(255),
  specialization    VARCHAR(50),
  experience        INT,
  available_time    VARCHAR(200),
  rating            DECIMAL(3,1) DEFAULT 5.0
);

-- Appointment Table
CREATE TABLE appointments (
  appointment_id           VARCHAR(36) PRIMARY KEY,
  patient_id               VARCHAR(36) REFERENCES patients(patient_id),
  doctor_id                VARCHAR(36) REFERENCES doctors(doctor_id),
  date                     DATE,
  time                     VARCHAR(20),
  status                   ENUM('pending','approved','cancelled','completed') DEFAULT 'pending',
  confirmation_probability INT,
  created_at               DATETIME DEFAULT NOW(),
  updated_at               DATETIME DEFAULT NOW()
);

-- Admin Table
CREATE TABLE admins (
  admin_id  VARCHAR(36) PRIMARY KEY,
  username  VARCHAR(50) UNIQUE,
  password  VARCHAR(255)
);
```

---

## 🔮 Future Enhancements
- Connect to MySQL database
- Online payment integration
- Email/SMS notifications
- Video consultation
- AI-based doctor recommendation
- Mobile app (React Native)
>>>>>>> a6684db (Initial commit: MediBook Doctor Appointment System)
