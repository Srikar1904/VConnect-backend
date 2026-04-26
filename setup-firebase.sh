#!/bin/bash
# Quick Setup Script for Firebase OTP

echo "🔧 V-Connect Firebase OTP Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env file not found"
    echo "Creating template .env file..."
    cat > backend/.env << 'EOF'
# Email Configuration for sending OTP (use Gmail or similar free service)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your_project_id"}
EOF
    echo "✅ Created backend/.env - Please update with your credentials"
else
    echo "✅ backend/.env exists"
fi

echo ""
echo "📋 Setup Checklist:"
echo "1. ✅ Create Firebase Project at https://console.firebase.google.com"
echo "2. ⏳ Copy Firebase config to ui/firebase-config.js"
echo "3. ⏳ Add Service Account key to backend/.env"
echo "4. ⏳ Set Gmail app password in backend/.env"
echo "5. ⏳ Enable Authentication methods in Firebase Console"
echo ""

echo "📁 Files Created:"
echo "  - backend/config/firebase.js (Firebase initialization)"
echo "  - backend/config/otpUtils.js (OTP utility functions)"
echo "  - ui/firebase-config.js (Frontend Firebase functions)"
echo "  - ui/firebase-otp-demo.html (Demo page)"
echo "  - FIREBASE_SETUP.md (Complete setup guide)"
echo ""

echo "🚀 To start the server:"
echo "  cd backend"
echo "  npm install firebase-admin"
echo "  node server.js"
echo ""

echo "🧪 To test:"
echo "  Open: http://localhost:5000/ui/firebase-otp-demo.html"
echo ""
