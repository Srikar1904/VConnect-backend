@echo off
echo.
echo 🔧 Firebase Setup Helper for V-Connect
echo ======================================
echo.
echo This script will help you configure Firebase for your V-Connect application.
echo.
echo 📋 REQUIRED STEPS:
echo.
echo 1. Create a Firebase Project:
echo   - Go to https://console.firebase.google.com/
echo   - Click "Create a project" or "Add project"
echo   - Name it "vconnect" or your preferred name
echo   - Enable Google Analytics (optional)
echo.
echo 2. Get Firebase Config (for frontend):
echo   - In Firebase Console, go to Project Settings (gear icon)
echo   - Scroll to "Your apps" section
echo   - Click "Add app" -^> Web app (</^>)
echo   - Register your app with name "V-Connect"
echo   - Copy the config object and paste it in ui/firebase-config.js
echo.
echo 3. Enable Authentication:
echo   - In Firebase Console, go to Authentication
echo   - Click "Get started"
echo   - Go to "Sign-in method" tab
echo   - Enable "Phone" and "Email/Password" providers
echo.
echo 4. Create Service Account (for backend):
echo   - In Firebase Console, go to Project Settings
echo   - Click "Service accounts" tab
echo   - Click "Generate new private key"
echo   - Download the JSON file
echo   - Open the JSON file and copy its entire content
echo   - Paste it as ONE LINE in backend/.env as FIREBASE_SERVICE_ACCOUNT value
echo.
echo 5. Set up Gmail App Password:
echo   - Go to https://myaccount.google.com/apppasswords
echo   - Generate an app password for "V-Connect"
echo   - Copy the 16-character password
echo   - Paste it in backend/.env as EMAIL_PASSWORD value
echo.
echo 📁 Files to update:
echo   - ui/firebase-config.js (Firebase config object)
echo   - backend/.env (Service account JSON + Gmail password)
echo.
echo 🚀 After setup, run: cd backend && node server.js
echo.
pause