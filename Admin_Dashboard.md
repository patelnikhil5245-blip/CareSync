# MediBook - Admin Dashboard

## Overview

The Admin Dashboard provides system administrators with comprehensive oversight and management capabilities for the MediBook platform.

## Access

### Login Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

### Login Endpoint

**POST /api/auth/admin-login**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

## Dashboard Features

### 1. System Statistics

Real-time overview of platform metrics.

**Endpoint**: `GET /api/admin/stats`

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

**UI Display**:
```
┌─────────────────────────────────────────────┐
│  System Overview                            │
├─────────────┬─────────────┬─────────────────┤
│  👥 Patients│  👨‍⚕️ Doctors│  📅 Appointments│
│     150     │      6      │       320       │
├─────────────┴─────────────┴─────────────────┤
│  Status Breakdown                           │
│  🟡 Pending: 45  🟢 Approved: 250  🔴 Cancelled: 25│
└─────────────────────────────────────────────┘
```

### 2. User Management

#### View All Patients

**Endpoint**: `GET /api/admin/patients`

**Response**: Array of patient objects (without passwords)

```json
[
  {
    "patient_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "age": 30,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

#### View All Doctors

**Endpoint**: `GET /api/admin/doctors`

**Response**: Array of doctor objects (without passwords)

```json
[
  {
    "doctor_id": "d1",
    "name": "Dr. Rajesh Sharma",
    "email": "rajesh@medibook.com",
    "specialization": "Cardiologist",
    "experience": 12,
    "approved": true
  }
]
```

#### Remove Doctor

**Endpoint**: `DELETE /api/admin/doctors/:id`

**Response**:
```json
{
  "message": "Doctor removed"
}
```

### 3. Appointment Oversight

#### View All Appointments

**Endpoint**: `GET /api/admin/appointments`

**Response**: Array of all appointments with patient and doctor details

```json
[
  {
    "appointment_id": "uuid",
    "patient_name": "John Doe",
    "doctor_name": "Dr. Rajesh Sharma",
    "date": "2025-06-15",
    "time": "9:00 AM",
    "status": "approved",
    "payment_status": "paid"
  }
]
```

#### Update Appointment Status

**Endpoint**: `PATCH /api/admin/appointments/:id`

**Request Body**:
```json
{
  "status": "approved" | "cancelled" | "pending"
}
```

**Response**: Updated appointment object

#### Delete Appointment

**Endpoint**: `DELETE /api/admin/appointments/:id`

**Response**:
```json
{
  "message": "Appointment deleted"
}
```

### 4. Payment Monitoring

**Endpoint**: `GET /api/admin/payments`

**Response**: Array of all payments with enriched details

```json
[
  {
    "payment_id": "uuid",
    "patient_name": "John Doe",
    "doctor_name": "Dr. Rajesh Sharma",
    "amount": 2500,
    "method": "card",
    "status": "paid",
    "transaction_ref": "TXN-ABC12345",
    "paid_at": "2025-06-15T10:30:00Z"
  }
]
```

## Dashboard Layout

### Sidebar Navigation

```
┌─────────────────────────────────────────────────────┐
│  🏥 MediBook Admin                                  │
├─────────────────────────────────────────────────────┤
│  📊 Dashboard          ← Overview & Stats           │
│  👥 Patients           ← Patient Management         │
│  👨‍⚕️ Doctors           ← Doctor Management          │
│  📅 Appointments       ← Appointment Oversight      │
│  💰 Payments           ← Payment Monitoring         │
│  ⚙️ Settings           ← System Settings            │
├─────────────────────────────────────────────────────┤
│  🔓 Logout                                          │
└─────────────────────────────────────────────────────┘
```

### Main Content Area

Dynamic content based on selected section:
- Statistics cards
- Data tables
- Action buttons
- Filters and search

## UI Components

### Statistics Cards

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-value" id="total-patients">150</div>
    <div class="stat-label">Total Patients</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-icon">👨‍⚕️</div>
    <div class="stat-value" id="total-doctors">6</div>
    <div class="stat-label">Total Doctors</div>
  </div>
  
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-value" id="total-appointments">320</div>
    <div class="stat-label">Total Appointments</div>
  </div>
</div>
```

### Data Table

```html
<table class="admin-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody id="table-body">
    <!-- Dynamic rows -->
  </tbody>
</table>
```

### Action Buttons

```html
<button class="btn-view" onclick="viewDetails(id)">👁️ View</button>
<button class="btn-edit" onclick="editItem(id)">✏️ Edit</button>
<button class="btn-delete" onclick="deleteItem(id)">🗑️ Delete</button>
```

## Admin Workflow

### Daily Operations

```
Login to Admin Dashboard
    │
    ▼
Review System Statistics
    │
    ▼
Check Pending Appointments
    │
    ▼
Manage User Accounts
    │
    ├── Add/Remove Doctors
    │
    └── Review Patient List
    │
    ▼
Monitor Payments
    │
    ▼
Generate Reports (Future)
```

### Emergency Actions

1. **Cancel All Appointments for Doctor**
   - Find doctor in list
   - Bulk cancel appointments
   - Notify affected patients

2. **Remove Malicious User**
   - Find user in patients list
   - Delete account
   - Cancel all their appointments

3. **System Maintenance**
   - View active appointments
   - Notify users of downtime
   - Schedule maintenance window

## Security Considerations

### Admin Privileges

| Action | Admin Only |
|--------|-----------|
| View all patients | ✅ |
| View all doctors | ✅ |
| Remove doctors | ✅ |
| Delete appointments | ✅ |
| View all payments | ✅ |
| Change any appointment status | ✅ |

### Best Practices

1. **Strong Password**: Use complex admin password
2. **Session Timeout**: Implement auto-logout (future)
3. **Audit Logging**: Track all admin actions (future)
4. **Two-Factor Auth**: Enable 2FA (future)

## API Implementation

### Admin Middleware

```javascript
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply to admin routes
app.get('/api/admin/stats', authMiddleware('admin'), getStats);
```

### Data Sanitization

```javascript
// Remove sensitive fields before sending
const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};
```

## Future Enhancements

- [ ] **Analytics Dashboard**: Charts and graphs
- [ ] **Export Data**: CSV/Excel downloads
- [ ] **Bulk Actions**: Multi-select operations
- [ ] **Search & Filter**: Advanced filtering
- [ ] **Audit Logs**: Complete action history
- [ ] **Role Management**: Multiple admin levels
- [ ] **System Settings**: Platform configuration
- [ ] **Email Templates**: Customizable notifications

---

**Document Version**: 1.0  
**Last Updated**: 2025
