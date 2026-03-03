# MediBook - Appointment Booking System

## Overview

The Appointment Booking System is the core functionality of MediBook, enabling patients to schedule appointments with doctors seamlessly.

## Booking Flow

```
Patient Login
    │
    ▼
Browse/Search Doctors
    │
    ▼
Select Doctor
    │
    ▼
Choose Date & Time Slot
    │
    ▼
Confirm Booking
    │
    ▼
Process Payment
    │
    ▼
Appointment Confirmed
    │
    ▼
Doctor Approval
    │
    ▼
Appointment Completed
```

## Appointment Lifecycle

### Status States

| Status | Description | Actions |
|--------|-------------|---------|
| **pending** | Awaiting payment or doctor approval | Pay, Cancel |
| **approved** | Confirmed and scheduled | View, Print receipt |
| **cancelled** | Cancelled by patient or doctor | None |

### State Transitions

```
┌─────────┐    Payment     ┌──────────┐
│  Book   │───────────────▶│  Pending │
└─────────┘                └────┬─────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────┐           ┌──────────┐
            │ Approved │           │ Cancelled│
            └──────────┘           └──────────┘
```

## API Endpoints

### Book Appointment

**Endpoint**: `POST /api/appointments`

**Authentication**: Required (Patient)

**Request Body**:
```json
{
  "doctor_id": "d1",
  "date": "2025-06-15",
  "time": "9:00 AM"
}
```

**Validation Rules**:
- `doctor_id`: Must exist in database
- `date`: Format YYYY-MM-DD, must be future date
- `time`: Must be in doctor's available_time list
- Slot must not be already booked

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

**Error Responses**:
- `400`: Missing required fields
- `404`: Doctor not found
- `409`: Slot already booked

### Get Patient Appointments

**Endpoint**: `GET /api/appointments`

**Authentication**: Required (Patient)

**Response**:
```json
[
  {
    "appointment_id": "uuid",
    "doctor_id": "d1",
    "doctor_name": "Dr. Rajesh Sharma",
    "doctor_spec": "Cardiologist",
    "date": "2025-06-15",
    "time": "9:00 AM",
    "status": "approved",
    "payment_status": "paid"
  }
]
```

### Cancel Appointment

**Endpoint**: `PATCH /api/appointments/:id/cancel`

**Authentication**: Required (Patient)

**Response**: Updated appointment with status "cancelled"

### Doctor: Get Appointments

**Endpoint**: `GET /api/doctor/appointments`

**Authentication**: Required (Doctor)

**Response**: Array of appointments for logged-in doctor

### Doctor: Update Status

**Endpoint**: `PATCH /api/doctor/appointments/:id`

**Authentication**: Required (Doctor)

**Request Body**:
```json
{
  "status": "approved" | "cancelled"
}
```

## Slot Availability

### Available Time Slots

Default slots for all doctors:
- 9:00 AM
- 11:00 AM
- 2:00 PM
- 4:30 PM

### Checking Availability

```javascript
function isSlotAvailable(doctorId, date, time) {
  return !DB.appointments.some(
    a => a.doctor_id === doctorId && 
         a.date === date && 
         a.time === time && 
         a.status !== 'cancelled'
  );
}
```

### Confirmation Probability

Calculated based on:
- Doctor's current load
- Historical approval rate
- Time until appointment

```javascript
// Simple calculation
const probability = Math.floor(Math.random() * 20) + 80; // 80-99%
```

## Frontend Implementation

### Booking UI Flow

```
┌─────────────────────────────────────┐
│  1. Doctor Selection                │
│     - Search/Filter doctors         │
│     - View doctor profiles          │
│     - Click "Book Now"              │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  2. Date & Time Selection           │
│     - Calendar picker               │
│     - Available slots display       │
│     - Fee information               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  3. Confirmation                    │
│     - Review details                │
│     - Terms acceptance              │
│     - Confirm booking               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  4. Payment                         │
│     - Select method                 │
│     - Enter details                 │
│     - Process payment               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  5. Success                         │
│     - Confirmation message          │
│     - Receipt download              │
│     - Add to calendar               │
└─────────────────────────────────────┘
```

### Appointment Card Component

```html
<div class="appointment-card">
  <div class="appt-header">
    <span class="status-badge approved">Approved</span>
    <span class="appt-date">June 15, 2025</span>
  </div>
  <div class="appt-body">
    <div class="doctor-info">
      <span class="emoji">👨‍⚕️</span>
      <div>
        <h4>Dr. Rajesh Sharma</h4>
        <p>Cardiologist</p>
      </div>
    </div>
    <div class="appt-time">9:00 AM</div>
  </div>
  <div class="appt-actions">
    <button onclick="printReceipt('uuid')">Print Receipt</button>
    <button onclick="cancelAppointment('uuid')">Cancel</button>
  </div>
</div>
```

## Appointment Management

### Patient View

**My Appointments Page**:
- List all appointments (upcoming and past)
- Filter by status
- Sort by date
- Cancel option for pending/approved
- Print receipt for paid appointments

### Doctor View

**Doctor Panel**:
- Incoming appointment requests
- Approve/Reject actions
- Patient contact information
- Appointment history

### Admin View

**Admin Dashboard**:
- All appointments overview
- Status management
- Delete appointments
- Export data

## Reminders & Notifications

### Current Implementation

- Toast notifications for immediate feedback
- Appointment list for reference
- No email/SMS (future enhancement)

### Future Enhancements

- [ ] Email reminders 24h before appointment
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Calendar integration (Google/Outlook)
- [ ] Automated follow-ups

## Data Model

### Appointment Object

```javascript
{
  appointment_id: "uuid",
  patient_id: "uuid",
  doctor_id: "string",
  date: "YYYY-MM-DD",
  time: "HH:MM AM/PM",
  status: "pending|approved|cancelled",
  payment_id: "uuid|null",
  created_at: "ISO timestamp",
  updated_at: "ISO timestamp"
}
```

### Relationships

```
Appointment
    ├── belongs_to: Patient
    ├── belongs_to: Doctor
    └── has_one: Payment (optional)
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Slot already booked" | Time taken | Choose different slot |
| "Doctor not available" | Doctor removed | Select different doctor |
| "Invalid date" | Past date selected | Select future date |
| "Payment required" | Unpaid appointment | Complete payment first |

## Best Practices

### For Patients

1. **Book in Advance**: Secure preferred slots early
2. **Accurate Information**: Provide correct contact details
3. **Cancellation Policy**: Cancel if unable to attend
4. **Arrive Early**: Be punctual for appointments

### For Doctors

1. **Timely Response**: Approve/reject within 24 hours
2. **Keep Updated**: Mark unavailable times promptly
3. **Professionalism**: Maintain patient confidentiality
4. **Preparation**: Review patient info before appointment

### For Developers

1. **Validation**: Always validate dates and slots server-side
2. **Concurrency**: Handle simultaneous booking attempts
3. **Idempotency**: Prevent duplicate bookings
4. **Audit Trail**: Log all status changes

## Statistics & Analytics

### Current Metrics

- Total appointments
- Pending approvals
- Approval rate
- Cancellation rate
- Revenue per doctor

### Future Analytics

- Peak booking times
- Popular specializations
- Patient retention
- Doctor performance
- Revenue trends

---

**Document Version**: 1.0  
**Last Updated**: 2025
