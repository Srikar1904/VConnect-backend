# Mobile OTP Authentication - Quick Reference Card

## ⚡ Quick Start (Copy & Paste)

### 1. Install Dependencies
```bash
cd backend
npm install firebase-admin
```

### 2. Configure .env
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
PORT=5000
```

### 3. Start Server
```bash
cd backend
node server.js
```

### 4. Test in Browser
```
http://localhost:5000/ui/mobile-otp-auth.html
```

---

## 📱 Three Authentication Flows

### REGISTRATION
```
Mobile → Send OTP → Verify OTP → Create User
POST /api/send-otp
POST /api/register/verify
```

### LOGIN  
```
Mobile → Send OTP → Verify OTP → Authenticate
POST /api/login
POST /api/login/verify
```

### PROFILE UPDATE
```
Mobile → Send OTP → Verify OTP → Update Profile
POST /api/send-profile-otp
POST /api/verify-otp
POST /api/update-profile
```

---

## 🔌 API Endpoints

| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /api/send-otp` | `{mobile}` | `{success,message}` |
| `POST /api/verify-otp` | `{mobile,otp}` | `{verified}` |
| `POST /api/register` | `{mobile}` | `{success,mobile}` |
| `POST /api/register/verify` | `{mobile,otp,full_name}` | `{success}` |
| `POST /api/login` | `{mobile}` | `{success,userId}` |
| `POST /api/login/verify` | `{mobile,otp}` | `{success,user}` |
| `POST /api/send-profile-otp` | `{mobile}` | `{success}` |
| `POST /api/update-profile` | `{mobile,otp,...fields}` | `{success}` |

---

## 🧪 Test Scenarios

### Test 1: Register (2 min)
```javascript
// Send OTP
POST http://localhost:5000/api/send-otp
{"mobile": "+919876543210"}

// Get OTP from browser console
// Verify & Register
POST http://localhost:5000/api/register/verify
{"mobile": "+919876543210", "otp": "123456", "full_name": "John"}
```

### Test 2: Login (2 min)
```javascript
// Send OTP
POST http://localhost:5000/api/login
{"mobile": "+919876543210"}

// Verify & Login
POST http://localhost:5000/api/login/verify
{"mobile": "+919876543210", "otp": "123456"}
```

### Test 3: Update Profile (2 min)
```javascript
// Send OTP
POST http://localhost:5000/api/send-profile-otp
{"mobile": "+919876543210"}

// Verify & Update
POST http://localhost:5000/api/update-profile
{"mobile": "+919876543210", "otp": "123456", "village": "XYZ"}
```

---

## 🛠️ Frontend JavaScript (Copy to Your HTML)

### Send Registration OTP
```javascript
async function sendRegOTP() {
  const mobile = document.getElementById('mobile').value;
  
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  
  const data = await response.json();
  if (data.success) {
    document.getElementById('otpBox').style.display = 'block';
    alert('OTP sent! Check browser console for testing');
  }
}
```

### Verify Registration OTP
```javascript
async function verifyRegOTP() {
  const mobile = document.getElementById('mobile').value;
  const otp = document.getElementById('otp').value;
  const name = document.getElementById('name').value;
  
  const response = await fetch('/api/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp, full_name: name })
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Registration successful!');
  } else {
    alert(data.error);
  }
}
```

### Login
```javascript
async function loginSendOTP() {
  const mobile = document.getElementById('loginMobile').value;
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  });
  
  const data = await response.json();
  if (data.success) {
    document.getElementById('loginOtpBox').style.display = 'block';
  }
}

async function verifyLoginOTP() {
  const mobile = document.getElementById('loginMobile').value;
  const otp = document.getElementById('loginOtp').value;
  
  const response = await fetch('/api/login/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  });
  
  const data = await response.json();
  if (data.success) {
    sessionStorage.setItem('user', JSON.stringify(data.user));
    alert('Login successful! Welcome ' + data.user.full_name);
  }
}
```

---

## 🔒 Security Rules (Memorize!)

- **OTP Format:** 6 digits `e.g., 123456`
- **OTP Lifetime:** 10 minutes then expires
- **Max Attempts:** 3 wrong tries, then blocked
- **Mobile Format:** `+919876543210` (10-15 digits)
- **Auto-Delete:** OTP deleted after 1 successful use

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Cannot find module firebase-admin" | `npm install firebase-admin` |
| "EADDRINUSE: port 5000" | Change PORT in .env or kill process |
| "Firebase not configured" | Set .env with FIREBASE variables |
| "OTP not found" | Check expiry (10 min) or wrong mobile |
| "Maximum attempts exceeded" | Request new OTP |
| "Invalid mobile format" | Use +country-code format |
| "Cannot reach localhost:5000" | Ensure server running |
| "CORS error" | Check server is running on port 5000 |

---

## 🔍 Debugging Checklist

```
□ Server running? (check terminal for "Server running on...")
□ Port 5000 free? (no EADDRINUSE error)
□ .env configured? (FIREBASE + EMAIL settings)
□ Firebase installed? (npm ls firebase-admin)
□ OTP in console? (Open F12 → Console tab)
□ DB connected? (Check server logs)
□ Mobile format valid? (+918765432100+)
□ OTP not expired? (<10 min since sent)
□ Attempts <3? (Check error message)
```

---

## 📊 Database Quick Commands

### Check Users Table
```sql
-- Connect
mysql -u root V_Connect

-- See all users
SELECT * FROM users;

-- Delete test user
DELETE FROM users WHERE mobile='+919876543210';

-- Check specific user
SELECT * FROM users WHERE mobile='+919876543210';

-- Count users
SELECT COUNT(*) FROM users;
```

---

## 📱 Mobile Number Testing Examples

**Valid Formats:**
- `+919876543210` ✅
- `919876543210` ✅  
- `+1-987-654-3210` ✅
- `+441234567890` ✅

**Invalid:**
- `919` ❌ (too short)
- `abc9876543210` ❌ (non-numeric)
- `9876543210` ❌ (no country code)

---

## 🧪 cURL Testing Examples

### Send OTP
```bash
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456"}'
```

### Register
```bash
curl -X POST http://localhost:5000/api/register/verify \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456", "full_name": "John Doe"}'
```

---

## 📁 Key Files Location

```
backend/
├── server.js             ← Main API (600+ lines)
├── config/
│   ├── otpUtils.js      ← OTP functions (200+ lines)
│   ├── firebase.js      ← Firebase setup
│   └── db.js            ← Database connection
├── .env                 ← Your configuration
└── package.json         ← Dependencies

ui/
├── mobile-otp-auth.html ← Complete demo app
└── firebase-config.js   ← Frontend functions
```

---

## 🚀 Deployment Checklist

- [ ] .env configured with all variables
- [ ] Firebase credentials working
- [ ] MySQL database created
- [ ] Users table created with schema
- [ ] Email service (Gmail) working
- [ ] Node v14+ installed
- [ ] All npm packages installed
- [ ] Server starts without errors
- [ ] Demo page loads & works
- [ ] All 3 authentication flows tested
- [ ] Error handling verified
- [ ] 3-attempt limit tested
- [ ] 10-minute expiry tested
- [ ] Database has test users

---

## 🎯 Next Steps

**1. First Time?**
→ Go to: QUICKSTART_MOBILE_OTP.md

**2. Need Details?**
→ Go to: MOBILE_OTP_GUIDE.md

**3. Understand Design?**
→ Go to: ARCHITECTURE_MOBILE_OTP.md

**4. Something Broken?**
→ Go to: TROUBLESHOOTING_MOBILE_OTP.md

**5. Complete Index?**
→ Go to: MOBILE_OTP_DOCUMENTATION_INDEX.md

---

## 💡 Pro Tips

1. **Check OTP in console:** Browser DevTools (F12) shows generated OTP
2. **Test quickly:** Use demo page at `mobile-otp-auth.html`
3. **Debug server:** Check terminal logs while testing
4. **Reset fast:** Restart server to clear in-memory OTP store
5. **Copy functions:** All JavaScript functions provided, ready to copy
6. **Database check:** Run MySQL queries to verify data saved
7. **Email test:** Check Gmail spam folder if email not received

---

## 📞 Quick Diagnosis

**Server won't start?**
```bash
# Check if port in use
netstat -ano | findstr :5000

# Check Firebase config
cat .env | grep FIREBASE
```

**OTP not sending?**
```bash
# Check email credentials
cat .env | grep EMAIL

# Test email setup (see TROUBLESHOOTING)
node test.js
```

**Can't verify OTP?**
```bash
# Check OTP in browser console (F12)
# Check expiry: should be within 10 min
# Check attempts: should be <= 3 wrong tries
```

---

## 🎓 3-Minute Video Script

> "V-Connect uses mobile number OTP authentication. User enters mobile, gets 6-digit OTP via email, then verifies to register/login. System has 10-minute expiry and 3-attempt limit. All API endpoints included. Complete demo page provided. Works with Firebase backend and MySQL database."

---

## ✅ Success Message

When everything works, you should see:
- ✅ Server running on http://localhost:5000
- ✅ Demo page loads at mobile-otp-auth.html
- ✅ OTP appears in console
- ✅ Registration completes
- ✅ Login works
- ✅ Profile updates
- ✅ Users in database

---

**Print this card!** | **Last Updated:** March 5, 2026 | **Version:** 1.0.0
