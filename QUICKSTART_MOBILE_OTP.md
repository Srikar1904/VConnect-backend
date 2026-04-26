# Quick Start - Mobile OTP Authentication

## ⚡ Setup in 5 Minutes

### 1. Prerequisites
```bash
# Navigate to backend folder
cd backend

# Install firebase-admin package (if not already done)
npm install firebase-admin
```

### 2. Configure .env File

Edit `backend/.env` and add:

```env
# Gmail Configuration (for OTP emails)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_SERVICE_ACCOUNT=path/to/service-account-key.json

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Getting Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy generated 16-character password
4. Paste into `EMAIL_PASSWORD` field

### 3. Start Server
```bash
# From backend folder
node server.js

# Expected output:
# Server running on http://localhost:5000
# Firebase admin initialized
```

### 4. Test Mobile OTP Auth

Open in browser: `http://localhost:5000/ui/mobile-otp-auth.html`

---

## 🧪 Quick Test Scenarios

### Scenario 1: Register a New User (2 min)

```
1. Click "Register" tab
2. Mobile: +919876543210
3. Name: John Doe
4. Click "Send OTP"
5. Check browser console (F12) for OTP code
6. Copy OTP → Paste in OTP field
7. Click "Verify & Register"
8. ✅ Success message appears
```

### Scenario 2: Login User (2 min)

```
1. Click "Login" tab
2. Mobile: +919876543210 (from Step 1)
3. Click "Send OTP"
4. Check console for OTP
5. Enter OTP
6. Click "Verify & Login"
7. ✅ See "Login successful! Welcome John Doe"
```

### Scenario 3: Update Profile (2 min)

```
1. Click "Profile" tab
2. Mobile: +919876543210
3. Click "Send OTP"
4. Enter OTP from console
5. Click "Verify OTP"
6. Fill optional fields (Village, Mandal, etc.)
7. Click "Save Profile"
8. ✅ Profile updated message appears
```

---

## 🔍 Testing Checklist

- [ ] **Registration Works**
  - [ ] OTP sends successfully
  - [ ] OTP appears in console
  - [ ] Can enter OTP
  - [ ] User created after verification
  
- [ ] **Login Works**
  - [ ] OTP sends to registered number
  - [ ] Can verify and login
  - [ ] User data shown after login
  
- [ ] **Profile Update Works**
  - [ ] OTP sends for profile
  - [ ] Profile fields updateable
  - [ ] Changes saved to database
  
- [ ] **Error Handling**
  - [ ] Wrong OTP rejected
  - [ ] Max attempts enforced (3)
  - [ ] Invalid number format caught
  - [ ] Expired OTP handled
  
- [ ] **Email Delivery**
  - [ ] Check Gmail spam folder for OTP emails
  - [ ] Verify OTP matches console

---

## 📋 API Endpoints Summary

| Flow | Endpoint 1 | Endpoint 2 | Endpoint 3 |
|------|-----------|-----------|-----------|
| **Register** | `POST /api/send-otp` | `POST /api/register/verify` | — |
| **Login** | `POST /api/login` | `POST /api/login/verify` | — |
| **Profile** | `POST /api/send-profile-otp` | `POST /api/verify-otp` | `POST /api/update-profile` |

---

## 🐛 Troubleshooting

### "Cannot find module firebase-admin"
```bash
cd backend
npm install firebase-admin
```

### "Firebase Service Account not configured"
- Make sure .env has `FIREBASE_SERVICE_ACCOUNT` path
- File path must be correct
- Service account JSON must have proper credentials

### "OTP not appearing in console"
- Open browser DevTools (F12)
- Click Console tab
- Check for "OTP sent" message
- OTP value should be displayed

### "Cannot reach localhost:5000"
- Verify server is running
- Check port 5000 is not blocked
- Try `http://localhost:5000` instead of `127.0.0.1:5000`

### "Email not received"
- Check Gmail spam folder
- Verify EMAIL_USER in .env
- Verify EMAIL_PASSWORD is app password (not Gmail password)
- Check Gmail security settings allow "Less secure apps"

---

## 📱 Sample Test Data

**Test Mobile Numbers:**
- `+919876543210` (India)
- `+14155552671` (USA)
- `+441234567890` (UK)

**Test OTP (console):**
- Format: 6 digits (e.g., `123456`)
- Valid for: 10 minutes
- Attempts: 3 max

---

## 🎯 Next Steps After Testing

1. ✅ **Test all 3 flows** with mobile-otp-auth.html
2. ✅ **Verify email delivery** works
3. ✅ **Check database** has user data
4. 📋 **Integrate into existing pages** (login.html, register.html)
5. 🚀 **Deploy to production**

---

## 📞 API Testing with cURL

### Register User
```bash
# Send OTP
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'

# Verify & Register
curl -X POST http://localhost:5000/api/register/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456", "full_name": "John Doe"}'
```

### Login User
```bash
# Send OTP
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'

# Verify & Login
curl -X POST http://localhost:5000/api/login/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456"}'
```

### Update Profile
```bash
# Send Profile OTP
curl -X POST http://localhost:5000/api/send-profile-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'

# Update Profile
curl -X POST http://localhost:5000/api/update-profile \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+919876543210",
    "otp": "123456",
    "full_name": "John Doe",
    "village": "Sample Village",
    "mandal": "Sample Mandal",
    "district": "Sample District",
    "aadhaar": "1234 5678 9012 3456"
  }'
```

---

## 📊 File Structure

```
Vill-Connect/
├── backend/
│   ├── server.js                 # Express server with OTP endpoints
│   ├── package.json              # Dependencies
│   ├── .env                       # Configuration (YOUR SETUP NEEDED)
│   └── config/
│       ├── firebase.js           # Firebase initialization
│       ├── otpUtils.js           # OTP generation/verification
│       └── db.js                 # Database connection
├── ui/
│   ├── mobile-otp-auth.html      # Complete demo app
│   └── firebase-config.js        # Frontend functions
└── MOBILE_OTP_GUIDE.md           # Full documentation
```

---

## ✅ Success Indicators

- [ ] Server starts without errors
- [ ] OTP sends to console
- [ ] Registration completes
- [ ] Login works
- [ ] Profile updates
- [ ] Database has user records
- [ ] Email OTP sent (optional, check Gmail)
- [ ] All errors handled gracefully

---

**Status:** Ready to test!  
**Time to first test:** ~5 minutes  
**Do not skip:** .env configuration step
