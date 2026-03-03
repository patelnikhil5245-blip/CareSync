# MediBook - Frontend Components

## Overview

MediBook's frontend is built as a Single Page Application (SPA) using vanilla JavaScript with a component-based architecture.

## Application Structure

```
app.js (Main Controller)
    │
    ├── State Management
    │       ├── curUser
    │       ├── curPage
    │       ├── theme
    │       └── booking data
    │
    ├── Page Controllers
    │       ├── showHome()
    │       ├── showDoctors()
    │       ├── showBook()
    │       ├── showAppointments()
    │       └── ...
    │
    ├── UI Components
    │       ├── renderDoctorCard()
    │       ├── renderAppointmentCard()
    │       └── renderPaymentMethod()
    │
    └── Event Handlers
            ├── doLogin()
            ├── doRegister()
            ├── bookAppointment()
            └── processPayment()
```

## Core Components

### 1. Navigation

#### Desktop Navbar

```javascript
function renderNavbar() {
  const isLoggedIn = !!State.curUser;
  const userRole = State.curUser?.role;
  
  return `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">🏥</span>
        <span>MediBook</span>
      </div>
      <div class="nav-links">
        <a onclick="showPage('home')">Home</a>
        <a onclick="showPage('doctors')">Doctors</a>
        ${isLoggedIn ? `
          <a onclick="showPage('appointments')">My Appointments</a>
          <a onclick="showPage('profile')">Profile</a>
          <a onclick="doLogout()">Logout</a>
        ` : `
          <a onclick="showLogin()">Login</a>
          <a onclick="showRegister()">Register</a>
        `}
        <button onclick="toggleTheme()" class="theme-toggle">
          ${State.theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  `;
}
```

#### Mobile Bottom Navigation

```javascript
function renderMobileNav() {
  return `
    <nav class="mobile-nav">
      <a onclick="showPage('home')" class="nav-item ${State.curPage === 'home' ? 'active' : ''}">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </a>
      <a onclick="showPage('doctors')" class="nav-item ${State.curPage === 'doctors' ? 'active' : ''}">
        <span class="nav-icon">👨‍⚕️</span>
        <span class="nav-label">Doctors</span>
      </a>
      <a onclick="showPage('appointments')" class="nav-item ${State.curPage === 'appointments' ? 'active' : ''}">
        <span class="nav-icon">📅</span>
        <span class="nav-label">Bookings</span>
      </a>
      <a onclick="showPage('profile')" class="nav-item ${State.curPage === 'profile' ? 'active' : ''}">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </a>
    </nav>
  `;
}
```

### 2. Doctor Card

```javascript
function renderDoctorCard(doctor) {
  return `
    <div class="doctor-card" onclick="selectDoctor('${doctor.doctor_id}')">
      <div class="doctor-emoji">${doctor.emoji}</div>
      <div class="doctor-info">
        <h3 class="doctor-name">${doctor.name}</h3>
        <p class="doctor-spec">${doctor.specialization}</p>
        <p class="doctor-exp">${doctor.experience} years experience</p>
        <div class="doctor-rating">
          <span class="stars">⭐ ${doctor.rating}</span>
        </div>
        <p class="doctor-fee">₹${getFee(doctor.specialization)} consultation fee</p>
      </div>
      <button class="btn-book" onclick="event.stopPropagation(); bookDoctor('${doctor.doctor_id}')">
        Book Now
      </button>
    </div>
  `;
}
```

### 3. Appointment Card

```javascript
function renderAppointmentCard(appt) {
  const statusColors = {
    pending: 'warning',
    approved: 'success',
    cancelled: 'danger'
  };
  
  return `
    <div class="appointment-card">
      <div class="appt-header">
        <span class="status-badge ${statusColors[appt.status]}">
          ${appt.status.toUpperCase()}
        </span>
        <span class="appt-date">${formatDate(appt.date)}</span>
      </div>
      <div class="appt-body">
        <div class="doctor-info">
          <span class="emoji">${appt.doctor_emoji}</span>
          <div>
            <h4>${appt.doctor_name}</h4>
            <p>${appt.doctor_spec}</p>
          </div>
        </div>
        <div class="appt-time">${appt.time}</div>
      </div>
      ${appt.status !== 'cancelled' ? `
        <div class="appt-actions">
          ${appt.payment_status === 'paid' ? `
            <button onclick="printReceipt('${appt.appointment_id}')">
              🖨️ Print Receipt
            </button>
          ` : ''}
          <button onclick="cancelAppointment('${appt.appointment_id}')" class="btn-danger">
            ❌ Cancel
          </button>
        </div>
      ` : ''}
    </div>
  `;
}
```

### 4. Payment Methods

```javascript
function renderPaymentMethods() {
  const methods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'gpay', name: 'Google Pay', icon: 'G' },
    { id: 'phonepe', name: 'PhonePe', icon: 'P' },
    { id: 'paytm', name: 'Paytm', icon: 'P' },
    { id: 'upi', name: 'Other UPI', icon: 'U' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
  ];
  
  return `
    <div class="payment-methods">
      ${methods.map(m => `
        <button 
          class="method-btn ${State.payMethod === m.id ? 'selected' : ''}"
          onclick="selectMethod('${m.id}')"
        >
          <span class="method-icon">${m.icon}</span>
          <span class="method-name">${m.name}</span>
        </button>
      `).join('')}
    </div>
  `;
}
```

### 5. Forms

#### Login Form

```javascript
function renderLoginForm() {
  return `
    <div class="form-container">
      <h2>Welcome Back</h2>
      <form onsubmit="event.preventDefault(); doLogin();">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" required placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn-primary btn-full">Login</button>
      </form>
      <div class="social-login">
        <p>Or continue with</p>
        <div class="social-buttons">
          <button onclick="oauthLogin('Google')" class="btn-google">
            <img src="google-icon.svg" alt="Google">
            Google
          </button>
          <button onclick="oauthLogin('Facebook')" class="btn-facebook">
            <img src="facebook-icon.svg" alt="Facebook">
            Facebook
          </button>
        </div>
      </div>
      <p class="form-footer">
        Don't have an account? <a onclick="showRegister()">Register</a>
      </p>
    </div>
  `;
}
```

#### Registration Form

```javascript
function renderRegisterForm() {
  return `
    <div class="form-container">
      <h2>Create Account</h2>
      <form onsubmit="event.preventDefault(); doRegister();">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="reg-name" required placeholder="John Doe">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" required placeholder="john@example.com">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="reg-phone" required placeholder="+91 9876543210">
        </div>
        <div class="form-group">
          <label>Age</label>
          <input type="number" id="reg-age" required min="1" max="120" placeholder="25">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="reg-password" required minlength="8" placeholder="Min 8 characters">
        </div>
        <button type="submit" class="btn-primary btn-full">Create Account</button>
      </form>
      <p class="form-footer">
        Already have an account? <a onclick="showLogin()">Login</a>
      </p>
    </div>
  `;
}
```

### 6. Modals

#### OAuth Modal

```javascript
function renderOAuthModal(provider) {
  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal-content oauth-modal">
        <div class="oauth-header">
          <h3>Continue with ${provider}</h3>
          <button onclick="closeModal()" class="btn-close">×</button>
        </div>
        <div class="oauth-body" id="oauth-step1">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="oauth-name" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="oauth-email" placeholder="your@${provider.toLowerCase()}.com">
            <small class="hint">Use ${getDomainHint(provider)} email</small>
          </div>
          <button onclick="requestVerification('${provider}')" class="btn-primary btn-full">
            Continue
          </button>
        </div>
        <div class="oauth-body hidden" id="oauth-step2">
          <p>Enter the 6-digit code sent to your email</p>
          <div class="form-group">
            <input type="text" id="oauth-code" maxlength="6" placeholder="123456">
          </div>
          <button onclick="submitOAuth('${provider}')" class="btn-primary btn-full">
            Verify
          </button>
          <button onclick="backToStep1()" class="btn-link">
            ← Back
          </button>
        </div>
      </div>
    </div>
  `;
}
```

### 7. Toast Notifications

```javascript
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Usage
showToast('Appointment booked successfully!');
showToast('Payment failed', 'error');
showToast('Please check your email', 'info');
```

## State Management

### Global State Object

```javascript
const State = {
  // User State
  curUser: null,
  authToken: localStorage.getItem('mb-token'),
  
  // Navigation State
  curPage: 'home',
  theme: localStorage.getItem('theme') || 'light',
  
  // Booking State
  selDoc: null,
  selSlot: null,
  selDate: null,
  payMethod: 'card',
  
  // Data Cache
  doctors: [],
  appointments: [],
  
  // UI State
  isLoading: false,
  modalOpen: false
};
```

### State Updates

```javascript
function setUser(user, token) {
  State.curUser = user;
  State.authToken = token;
  localStorage.setItem('mb-token', token);
  localStorage.setItem('mb-user', JSON.stringify(user));
  updateUI();
}

function clearUser() {
  State.curUser = null;
  State.authToken = null;
  localStorage.removeItem('mb-token');
  localStorage.removeItem('mb-user');
  updateUI();
}
```

## Page Routing

### Page Controller

```javascript
function showPage(page) {
  State.curPage = page;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  
  // Show requested page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.classList.remove('hidden');
  }
  
  // Update navigation
  updateNavState();
  
  // Load page data
  switch(page) {
    case 'doctors':
      loadDoctors();
      break;
    case 'appointments':
      loadAppointments();
      break;
    case 'profile':
      loadProfile();
      break;
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}
```

## Event Handling

### Event Delegation

```javascript
document.addEventListener('click', (e) => {
  // Handle dynamic elements
  if (e.target.matches('.doctor-card')) {
    const id = e.target.dataset.doctorId;
    selectDoctor(id);
  }
  
  if (e.target.matches('.btn-cancel')) {
    const id = e.target.dataset.appointmentId;
    cancelAppointment(id);
  }
});
```

### Form Submissions

```javascript
async function doLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    showLoading();
    const data = await api('/auth/login', { email, password });
    setUser(data.user, data.token);
    showToast('Welcome back!');
    showPage('home');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideLoading();
  }
}
```

## Responsive Design

### Mobile-First Approach

```css
/* Mobile (default) */
.container {
  padding: 1rem;
}

.doctor-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 640px) {
  .doctor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .doctor-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .mobile-nav {
    display: none;
  }
}
```

## Performance Optimizations

### Lazy Loading

```javascript
// Load doctors only when needed
async function loadDoctors() {
  if (State.doctors.length === 0) {
    const data = await api('/doctors');
    State.doctors = data;
  }
  renderDoctors(State.doctors);
}
```

### Debouncing

```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Usage
const searchDoctors = debounce((query) => {
  filterDoctors(query);
}, 300);
```

---

**Document Version**: 1.0  
**Last Updated**: 2025
