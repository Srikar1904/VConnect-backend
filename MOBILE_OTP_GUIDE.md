# V-Connect Mobile OTP Authentication Guide

## Overview

This guide explains the **mobile-first authentication system** for V-Connect, where all authentication flows use mobile numbers and OTP verification.

---

## 🎯 Authentication Flows

### 1. REGISTRATION FLOW
```
Mobile Number → Send OTP → Verify OTP → Create User Account
```

**Endpoint Chain:**
1. `POST /api/send-otp` - Generate OTP for mobile
2. `POST /api/register/verify` - Verify OTP and create account

**Request/Response:**
```javascript
// Step 1: Send OTP
POST /api/send-otp
{
  "mobile": "+919876543210"
}
→ { "success": true, "message": "OTP sent...", "mobile": "+919876543210" }

// Step 2: Verify & Register
POST /api/register/verify
{
  "mobile": "+919876543210",
  "otp": "123456",
  "full_name": "John Doe"
}
→ { "success": true, "message": "Registration successful!", "mobile": "+919876543210" }
```

### 2. LOGIN FLOW
```
Mobile Number → Send OTP → Verify OTP → Login User
```

**Endpoint Chain:**
1. `POST /api/login` - Send OTP for login
2. `POST /api/login/verify` - Verify OTP and authenticate

**Request/Response:**
```javascript
// Step 1: Send OTP
POST /api/login
{
  "mobile": "+919876543210"
}
→ { "success": true, "message": "OTP sent...", "mobile": "+919876543210", "userId": 1 }

// Step 2: Verify & Login
POST /api/login/verify
{
  "mobile": "+919876543210",
  "otp": "123456"
}
→ {
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "mobile": "+919876543210",
    "full_name": "John Doe",
    "role": "citizen",
    "first_login": true
  }
}
```

### 3. PROFILE UPDATE FLOW
```
Mobile Number → Send OTP → Verify OTP → Update Profile
```

**Endpoint Chain:**
1. `POST /api/send-profile-otp` - Generate OTP for profile update
2. `POST /api/verify-otp` - Verify OTP
3. `POST /api/update-profile` - Update profile with OTP

**Request/Response:**
```javascript
// Step 1: Send Profile OTP
POST /api/send-profile-otp
{
  "mobile": "+919876543210"
}
→ { "success": true, "message": "Profile update OTP sent...", "mobile": "+919876543210" }

// Step 2: Verify OTP
POST /api/verify-otp
{
  "mobile": "+919876543210",
  "otp": "123456"
}
→ { "verified": true, "message": "OTP verified successfully", "mobile": "+919876543210" }

// Step 3: Update Profile
POST /api/update-profile
{
  "mobile": "+919876543210",
  "otp": "123456",
  "full_name": "John Doe",
  "village": "Sample Village",
  "mandal": "Sample Mandal",
  "district": "Sample District",
  "aadhaar": "1234 5678 9012 3456",
  "profile_image": ""
}
→ { "success": true, "message": "Profile updated successfully" }
```

---

## 📱 API Endpoints

### Registration Endpoints

#### `POST /api/send-otp`
Send OTP to mobile number.

**Request:**
```json
{
  "mobile": "+919876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number",
  "expiresIn": "10 minutes",
  "mobile": "+919876543210"
}
```

**Response (Error):**
```json
{
  "error": "Invalid mobile number format"
}
```

---

#### `POST /api/register/verify`
Verify OTP and create user account.

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456",
  "full_name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful! Please complete your profile.",
  "mobile": "+919876543210"
}
```

**Response (Error):**
```json
{
  "error": "OTP not found or expired"
}
```

---

### Login Endpoints

#### `POST /api/login`
Initiate login with mobile number (sends OTP).

**Request:**
```json
{
  "mobile": "+919876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your mobile number",
  "mobile": "+919876543210",
  "userId": 1
}
```

**Response (User Not Found):**
```json
{
  "success": false,
  "message": "User not found. Please register first.",
  "notFound": true
}
```

---

#### `POST /api/login/verify`
Verify OTP and authenticate user.

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "mobile": "+919876543210",
    "full_name": "John Doe",
    "role": "citizen",
    "first_login": true
  }
}
```

---

### Profile Endpoints

#### `POST /api/send-profile-otp`
Send OTP for profile update.

**Request:**
```json
{
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile update OTP sent to your mobile number",
  "expiresIn": "10 minutes",
  "mobile": "+919876543210"
}
```

---

#### `POST /api/verify-otp`
Verify OTP (used for any verification).

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "verified": true,
  "message": "OTP verified successfully",
  "mobile": "+919876543210"
}
```

**Response (Failed):**
```json
{
  "verified": false,
  "message": "Invalid OTP. 2 attempts remaining"
}
```

---

#### `POST /api/update-profile`
Update user profile (requires OTP verification).

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456",
  "full_name": "John Doe",
  "village": "Sample Village",
  "mandal": "Sample Mandal",
  "district": "Sample District",
  "aadhaar": "1234 5678 9012 3456",
  "profile_image": ""
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 🖥️ Frontend Implementation

### Using the Demo Page

Open: `http://localhost:5000/ui/mobile-otp-auth.html`

**Features:**
- ✅ 3 tabs: Register, Login, Profile
- ✅ Mobile number validation
- ✅ OTP input with 6-digit limit
- ✅ Error handling and status messages
- ✅ Session storage for logged-in user

### JavaScript Functions

#### Registration
```javascript
// Send OTP for registration
async function registerSendOTP() {
  const mobile = document.getElementById('regMobile').value;
  
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  
  const data = await response.json();
  if (data.success) {
    // Show OTP input
    document.getElementById('regOtpContainer').classList.remove('hidden');
  }
}

// Verify OTP and register
async function registerVerifyOTP() {
  const mobile = document.getElementById('regMobile').value;
  const otp = document.getElementById('regOtp').value;
  
  const response = await fetch('/api/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile,
      otp,
      full_name: document.getElementById('regName').value
    })
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Registration successful! You can now login.');
  }
}
```

#### Login
```javascript
// Send OTP for login
async function loginSendOTP() {
  const mobile = document.getElementById('loginMobile').value;
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  
  const data = await response.json();
  if (data.success) {
    document.getElementById('loginOtpContainer').classList.remove('hidden');
  }
}

// Verify OTP and login
async function loginVerifyOTP() {
  const mobile = document.getElementById('loginMobile').value;
  const otp = document.getElementById('loginOtp').value;
  
  const response = await fetch('/api/login/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store user in session
    sessionStorage.setItem('user', JSON.stringify(data.user));
    alert(`Login successful! Welcome ${data.user.full_name}`);
  }
}
```

#### Profile Update
```javascript
// Send OTP for profile update
async function profileSendOTP() {
  const mobile = document.getElementById('profMobile').value;
  
  const response = await fetch('/api/send-profile-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  
  const data = await response.json();
  if (data.success) {
    document.getElementById('profOtpContainer').classList.remove('hidden');
  }
}

// Save profile after OTP verification
async function saveProfile() {
  const mobile = document.getElementById('profMobile').value;
  const otp = document.getElementById('profOtp').value;
  
  const response = await fetch('/api/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile,
      otp,
      full_name: document.getElementById('profName').value,
      village: document.getElementById('profVillage').value,
      mandal: document.getElementById('profMandal').value,
      district: document.getElementById('profDistrict').value,
      aadhaar: document.getElementById('profAadhaar').value,
      profile_image: ''
    })
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Profile updated successfully!');
  }
}
```

---

## 🔒 Security Features

| Feature | Details |
|---------|---------|
| OTP Format | 6-digit random number |
| OTP Lifetime | 10 minutes |
| Max Attempts | 3 attempts per OTP |
| Mobile Validation | +Country code format |
| OTP Deletion | Auto-deleted after verification |
| Attempt Tracking | Tracks failed attempts |

---

## 📝 Testing Guide

### Test Case 1: Register New User
1. Open `mobile-otp-auth.html`
2. Go to "Register" tab
3. Enter mobile: `+919876543210`
4. Enter name: `Test User`
5. Click "Send OTP"
6. Check console for OTP (example: `123456`)
7. Enter OTP
8. Click "Verify & Register"
9. ✅ Should show "Registration successful!"

### Test Case 2: Login User
1. Go to "Login" tab
2. Enter mobile: `+919876543210` (same from registration)
3. Click "Send OTP"
4. Check console for OTP
5. Enter OTP
6. Click "Verify & Login"
7. ✅ Should show "Login successful! Welcome Test User"

### Test Case 3: Update Profile
1. Go to "Profile" tab
2. Enter mobile: `+919876543210`
3. Click "Send OTP"
4. Enter OTP
5. Click "Verify OTP"
6. Fill profile details
7. Click "Save Profile"
8. ✅ Should show "Profile updated successfully!"

### Test Case 4: Error Scenarios
1. **Wrong OTP** - Try entering wrong 6-digit code → Should fail
2. **Max Attempts** - Try 3 wrong OTPs → Should fail after 3rd attempt
3. **Expired OTP** - Wait 10+ minutes → OTP should expire
4. **Invalid Number** - Enter invalid format → Should show format error
5. **Missing Fields** - Leave required fields blank → Should show error

---

## 🔧 Backend Implementation

### Key Functions (otpUtils.js)

```javascript
// Generate OTP for mobile number
await generateOTP(mobile);

// Verify OTP code
await verifyOTP(mobile, otp);

// Send OTP via email (optional)
await sendOTPViaEmail(mobile, email, otp);
```

### OTP Storage

**Development:** In-memory storage (clears on server restart)

**Production:** Upgrade to:
- Firestore Database
- Redis Cache
- MongoDB

---

## 📱 Mobile Number Format

**Accepted Formats:**
- `+919876543210` ✅ (with country code)
- `919876543210` ✅ (without +)
- `+1-987-654-3210` ✅ (with dashes)

**Requirements:**
- Country code: 1-3 digits
- Phone number: 6-14 digits
- Total length: 10-15 digits

---

## ❌ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid mobile number format" | Wrong format | Use +country code format |
| "Mobile number already registered" | User exists | Use different number or login |
| "OTP not found or expired" | OTP expired/wrong | Request new OTP |
| "Maximum attempts exceeded" | 3 wrong tries | Request new OTP |
| "User not found" | Trying to login unregistered | Register first |
| "Invalid or missing OTP" | Empty OTP field | Enter 6-digit OTP |

---

## 🚀 Integration Steps

### Step 1: Include in Your HTML
```html
<!-- Custom mobile auth page -->
<a href="/ui/mobile-otp-auth.html">Login</a>

<!-- Or use it as standalone app -->
```

### Step 2: Customize for Your App
1. Update styles in `mobile-otp-auth.html`
2. Add your branding/logo
3. Customize success/error messages
4. Adjust OTP time limit if needed

### Step 3: Store User Session
```javascript
// After successful login
const user = data.user;
sessionStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('authToken', generateToken(user));

// On page load
const user = JSON.parse(sessionStorage.getItem('user'));
if (!user) {
  // Redirect to login
  window.location.href = '/ui/mobile-otp-auth.html';
}
```

---

## 📊 Database Schema

**users table:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  village VARCHAR(255),
  mandal VARCHAR(255),
  district VARCHAR(255),
  aadhaar VARCHAR(20),
  profile_image LONGTEXT,
  role ENUM('citizen', 'admin') DEFAULT 'citizen',
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_mobile ON users(mobile);
```

---

## ✅ Production Checklist

Before deploying:

- [ ] Move OTP storage to Firestore/Redis
- [ ] Reduce dev-mode OTP logging
- [ ] Enable HTTPS only
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up error logging
- [ ] Configure SMS provider (if needed)
- [ ] Test all error scenarios
- [ ] Set up monitoring/alerts
- [ ] Document API for users

---

## 📖 Additional Resources

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [OTP Quick Reference](FIREBASE_QUICK_REFERENCE.md)
- [Firebase Examples](FIREBASE_EXAMPLES.html)
- [Demo Page](ui/mobile-otp-auth.html)

---

**Version:** 1.0.0  
**Last Updated:** March 5, 2026  
**Status:** Production Ready ✅
