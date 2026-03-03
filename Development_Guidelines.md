# MediBook - Development Guidelines

## Code Style

### JavaScript

#### Naming Conventions

```javascript
// Variables: camelCase
const userName = 'John';
let appointmentCount = 0;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '/api';
const JWT_SECRET = 'secret-key';

// Functions: camelCase, verb prefix
function getUserById() {}
function handleSubmit() {}
function renderDoctorCard() {}

// Classes: PascalCase
class AppointmentManager {}
class PaymentProcessor {}

// Files: kebab-case
doctor-management.js
appointment-booking.js
```

#### Code Structure

```javascript
// 1. Imports/Dependencies
const express = require('express');
const bcrypt = require('bcryptjs');

// 2. Constants
const PORT = process.env.PORT || 5000;

// 3. State/Configuration
let DB = { patients: [], doctors: [], appointments: [], payments: [] };

// 4. Helper Functions
function generateId() { return uuidv4(); }
function hashPassword(pwd) { return bcrypt.hashSync(pwd, 10); }

// 5. Main Functions
async function bookAppointment(data) {
  // Implementation
}

// 6. Event Handlers / Routes
app.post('/api/appointments', (req, res) => {
  // Route handler
});

// 7. Initialization
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

### CSS

#### Naming: BEM Methodology

```css
/* Block */
.doctor-card { }

/* Element */
.doctor-card__image { }
.doctor-card__title { }
.doctor-card__button { }

/* Modifier */
.doctor-card--featured { }
.doctor-card__button--primary { }
.doctor-card__button--disabled { }
```

#### Property Order

```css
.component {
  /* 1. Positioning */
  position: relative;
  z-index: 10;
  
  /* 2. Display & Box Model */
  display: flex;
  width: 100%;
  margin: 0;
  padding: 1rem;
  border: 1px solid #ccc;
  
  /* 3. Typography */
  font-size: 1rem;
  text-align: center;
  
  /* 4. Visual */
  background: #fff;
  color: #333;
  
  /* 5. Animation */
  transition: all 0.3s ease;
  
  /* 6. Misc */
  cursor: pointer;
}
```

## Project Structure

```
MediBook/
├── src/                          # Source files (future)
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── styles/
├── public/                       # Static assets (future)
│   ├── images/
│   └── fonts/
├── docs/                         # Documentation
│   ├── API_REFERENCE.md
│   ├── PAYMENT_GUIDE.md
│   └── ...
├── tests/                        # Test files (future)
├── server.js                     # Backend entry
├── app.js                        # Frontend entry
├── index.html                    # Main HTML
├── style.css                     # Styles
├── api.js                        # API client
├── package.json
└── README.md
```

## Git Workflow

### Branching Strategy

```
main                    # Production-ready
  └── develop           # Integration branch
        └── feature/    # Feature branches
        └── bugfix/     # Bug fix branches
        └── hotfix/     # Urgent fixes
```

### Commit Messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(auth): add OAuth social login

Implement Google, Facebook, and Apple OAuth
with email verification flow.

Closes #123
```

```
fix(payment): resolve UPI validation error

UPI ID regex was too strict, causing valid IDs
to be rejected. Updated pattern to match
standard UPI format.

Fixes #456
```

## API Development

### Endpoint Design

```javascript
// RESTful conventions
GET    /api/doctors          # List all
GET    /api/doctors/:id      # Get one
POST   /api/doctors          # Create
PUT    /api/doctors/:id      # Update (full)
PATCH  /api/doctors/:id      # Update (partial)
DELETE /api/doctors/:id      # Delete
```

### Response Format

```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }  // Optional
  }
}
```

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

## Testing

### Unit Tests (Future)

```javascript
// Example test structure
describe('Appointment Booking', () => {
  test('should book appointment successfully', async () => {
    const data = {
      doctor_id: 'd1',
      date: '2025-06-15',
      time: '9:00 AM'
    };
    
    const result = await bookAppointment(data);
    
    expect(result.status).toBe('pending');
    expect(result.doctor_id).toBe('d1');
  });
  
  test('should reject double booking', async () => {
    // Test implementation
  });
});
```

### Manual Testing Checklist

#### Authentication
- [ ] Register new patient
- [ ] Login with email/password
- [ ] Login with OAuth (Google, Facebook)
- [ ] Email verification flow
- [ ] Doctor login
- [ ] Admin login
- [ ] Logout
- [ ] Token expiration

#### Doctor Management
- [ ] View doctor list
- [ ] Search doctors
- [ ] Filter by specialization
- [ ] View doctor details
- [ ] Submit review

#### Appointments
- [ ] Book appointment
- [ ] View my appointments
- [ ] Cancel appointment
- [ ] Doctor approve/reject
- [ ] Prevent double booking

#### Payments
- [ ] Card payment
- [ ] UPI payment (all methods)
- [ ] Bank transfer
- [ ] Payment failure handling
- [ ] Receipt generation
- [ ] Print receipt

#### Admin
- [ ] View statistics
- [ ] View all patients
- [ ] View all doctors
- [ ] Remove doctor
- [ ] Manage appointments

#### UI/UX
- [ ] Dark mode toggle
- [ ] Responsive design (mobile)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error messages

## Performance Guidelines

### Frontend

1. **Minimize DOM Updates**
   ```javascript
   // Bad: Multiple updates
   element.style.color = 'red';
   element.style.fontSize = '20px';
   
   // Good: Single update
   element.className = 'highlighted';
   ```

2. **Debounce Expensive Operations**
   ```javascript
   const search = debounce((query) => {
     filterResults(query);
   }, 300);
   ```

3. **Lazy Load Data**
   ```javascript
   // Load only when needed
   async function loadDoctors() {
     if (State.doctors.length === 0) {
       State.doctors = await api('/doctors');
     }
   }
   ```

### Backend

1. **Use Indexes**
   ```javascript
   // MySQL example
   CREATE INDEX idx_email ON patients(email);
   ```

2. **Limit Query Results**
   ```javascript
   app.get('/api/doctors', (req, res) => {
     const limit = Math.min(req.query.limit || 20, 100);
     // Return paginated results
   });
   ```

3. **Cache Frequently Accessed Data**
   ```javascript
   const cache = new Map();
   
   function getCachedDoctors() {
     if (cache.has('doctors')) {
       return cache.get('doctors');
     }
     const doctors = fetchDoctors();
     cache.set('doctors', doctors);
     return doctors;
   }
   ```

## Security Guidelines

### Authentication

1. **Never Store Plain Passwords**
   ```javascript
   const hashed = await bcrypt.hash(password, 10);
   ```

2. **Validate JWT on Every Request**
   ```javascript
   app.use('/api/protected', authMiddleware);
   ```

3. **Use HTTPS in Production**
   ```javascript
   // Production only
   const https = require('https');
   const options = {
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   };
   https.createServer(options, app).listen(443);
   ```

### Input Validation

```javascript
function validateAppointment(data) {
  const errors = [];
  
  if (!data.doctor_id) {
    errors.push('Doctor ID is required');
  }
  
  if (!data.date || !isValidDate(data.date)) {
    errors.push('Valid date is required');
  }
  
  if (!data.time || !isValidTime(data.time)) {
    errors.push('Valid time is required');
  }
  
  return errors;
}
```

### XSS Prevention

```javascript
// Sanitize user input
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Use in templates
element.innerHTML = `<p>${escapeHtml(userInput)}</p>`;
```

## Documentation

### Code Comments

```javascript
/**
 * Book an appointment with a doctor
 * @param {Object} data - Appointment data
 * @param {string} data.doctor_id - Doctor ID
 * @param {string} data.date - Appointment date (YYYY-MM-DD)
 * @param {string} data.time - Appointment time (HH:MM AM/PM)
 * @returns {Promise<Object>} Created appointment
 * @throws {Error} If slot is already booked
 */
async function bookAppointment(data) {
  // Implementation
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing API endpoints
- Modifying setup instructions
- Adding dependencies

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificate installed
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Backup strategy in place

### Environment Variables

```bash
# Required
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key

# Optional
STRIPE_SECRET_KEY=sk_live_...
DATABASE_URL=mysql://...
REDIS_URL=redis://...
```

---

**Document Version**: 1.0  
**Last Updated**: 2025
