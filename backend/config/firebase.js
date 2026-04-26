const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Parse the Firebase service account key from environment variable
let serviceAccount = {};
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
  if (serviceAccountJson &&
      serviceAccountJson !== '{"type":"service_account","project_id":"YOUR_PROJECT_ID","private_key_id":"YOUR_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@YOUR_PROJECT_ID.iam.gserviceaccount.com","client_id":"YOUR_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/service_accounts/v1/metadata/x509/firebase-adminsdk%40YOUR_PROJECT_ID.iam.gserviceaccount.com"}' &&
      !serviceAccountJson.includes('YOUR_PROJECT_ID') &&
      !serviceAccountJson.includes('YOUR_PRIVATE_KEY_HERE')) {
    serviceAccount = JSON.parse(serviceAccountJson);
  }
} catch (error) {
  console.warn('⚠️  Firebase Service Account JSON parsing failed:', error.message);
  serviceAccount = {};
}

let firebaseApp = null;
let db = null;
let auth = null;

if (serviceAccount.project_id && serviceAccount.private_key) {
  try {
    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    db = admin.firestore();
    auth = admin.auth();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
} else {
  console.warn('⚠️  Firebase Service Account not configured. OTP features will be limited.');
  console.warn('   Run setup-firebase-complete.bat for setup instructions.');
}

// Export Firebase modules
module.exports = {
  admin: firebaseApp ? admin : null,
  db,
  auth,
  firebaseInitialized: !!firebaseApp
};
