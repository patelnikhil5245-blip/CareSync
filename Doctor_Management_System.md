# MediBook - Doctor Management System

## Overview

The Doctor Management System handles all aspects of doctor profiles, availability, appointments, and patient interactions within MediBook.

## Doctor Profiles

### Profile Structure

```json
{
  "doctor_id": "d1",
  "name": "Dr. Rajesh Sharma",
  "email": "rajesh@medibook.com",
  "password": "hashed_password",
  "specialization": "Cardiologist",
  "experience": 12,
  "available_time": "9:00 AM,11:00 AM,2:00 PM,4:30 PM",
  "rating": 4.8,
  "reviews": [],
  "emoji": "👨‍⚕️",
  "approved": true
}
```

### Available Doctors

| ID | Name | Specialization | Experience | Rating |
|----|------|----------------|------------|--------|
| d1 | Dr. Rajesh Sharma | Cardiologist | 12 years | 4.8 |
| d2 | Dr. Priya Patel | Neurologist | 8 years | 4.6 |
| d3 | Dr. Anjali Gupta | Dermatologist | 10 years | 4.9 |
| d4 | Dr. Vikram Singh | Orthopedic | 15 years | 4.7 |
| d5 | Dr. Sunita Reddy | Pediatrician | 9 years | 4.5 |
| d6 | Dr. Arun Kumar | General Physician | 20 years | 4.4 |

## API Endpoints

### List All Doctors

**Endpoint**: `GET /api/doctors`

**Authentication**: None (Public)

**Query Parameters**:
- `search`: Filter by name or specialization
- `specialization`: Exact match filter

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
    "emoji": "👨‍⚕️"
  }
]
```

### Get Doctor Details

**Endpoint**: `GET /api/doctors/:id`

**Authentication**: None (Public)

**Response**:
```json
{
  "doctor_id": "d1",
  "name": "Dr. Rajesh Sharma",
  "specialization": "Cardiologist",
  "experience": 12,
  "available_time": "9:00 AM,11:00 AM,2:00 PM,4:30 PM",
  "rating": 4.8,
  "reviews": [
    {
      "patient_name": "John Doe",
      "rating": 5,
      "comment": "Excellent doctor!"
    }
  ],
  "emoji": "👨‍⚕️"
}
```

### Get Doctor's Appointments

**Endpoint**: `GET /api/doctor/appointments`

**Authentication**: Required (Doctor only)

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
    "patient_name": "John Doe",
    "patient_phone": "+91 9876543210"
  }
]
```

### Update Appointment Status

**Endpoint**: `PATCH /api/doctor/appointments/:id`

**Authentication**: Required (Doctor only)

**Request Body**:
```json
{
  "status": "approved" | "cancelled"
}
```

**Response**: Updated appointment object

### Submit Review

**Endpoint**: `POST /api/doctors/:id/review`

**Authentication**: Required (Patient only)

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

## Doctor Dashboard

### Features

1. **Incoming Appointments**
   - View all appointment requests
   - See patient details
   - Approve or reject appointments

2. **Appointment Management**
   - Filter by status (pending, approved, cancelled)
   - Sort by date
   - View appointment history

3. **Patient Information**
   - Patient name and contact
   - Appointment date and time
   - Payment status

### Dashboard Workflow

```
Doctor Login
    │
    ▼
View Appointments
    │
    ├── Pending → Approve/Reject
    │
    ├── Approved → View Details
    │
    └── Cancelled → Archive
```

## Specializations & Fees

| Specialization | Consultation Fee | Emoji |
|----------------|------------------|-------|
| Cardiologist | ₹2,500 | 👨‍⚕️ |
| Neurologist | ₹2,200 | 🧠 |
| Dermatologist | ₹1,500 | 🩺 |
| Orthopedic | ₹2,000 | 🦴 |
| Pediatrician | ₹1,200 | 👶 |
| General Physician | ₹800 | 🏥 |

## Time Slots

### Default Available Times

- 9:00 AM
- 11:00 AM
- 2:00 PM
- 4:30 PM

### Slot Booking Logic

```javascript
// Check if slot is available
const isAvailable = !appointments.some(
  a => a.doctor_id === doctorId && 
       a.date === date && 
       a.time === time && 
       a.status !== 'cancelled'
);
```

## Rating System

### Calculation

```javascript
// Average rating calculation
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
```

### Display

- Stars (1-5)
- Decimal precision (e.g., 4.8)
- Review count

## Doctor Login

### Credentials

All doctors use the same password for demo:
- **Password**: `doctor123`

### Login Flow

```javascript
async function doDoctorLogin() {
  const data = await api('/auth/doctor-login', {
    email: 'rajesh@medibook.com',
    password: 'doctor123'
  });
  
  // Store token and user
  localStorage.setItem('mb-token', data.token);
  localStorage.setItem('mb-user', JSON.stringify(data.user));
  
  // Redirect to doctor panel
  showPage('doctor-panel');
}
```

## Admin Doctor Management

### List All Doctors

**Endpoint**: `GET /api/admin/doctors`

**Authentication**: Required (Admin only)

### Remove Doctor

**Endpoint**: `DELETE /api/admin/doctors/:id`

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "message": "Doctor removed"
}
```

## Frontend Implementation

### Doctor Card Component

```html
<div class="doctor-card">
  <div class="doctor-emoji">👨‍⚕️</div>
  <div class="doctor-info">
    <h3>Dr. Rajesh Sharma</h3>
    <p>Cardiologist • 12 years exp</p>
    <div class="rating">⭐ 4.8</div>
    <p class="fee">₹2,500 consultation fee</p>
  </div>
  <button onclick="bookDoctor('d1')">Book Now</button>
</div>
```

### Doctor Panel UI

```html
<div id="doctor-panel">
  <h2>Welcome, Dr. <span id="doc-name"></span></h2>
  
  <div class="appointments-list">
    <h3>Incoming Appointments</h3>
    <div id="doc-appointments"></div>
  </div>
</div>
```

## Best Practices

### For Doctors

1. **Respond Quickly**: Approve/reject appointments within 24 hours
2. **Keep Schedule Updated**: Mark unavailable times
3. **Professional Communication**: Maintain patient confidentiality
4. **Accurate Information**: Keep profile information current

### For Developers

1. **Validation**: Always validate doctor ID before operations
2. **Authorization**: Enforce doctor role middleware
3. **Audit Trail**: Log all status changes
4. **Error Handling**: Graceful handling of edge cases

## Future Enhancements

- [ ] Doctor availability calendar
- [ ] Time-off management
- [ ] Patient medical history access
- [ ] Prescription generation
- [ ] Video consultation integration
- [ ] Automated reminders
- [ ] Performance analytics

---

**Document Version**: 1.0  
**Last Updated**: 2025
