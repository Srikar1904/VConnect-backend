// Firebase Configuration for Frontend
// Initialize Firebase in your frontend HTML before using these functions

// Import Firebase SDK (add to your HTML head):
// <script src="https://www.gstatic.com/firebasefiles/ui/6.0.2/firebase-ui-auth.js"></script>
// <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasefiles/ui/6.0.2/firebase-ui-auth.css" />

const firebaseConfig = {
  apiKey: "AIzaSyDHRpM7PEelxtc_SlK5nWKW67NMDoy6xwA",
  authDomain: "vconnect-d5c97.firebaseapp.com",
  projectId: "vconnect-d5c97",
  storageBucket: "vconnect-d5c97.firebasestorage.app",
  messagingSenderId: "390491733592",
  appId: "1:390491733592:web:471a2b4100539e1d73942d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth instance
const auth = firebase.auth();

// =====================================================
// GENERATE OTP - Send OTP to user's phone/email
// =====================================================
async function generateOTP() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const email = document.getElementById('email').value;

  if (!phoneNumber && !email) {
    alert('Please enter phone number or email');
    return;
  }

  try {
    // Show loading state
    document.getElementById('otpStatus').textContent = 'Sending OTP...';
    document.getElementById('otpStatus').style.color = 'blue';

    // Send OTP via backend
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber || null,
        email: email || null
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById('otpStatus').textContent = `✅ OTP sent! Expires in ${data.expiresIn}`;
      document.getElementById('otpStatus').style.color = 'green';
      
      // Show OTP input field
      document.getElementById('otpContainer').style.display = 'block';
      document.getElementById('otpInput').focus();
    } else {
      document.getElementById('otpStatus').textContent = `❌ ${data.error}`;
      document.getElementById('otpStatus').style.color = 'red';
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    document.getElementById('otpStatus').textContent = '❌ Error sending OTP';
    document.getElementById('otpStatus').style.color = 'red';
  }
}

// =====================================================
// VERIFY OTP - Check OTP entered by user
// =====================================================
async function verifyOTP() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const otpCode = document.getElementById('otpInput').value;

  if (!otpCode) {
    alert('Please enter OTP');
    return;
  }

  try {
    document.getElementById('verifyStatus').textContent = 'Verifying OTP...';
    document.getElementById('verifyStatus').style.color = 'blue';

    // Verify OTP via backend
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otpCode
      })
    });

    const data = await response.json();

    if (data.verified) {
      document.getElementById('verifyStatus').textContent = `✅ ${data.message}`;
      document.getElementById('verifyStatus').style.color = 'green';
      
      // Disable inputs after verification
      document.getElementById('otpInput').disabled = true;
      document.getElementById('verifyBtn').disabled = true;
      
      // You can now proceed with user registration or profile update
      onOTPVerified();
    } else {
      document.getElementById('verifyStatus').textContent = `❌ ${data.message}`;
      document.getElementById('verifyStatus').style.color = 'red';
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    document.getElementById('verifyStatus').textContent = '❌ Error verifying OTP';
    document.getElementById('verifyStatus').style.color = 'red';
  }
}

// =====================================================
// SEND PROFILE UPDATE OTP
// =====================================================
async function sendProfileUpdateOTP() {
  const phoneNumber = document.getElementById('userPhone').value;
  const email = document.getElementById('userEmail').value;

  if (!phoneNumber && !email) {
    alert('Please enter phone number or email');
    return;
  }

  try {
    document.getElementById('profileOtpStatus').textContent = 'Sending OTP...';
    document.getElementById('profileOtpStatus').style.color = 'blue';

    const response = await fetch('/api/send-profile-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber || null,
        email: email || null
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById('profileOtpStatus').textContent = `✅ ${data.message}`;
      document.getElementById('profileOtpStatus').style.color = 'green';
      
      // Show profile OTP input
      document.getElementById('profileOtpContainer').style.display = 'block';
      document.getElementById('profileOtpInput').focus();
    } else {
      document.getElementById('profileOtpStatus').textContent = `❌ ${data.error}`;
      document.getElementById('profileOtpStatus').style.color = 'red';
    }
  } catch (error) {
    console.error('Error sending profile OTP:', error);
    document.getElementById('profileOtpStatus').textContent = '❌ Error sending OTP';
    document.getElementById('profileOtpStatus').style.color = 'red';
  }
}

// =====================================================
// VERIFY PROFILE UPDATE OTP
// =====================================================
async function verifyProfileUpdateOTP() {
  const phoneNumber = document.getElementById('userPhone').value;
  const otpCode = document.getElementById('profileOtpInput').value;

  if (!otpCode) {
    alert('Please enter OTP');
    return;
  }

  try {
    document.getElementById('profileVerifyStatus').textContent = 'Verifying OTP...';
    document.getElementById('profileVerifyStatus').style.color = 'blue';

    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otpCode
      })
    });

    const data = await response.json();

    if (data.verified) {
      document.getElementById('profileVerifyStatus').textContent = `✅ ${data.message}`;
      document.getElementById('profileVerifyStatus').style.color = 'green';
      
      // Enable profile update
      document.getElementById('profileOtpInput').disabled = true;
      document.getElementById('profileVerifyBtn').disabled = true;
      document.getElementById('updateProfileBtn').disabled = false;
      
      // Proceed with profile update
      updateProfileWithOTP();
    } else {
      document.getElementById('profileVerifyStatus').textContent = `❌ ${data.message}`;
      document.getElementById('profileVerifyStatus').style.color = 'red';
    }
  } catch (error) {
    console.error('Error verifying profile OTP:', error);
    document.getElementById('profileVerifyStatus').textContent = '❌ Error verifying OTP';
    document.getElementById('profileVerifyStatus').style.color = 'red';
  }
}

// =====================================================
// UPDATE PROFILE WITH OTP
// =====================================================
async function updateProfileWithOTP() {
  const formData = {
    mobile: document.getElementById('userPhone').value,
    full_name: document.getElementById('fullName').value,
    village: document.getElementById('village').value,
    mandal: document.getElementById('mandal').value,
    district: document.getElementById('district').value,
    aadhaar: document.getElementById('aadhaar').value,
    profile_image: document.getElementById('profileImage').value
  };

  try {
    document.getElementById('updateStatus').textContent = 'Updating profile...';
    document.getElementById('updateStatus').style.color = 'blue';

    const response = await fetch('/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById('updateStatus').textContent = '✅ Profile updated successfully!';
      document.getElementById('updateStatus').style.color = 'green';
    } else {
      document.getElementById('updateStatus').textContent = `❌ ${data.error}`;
      document.getElementById('updateStatus').style.color = 'red';
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    document.getElementById('updateStatus').textContent = '❌ Error updating profile';
    document.getElementById('updateStatus').style.color = 'red';
  }
}

// =====================================================
// FIREBASE PHONE AUTHENTICATION (Alternative)
// =====================================================
async function signInWithPhone() {
  const phoneNumber = document.getElementById('phoneNumber').value;

  if (!phoneNumber) {
    alert('Please enter phone number');
    return;
  }

  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
      console.log('reCAPTCHA verified');
    }
  });

  try {
    const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
    
    // SMS OTP has been sent
    window.confirmationResult = confirmationResult;
    document.getElementById('otpContainer').style.display = 'block';
  } catch (error) {
    console.error('Error signing in with phone:', error);
    alert('Error: ' + error.message);
  }
}

// =====================================================
// VERIFY FIREBASE PHONE OTP
// =====================================================
async function verifyFirebasePhoneOTP() {
  const otpCode = document.getElementById('otpInput').value;

  if (!otpCode) {
    alert('Please enter OTP');
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(otpCode);
    console.log('User signed in:', result.user);
    alert('Phone authentication successful!');
    onOTPVerified();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    alert('Invalid OTP: ' + error.message);
  }
}

// =====================================================
// CALLBACK AFTER OTP VERIFICATION
// =====================================================
function onOTPVerified() {
  console.log('OTP verified successfully!');
  // Redirect to next step or update UI
  // Example: window.location.href = '/profile-update.html';
}

// =====================================================
// SEND EMAIL VERIFICATION
// =====================================================
async function sendEmailVerification(user) {
  try {
    await user.sendEmailVerification();
    console.log('Email verification sent');
  } catch (error) {
    console.error('Error sending email verification:', error);
  }
}

// =====================================================
// CREATE USER WITH EMAIL AND PASSWORD
// =====================================================
async function createUserWithEmail(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    console.log('User created:', user.uid);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// =====================================================
// SIGN IN WITH EMAIL AND PASSWORD
// =====================================================
async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// =====================================================
// GET CURRENT USER
// =====================================================
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        resolve(user);
      } else {
        reject(null);
      }
    });
  });
}

// =====================================================
// SIGN OUT
// =====================================================
async function signOut() {
  try {
    await auth.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
