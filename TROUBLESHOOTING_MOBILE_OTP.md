# Mobile OTP Authentication - Troubleshooting & Debugging Guide

## 🔴 Common Issues & Solutions

---

## Issue 1: Server Won't Start

### Error: "Cannot find module 'firebase-admin'"

**Cause:** Firebase Admin SDK not installed

**Solution:**
```bash
cd backend
npm install firebase-admin
npm ls firebase-admin  # Verify installation
```

---

### Error: "EADDRINUSE: address already in use :::5000"

**Cause:** Port 5000 already in use

**Solution:**
```bash
# Option 1: Kill process on port 5000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Option 2: Use different port
# Edit server.js line with: const PORT = 5001;
# Or set: PORT=5001 in .env
```

---

### Error: "Firebase Service Account not configured"

**Cause:** Missing or incorrect Firebase credentials

**Solution:**
1. Get service account JSON from Firebase Console
2. Download and save to `backend/serviceAccountKey.json`
3. Update `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
   ```

---

## Issue 2: OTP Not Sending

### OTP arrives in email but with wrong code

**Cause:** Function returning placeholder instead of actual OTP

**Check:** In `backend/config/otpUtils.js`, line ~40-50

```javascript
// ✅ CORRECT - sendOTPViaEmail receives actual otp parameter
app.post("/api/send-otp", async (req, res) => {
  const { mobile } = req.body;
  const otp = generateOTP(mobile);  // ← Gets actual OTP
  await sendOTPViaEmail(mobile, email, otp);  // ← Passes actual OTP
});

// ❌ WRONG - Would pass undefined
const otp = generateOTP(mobile);
// ... but don't call otp again without assigning result
```

---

### OTP not appearing in console

**Debug Steps:**

1. **Open browser DevTools**
   ```
   Press F12 → Click Console tab
   ```

2. **Filter for OTP messages**
   ```javascript
   // In browser console
   console.log("Testing console");  // Should appear
   ```

3. **Check server logs**
   ```
   Look at terminal where server is running
   Should show: "Saving OTP for +919876543210: 123456"
   ```

4. **Verify generateOTP is being called**
   ```javascript
   // In otpUtils.js, add at top of generateOTP function:
   console.log("generateOTP called with:", phoneNumber);
   ```

---

### Email not received

**Checklist:**

- [ ] Gmail app password used (not regular password)
- [ ] Less secure apps enabled in Gmail settings
- [ ] EMAIL_USER matches your Gmail address
- [ ] EMAIL_PASSWORD matches generated app password
- [ ] Check Gmail spam/promotions folder
- [ ] Network request shows 200 OK

**Test Gmail credentials:**
```bash
# In backend folder, create test.js:
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((err, success) => {
  if (err) console.log('Gmail error:', err);
  if (success) console.log('Gmail connected successfully!');
});

// Run: node test.js
```

---

## Issue 3: OTP Verification Failures

### "OTP not found or expired"

**Possible Causes:**

1. **OTP already used** - Once verified, it's deleted
   - Solution: Request new OTP

2. **OTP expired** - Valid for 10 minutes only
   - Solution: Request new OTP if more than 10 min passed

3. **Wrong mobile format**
   - Solution: Use format like `+919876543210`

**Debug:**
```javascript
// In browser console, before verifying OTP:
console.log("Current OTP store state:");
// This won't show in browser, but server logs show it

// In server terminal, add logging to otpUtils.js:
console.log("OTP Store:", otpStore);  // Show all OTPs in memory
```

---

### "Maximum attempts exceeded"

**Cause:** Already tried 3 wrong OTPs

**Solution:**
```javascript
// In otpUtils.js, find verifyOTP function:
// Resets after 10 minutes or request new OTP

// To manually reset for testing:
// 1. Restart server (clears in-memory OTP store)
// 2. Request new OTP again
```

---

### "Invalid OTP. X attempts remaining"

**Check:** 
- [ ] Entered exactly 6 digits?
- [ ] Typed correct OTP from console?
- [ ] OTP hasn't expired (>10 min)?
- [ ] Not exceeding 3 attempts?

**Test with correct OTP flow:**
```
1. Send OTP
2. Check console immediately (OTP appears within 1 sec)
3. Copy OTP (6 digits only)
4. Paste into field
5. Enter OTP (verify no extra spaces)
6. Click verify immediately
```

---

## Issue 4: Database Errors

### "ER_DUP_ENTRY: Duplicate entry for key 'mobile'"

**Cause:** Mobile number already registered

**Solution:**
```bash
# Option 1: Use different mobile number for testing
# Option 2: Delete user from database:
mysql -u root V_Connect
DELETE FROM users WHERE mobile='+919876543210';
EXIT;

# Option 3: Run fresh migration
# Drop and recreate users table
```

---

### "ER_NO_REFERENCED_ROW: Cannot add or update child row"

**Cause:** Foreign key constraint violation (if using)

**Solution:**
- Check parent table exists
- Verify referenced ID exists
- Check foreign key constraints in db schema

---

### No data appearing in database after registration

**Debug:**
```bash
# 1. Connect to MySQL
mysql -u root V_Connect

# 2. Check if user table exists
SHOW TABLES;

# 3. Check table structure
DESCRIBE users;

# 4. Check if user was created
SELECT * FROM users WHERE mobile='+919876543210';

# 5. Check if query ran
SHOW PROCESSLIST;  # Active queries
```

---

## Issue 5: Network Errors

### "Failed to fetch" or "CORS error"

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# 1. Verify server is running
# Terminal should show: "Server running on http://localhost:5000"

# 2. Check correct URL
# Should be: http://localhost:5000 (NOT https)

# 3. Test connectivity
# In browser console:
fetch('http://localhost:5000/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile: '+919876543210' })
}).then(r => r.json()).then(console.log);
```

---

### "404 Not Found"

**Cause:** Wrong endpoint path or method

**Correct Endpoints:**
```
POST /api/send-otp             ✅ (not /send-otp-code)
POST /api/register/verify      ✅ (not /register-verify)
POST /api/login                ✅ (not /api/login-send-otp)
POST /api/login/verify         ✅ (not /login-verify)
POST /api/verify-otp           ✅ (not /verify)
POST /api/update-profile       ✅ (not /profile-update)
```

---

## Issue 6: Frontend Issues

### Form Not Submitting

**Check:**
```html
<!-- ❌ WRONG: No form element -->
<input id="mobile" />
<button onclick="sendOTP()">Send</button>

<!-- ✅ CORRECT: Form wrapper or JavaScript handler -->
<input id="mobile" />
<button onclick="sendOTP(); return false;">Send</button>
```

---

### OTP Input Not Accepting Text

**Check HTML:**
```html
<!-- ✅ Correct: Limited to 6 digits -->
<input id="otp" type="text" maxlength="6" pattern="[0-9]{6}" />

<!-- ✅ With JavaScript: Filter non-digits -->
<input id="otp" type="text" maxlength="6" 
  oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
```

---

### Session Not Persisting

**Fix:**
```javascript
// After successful login:
const user = data.user;

// ✅ Use sessionStorage (cleared on tab close):
sessionStorage.setItem('user', JSON.stringify(user));

// OR ✅ Use localStorage (persists):
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('authToken', token);

// On page load:
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
if (!user.id) {
  window.location.href = '/ui/mobile-otp-auth.html';
}
```

---

## Issue 7: OTP Logic Errors

### OTP Generated But Not Stored

**In otpUtils.js, verify:**
```javascript
const generateOTP = (phoneNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryTime = Date.now() + 10 * 60 * 1000;  // 10 min
  
  otpStore[phoneNumber] = {
    otp: otp,
    expiryTime: expiryTime,
    attempts: 0
  };
  
  console.log(`Saving OTP for ${phoneNumber}: ${otp}`);  // ← Debug line
  return otp;
};
```

---

### Attempt Limit Not Working

**Check verifyOTP function:**
```javascript
const verifyOTP = (phoneNumber, otp) => {
  const storedOtp = otpStore[phoneNumber];
  
  if (!storedOtp) {
    return { verified: false, message: "OTP not found" };
  }
  
  // ✅ Check attempts FIRST
  if (storedOtp.attempts >= 3) {
    return { verified: false, message: "Maximum attempts exceeded" };
  }
  
  // ✅ Increment attempts
  storedOtp.attempts++;
  
  // Check expiry
  if (Date.now() > storedOtp.expiryTime) {
    return { verified: false, message: "OTP expired" };
  }
  
  // Check OTP value
  if (storedOtp.otp !== otp) {
    const remaining = 3 - storedOtp.attempts;
    return { verified: false, message: `Invalid OTP. ${remaining} attempts left` };
  }
  
  // ✅ Success - delete OTP
  delete otpStore[phoneNumber];
  return { verified: true, message: "OTP verified successfully" };
};
```

---

### Expiry Time Not Calculated

**Common Mistakes:**
```javascript
// ❌ WRONG: Milliseconds not multiplied
expiryTime = Date.now() + 10 * 60;  // Only 600ms = 0.6 seconds

// ✅ CORRECT: Milliseconds calculation
expiryTime = Date.now() + 10 * 60 * 1000;  // 10 minutes = 600,000ms
```

---

## 🧪 Debugging Workflow

### Step 1: Check Server Logs
```bash
# Terminal where server runs should show:
✓ Server running on http://localhost:5000
✓ Database connected successfully
✓ Firebase admin initialized
```

### Step 2: Open Browser DevTools
```
Browser → F12 → Console tab
Watch for messages as you interact
```

### Step 3: Test Single Step
```javascript
// In browser console:
fetch('http://localhost:5000/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile: '+919876543210' })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));
```

### Step 4: Add Console Logs
```javascript
// In backend server.js or otpUtils.js:
console.log('Incoming request:', req.body);
console.log('OTP generated:', otp);
console.log('OTP store:', otpStore);
console.log('Database result:', row);
```

### Step 5: Use MySQL Direct
```bash
mysql -u root V_Connect
SELECT * FROM users;
SELECT * FROM users WHERE mobile='+919876543210';
UPDATE users SET full_name='New Name' WHERE mobile='+919876543210';
```

---

## 📊 Monitoring Console Logs

### Expected Output After "Send OTP"

**Server Terminal:**
```
POST /api/send-otp
Saving OTP for +919876543210: 123456
OTP saved with 10 minute expiry
Sending OTP via email...
OTP sent successfully
```

**Browser Console:**
```
✓ Form submitted
✓ OTP sent successfully!
✓ OTP: 123456
```

---

## 🚨 Emergency Resets

### Reset All OTPs (Clear Memory)
```bash
# Restart the server:
Ctrl+C  # Stop server
node server.js  # Start again
```

### Reset Database
```bash
mysql -u root V_Connect
TRUNCATE TABLE users;  # Delete all users
```

### Reset Single User
```bash
mysql -u root V_Connect
DELETE FROM users WHERE mobile='+919876543210';
```

---

## 📝 Logging Helper Functions

### Add to server.js for debugging:

```javascript
// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  if (req.body) console.log('Body:', req.body);
  next();
});

// Error logger
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Response logger
app.use((req, res, next) => {
  const send = res.send;
  res.send = function(data) {
    console.log('Response:', data);
    res.send = send;
    return res.send(data);
  };
  next();
});
```

---

## ✅ Quick Verification Checklist

Use this when something breaks:

```
□ Server running? (check terminal)
□ Port 5000 available? (no EADDRINUSE)
□ Firebase configured? (.env has credentials)
□ Database connected? (server logs show success)
□ Mobile format valid? (+919876543210 format)
□ OTP appears in console? (F12 → Console)
□ 10min expiry respected? (test after delay)
□ 3-attempt limit works? (test wrong OTP x3)
□ User created in DB? (check MySQL)
□ Unique mobile constraint? (can't register twice)
□ Session storage works? (after login)
□ Email received? (check Gmail + spam)
```

---

**Last Updated:** March 5, 2026  
**For Issues:** Check server terminal logs first, then browser console
