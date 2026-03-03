# MediBook - Architecture Overview

## System Architecture

MediBook follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Browser   │  │   Mobile    │  │   Future: Mobile    │ │
│  │   (SPA)     │  │  (Responsive)│  │      App            │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          └────────────────┘
                   │
                   ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Express.js Server (Node.js)                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │   Routes    │  │ Middleware  │  │  Controllers    │ │ │
│  │  │  (/api/*)   │  │(Auth, CORS) │  │   (Logic)       │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              In-Memory Database (Current)               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Patients │ │ Doctors  │ │Appointments│ │ Payments│  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Future: MySQL/MongoDB with persistent storage               │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture

```
index.html
    │
    ├── app.js (Main Application Logic)
    │       ├── State Management
    │       ├── API Integration
    │       ├── UI Controllers
    │       └── Event Handlers
    │
    ├── style.css (Styling)
    │       ├── CSS Variables (Theming)
    │       ├── Responsive Design
    │       └── Component Styles
    │
    └── api.js (API Wrapper)
            ├── Axios Instance
            ├── Request Interceptors
            └── API Methods
```

### 2. Backend Architecture

```
server.js
    │
    ├── Middleware Stack
    │       ├── CORS
    │       ├── JSON Parser
    │       └── Static Files
    │
    ├── Authentication Layer
    │       ├── JWT Verification
    │       └── Role-Based Access
    │
    ├── Route Handlers
    │       ├── /api/auth/*
    │       ├── /api/doctors/*
    │       ├── /api/appointments/*
    │       ├── /api/payments/*
    │       └── /api/admin/*
    │
    └── Database (In-Memory)
            ├── Patients Collection
            ├── Doctors Collection
            ├── Appointments Collection
            └── Payments Collection
```

## Data Flow

### Authentication Flow

```
User Login
    │
    ▼
POST /api/auth/login
    │
    ▼
Validate Credentials
    │
    ▼
Generate JWT Token
    │
    ▼
Store Token (localStorage)
    │
    ▼
Include Token in Headers
    │
    ▼
Access Protected Routes
```

### Appointment Booking Flow

```
Select Doctor & Slot
    │
    ▼
POST /api/appointments
    │
    ▼
Check Slot Availability
    │
    ▼
Create Appointment (pending)
    │
    ▼
Process Payment
    │
    ▼
Update Status (approved)
    │
    ▼
Generate Receipt
    │
    ▼
Confirmation Display
```

### Payment Processing Flow

```
Select Payment Method
    │
    ▼
Enter Payment Details
    │
    ▼
Validate Input
    │
    ▼
POST /api/payments/simulate
    │
    ▼
Process Payment
    │
    ▼
Create Payment Record
    │
    ▼
Link to Appointment
    │
    ▼
Generate Transaction Ref
    │
    ▼
Return Receipt
```

## Security Architecture

### Authentication & Authorization

```
Request
    │
    ▼
JWT Middleware
    │
    ├── Extract Token from Header
    │
    ├── Verify Token Signature
    │
    ├── Check Expiration
    │
    ├── Decode User Info
    │
    └── Attach to Request Object
    │
    ▼
Role Middleware (if required)
    │
    ├── Check User Role
    │
    └── Verify Permission
    │
    ▼
Route Handler
```

### Data Protection

| Layer | Protection Mechanism |
|-------|---------------------|
| Transport | HTTPS (TLS 1.3) |
| Authentication | JWT with expiration |
| Passwords | bcryptjs hashing |
| Input | Server-side validation |
| Output | XSS prevention |

## API Architecture

### RESTful Design Principles

- **Resources**: `/doctors`, `/appointments`, `/payments`
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: Standard HTTP status codes
- **Content Type**: JSON

### Endpoint Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /doctor-login
│   └── POST /admin-login
│
├── /doctors
│   ├── GET / (list)
│   ├── GET /:id (detail)
│   └── POST /:id/review
│
├── /appointments
│   ├── GET / (patient's appointments)
│   ├── POST / (book)
│   └── PATCH /:id/cancel
│
├── /payments
│   ├── POST /create-intent (Stripe)
│   ├── POST /simulate
│   ├── GET /:appointment_id
│   └── GET /fee/:doctor_id
│
├── /profile
│   ├── GET /
│   └── PUT /
│
└── /admin
    ├── GET /stats
    ├── GET /appointments
    ├── GET /patients
    ├── GET /doctors
    └── PATCH /appointments/:id
```

## State Management

### Client-Side State

```javascript
// Global State Object
const State = {
  // User State
  curUser: null,        // Current logged-in user
  authToken: null,      // JWT token
  
  // UI State
  curPage: 'home',      // Current page
  theme: 'light',       // Dark/Light mode
  
  // Booking State
  selDoc: null,         // Selected doctor
  selSlot: null,        // Selected time slot
  payMethod: 'card',    // Selected payment method
  
  // Data Cache
  doctors: [],          // Cached doctor list
  appointments: []      // Cached appointments
};
```

### Server-Side State

```javascript
// In-Memory Database
const DB = {
  patients: [],
  doctors: [],
  appointments: [],
  payments: [],
  admins: []
};
```

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory database (data lost on restart)
- No caching layer
- No load balancing

### Future Scaling
```
┌─────────────────────────────────────────┐
│           Load Balancer                 │
└─────────────────────────────────────────┘
           │              │
    ┌──────┘              └──────┐
    ▼                            ▼
┌─────────┐                ┌─────────┐
│ Server 1│                │ Server 2│
│ (Node)  │                │ (Node)  │
└────┬────┘                └────┬────┘
     │                          │
     └──────────┬───────────────┘
                ▼
        ┌───────────────┐
        │  Redis Cache  │
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │  MySQL/Mongo  │
        │   (Primary)   │
        └───────────────┘
```

## Technology Decisions

### Why Express.js?
- Minimal and flexible
- Large ecosystem
- Easy middleware integration
- Great for REST APIs

### Why JWT?
- Stateless authentication
- Cross-domain capability
- Mobile-friendly
- Industry standard

### Why In-Memory DB?
- Fast development
- No setup required
- Easy to reset
- Future migration path

## Deployment Architecture

### Development
```
Local Machine
    │
    ├── Node.js Server (port 5000)
    │
    └── Browser Access
```

### Production (Future)
```
Cloud Provider (AWS/Azure/GCP)
    │
    ├── Load Balancer
    │
    ├── Auto-scaling Group
    │   ├── Server Instance 1
    │   ├── Server Instance 2
    │   └── Server Instance N
    │
    ├── Managed Database (RDS/Atlas)
    │
    └── CDN for Static Assets
```

## Monitoring & Logging

### Current
- Console logging
- Toast notifications for user feedback

### Future
- Application Performance Monitoring (APM)
- Centralized logging (ELK Stack)
- Error tracking (Sentry)
- Analytics (Google Analytics)

---

**Architecture Version**: 1.0  
**Last Updated**: 2025  
**Status**: Development Ready
