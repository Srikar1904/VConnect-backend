# Firebase Authentication Setup Guide for V-Connect

## Overview
This guide demonstrates how to set up Firebase authentication with OTP verification for the V-Connect application.

## Backend Files Created

### 1. `backend/config/firebase.js`
Initializes Firebase Admin SDK for backend operations.

**Key Functions:**
- Initializes Firebase Admin SDK
- Exports: `admin`, `db` (Firestore), `auth`

### 2. `backend/config/otpUtils.js`
Utility functions for OTP generation and verification.

**Functions:**
```javascript
generateOTP(phoneNumber)           // Generate 6-digit OTP
verifyOTP(phoneNumber, otp)        // Verify OTP entered by user
sendOTPViaEmail(phoneNumber, email, otp)  // Send OTP via email
createCustomToken(uid)             // Create Firebase custom token
verifyIdToken(token)               // Verify Firebase ID token
```

### 3. `backend/server.js` (Updated)
API endpoints for OTP functionality:

**Endpoints:**
- `POST /api/send-otp` - Generate and send OTP
- `POST /api/verify-otp` - Verify OTP code
- `POST /api/send-profile-otp` - Generate OTP for profile update
- `POST /api/update-profile` - Update user profile (after OTP verification)

## Frontend Files Created

### 1. `ui/firebase-config.js`
Complete Firebase client-side configuration and functions.

**Main Functions:**
```javascript
generateOTP()                      // Send OTP to user
verifyOTP()                        // Verify OTP code
sendProfileUpdateOTP()             // Send profile update OTP
verifyProfileUpdateOTP()           // Verify profile update OTP
updateProfileWithOTP()             // Update profile after OTP verification
signInWithPhone()                  // Firebase phone authentication
verifyFirebasePhoneOTP()           // Verify Firebase phone OTP
signInWithEmail(email, password)   // Email/password authentication
createUserWithEmail(email, password) // Create new email account
getCurrentUser()                   // Get authenticated user
signOut()                          // Sign out user
```

### 2. `ui/firebase-otp-demo.html`
Complete demo page showing how to use all OTP functions.

## Setup Steps

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name: `vill-connect`
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Copy your Firebase config object
3. Update `ui/firebase-config.js` with:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Create Service Account Key (Backend)
1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate New Private Key"
3. Download the JSON file
4. Convert the JSON to a single-line string (replace newlines with `\n`)
5. Add to `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

### Step 4: Enable Authentication Methods
In Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Phone** (if using Firebase phone OTP)
4. Enable **Google** (optional)

### Step 5: Set Up Firestore (Optional)
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in test mode (change to production rules later)

### Step 6: Configure Email (Optional)
If you want OTP via email:
1. Go to `backend/.env`
2. Set up Gmail:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
3. Get App Password:
   - Enable 2FA on Google Account
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Generate password for Node.js
   - Use that password in `.env`

## API Request/Response Examples

### 1. Send OTP
**Request:**
```javascript
POST /api/send-otp
{
  "phoneNumber": "+919876543210",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": "10 minutes"
}
```

### 2. Verify OTP
**Request:**
```javascript
POST /api/verify-otp
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "verified": true,
  "message": "OTP verified successfully"
}
```

### 3. Send Profile Update OTP
**Request:**
```javascript
POST /api/send-profile-otp
{
  "phoneNumber": "+919876543210",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile update OTP sent successfully",
  "expiresIn": "10 minutes"
}
```

### 4. Update Profile
**Request:**
```javascript
POST /api/update-profile
{
  "mobile": "+919876543210",
  "full_name": "John Doe",
  "village": "Sample Village",
  "mandal": "Sample Mandal",
  "district": "Sample District",
  "aadhaar": "1234 5678 9012 3456",
  "profile_image": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true
}
```

## OTP Security Features

1. **Expiry Time**: OTP expires after 10 minutes
2. **Attempt Limit**: Maximum 3 verification attempts per OTP
3. **OTP Format**: 6-digit random number
4. **Storage**: OTPs stored in memory (use Redis/Firestore for production)
5. **Deletion**: OTP automatically deleted after verification

## Frontend Implementation Example

### HTML Structure
```html
<!-- Send OTP -->
<input type="tel" id="phoneNumber" placeholder="+919876543210">
<input type="email" id="email" placeholder="user@example.com">
<button onclick="generateOTP()">Send OTP</button>

<!-- OTP Verification -->
<div id="otpContainer" style="display: none;">
  <input type="text" id="otpInput" placeholder="123456" maxlength="6">
  <button onclick="verifyOTP()">Verify OTP</button>
</div>

<!-- Status Messages -->
<div id="otpStatus"></div>
```

### JavaScript Implementation
```javascript
// Send OTP
async function generateOTP() {
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: document.getElementById('phoneNumber').value,
      email: document.getElementById('email').value
    })
  });
  
  const data = await response.json();
  if (data.success) {
    document.getElementById('otpContainer').style.display = 'block';
  }
}

// Verify OTP
async function verifyOTP() {
  const response = await fetch('/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: document.getElementById('phoneNumber').value,
      otp: document.getElementById('otpInput').value
    })
  });
  
  const data = await response.json();
  if (data.verified) {
    // Proceed with registration/update
    onOTPVerified();
  }
}
```

## Testing

### Test the Demo Page
1. Start your server: `cd backend && node server.js`
2. Open browser: `http://localhost:5000/ui/firebase-otp-demo.html`
3. Fill in phone number and email
4. Click "Send OTP"
5. Check console (or email) for OTP
6. Enter OTP and click "Verify"

### Development Console
OTPs are logged to console during development:
```
📱 OTP for +919876543210: 123456
```

## Production Checklist

- [ ] Move OTP storage to Firestore or Redis
- [ ] Reduce OTP expiry time to 5 minutes
- [ ] Implement rate limiting on OTP generation
- [ ] Use HTTPS only
- [ ] Update Firebase security rules
- [ ] Enable reCAPTCHA verification
- [ ] Set up proper error logging
- [ ] Add email domain verification
- [ ] Implement phone number validation

## Troubleshooting

### "Firebase service account not configured"
- Check if `FIREBASE_SERVICE_ACCOUNT` is set in `.env`
- Verify JSON is properly formatted

### Emails not sending
- Check Gmail app password is correct
- Verify 2FA is enabled on Gmail
- Check inbox and spam folder

### OTP not verified
- Check if OTP hasn't expired (10 minutes)
- Verify phone number format (+countrycode followed by number)
- Check attempt limit (max 3 attempts)

### CORS Errors
- Ensure backend and frontend are on same domain
- Check CORS middleware is properly configured

## Firebase Documentation
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Rules](https://firebase.google.com/docs/rules)

## Additional Resources
- Complete demo: `ui/firebase-otp-demo.html`
- Backend utils: `backend/config/otpUtils.js`
- Firebase config: `ui/firebase-config.js`
