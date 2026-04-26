# V-Connect Firebase OTP - Quick Reference

## Backend OTP Functions (otpUtils.js)

### generateOTP(phoneNumber)
Generate a 6-digit OTP for a phone number/email.

```javascript
const { generateOTP } = require('./config/otpUtils');

const result = await generateOTP('+919876543210');
// Result: { success: true, message: "OTP generated...", expiresIn: "10 minutes" }
```

### verifyOTP(phoneNumber, otp)
Verify the OTP entered by user.

```javascript
const { verifyOTP } = require('./config/otpUtils');

const result = await verifyOTP('+919876543210', '123456');
// Result: { verified: true, message: "OTP verified..." }
// or: { verified: false, message: "Invalid OTP..." }
```

### sendOTPViaEmail(phoneNumber, email, otp)
Send OTP via email (requires Gmail setup in .env).

```javascript
const { sendOTPViaEmail } = require('./config/otpUtils');

await sendOTPViaEmail('+919876543210', 'user@email.com', '123456');
```

### createCustomToken(uid)
Create Firebase authentication token for user.

```javascript
const { createCustomToken } = require('./config/otpUtils');

const result = await createCustomToken('user123');
// Result: { success: true, token: "..." }
```

### verifyIdToken(token)
Verify Firebase ID token.

```javascript
const { verifyIdToken } = require('./config/otpUtils');

const result = await verifyIdToken('token_string');
// Result: { verified: true, uid: "...", email: "..." }
```

## Backend API Endpoints

### 1. POST /api/send-otp
Send OTP to user (via email or SMS).

**Request:**
```json
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

### 2. POST /api/verify-otp
Verify OTP code.

**Request:**
```json
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

### 3. POST /api/send-profile-otp
Send OTP specifically for profile update.

**Request:**
```json
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

### 4. POST /api/update-profile
Update user profile (OTP must be verified first).

**Request:**
```json
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

## Frontend Functions (firebase-config.js)

### generateOTP()
Send OTP (uses HTML elements: phoneNumber, email).

```javascript
// HTML needed:
// <input id="phoneNumber" value="+919876543210">
// <input id="email" value="user@example.com">
// <div id="otpStatus"></div>
// <div id="otpContainer"></div>

generateOTP();
```

### verifyOTP()
Verify OTP code (uses HTML elements: phoneNumber, otpInput).

```javascript
// HTML needed:
// <input id="phoneNumber" value="+919876543210">
// <input id="otpInput" value="123456">
// <div id="verifyStatus"></div>

verifyOTP();
```

### sendProfileUpdateOTP()
Send OTP for profile update.

```javascript
// HTML needed:
// <input id="userPhone" value="+919876543210">
// <input id="userEmail" value="user@example.com">
// <div id="profileOtpStatus"></div>
// <div id="profileOtpContainer"></div>

sendProfileUpdateOTP();
```

### verifyProfileUpdateOTP()
Verify profile update OTP.

```javascript
// HTML needed:
// <input id="userPhone" value="+919876543210">
// <input id="profileOtpInput" value="123456">
// <div id="profileVerifyStatus"></div>

verifyProfileUpdateOTP();
```

### updateProfileWithOTP()
Update user profile after OTP verification.

```javascript
// HTML needed for all profile fields:
// <input id="fullName">
// <input id="village">
// <input id="mandal">
// <input id="district">
// <input id="aadhaar">
// <input id="profileImage">
// <div id="updateStatus"></div>

updateProfileWithOTP();
```

### signInWithPhone()
Firebase phone authentication (requires reCAPTCHA).

```javascript
// HTML needed:
// <input id="phoneNumber" value="+919876543210">
// <div id="recaptcha-container"></div>
// <div id="otpContainer"></div>

signInWithPhone();
```

### verifyFirebasePhoneOTP()
Verify Firebase phone OTP.

```javascript
verifyFirebasePhoneOTP();
```

### signInWithEmail(email, password)
Sign in with email and password.

```javascript
await signInWithEmail('user@example.com', 'password123');
```

### createUserWithEmail(email, password)
Create new user with email.

```javascript
await createUserWithEmail('user@example.com', 'password123');
```

### getCurrentUser()
Get currently authenticated user.

```javascript
const user = await getCurrentUser();
console.log(user.uid, user.email);
```

### signOut()
Sign out current user.

```javascript
await signOut();
```

## Configuration Files

### backend/.env
```env
# Email Settings
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Firebase Settings
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### ui/firebase-config.js
Update with your Firebase credentials:
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

## Common Workflows

### Workflow 1: User Registration with OTP
1. User enters phone/email
2. Frontend calls `generateOTP()`
3. Backend sends OTP
4. User enters OTP
5. Frontend calls `verifyOTP()`
6. If verified, save user to database

### Workflow 2: Profile Update with OTP
1. User fills profile form
2. Frontend calls `sendProfileUpdateOTP()`
3. Backend sends OTP
4. User enters OTP
5. Frontend calls `verifyProfileUpdateOTP()`
6. If verified, frontend calls `updateProfileWithOTP()`
7. Backend updates profile in database

### Workflow 3: Firebase Phone Authentication
1. User enters phone number (must include +country code)
2. Frontend calls `signInWithPhone()`
3. Firebase sends SMS OTP to user
4. User enters OTP
5. Frontend calls `verifyFirebasePhoneOTP()`
6. If verified, user is signed in

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "OTP not found or expired" | OTP was never sent or expired after 10 min | Send OTP again |
| "Maximum attempts exceeded" | User tried wrong OTP 3 times | Send new OTP |
| "Invalid or expired token" | Firebase token validation failed | Re-authenticate |
| "Email is required" | Email field was empty | Provide email address |
| "Firebase Service Account not configured" | .env file missing Firebase keys | Add Firebase credentials |
| "Cannot send email" | Gmail app password incorrect | Verify Gmail settings |

## Testing Checklist

- [ ] OTP generates successfully
- [ ] OTP expires after 10 minutes
- [ ] OTP verification works with correct code
- [ ] OTP verification fails with wrong code
- [ ] Maximum 3 attempts enforced
- [ ] Profile updates after OTP verification
- [ ] Email OTP delivery working (check spam folder)
- [ ] Firebase phone auth (optional) working
- [ ] User data saved to database correctly

## Files Reference

| File | Purpose |
|------|---------|
| backend/config/firebase.js | Firebase initialization |
| backend/config/otpUtils.js | OTP utility functions |
| ui/firebase-config.js | Frontend Firebase setup |
| ui/firebase-otp-demo.html | Complete demo page |
| FIREBASE_SETUP.md | Detailed setup guide |
| setup-firebase.sh | Auto-setup script (Linux/Mac) |
| setup-firebase.bat | Auto-setup script (Windows) |
