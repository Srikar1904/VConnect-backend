# Mobile OTP Authentication - Comprehensive Test Suite

## 🧪 Complete Testing Guide

This document provides step-by-step instructions for testing every aspect of the mobile OTP authentication system.

---

## 📋 Pre-Testing Checklist

Before running tests, verify:

- [ ] Server is running: `node server.js` in terminal
- [ ] MySQL database is running
- [ ] `.env` file is configured with all values
- [ ] Browser console is ready (F12)
- [ ] `http://localhost:5000` is accessible
- [ ] No errors in server terminal

---

## 🎯 Test Suite 1: Basic Functionality (5 minutes)

### Test 1.1: Send OTP Request
**Objective:** Verify OTP generation and console logging

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Go to mobile-otp-auth.html → Register tab
4. Enter mobile: `+919876543210`
5. Click "Send OTP"

**Expected Results:**
```
✅ Network tab shows POST /api/send-otp - 200 OK
✅ Console shows: "OTP sent to your mobile: +919876543210"
✅ Console displays generated OTP (e.g., "OTP: 123456")
✅ Form shows: "OTP sent successfully"
✅ Status message: Green checkmark, success color
```

**Failure Diagnostics:**
- If 400 error: Check mobile format
- If 500 error: Check server logs for details
- If CORS error: Ensure server running
- If "Cannot reach": Check localhost:5000

---

### Test 1.2: OTP Input Validation
**Objective:** Verify OTP field accepts only 6 digits

**Steps:**
1. In Register tab, after sending OTP
2. Click on OTP input field
3. Try typing: `abc123`
4. Try pasting: `12345`
5. Try entering: `123456`

**Expected Results:**
```
✅ Non-numeric characters ignored or rejected
✅ Field accepts exactly 6 digits
✅ Maxlength enforced (can't enter >6)
✅ Copy-paste works for 6 digits
```

---

### Test 1.3: Mobile Format Validation
**Objective:** Verify mobile number format validation

**Test Cases:**

| Input | Expected | Status |
|-------|----------|--------|
| `+919876543210` | Accept ✅ | Valid format |
| `919876543210` | Accept ✅ | No + sign OK |
| `+1-987-654-3210` | Accept ✅ | Dashes OK |
| `919` | Reject ❌ | Too short |
| `abc9876543210` | Reject ❌ | Non-numeric |
| (empty) | Reject ❌ | Required |

**Steps for each:**
1. Enter mobile number
2. Click "Send OTP"
3. Check response

---

## 🎯 Test Suite 2: Registration Flow (10 minutes)

### Test 2.1: Complete Registration
**Objective:** Register new user end-to-end

**Steps:**
1. Go to Register tab
2. Mobile: `+919876543210`
3. Name: `Test User`
4. Click "Send OTP"
5. Wait for: "OTP sent successfully" message
6. Open Console (F12), find and copy OTP code
7. Paste OTP in OTP field
8. Click "Verify & Register"

**Expected Results:**
```
✅ Success message: "Registration successful!"
✅ Database: User created with mobile & name
✅ Session: User data stored (check console)
✅ Response time: <2 seconds
```

**Verify in Database:**
```bash
mysql -u root V_Connect
SELECT * FROM users WHERE mobile='+919876543210';
```

---

### Test 2.2: Duplicate Registration Prevention
**Objective:** Prevent registering same mobile twice

**Steps:**
1. Use mobile from Test 2.1: `+919876543210`
2. Enter new name: `Test User 2`
3. Click "Send OTP"
4. Verify OTP
5. Click "Verify & Register"

**Expected Results:**
```
❌ Error message: "Mobile already registered" 
   OR "User already exists"
✅ Database: No duplicate entry created
✅ Original user data unchanged
```

---

### Test 2.3: Invalid OTP on Registration
**Objective:** Verify wrong OTP rejected

**Steps:**
1. New mobile: `+919876543211`
2. Click "Send OTP"
3. Receive actual OTP (e.g., `123456`)
4. Enter WRONG OTP: `000000`
5. Click "Verify & Register"

**Expected Results:**
```
❌ Error message: "Invalid OTP. 2 attempts remaining"
✅ User NOT created
✅ Database empty for this mobile
✅ Can retry 2 more times
```

---

### Test 2.4: Maximum Registration Attempts
**Objective:** Block after 3 wrong attempts

**Steps:**
1. New mobile: `+919876543212`
2. Send OTP (get OTP code)
3. Attempt 1: Wrong OTP (e.g., `111111`) → Fails
   - Message: "Invalid OTP. 2 attempts remaining" ✅
4. Attempt 2: Wrong OTP (e.g., `222222`) → Fails
   - Message: "Invalid OTP. 1 attempt remaining" ✅
5. Attempt 3: Wrong OTP (e.g., `333333`) → Fails
   - Message: "Maximum attempts exceeded" ✅
6. Attempt 4: Enter correct OTP → Blocked
   - Message: "Maximum attempts exceeded" ✅
7. Must request new OTP

---

### Test 2.5: OTP Expiry (10 minutes)
**Objective:** Verify OTP expires after 10 minutes

**Steps:**
1. New mobile: `+919876543213`
2. Send OTP, note the time
3. Wait 10+ minutes
4. Enter OTP
5. Click "Verify & Register"

**Expected Results:**
```
❌ Error message: "OTP expired. Please request new OTP"
✅ Timer confirmation: Exactly 10min from send
```

**Note:** Skip this test if time-limited, just verify code

---

## 🎯 Test Suite 3: Login Flow (10 minutes)

### Test 3.1: Successful Login
**Objective:** Login registered user

**Steps:**
1. Go to Login tab
2. Mobile: `+919876543210` (from Test 2.1)
3. Click "Send OTP"
4. Get OTP from console
5. Enter OTP
6. Click "Verify & Login"

**Expected Results:**
```
✅ Success message: "Login successful! Welcome Test User"
✅ User data displayed: name, role, mobile
✅ Session stored (check sessionStorage)
✅ Response time: <2 seconds
```

---

### Test 3.2: Login Non-Existent User
**Objective:** Prevent login of unregistered user

**Steps:**
1. Go to Login tab
2. Mobile: `+912222222222` (never registered)
3. Click "Send OTP"

**Expected Results:**
```
❌ Error message: "User not found. Please register first"
OR
❌ Different message indicating user doesn't exist
✅ OTP NOT sent
```

---

### Test 3.3: Invalid OTP on Login
**Objective:** Verify wrong OTP rejected on login

**Steps:**
1. Mobile: `+919876543210`
2. Send OTP (get code)
3. Enter wrong OTP: `000000`
4. Click "Verify & Login"

**Expected Results:**
```
❌ Error: "Invalid OTP. 2 attempts remaining"
✅ User NOT logged in
✅ Session NOT stored
✅ Can retry up to 3 times
```

---

### Test 3.4: Login Attempt Limit
**Objective:** Block after 3 wrong login attempts

**Steps:**
1. Same mobile: `+919876543210`
2. New login attempt
3. Try 3 wrong OTPs
4. On 4th attempt

**Expected Results:**
```
✅ After attempt 3: "Maximum attempts exceeded"
✅ After attempt 4+: Still blocked
✅ Must request new OTP
```

---

## 🎯 Test Suite 4: Profile Update (10 minutes)

### Test 4.1: Update Profile Successfully
**Objective:** Update profile with OTP verification

**Steps:**
1. Go to Profile tab
2. Mobile: `+919876543210`
3. Click "Send OTP"
4. Get OTP from console
5. Enter OTP
6. Click "Verify OTP" (shows success)
7. Fill optional fields:
   - Name: `Updated Name`
   - Village: `Test Village`
   - Mandal: `Test Mandal`
   - District: `Test District`
   - Aadhaar: `1234 5678 9012 3456`
8. Click "Save Profile"

**Expected Results:**
```
✅ Success: "Profile updated successfully"
✅ Database: Fields updated for user
✅ Verification: Check MySQL for new data
```

**Verify:**
```sql
SELECT * FROM users WHERE mobile='+919876543210';
```

---

### Test 4.2: Profile Update Invalid OTP
**Objective:** Reject profile update with wrong OTP

**Steps:**
1. Mobile: `+919876543210`
2. Send OTP
3. Enter wrong OTP
4. Click "Verify OTP"

**Expected Results:**
```
❌ Error: "Invalid OTP"
✅ Cannot proceed to save profile
✅ Form displays verification failure
```

---

### Test 4.3: Profile Update Maximum Attempts
**Objective:** Block profile updates after 3 wrong attempts

**Steps:**
1. Mobile: `+919876543210`
2. Send OTP
3. Try 3 wrong OTPs
4. Try correct OTP

**Expected Results:**
```
✅ After 3 attempts: "Maximum attempts exceeded"
✅ Correct OTP rejected (already at limit)
✅ Must request new OTP
```

---

## 🎯 Test Suite 5: Security Tests (5 minutes)

### Test 5.1: CORS & Cross-Origin
**Objective:** Verify API doesn't accept cross-origin requests

**Steps:**
1. Open any website
2. In console, run:
```javascript
fetch('http://localhost:5000/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile: '+919876543210' })
}).then(r => r.json()).then(console.log)
```

**Expected Results:**
```
✅ Works from localhost (same origin)
✅ Blocked from other domains (security)
   OR works (if CORS enabled)
```

---

### Test 5.2: SQL Injection Prevention
**Objective:** Verify input sanitization

**Steps:**
1. Register tab
2. Mobile field: `+919876543210'; DROP TABLE users; --`
3. Click "Send OTP"

**Expected Results:**
```
✅ Error message: "Invalid mobile format"
✅ Table NOT dropped
✅ Input sanitized/rejected
```

---

### Test 5.3: Attempt Throttling
**Objective:** Verify multiple rapid requests handled

**Steps:**
1. Open Console
2. Rapidly send 10 requests:
```javascript
for(let i=0; i<10; i++) {
  fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '+919876543210' })
  }).then(r=>r.json()).then(d=>console.log(d))
}
```

**Expected Results:**
```
✅ Requests processed (or rate limited)
✅ Database OK (no corruption)
✅ Similar OTP for same mobile in short time
   OR blocked with rate limit error
```

---

## 🎯 Test Suite 6: Database Integrity (5 minutes)

### Test 6.1: User Data Persists
**Objective:** Verify data saved correctly in database

**Steps:**
1. Register user: `+919876543214`, name: `DB Test User`
2. Close browser
3. Connect to MySQL:
```bash
mysql -u root V_Connect
SELECT * FROM users WHERE mobile='+919876543214';
```

**Expected Results:**
```
✅ User data exists in database
✅ All fields populated correctly
✅ created_at timestamp present
```

---

### Test 6.2: Profile Updates Persist
**Objective:** Verify profile changes saved

**Steps:**
1. Update profile for `+919876543210`
2. Add data: village, mandal, district
3. Query database:
```sql
SELECT village, mandal, district FROM users 
WHERE mobile='+919876543210';
```

**Expected Results:**
```
✅ New data appears in database
✅ Fields not NULL
✅ updated_at timestamp changed
```

---

### Test 6.3: Unique Mobile Constraint
**Objective:** Verify duplicate mobile rejected at DB level

**Steps:**
1. Manual MySQL attempt:
```sql
INSERT INTO users (mobile, full_name, role) 
VALUES ('+919876543210', 'Duplicate', 'citizen');
```

**Expected Results:**
```
❌ Error: "Duplicate entry for key 'mobile'"
✅ Constraint working
```

---

## 🎯 Test Suite 7: Performance Tests (5 minutes)

### Test 7.1: Response Time
**Objective:** Verify fast response times

**Steps:**
1. Open DevTools Network tab
2. Send OTP request
3. Check response time

**Expected Results:**
```
✅ Send OTP: <500ms
✅ Verify OTP: <500ms
✅ Register: <500ms
✅ Login: <500ms
✅ Update Profile: <500ms
```

---

### Test 7.2: Database Query Performance
**Objective:** Verify efficient database queries

**Steps:**
1. Add 100 test users to database
2. Test login/search for specific user
3. Monitor response time

**Expected Results:**
```
✅ Response time <1000ms even with many users
✅ No noticeable slowdown
✅ Database properly indexed
```

---

### Test 7.3: Memory Usage
**Objective:** Verify no memory leaks

**Steps:**
1. Open DevTools Memory tab
2. Run 100 OTP generations
3. Monitor heap size

**Expected Results:**
```
✅ Memory stable after operations
✅ No continuously growing heap
✅ Garbage collection working
```

---

## 🎯 Test Suite 8: Email Delivery (Optional, 5 minutes)

### Test 8.1: Email OTP Received
**Objective:** Verify email OTP successfully sent

**Steps:**
1. Configure nodemailer in .env with real Gmail
2. Send OTP with real email
3. Check Gmail inbox (and spam)

**Expected Results:**
```
✅ Email received with OTP
✅ Subject line clear
✅ OTP code visible in email
✅ Email formatted nicely
```

**If not received:**
- [ ] Check Gmail spam folder
- [ ] Verify EMAIL_USER correct
- [ ] Verify EMAIL_PASSWORD correct (app password)
- [ ] Check Gmail "Less secure apps" enabled

---

### Test 8.2: Email Format
**Objective:** Verify email looks professional

**Expected Email Format:**
```
To: your-gmail@gmail.com
Subject: Your OTP Code

Body:
Your OTP Code: 123456
Valid for: 10 minutes
If you didn't request this, ignore this email.
```

---

## 📊 Test Result Summary Template

Use this to track your testing:

```markdown
# Test Results - Date: ___________

## Suite 1: Basic Functionality
- [ ] Test 1.1: Send OTP - PASS / FAIL
- [ ] Test 1.2: OTP Validation - PASS / FAIL
- [ ] Test 1.3: Mobile Format - PASS / FAIL

## Suite 2: Registration
- [ ] Test 2.1: Complete Registration - PASS / FAIL
- [ ] Test 2.2: Duplicate Prevention - PASS / FAIL
- [ ] Test 2.3: Invalid OTP - PASS / FAIL
- [ ] Test 2.4: Max Attempts - PASS / FAIL
- [ ] Test 2.5: OTP Expiry - PASS / FAIL

## Suite 3: Login
- [ ] Test 3.1: Successful Login - PASS / FAIL
- [ ] Test 3.2: Non-Existent User - PASS / FAIL
- [ ] Test 3.3: Invalid OTP - PASS / FAIL
- [ ] Test 3.4: Attempt Limit - PASS / FAIL

## Suite 4: Profile Update
- [ ] Test 4.1: Successful Update - PASS / FAIL
- [ ] Test 4.2: Invalid OTP - PASS / FAIL
- [ ] Test 4.3: Max Attempts - PASS / FAIL

## Suite 5: Security
- [ ] Test 5.1: CORS - PASS / FAIL
- [ ] Test 5.2: SQL Injection - PASS / FAIL
- [ ] Test 5.3: Throttling - PASS / FAIL

## Suite 6: Database
- [ ] Test 6.1: Data Persistence - PASS / FAIL
- [ ] Test 6.2: Updates Persist - PASS / FAIL
- [ ] Test 6.3: Unique Constraint - PASS / FAIL

## Suite 7: Performance
- [ ] Test 7.1: Response Times - PASS / FAIL
- [ ] Test 7.2: Query Performance - PASS / FAIL
- [ ] Test 7.3: Memory Usage - PASS / FAIL

## Suite 8: Email (Optional)
- [ ] Test 8.1: Email Delivery - PASS / FAIL
- [ ] Test 8.2: Email Format - PASS / FAIL

## Summary
Total Tests: ___
Passed: ___
Failed: ___
Success Rate: ___%

## Notes
- Issue 1: _________________
- Issue 2: _________________
- Recommendation: _________
```

---

## 🚨 Failure Recovery

If a test fails:

1. **Check server logs** - Terminal where server runs
2. **Check browser console** - F12 → Console tab
3. **Check network tab** - F12 → Network (see requests/responses)
4. **Check database** - MySQL queries to verify data
5. **Review error message** - Read exact error text
6. **Check .env** - Verify all variables set
7. **Restart server** - `Ctrl+C` then `node server.js`

---

## ✅ Test Completion Criteria

System is ready for production when:

- [x] All 8 test suites complete
- [x] Minimum 95% test pass rate
- [x] No unresolved failures
- [x] Response times acceptable (<1s)
- [x] Database queries working
- [x] Security tests passing
- [x] Email delivery working (if enabled)

---

## 🎯 Quick Test (5 minutes)

If short on time, run this minimum:

```
1. Send OTP → Check console for OTP code
2. Register → Verify OTP from console
3. Login → Verify OTP from console
4. Profile Update → Verify OTP from console
5. Database → Query to confirm data saved
Result: System working ✅
```

---

**Test Suite Version:** 1.0.0  
**Last Updated:** March 5, 2026  
**Estimated Time:** 60 minutes for full suite | 5 minutes for quick test
