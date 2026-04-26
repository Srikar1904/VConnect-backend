@echo off
REM Quick Setup Script for Firebase OTP

echo.
echo 🔧 V-Connect Firebase OTP Setup
echo ================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ❌ backend\.env file not found
    echo Creating template .env file...
    (
        echo # Email Configuration for sending OTP
        echo EMAIL_SERVICE=gmail
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASSWORD=your_app_password
        echo # Firebase Configuration
        echo FIREBASE_PROJECT_ID=your_project_id
        echo FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
        echo FIREBASE_SERVICE_ACCOUNT={"type":"service_account"}
    ) > backend\.env
    echo ✅ Created backend\.env - Please update with your credentials
) else (
    echo ✅ backend\.env exists
)

echo.
echo 📋 Setup Checklist:
echo 1. ✅ Create Firebase Project at https://console.firebase.google.com
echo 2. ⏳ Copy Firebase config to ui/firebase-config.js
echo 3. ⏳ Add Service Account key to backend/.env
echo 4. ⏳ Set Gmail app password in backend/.env
echo 5. ⏳ Enable Authentication methods in Firebase Console
echo.

echo 📁 Files Created:
echo   - backend/config/firebase.js (Firebase initialization)
echo   - backend/config/otpUtils.js (OTP utility functions)
echo   - ui/firebase-config.js (Frontend Firebase functions)
echo   - ui/firebase-otp-demo.html (Demo page)
echo   - FIREBASE_SETUP.md (Complete setup guide)
echo.

echo 🚀 To start the server:
echo   cd backend
echo   npm install firebase-admin
echo   node server.js
echo.

echo 🧪 To test:
echo   Open: http://localhost:5000/ui/firebase-otp-demo.html
echo.

pause
