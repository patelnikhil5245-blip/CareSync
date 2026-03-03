# MediBook - Troubleshooting & FAQ

## Frequently Asked Questions

### General

**Q: Is MediBook free to use?**
A: Yes, it's an open-source project for educational and development purposes.

**Q: Can I use this for my hospital/clinic?**
A: Yes, but you'll need to add production-grade features like persistent database, email notifications, and security hardening.

**Q: Is patient data secure?**
A: In the current version, data is stored in-memory and lost on server restart. For production, implement proper database encryption and security measures.

### Authentication

**Q: I forgot my password. How do I reset it?**
A: Currently, password reset is not implemented. You can restart the server to clear data and re-register.

**Q: Can I login with Google/Facebook?**
A: Yes! Click the social login buttons. For demo, use these verification codes:
- Google: any @gmail.com email + code `123456`
- Facebook: any @facebook.com email + code `123456`

**Q: Why is my email rejected during OAuth?**
A: Each provider requires specific email domains:
- Google: must use @gmail.com
- Facebook: must use @facebook.com
- Apple: must use @icloud.com

### Appointments

**Q: Can I book multiple appointments?**
A: Yes, you can book as many as you want with different doctors or time slots.

**Q: How do I cancel an appointment?**
A: Go to "My Appointments" and click the "Cancel" button on the appointment you want to cancel.

**Q: Why can't I book a slot?**
A: The slot might be already booked by another patient. Try a different time.

### Payments

**Q: Is this real money?**
A: No, all payments are simulated. No real transactions occur.

**Q: What payment methods work?**
A: All methods work in simulation mode:
- Credit/Debit cards (any number)
- UPI (Google Pay, PhonePe, Paytm)
- Bank transfer

**Q: Can I get a refund?**
A: Refund functionality is not implemented in this version.

**Q: Where can I see my receipts?**
A: After payment, click "Print Receipt" or view in "My Appointments".

### Technical

**Q: What technologies are used?**
A: Node.js, Express, vanilla JavaScript, HTML, CSS. No React or other frameworks.

**Q: Is there a database?**
A: Currently uses in-memory storage. For production, migrate to MySQL or MongoDB.

**Q: Can I deploy this online?**
A: Yes, but you'll need to:
1. Add persistent database
2. Configure environment variables
3. Set up proper hosting

## Troubleshooting Guide

### Server Issues

#### Error: `Port already in use`

**Problem**: Another process is using port 5000.

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

#### Error: `Cannot find module`

**Problem**: Dependencies not installed.

**Solution**:
```bash
npm install
```

#### Error: `Module not found: 'stripe'`

**Problem**: Optional dependency missing.

**Solution**:
```bash
npm install stripe
# OR ignore - payments will use simulation mode
```

### Frontend Issues

#### Page not loading

**Check**:
1. Is server running? (`npm start`)
2. Correct URL? (`http://localhost:5000`)
3. Browser console for errors

#### Styles not applying

**Check**:
1. `style.css` file exists
2. No 404 error in Network tab
3. Hard refresh (Ctrl+Shift+R)

#### JavaScript not working

**Check**:
1. `app.js` loaded in index.html
2. No console errors
3. Check line numbers in error messages

### Authentication Issues

#### Can't login

**Check**:
1. Correct email/username
2. Correct password
3. Caps Lock is off
4. Try demo credentials:
   - Patient: register new account
   - Doctor: rajesh@medibook.com / doctor123
   - Admin: admin / admin123

#### "Invalid token" error

**Solution**:
1. Logout and login again
2. Clear browser localStorage
3. Restart server

#### OAuth verification code not working

**Check**:
1. Use code: `123456`
2. Ensure correct email domain for provider
3. Check spam folder (if real email)

### Payment Issues

#### Payment failed

**Check**:
1. All fields filled correctly
2. Card number has 16 digits
3. UPI ID format: `name@provider`
4. Try different payment method

#### Can't print receipt

**Check**:
1. Pop-up blocker disabled
2. Browser supports window.print()
3. Try Ctrl+P instead

### API Issues

#### 401 Unauthorized

**Causes**:
- Not logged in
- Token expired
- Wrong role for endpoint

**Solution**:
- Login again
- Check token in localStorage

#### 404 Not Found

**Causes**:
- Wrong API endpoint
- Resource doesn't exist

**Solution**:
- Check API documentation
- Verify ID in URL

#### 500 Server Error

**Causes**:
- Server crash
- Database error
- Bug in code

**Solution**:
- Check server console for error
- Restart server
- Report issue

### Data Issues

#### Data lost after restart

**Expected**: In-memory database clears on restart.

**Solution**: For production, implement persistent database.

#### Can't find my appointment

**Check**:
1. Logged in with correct account
2. Appointment wasn't cancelled
3. Check "My Appointments" page

## Debug Mode

### Enable Console Logging

Add to `app.js`:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);
```

### Check API Calls

Open browser DevTools → Network tab → Filter by "api"

### Inspect Database

In browser console:
```javascript
// View all data
console.log('Patients:', DB.patients);
console.log('Doctors:', DB.doctors);
console.log('Appointments:', DB.appointments);
console.log('Payments:', DB.payments);
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Account exists | Login instead |
| "Invalid email or password" | Wrong credentials | Check and retry |
| "Slot already booked" | Time taken | Choose different slot |
| "Payment service unavailable" | Stripe not configured | Use simulation mode |
| "Access denied" | Wrong role | Use correct account type |
| "Doctor not found" | Invalid ID | Check doctor list |

## Getting Help

### Before Asking

1. Check this FAQ
2. Check console logs
3. Check server logs
4. Try restarting server
5. Try clearing browser cache

### Information to Provide

When reporting issues:
1. Error message (exact text)
2. Steps to reproduce
3. Browser and version
4. Node.js version (`node -v`)
5. Screenshot if UI issue

### Contact

For bugs and feature requests:
- Check existing documentation
- Review code comments
- Test with demo credentials first

---

**Last Updated**: 2025  
**Version**: 1.0
