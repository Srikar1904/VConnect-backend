// OTP Utility Functions using Firebase
const { auth } = require('./firebase');

// In-memory OTP store (for development)
// In production, use Firestore or Redis
const otpStore = {};
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Generate OTP and store temporarily, then send via email
 * @param {string} identifier - Phone number or email address
 * @param {string} email - Email address (optional, if different from identifier)
 * @returns {object} - { success: boolean, otp: string, message: string }
 */
async function generateOTP(identifier, email = null) {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Use email if provided, otherwise use identifier as email
    const emailToSend = email || identifier;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      return {
        success: false,
        message: 'Invalid email address format'
      };
    }

    // Store OTP with expiry time
    otpStore[identifier] = {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0
    };

    console.log(`📱 OTP generated for ${identifier}: ${otp}`);

    // Send OTP via email
    const emailResult = await sendOTPViaEmail(identifier, emailToSend, otp);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.message);
      return {
        success: false,
        message: 'Failed to send OTP email'
      };
    }

    console.log(`📧 OTP email sent to ${emailToSend}`);

    return {
      success: true,
      message: 'OTP generated and sent to email successfully',
      expiresIn: '10 minutes'
    };
  } catch (error) {
    console.error('Error generating/sending OTP:', error);
    return {
      success: false,
      message: 'Failed to generate and send OTP'
    };
  }
}

/**
 * Verify OTP
 * @param {string} phoneNumber - Phone number (e.g., +919876543210)
 * @param {string} otp - OTP entered by user
 * @returns {object} - { verified: boolean, message: string }
 */
async function verifyOTP(phoneNumber, otp) {
  try {
    if (!otpStore[phoneNumber]) {
      return {
        verified: false,
        message: 'OTP not found or expired'
      };
    }

    const storedData = otpStore[phoneNumber];

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      delete otpStore[phoneNumber];
      return {
        verified: false,
        message: 'OTP has expired'
      };
    }

    // Check if max attempts exceeded (3 attempts allowed)
    if (storedData.attempts >= 3) {
      delete otpStore[phoneNumber];
      return {
        verified: false,
        message: 'Maximum attempts exceeded. Request a new OTP.'
      };
    }

    // Verify OTP
    if (storedData.otp === otp) {
      delete otpStore[phoneNumber];
      return {
        verified: true,
        message: 'OTP verified successfully'
      };
    } else {
      storedData.attempts += 1;
      return {
        verified: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      verified: false,
      message: 'Error verifying OTP'
    };
  }
}

/**
 * Send OTP via Email (alternative method)
 * Use this if you want to send via email instead of SMS
 */
async function sendOTPViaEmail(phoneNumber, email, otp) {
  try {
    const nodemailer = require('nodemailer');
    require('dotenv').config();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for V-Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">V-Connect OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 4px; text-align: center;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">Do not share this OTP with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'OTP sent to email'
    };
  } catch (error) {
    console.error('Error sending OTP via email:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
}

/**
 * Create custom Firebase token for client-side authentication
 */
async function createCustomToken(uid) {
  try {
    const token = await auth.createCustomToken(uid);
    return {
      success: true,
      token
    };
  } catch (error) {
    console.error('Error creating custom token:', error);
    return {
      success: false,
      message: 'Failed to create authentication token'
    };
  }
}

/**
 * Verify Firebase ID token
 */
async function verifyIdToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      verified: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return {
      verified: false,
      message: 'Invalid or expired token'
    };
  }
}

module.exports = {
  generateOTP,
  verifyOTP,
  sendOTPViaEmail,
  createCustomToken,
  verifyIdToken
};
