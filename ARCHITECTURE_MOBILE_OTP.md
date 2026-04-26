# Mobile OTP Authentication System - Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    V-CONNECT APPLICATION                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐              ┌─────────────────┐   │
│  │  Frontend (HTML/JS) │◄────────────►│  Backend (Node) │   │
│  ├─────────────────────┤   JSON API   ├─────────────────┤   │
│  │ • Register Tab      │   (REST)     │ • Express.js    │   │
│  │ • Login Tab         │              │ • OTP Utils     │   │
│  │ • Profile Tab       │              │ • Routes        │   │
│  │ • Form Validation   │              │ • Controllers   │   │
│  └─────────────────────┘              └────────┬────────┘   │
│                                                 │             │
│                                    ┌────────────▼─────────┐  │
│                                    │   Firebase Admin SDK │  │
│                                    │   • Auth            │  │
│                                    │   • Tokens          │  │
│                                    │   • Verification    │  │
│                                    └────────────┬────────┘  │
│                                                 │             │
│                    ┌────────────────────────────┼─────────┐  │
│                    │                                      │  │
│         ┌──────────▼──────────┐          ┌──────────▼─────────┐
│         │  MySQL Database     │          │  Email Service      │
│         ├─────────────────────┤          │  (Nodemailer/Gmail) │
│         │ • users table       │          │                     │
│         │ • complaints table  │          │ • OTP delivery      │
│         │ • schemes table     │          │ • Email templates   │
│         └─────────────────────┘          └─────────────────────┘
│                                                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Authentication Flow - Registration

```
┌──────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                             │
└──────────────────────────────────────────────────────────────────┘

User Interface                Backend Logic              Storage
    │                              │                       │
    │                              │                       │
    ├─ Enter Mobile ──────────────►│                       │
    │  "+919876543210"             │                       │
    │                              │                       │
    ├─ Click "Send OTP" ──────────►│                       │
    │                              │                       │
    │                              ├─ Validate Mobile     │
    │                              │  Format ✓            │
    │                              │                       │
    │                              ├─ Generate 6-digit ───┼─► In-Memory
    │                              │  Random OTP (123456)  │   OTP Store
    │                              │  Set 10min timer      │
    │                              │                       │
    │                              ├─ Send via Email ─────┼─► Gmail
    │                              │  (Nodemailer)         │
    │                              │                       │
    │◄─────────────────────────────┤ Return Success       │
    │  "OTP sent to your mobile"    │                       │
    │  (OTP shows in console)       │                       │
    │                              │                       │
    │                              │  ┌──────────────────┐ │
    │  [Receive OTP: 123456]        │  │  Timer: 10 min  │ │
    │                              │  │  Attempts: 0/3  │ │
    │                              │  └──────────────────┘ │
    │                              │                       │
    ├─ Enter OTP ─────────────────►│                       │
    │ Enter Name                   │                       │
    │ Click "Verify & Register"    │                       │
    │                              │                       │
    │                              ├─ Verify OTP ─────────┼─► Check Store
    │                              │  (123456 == 123456) ✓ │
    │                              │                       │
    │                              ├─ Check Expiry ───────┼─► Not expired ✓
    │                              │                       │
    │                              ├─ Create User ────────┼─► MySQL INSERT
    │                              │  mobile: +919876543210│   users table
    │                              │  full_name: John Doe  │   role: citizen
    │                              │  created_at: now      │   first_login: 1
    │                              │                       │
    │                              ├─ Delete OTP ─────────┼─► Remove from
    │                              │  (from memory)        │   OTP Store
    │                              │                       │
    │◄─────────────────────────────┤ "Registration        │
    │  "Registration Successful!"   │  Successful!"        │
    │                              │                       │
    └──────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow - Login

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                    │
└──────────────────────────────────────────────────────────────────┘

User Interface                Backend Logic              Storage
    │                              │                       │
    ├─ Enter Mobile ──────────────►│                       │
    │ "+919876543210"              │                       │
    │                              │                       │
    ├─ Click "Send OTP" ──────────►│                       │
    │                              │                       │
    │                              ├─ Check User Exists ──┼─► MySQL SELECT
    │                              │  from users table     │   WHERE mobile
    │                              │                       │   = input ✓
    │                              │                       │
    │                              ├─ Generate OTP ───────┼─► In-Memory
    │                              │  (654321)             │   OTP Store
    │                              │  10min timer          │
    │                              │                       │
    │                              ├─ Send OTP Email ─────┼─► Gmail
    │                              │                       │
    │◄─────────────────────────────┤ Return Success        │
    │  "OTP sent to your mobile"    │  + userId            │
    │                              │                       │
    │  [Receive OTP: 654321]        │                       │
    │                              │                       │
    ├─ Enter OTP ─────────────────►│                       │
    │ Click "Verify & Login"       │                       │
    │                              │                       │
    │                              ├─ Verify OTP ─────────┼─► Check Store
    │                              │  (654321 == 654321) ✓ │
    │                              │                       │
    │                              ├─ Check Expiry ───────┼─► Not expired ✓
    │                              │                       │
    │                              ├─ Fetch User Data ────┼─► MySQL SELECT
    │                              │  full_name            │   user by mobile
    │                              │  role                 │
    │                              │  profile_data         │
    │                              │                       │
    │                              ├─ Delete OTP ─────────┼─► Remove from
    │                              │                       │   Store
    │                              │                       │
    │◄─────────────────────────────┤ Return User Info      │
    │  "Login successful!"          │  + token (Firebase)   │
    │  "Welcome John Doe"           │                       │
    │  (Store user in session)      │                       │
    │                              │                       │
    └──────────────────────────────────────────────────────────┘
```

---

## 👤 Profile Update Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  PROFILE UPDATE FLOW                             │
└──────────────────────────────────────────────────────────────────┘

User Interface                Backend Logic              Storage
    │                              │                       │
    ├─ Enter Mobile ──────────────►│                       │
    │                              │                       │
    ├─ Click "Send OTP" ──────────►│                       │
    │                              │                       │
    │                              ├─ Generate OTP ───────┼─► In-Memory
    │                              │  (987654)             │   OTP Store
    │                              │  10min timer          │
    │                              │                       │
    │◄─────────────────────────────┤ "Profile OTP sent"    │
    │                              │                       │
    │  [Receive OTP: 987654]        │                       │
    │                              │                       │
    ├─ Enter OTP ─────────────────►│                       │
    │ Click "Verify OTP"           │                       │
    │                              │                       │
    │                              ├─ Verify OTP ─────────┼─► Check Store
    │                              │                       │
    │◄─────────────────────────────┤ "OTP Verified"        │
    │  [Show Profile Form]          │                       │
    │                              │                       │
    ├─ Fill Profile Fields ────────┤                       │
    │  • Village                   │                       │
    │  • Mandal                    │                       │
    │  • District                  │                       │
    │  • Aadhaar                   │                       │
    │                              │                       │
    ├─ Click "Save Profile" ──────►│                       │
    │ (submit with OTP again)      │                       │
    │                              │                       │
    │                              ├─ Verify OTP again ───┼─► Check Store
    │                              │  (same OTP)           │
    │                              │                       │
    │                              ├─ Update User ────────┼─► MySQL UPDATE
    │                              │  in users table       │   by mobile
    │                              │  SET village          │   SET mandal
    │                              │  SET district         │   SET aadhaar
    │                              │  SET updated_at       │
    │                              │                       │
    │                              ├─ Delete OTP ─────────┼─► Remove
    │                              │                       │
    │◄─────────────────────────────┤ "Profile Updated!"    │
    │                              │                       │
    └──────────────────────────────────────────────────────────┘
```

---

## 🔄 OTP Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  OTP LIFECYCLE (10 MINUTES)                 │
└─────────────────────────────────────────────────────────────┘

Timeline:
┌───────────────────────────────────────────────────────────┐
│ T=0min       │ T=5min        │ T=9min      │ T=10+min      │
│ (Start)      │ (Midway)      │ (Near end)  │ (EXPIRED)     │
└───────────────────────────────────────────────────────────┘

States:
┌────────────────────────────────────────────────────────────┐
│ T=0min: ✅ ACTIVE & VALID                                  │
│         • OTP: 123456                                      │
│         • Status: Accept verification                      │
│         • Attempts: 0/3                                    │
│                                                             │
│ T=5min: ✅ STILL VALID                                     │
│         • Status: Accept verification                      │
│         • Attempts: 0/3 (no failed attempts yet)           │
│         • Message: "Time remaining: 5 minutes"             │
│                                                             │
│ T=9min: ⚠️  EXPIRING SOON                                 │
│         • Status: Accept but hurry                         │
│         • Attempts: 1/3 (if tried wrong once)              │
│         • Message: "Time remaining: 1 minute"              │
│                                                             │
│ T=10+min: ❌ EXPIRED & REJECTED                           │
│          • Status: Request new OTP                         │
│          • Error: "OTP expired. Please request new OTP"    │
│          • Cleanup: Auto-deleted from store                │
└────────────────────────────────────────────────────────────┘

After successful verification:
┌────────────────────────────────────────────────────────────┐
│ ✅ OTP USED & DELETED                                      │
│    • Immediately after 1 correct verification              │
│    • Cannot be reused                                      │
│    • User must request new OTP for next action             │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 OTP Attempt Limit (3 Attempts)

```
Attempt Flow:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│ User attempts OTP verification:                         │
│                                                          │
│  Attempt 1: Wrong OTP (e.g., 000000)                   │
│  ├─ Check: storedOtp.otp (123456) != input (000000)    │
│  ├─ Increment: attempts = 1                            │
│  └─ Response: "Invalid OTP. 2 attempts remaining"      │
│                                                          │
│  Attempt 2: Wrong OTP (e.g., 111111)                   │
│  ├─ Increment: attempts = 2                            │
│  └─ Response: "Invalid OTP. 1 attempt remaining"       │
│                                                          │
│  Attempt 3: Wrong OTP (e.g., 222222)                   │
│  ├─ Increment: attempts = 3                            │
│  ├─ Next check: attempts (3) >= maxAttempts (3) ✓      │
│  └─ Response: "Maximum attempts exceeded"              │
│                                                          │
│  Attempt 4+: BLOCKED                                   │
│  └─ Response: "Maximum attempts exceeded"              │
│     User must request new OTP                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 💾 Data Storage Layers

```
┌─────────────────────────────────────────────────────────────┐
│              MULTI-LAYER DATA STORAGE ARCHITECTURE           │
└─────────────────────────────────────────────────────────────┘

LAYER 1: IN-MEMORY OTP STORE (Development)
┌──────────────────────────────────────────┐
│ otpStore = {                             │
│   "+919876543210": {                     │
│     otp: "123456",                       │
│     expiryTime: 1709640000000,           │
│     attempts: 0                          │
│   },                                     │
│   "+919876543211": {                     │
│     otp: "654321",                       │
│     expiryTime: 1709640500000,           │
│     attempts: 1                          │
│   }                                      │
│ }                                        │
│                                          │
│ ⚠️  LIMITATION:                         │
│   • Clears on server restart             │
│   • Not suitable for production          │
│   • Only in-memory (no persistence)      │
└──────────────────────────────────────────┘

LAYER 2: MYSQL DATABASE (Persistent)
┌──────────────────────────────────────────┐
│ users TABLE:                             │
│ ┌──────┬──────────┬───────────┬─────┐   │
│ │ id   │ mobile   │ full_name │role │   │
│ ├──────┼──────────┼───────────┼─────┤   │
│ │ 1    │ +9198... │ John Doe  │citi│   │
│ │ 2    │ +9198... │ Jane Smith│ admin   │
│ └──────┴──────────┴───────────┴─────┘   │
│                                          │
│ Other tables:                            │
│ • complaints                             │
│ • schemes                                │
│ • funding                                │
└──────────────────────────────────────────┘

LAYER 3: BROWSER SESSION STORAGE
┌──────────────────────────────────────────┐
│ sessionStorage = {                       │
│   "user": {                              │
│     "id": 1,                             │
│     "mobile": "+919876543210",           │
│     "full_name": "John Doe",             │
│     "role": "citizen"                    │
│   },                                     │
│   "authToken": "eyJhbGc..."              │
│ }                                        │
│                                          │
│ ⚠️  Cleared when tab closes              │
└──────────────────────────────────────────┘

LAYER 4: FIREBASE (Optional - Future)
┌──────────────────────────────────────────┐
│ Firestore Database:                      │
│ • OTP collection (temp storage)          │
│ • User profiles (backup)                 │
│ • Verification logs                      │
│                                          │
│ Authentication Tokens:                   │
│ • Custom tokens (Firebase)               │
│ • ID tokens                              │
│ • Refresh tokens                         │
└──────────────────────────────────────────┘
```

---

## 🔌 API Endpoint Map

```
┌─────────────────────────────────────────────────────────────┐
│              API ENDPOINT ROUTING DIAGRAM                   │
└─────────────────────────────────────────────────────────────┘

/api/
│
├─ /send-otp (POST)
│  └─ Purpose: Generate & send OTP
│     Input: { mobile }
│     Output: { success, message, expiresIn }
│
├─ /verify-otp (POST)
│  └─ Purpose: Verify OTP code
│     Input: { mobile, otp }
│     Output: { verified, message }
│
├─ /register
│  ├─ (POST) Send OTP for registration
│  │  Input: { mobile }
│  │  Output: { success, mobile }
│  │
│  └─ /verify (POST)
│     Purpose: Verify OTP & create user
│     Input: { mobile, otp, full_name }
│     Output: { success, mobile }
│
├─ /login
│  ├─ (POST) Send OTP for login
│  │  Input: { mobile }
│  │  Output: { success, mobile, userId }
│  │
│  └─ /verify (POST)
│     Purpose: Verify OTP & authenticate
│     Input: { mobile, otp }
│     Output: { success, user, message }
│
└─ /send-profile-otp (POST)
   └─ Purpose: Send OTP for profile update
      Input: { mobile }
      Output: { success, message, expiresIn }

└─ /update-profile (POST)
   └─ Purpose: Update user profile
      Input: { mobile, otp, full_name, village... }
      Output: { success, message }
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│              SECURITY CHECKPOINT DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

REQUEST VALIDATION LAYER:
┌──────────────────────────────────────┐
│ 1. Mobile Format Check               │
│    Required: +country-code format    │
│    Regex: ^\+?\d{10,15}$            │
│    If fails → 400 Bad Request        │
│                                      │
│ 2. OTP Format Check                  │
│    Required: Exactly 6 digits        │
│    Must be numeric                   │
│    If fails → 400 Bad Request        │
│                                      │
│ 3. Required Field Check              │
│    mobile: always required           │
│    otp: required for verify          │
│    If fails → 400 Bad Request        │
└──────────────────────────────────────┘

OTP VERIFICATION LAYER:
┌──────────────────────────────────────┐
│ 1. Check Maximum Attempts (3)        │
│    If attempts >= 3 → Block          │
│    Response: "Max attempts exceeded" │
│                                      │
│ 2. Check Expiry Time (10 min)        │
│    If current > expiryTime → Block   │
│    Response: "OTP expired"           │
│                                      │
│ 3. Check OTP Value Match             │
│    If stored != input → Reject       │
│    Increment attempts                │
│    Response: "Invalid OTP"           │
│                                      │
│ 4. On Success: Delete OTP             │
│    Remove from store immediately     │
│    Cannot be reused                  │
└──────────────────────────────────────┘

DATABASE LAYER:
┌──────────────────────────────────────┐
│ 1. Unique Mobile Constraint          │
│    Cannot register twice             │
│    UNIQUE(mobile) in DB              │
│    If fails → Duplicate entry error  │
│                                      │
│ 2. Data Type Validation              │
│    mobile: VARCHAR(20)               │
│    aadhaar: VARCHAR(20)              │
│    full_name: VARCHAR(255)           │
│                                      │
│ 3. SQL Injection Prevention          │
│    Prepared statements               │
│    Parameterized queries             │
│    Input sanitization                │
└──────────────────────────────────────┘

APPLICATION LAYER:
┌──────────────────────────────────────┐
│ 1. Error Handling                    │
│    Try/catch blocks                  │
│    Proper error responses            │
│                                      │
│ 2. Logging & Monitoring              │
│    Console logs for debugging        │
│    Track API calls                   │
│    Monitor OTP attempts              │
│                                      │
│ 3. Session Management                │
│    Store user in sessionStorage      │
│    Validate on each request          │
│    Clear on logout                   │
└──────────────────────────────────────┘
```

---

## 📊 Component Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│            DEPENDENCY GRAPH                                 │
└─────────────────────────────────────────────────────────────┘

firebase-admin (package)
    │
    ├─► firebaseConfig.js
    │       │
    │       └─► server.js (uses Firebase auth)
    │
    └─► otpUtils.js (Firebase token functions)
            │
            └─► server.js (uses OTP functions)

express (package)
    │
    └─► server.js (create REST API)

mysql2 (package)
    │
    ├─► db.js (database connection)
    │       │
    │       └─► server.js (query users)
    │
    └─► otpUtils.js (optional, for future DB storage)

nodemailer (package)
    │
    └─► otpUtils.js (send OTP emails)

dotenv (package)
    │
    └─► server.js, firebase.js, otpUtils.js (load .env)

Frontend:
mobile-otp-auth.html
    │
    ├─ Calls API endpoints
    │   └─► /api/send-otp
    │   └─► /api/register/verify
    │   └─► /api/login
    │   └─► /api/login/verify, etc.
    │
    └─ Uses sessionStorage
        └─► Store logged-in user
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│        SUGGESTED PRODUCTION ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

Client Layer:
  ┌──────────────────────────────────────┐
  │  Web: React/Vue/Angular              │
  │  Mobile: React Native/Flutter        │
  └──────────────────┬───────────────────┘
                     │ HTTPS
                     ▼
API Gateway Layer:
  ┌──────────────────────────────────────┐
  │  Load Balancer (Nginx)               │
  │  Rate Limiting & CORS                │
  │  Request Throttling                  │
  └──────────────────┬───────────────────┘
                     │
                     ▼
Backend Application Layer:
  ┌──────────────────────────────────────┐
  │  Node.js Cluster (Multiple Instances)│
  │  • Express Server (PM2)              │
  │  • OTP Utilities                     │
  │  • Request Validation                │
  └──────────────────┬───────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
Cache:     DB:      Email:
Redis    MySQL     AWS SES
(OTPs)   (Users)   (Emails)
         
         │
         ▼
Messaging Queue (Optional):
  ┌──────────────────────────────────────┐
  │  RabbitMQ / Redis Queue              │
  │  • Async OTP sending                 │
  │  • Email delivery                    │
  │  • Notification queue                │
  └──────────────────────────────────────┘
         
         │
         ▼
Logging & Monitoring:
  ┌──────────────────────────────────────┐
  │  ELK Stack (Elasticsearch)           │
  │  • Error tracking                    │
  │  • Performance monitoring            │
  │  • User behavior analytics           │
  └──────────────────────────────────────┘
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** March 5, 2026  
**Status:** Current Implementation ✅
