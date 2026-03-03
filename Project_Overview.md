# MediBook - Project Overview

## Introduction

MediBook is a comprehensive online doctor appointment booking system designed to streamline healthcare access for patients while providing efficient management tools for doctors and administrators.

## Mission

To bridge the gap between patients and healthcare providers by offering a seamless, digital-first appointment booking experience that saves time, reduces administrative overhead, and improves healthcare accessibility.

## Key Features

### For Patients
- **Easy Registration**: Quick signup with email or social login (Google, Facebook, Apple, GitHub)
- **Doctor Search**: Find doctors by specialization, name, or availability
- **Appointment Booking**: Real-time slot selection with confirmation probability
- **Multiple Payment Options**: Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), Bank Transfer
- **Appointment Management**: View, cancel, and track appointments
- **Digital Receipts**: Download and print payment receipts
- **Profile Management**: Update personal information and medical history

### For Doctors
- **Doctor Dashboard**: View and manage appointment requests
- **Appointment Approval**: Accept or reject appointment requests
- **Patient Information**: Access patient details for scheduled appointments
- **Availability Management**: Set and update available time slots
- **Review System**: Receive patient ratings and feedback

### For Administrators
- **System Statistics**: Real-time overview of patients, doctors, and appointments
- **User Management**: Add/remove doctors and manage patient data
- **Appointment Oversight**: Monitor and modify appointment statuses
- **Payment Monitoring**: Track all transactions and revenue
- **Analytics**: Comprehensive reporting and data insights

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2.1
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Payment Processing**: Stripe (optional) + Custom simulation
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Architecture**: Single Page Application (SPA)
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: SVG icons and Emoji
- **Responsive**: Mobile-first design with bottom navigation

### Database
- **Type**: In-memory (development)
- **Structure**: Relational data model
- **Future**: MySQL/MongoDB migration ready

## User Roles

| Role | Permissions |
|------|-------------|
| **Patient** | Book appointments, make payments, view history, manage profile |
| **Doctor** | View appointments, approve/reject, manage availability |
| **Admin** | Full system access, user management, analytics |

## Core Workflows

### 1. Patient Registration & Booking
```
Register → Login → Search Doctors → Select Slot → Book → Payment → Confirmation
```

### 2. Doctor Appointment Management
```
Login → View Appointments → Approve/Reject → Update Status
```

### 3. Admin Oversight
```
Login → Dashboard → Manage Users → Monitor Appointments → View Reports
```

## Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcryptjs with salt rounds
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Server-side and client-side validation
- **CORS Protection**: Configured for safe cross-origin requests
- **Email Verification**: 6-digit code verification for OAuth

## Payment System

### Supported Methods
- Credit/Debit Cards (Visa, Mastercard, UnionPay)
- UPI Payments (Google Pay, PhonePe, Paytm, BHIM)
- Bank Transfer/NEFT

### Fee Structure
| Specialization | Consultation Fee |
|----------------|------------------|
| Cardiologist | ₹2,500 |
| Neurologist | ₹2,200 |
| Dermatologist | ₹1,500 |
| Orthopedic | ₹2,000 |
| Pediatrician | ₹1,200 |
| General Physician | ₹800 |

## UI/UX Features

- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Toast Notifications**: Real-time feedback for actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Print Support**: Optimized receipt printing

## Demo Credentials

### Patient
- Register new account or use any email

### Doctor
| Name | Email | Password |
|------|-------|----------|
| Dr. Rajesh Sharma | rajesh@medibook.com | doctor123 |
| Dr. Priya Patel | priya@medibook.com | doctor123 |
| Dr. Anjali Gupta | anjali@medibook.com | doctor123 |
| Dr. Vikram Singh | vikram@medibook.com | doctor123 |
| Dr. Sunita Reddy | sunita@medibook.com | doctor123 |
| Dr. Arun Kumar | arun@medibook.com | doctor123 |

### Admin
- Username: `admin`
- Password: `admin123`

## Project Structure

```
MediBook/
├── server.js              # Express backend
├── app.js                 # Frontend logic
├── index.html             # Main HTML
├── style.css              # Styles
├── api.js                 # API wrapper
├── package.json           # Dependencies
├── API_REFERENCE.md       # API documentation
├── PAYMENT_GUIDE.md       # Payment documentation
└── Project_Overview.md    # This file
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Access Application**
   - Open browser: `http://localhost:5000`

## Future Roadmap

- [ ] MySQL/MongoDB database integration
- [ ] Email notifications (SMTP)
- [ ] SMS alerts (Twilio)
- [ ] Video consultation integration
- [ ] Mobile app (React Native)
- [ ] AI-powered doctor recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## License

ISC License - Open source healthcare project

## Support

For issues, feature requests, or contributions, please refer to the project documentation or contact the development team.

---

**Version**: 1.0  
**Last Updated**: 2025  
**Status**: Production Ready
