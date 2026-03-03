# MediBook API Reference

## Table of Contents
- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Architecture Overview](#architecture-overview)
- [Detailed Component Analysis](#detailed-component-analysis)
- [Dependency Analysis](#dependency-analysis)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting Guide](#troubleshooting-guide)

## Introduction

This document provides comprehensive API documentation for the MediBook Doctor appointment booking system. It covers all RESTful endpoints grouped by functional domains: authentication, doctor management, appointment booking, payment processing, and admin operations.

### Key Features
- JWT-based authentication with role-based access control
- In-memory database (easily replaceable with MySQL/MongoDB)
- UPI payment integration (Google Pay, PhonePe, Paytm)
- Email verification for OAuth social logins
- Responsive React frontend with dark mode

## Project Structure

```
MediBook/
├── server.js          # Express backend API
├── app.js             # Frontend JavaScript logic
├── index.html         # Main HTML file
├── style.css          # Styling
├── api.js             # Axios API wrapper
└── package.json       # Dependencies
```

### Technology Stack
- **Backend**: Node.js + Express 5.2.1
- **Frontend**: Vanilla JavaScript (SPA)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Payment**: Stripe (optional) + UPI simulation

## Core Components

### Authentication Middleware
Enforces JWT-based access control and role checks:
- `authMiddleware(role)` - Validates token and checks role permissions

### Public Endpoints
- Doctor listings and search
- Consultation fee information

### Protected Endpoints
Require Bearer tokens and enforce role-based permissions:
- Patient: Appointment booking, profile management
- Doctor: Appointment approval/rejection
- Admin: System management

### Payment Endpoints
- Stripe PaymentIntent (when configured)
- UPI payment simulation (Google Pay, PhonePe, Paytm, Other UPI)
- Bank transfer/NEFT

## Architecture Overview

```
Client (Browser)
    ↓ HTTP Request
Express Server
    ↓ JWT Middleware (protected routes)
Controller
    ↓ Query/Update
In-Memory Database
    ↓ Response
Client
```

### Authentication Flow
1. User registers/logs in
2. Server validates credentials
3. JWT token returned
4. Client stores token (localStorage)
5. Token sent in Authorization header for protected routes

## Detailed Component Analysis

---

### Authentication Endpoints

#### POST /api/auth/register
Register a new patient account.

**Authentication**: None

**Request Body**:
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "age": "number (required)",
  "password": "string (required, min 8 chars)"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Patient Name",
    "email": "patient@example.com",
    "phone": "+91 9876543210",
    "age": 25,
    "role": "patient"
  }
}
```

**Errors**:
- `400`: Missing required fields
- `409`: Email already registered

---

#### POST /api/auth/login
Patient login.

**Authentication**: None

**Request Body**:
```json
{
  "email": "patient@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Patient Name",
    "email": "patient@example.com",
    "phone": "+91 9876543210",
    "age": 25,
    "role": "patient"
  }
}
```

**Errors**:
- `401`: Invalid email or password

---

#### POST /api/auth/doctor-login
Doctor login.

**Authentication**: None

**Request Body**:
```json
{
  "email": "rajesh@medibook.com",
  "password": "doctor123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "d1",
    "name": "Dr. Rajesh Sharma",
    "email": "rajesh@medibook.com",
    "specialization": "Cardiologist",
    "role": "doctor"
  }
}
```

**Demo Credentials**:
| Doctor | Email | Password |
|--------|-------|----------|
| Dr. Rajesh Sharma | rajesh@medibook.com | doctor123 |
| Dr. Priya Patel | priya@medibook.com | doctor123 |
| Dr. Anjali Gupta | anjali@medibook.com | doctor123 |
| Dr. Vikram Singh | vikram@medibook.com | doctor123 |
| Dr. Sunita Reddy | sunita@medibook.com | doctor123 |
| Dr. Arun Kumar | arun@medibook.com | doctor123 |

---

#### POST /api/auth/admin-login
Admin login.

**Authentication**: None

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1",
    "name": "Administrator",
    "role": "admin"
  }
}
```

---

### Doctor Management Endpoints

#### GET /api/doctors
List all doctors with optional filters.

**Authentication**: None

**Query Parameters**:
- `search`: string (name or specialization)
- `specialization`: string (exact match)

**Response**:
```json
[
  {
    "doctor_id": "d1",
    "name": "Dr. Rajesh Sharma",
    "specialization": "Cardiologist",
    "experience": 12,
    "available_time": "9:00 AM,11:00 AM,2:00 PM,4:30 PM",
    "rating": 4.8,
    "reviews": [],
    "emoji": "👨‍⚕️",
    "approved": true
  }
]
```

---

#### GET /api/doctors/:id
Get doctor details by ID.

**Authentication**: None

**Response**:
```json
{
  "doctor_id": "d1",
  "name": "Dr. Rajesh Sharma",
  "specialization": "Cardiologist",
  "experience": 12,
  "available_time": "9:00 AM,11:00 AM,2:00 PM,4:30 PM",
  "rating": 4.8,
  "reviews": [],
  "emoji": "👨‍⚕️"
}
```

**Errors**:
- `404`: Doctor not found

---

#### GET /api/doctor/appointments
Get doctor's appointments (doctor only).

**Authentication**: Required (Bearer token, doctor role)

**Response**:
```json
[
  {
    "appointment_id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "d1",
    "date": "2025-06-15",
    "time": "9:00 AM",
    "status": "pending",
    "patient_name": "Patient Name",
    "patient_phone": "+91 9876543210"
  }
]
```

---

#### PATCH /api/doctor/appointments/:id
Approve or reject appointment.

**Authentication**: Required (Bearer token, doctor role)

**Request Body**:
```json
{
  "status": "approved" | "cancelled"
}
```

**Response**: Updated appointment object

**Errors**:
- `404`: Appointment not found
- `400`: Invalid status

---

#### POST /api/doctors/:id/review
Submit a review for a doctor.

**Authentication**: Required (Bearer token, patient role)

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Excellent doctor!"
}
```

**Response**:
```json
{
  "message": "Review added",
  "rating": 4.9
}
```

---

### Appointment Booking Endpoints

#### POST /api/appointments
Book an appointment.

**Authentication**: Required (Bearer token, patient role)

**Request Body**:
```json
{
  "doctor_id": "d1",
  "date": "2025-06-15",
  "time": "9:00 AM"
}
```

**Response**:
```json
{
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "d1",
  "doctor_name": "Dr. Rajesh Sharma",
  "doctor_spec": "Cardiologist",
  "doctor_emoji": "👨‍⚕️",
  "date": "2025-06-15",
  "time": "9:00 AM",
  "status": "pending",
  "confirmation_probability": 85
}
```

**Errors**:
- `400`: Missing required fields
- `404`: Doctor not found
- `409`: Slot already booked

---

#### GET /api/appointments
Get patient's appointments.

**Authentication**: Required (Bearer token, patient role)

**Response**: Array of appointments

---

#### PATCH /api/appointments/:id/cancel
Cancel an appointment.

**Authentication**: Required (Bearer token, patient role)

**Response**: Updated appointment

---

### Patient Profile Endpoints

#### GET /api/profile
Get patient profile.

**Authentication**: Required (Bearer token, patient role)

**Response**:
```json
{
  "patient_id": "uuid",
  "name": "Patient Name",
  "email": "patient@example.com",
  "phone": "+91 9876543210",
  "age": 25
}
```

---

#### PUT /api/profile
Update patient profile.

**Authentication**: Required (Bearer token, patient role)

**Request Body**:
```json
{
  "name": "Updated Name",
  "phone": "+91 9876543210",
  "age": 26,
  "password": "newPassword123"  // optional
}
```

**Response**: Updated patient object

---

### Payment Processing Endpoints

#### POST /api/payments/create-intent
Create Stripe PaymentIntent (requires Stripe configuration).

**Authentication**: Required (Bearer token, patient role)

**Request Body**:
```json
{
  "appointment_id": "uuid",
  "doctor_id": "d1"
}
```

**Response**:
```json
{
  "clientSecret": "pi_..._secret_...",
  "amount": 250000,
  "doctor": "Dr. Rajesh Sharma",
  "specialization": "Cardiologist"
}
```

**Errors**:
- `503`: Stripe not configured

---

#### POST /api/payments/simulate
Simulate payment (UPI, Card, Bank Transfer).

**Authentication**: Required (Bearer token, patient role)

**Request Body**:
```json
{
  "appointment_id": "uuid",
  "doctor_id": "d1",
  "method": "gpay" | "phonepe" | "paytm" | "upi" | "card" | "bank",
  "card_number": "1234567890123456",      // for card
  "card_name": "Card Holder",             // for card
  "expiry": "12/28",                      // for card
  "cvv": "123"                            // for card
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "payment_id": "uuid",
    "appointment_id": "uuid",
    "amount": 2500,
    "currency": "Rs",
    "method": "gpay",
    "status": "paid",
    "transaction_ref": "TXN-ABC12345",
    "paid_at": "2025-06-15T10:30:00Z"
  }
}
```

**Payment Methods**:
| Method | Description |
|--------|-------------|
| `gpay` | Google Pay UPI |
| `phonepe` | PhonePe UPI |
| `paytm` | Paytm UPI |
| `upi` | Other UPI (BHIM, Amazon Pay, etc.) |
| `card` | Credit/Debit Card |
| `bank` | Bank Transfer/NEFT |

---

#### GET /api/payments/:appointment_id
Get payment receipt.

**Authentication**: Required (Bearer token, patient role)

**Response**: Payment object

---

#### GET /api/payments/fee/:doctor_id
Get consultation fee for a doctor.

**Authentication**: None

**Response**:
```json
{
  "fee": 2500,
  "currency": "Rs",
  "specialization": "Cardiologist"
}
```

**Fee Structure**:
| Specialization | Fee (Rs) |
|----------------|-----------|
| Cardiologist | 2500 |
| Neurologist | 2200 |
| Dermatologist | 1500 |
| Orthopedic | 2000 |
| Pediatrician | 1200 |
| General Physician | 800 |

---

### Admin Operations Endpoints

#### GET /api/admin/stats
Get system statistics.

**Authentication**: Required (Bearer token, admin role)

**Response**:
```json
{
  "totalPatients": 150,
  "totalDoctors": 6,
  "totalAppointments": 320,
  "pending": 45,
  "approved": 250,
  "cancelled": 25
}
```

---

#### GET /api/admin/appointments
Get all appointments.

**Authentication**: Required (Bearer token, admin role)

**Response**: Array of all appointments

---

#### GET /api/admin/patients
Get all patients.

**Authentication**: Required (Bearer token, admin role)

**Response**: Array of patients (without passwords)

---

#### GET /api/admin/doctors
Get all doctors.

**Authentication**: Required (Bearer token, admin role)

**Response**: Array of doctors (without passwords)

---

#### PATCH /api/admin/appointments/:id
Update appointment status.

**Authentication**: Required (Bearer token, admin role)

**Request Body**:
```json
{
  "status": "approved" | "cancelled" | "pending"
}
```

**Response**: Updated appointment

---

#### DELETE /api/admin/doctors/:id
Remove a doctor.

**Authentication**: Required (Bearer token, admin role)

**Response**:
```json
{
  "message": "Doctor removed"
}
```

---

## Dependency Analysis

### Frontend to Backend Communication

```javascript
// api.js - Axios wrapper
const API = axios.create({ baseURL: '/api' });

// Automatically attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('mb-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Backend Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT signing/verification |
| uuid | Unique ID generation |
| cors | Cross-origin requests |
| stripe | Payment processing (optional) |

---

## Performance Considerations

### Current Implementation
- **In-memory storage**: O(n) lookups for filtering/searching
- **Suitable for**: Development, small scale (< 1000 records)
- **Limitations**: Data lost on server restart

### Production Recommendations
1. **Database**: Replace in-memory with MySQL/MariaDB or MongoDB
2. **Caching**: Add Redis for session management
3. **Rate Limiting**: Implement express-rate-limit
4. **Pagination**: Add limit/offset to list endpoints
5. **Indexing**: Database indexes on frequently queried fields

---

## Troubleshooting Guide

### Common Issues

#### CORS Errors
**Solution**: Ensure `cors` middleware is enabled in server.js

#### JWT Token Expired
**Error**: `401 Invalid or expired token`
**Solution**: Re-login to get fresh token

#### Payment Failed
**Error**: `503 Payment service unavailable`
**Solution**: Stripe not configured. Use `/api/payments/simulate` instead.

#### Doctor Login Not Working
**Check**: Use correct email format: `name@medibook.com`
**Password**: `doctor123`

### Debug Mode
Set environment variables:
```bash
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

---

## Appendix: OAuth Social Login

### Supported Providers
- Google (gmail.com)
- Facebook (facebook.com)
- Apple (icloud.com, me.com, mac.com)
- GitHub (github.com)
- X/Twitter (x.com, twitter.com)
- LinkedIn (linkedin.com)

### OAuth Flow
1. Click social login button
2. Enter name and email (domain validated)
3. Receive 6-digit verification code (demo: `123456`)
4. Enter code to complete registration/login

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**API Base URL**: `http://localhost:5000/api`
