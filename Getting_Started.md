# MediBook - Getting Started Guide

## Quick Start

Get MediBook up and running in 3 simple steps.

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Browser**: Chrome, Firefox, Safari, or Edge

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin requests
- `uuid` - Unique ID generation

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
✅ MediBook API running on http://localhost:5000
```

### Step 3: Open in Browser

Navigate to: `http://localhost:5000`

## First Time Setup

### 1. Register as Patient

1. Click "Register" on homepage
2. Fill in your details:
   - Full Name
   - Email
   - Phone
   - Age
   - Password (min 8 characters)
3. Click "Create Account"
4. You'll be logged in automatically

### 2. Book an Appointment

1. Click "Doctors" in navigation
2. Search or browse doctors
3. Click "Book Now" on a doctor card
4. Select date and time slot
5. Click "Confirm Booking"
6. Complete payment
7. Receive confirmation

### 3. Try Demo Accounts

**Doctor Login:**
- Email: `rajesh@medibook.com`
- Password: `doctor123`

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## Development Mode

### Environment Variables (Optional)

Create a `.env` file:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Running in Development

```bash
# Start server
npm start

# Server runs on http://localhost:5000
```

## Project Structure

```
MediBook/
├── server.js          # Backend API
├── app.js             # Frontend logic
├── index.html         # Main page
├── style.css          # Styles
├── api.js             # API client
├── package.json       # Dependencies
└── *.md               # Documentation
```

## Common Tasks

### Reset Data

Restart the server to reset in-memory data:

```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

### Test Payments

Use the payment simulation (no real money):
- Any card number works
- UPI ID format: `name@upi`
- Demo code for OAuth: `123456`

### Switch Themes

Click the moon/sun icon in the navbar to toggle dark/light mode.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### CORS Errors

Ensure server is running on `http://localhost:5000` and you're accessing from the same origin.

## Next Steps

- Read [API_REFERENCE.md](API_REFERENCE.md) for API details
- Read [PAYMENT_GUIDE.md](PAYMENT_GUIDE.md) for payment info
- Explore the codebase
- Customize for your needs

## Support

For issues, check:
1. [Troubleshooting Guide](Troubleshooting_and_FAQ.md)
2. Console logs in browser
3. Server logs in terminal

---

**Happy Coding! 🚀**
