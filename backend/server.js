console.log("🔥 server.js started");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateOTP, verifyOTP, sendOTPViaEmail } = require('./config/otpUtils');
const { auth, firebaseInitialized } = require('./config/firebase');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.json());

// Serve static files from the parent directory (UI files)
app.use(express.static('../'));

// ================= DATABASE CONNECTION =================
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "vconnect",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ================= OTP STORE (managed by otpUtils) =================

// =====================================================
// ================= AUTH SECTION ======================
// =====================================================

// REGISTER - Mobile First (OTP Verification Required)
app.post("/api/register", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\+?\d{10,15}$/.test(mobile.replace(/[^0-9+]/g, ''))) {
    return res.status(400).json({ error: "Invalid mobile number format" });
  }

  try {
    // Check if user already exists
    db.query("SELECT * FROM users WHERE mobile=?", [mobile], async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length > 0) {
        return res.status(400).json({ error: "Mobile number already registered" });
      }

      // Generate OTP for registration
      const otpResult = await generateOTP(mobile);
      
      if (!otpResult.success) {
        return res.status(500).json({ error: "Failed to generate OTP" });
      }

      res.json({ 
        success: true, 
        message: "OTP sent to your registered mobile number",
        mobile: mobile
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// VERIFY REGISTRATION & CREATE USER
app.post("/api/register/verify", async (req, res) => {
  const { mobile, otp, full_name } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: "Mobile and OTP are required" });
  }

  try {
    // Verify OTP
    const verifyResult = await verifyOTP(mobile, otp);

    if (!verifyResult.verified) {
      return res.status(400).json({ error: verifyResult.message });
    }

    // Create user after OTP verification
    const sql = `
      INSERT INTO users (mobile, role, full_name, first_login, created_at)
      VALUES (?, 'citizen', ?, TRUE, NOW())
    `;

    db.query(sql, [mobile, full_name || 'User'], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "User creation failed" });
      }

      res.json({ 
        success: true, 
        message: "Registration successful! Please complete your profile.",
        mobile: mobile
      });
    });
  } catch (error) {
    console.error('Registration verification error:', error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// LOGIN - Mobile + OTP
app.post("/api/login", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  try {
    // Check if user exists
    db.query("SELECT * FROM users WHERE mobile=?", [mobile], async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length === 0) {
        return res.json({ 
          success: false, 
          message: "User not found. Please register first.",
          notFound: true 
        });
      }

      const user = result[0];

      // Send OTP for login
      const otpResult = await generateOTP(mobile);

      if (!otpResult.success) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }

      res.json({
        success: true,
        message: "OTP sent to your mobile number",
        mobile: mobile,
        userId: user.id
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// VERIFY LOGIN OTP
app.post("/api/login/verify", async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: "Mobile and OTP are required" });
  }

  try {
    // Verify OTP
    const verifyResult = await verifyOTP(mobile, otp);

    if (!verifyResult.verified) {
      return res.status(400).json({ error: verifyResult.message });
    }

    // Get user details
    db.query("SELECT * FROM users WHERE mobile=?", [mobile], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = result[0];

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          mobile: user.mobile,
          full_name: user.full_name,
          role: user.role,
          first_login: user.first_login
        }
      });
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// =====================================================
// ================= PROFILE SECTION ===================
// =====================================================

// GET PROFILE
app.get("/api/profile/:mobile", (req, res) => {
  const mobile = req.params.mobile;

  db.query("SELECT * FROM users WHERE mobile=?", [mobile], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0] || {});
  });
});

// UPDATE PROFILE (with Mobile OTP verification)
app.post("/api/update-profile", async (req, res) => {
  const {
    full_name,
    mobile,
    village,
    mandal,
    district,
    aadhaar,
    profile_image,
    otp
  } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  if (!otp) {
    return res.status(400).json({ error: "OTP verification required for profile update" });
  }

  try {
    // Verify OTP using Firebase utilities
    const verifyResult = await verifyOTP(mobile, otp);

    if (!verifyResult.verified) {
      return res.status(400).json({ error: verifyResult.message });
    }

    // Update profile after OTP verification
    const sql = `
      UPDATE users
      SET full_name=?, village=?, mandal=?, district=?, 
          aadhaar=?, profile_image=?, first_login=FALSE
      WHERE mobile=?
    `;

    db.query(
      sql,
      [full_name, village, mandal, district, aadhaar, profile_image, mobile],
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to update profile" });
        }

        res.json({ 
          success: true,
          message: "Profile updated successfully"
        });
      }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// =====================================================
// ================= OTP SECTION =======================
// =====================================================

app.post("/api/send-otp", async (req, res) => {
  try {
    const { identifier: rawIdentifier, mobile, email } = req.body;
    const identifier = rawIdentifier || mobile || email;

    if (!identifier) {
      return res.status(400).json({ error: 'Mobile number or email is required' });
    }

    const normalizedMobile = identifier.toString().replace(/\D/g, '');
    const isMobile = /^[0-9]{10,15}$/.test(normalizedMobile);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isMobile && !isEmail) {
      return res.status(400).json({ error: 'Invalid mobile number or email format' });
    }

    if (isMobile) {
      db.query("SELECT email FROM users WHERE mobile=?", [normalizedMobile], async (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: 'No account found with that mobile number' });
        }

        const userEmail = result[0].email;

        if (!userEmail) {
          return res.status(400).json({ error: 'No email registered for this mobile number' });
        }

        const otpResult = await generateOTP(identifier, userEmail);

        if (!otpResult.success) {
          return res.status(500).json({ error: otpResult.message });
        }

        res.json({
          success: true,
          message: 'OTP sent successfully to the email registered for your mobile number',
          expiresIn: '10 minutes',
          identifier: identifier
        });
      });
    } else {
      db.query("SELECT * FROM users WHERE email=?", [identifier], async (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: 'No account found with that email address' });
        }

        const otpResult = await generateOTP(identifier, identifier);

        if (!otpResult.success) {
          return res.status(500).json({ error: otpResult.message });
        }

        res.json({
          success: true,
          message: 'OTP sent successfully to your email address',
          expiresIn: '10 minutes',
          identifier: identifier
        });
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { identifier: rawIdentifier, mobile, email, otp } = req.body;
    const identifier = rawIdentifier || mobile || email;

    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP are required' });
    }

    const verifyResult = await verifyOTP(identifier, otp);

    if (verifyResult.verified) {
      res.json({
        verified: true,
        message: verifyResult.message,
        identifier: identifier
      });
    } else {
      res.status(400).json({
        verified: false,
        message: verifyResult.message
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

// RESET PASSWORD (after OTP verification)
app.post("/api/reset-password", async (req, res) => {
  try {
    console.log('reset-password request body:', req.body);
    const identifier = req.body.identifier || req.body.mobile || req.body.email;
    const newPassword = req.body.newPassword || req.body.password;

    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'Identifier and new password are required' });
    }

    const normalizedMobile = identifier.toString().replace(/\D/g, '');
    const isMobile = /^[0-9]{10,15}$/.test(normalizedMobile);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isMobile && !isEmail) {
      return res.status(400).json({ error: 'Invalid mobile number or email address' });
    }

    // Validate password strength
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    const query = isEmail ? "SELECT * FROM users WHERE email=?" : "SELECT * FROM users WHERE mobile=?";
    const params = [isEmail ? identifier.toLowerCase() : normalizedMobile];

    // Check if user exists
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result[0];
      const updateQuery = isEmail ? "UPDATE users SET password=? WHERE email=?" : "UPDATE users SET password=? WHERE mobile=?";
      const updateParams = [newPassword, params[0]];

      db.query(updateQuery, updateParams, (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ error: 'Failed to update password' });
        }

        console.log(`✅ Password updated for user: ${isEmail ? user.email : user.mobile}`);
        res.json({
          success: true,
          message: 'Password updated successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// SEND PROFILE UPDATE OTP
app.post("/api/send-profile-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Validate mobile number format
    if (!/^\+?\d{10,15}$/.test(mobile.replace(/[^0-9+]/g, ''))) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // Generate OTP using Firebase utilities
    const otpResult = await generateOTP(mobile);

    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.message });
    }

    res.json({ 
      success: true,
      message: 'Profile update OTP sent to your mobile number',
      expiresIn: '10 minutes',
      mobile: mobile
    });
  } catch (error) {
    console.error('Error sending profile OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// =====================================================
// ================= COMPLAINT SECTION =================
// =====================================================

// ADD COMPLAINT
app.post("/api/complaints/add", (req, res) => {
  const {
    complaint_id,
    user_mobile,
    type,
    location,
    description,
    image
  } = req.body;

  const sql = `
    INSERT INTO complaints
    (complaint_id, user_mobile, type, location, description, image, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;

  db.query(
    sql,
    [complaint_id, user_mobile, type, location, description, image],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Insert failed" });
      }

      console.log("✅ Complaint inserted into MySQL");
      res.json({ success: true });
    }
  );
});

// GET USER COMPLAINTS
app.get("/api/complaints/user/:mobile", (req, res) => {
  const mobile = req.params.mobile;

  db.query(
    "SELECT * FROM complaints WHERE user_mobile=? ORDER BY created_at DESC",
    [mobile],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
});

// =====================================================
// ================= ADMIN SECTION =====================
// =====================================================

// GET ALL COMPLAINTS
app.get("/api/admin/complaints", (req, res) => {
  db.query(
    "SELECT * FROM complaints ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
});

// UPDATE STATUS
app.put("/api/admin/update/:complaint_id", (req, res) => {
  const complaintId = req.params.complaint_id;
  const { status } = req.body;

  db.query(
    "UPDATE complaints SET status=? WHERE complaint_id=?",
    [status, complaintId],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

// ADMIN ANALYTICS
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        COUNT(*) as total,
        SUM(status='Pending') as pending,
        SUM(status='In Progress') as inProgress,
        SUM(status='Resolved') as resolved
      FROM complaints
    `);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// ADMIN - GET CITIZENS WITH COMPLAINT COUNT
app.get("/api/admin/citizens", (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.full_name,
      u.mobile,
      u.village,
      u.mandal,
      u.district,
      COUNT(c.id) AS complaint_count
    FROM users u
    LEFT JOIN complaints c 
      ON u.mobile = c.user_mobile
    WHERE u.role = 'citizen'
    GROUP BY u.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// USER DASHBOARD STATS
app.get("/api/dashboard/stats/:mobile", (req, res) => {
  const mobile = req.params.mobile;

  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status='Pending') AS pending,
      SUM(status='In Progress') AS progress,
      SUM(status='Resolved') AS resolved
    FROM complaints
    WHERE user_mobile = ?
  `;

  db.query(sql, [mobile], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

// =====================================================
// ================= TEST DATA ENDPOINTS ==============
// =====================================================

// ADD TEST COMPLAINTS (for demo purpose)
app.get("/api/test/add-complaints", (req, res) => {
  const testComplaints = [
    {
      complaint_id: "C001",
      user_mobile: "9876543210",
      type: "Road Damage",
      location: "Main Street, Village A",
      description: "Large pothole on main road causing accidents",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      status: "Pending"
    },
    {
      complaint_id: "C002",
      user_mobile: "9876543211",
      type: "Water Supply Issue",
      location: "North Colony, Village B",
      description: "No water supply for past 3 days",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      status: "In Progress"
    },
    {
      complaint_id: "C003",
      user_mobile: "9876543212",
      type: "Street Light Not Working",
      location: "Market Area, Village C",
      description: "Street lights in market area are not functioning",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      status: "Resolved"
    },
    {
      complaint_id: "C004",
      user_mobile: "9876543213",
      type: "Garbage Collection",
      location: "Residential Area, Village D",
      description: "Garbage is not being collected regularly",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      status: "Pending"
    }
  ];

  let addedCount = 0;
  let errorCount = 0;
  const totalCount = testComplaints.length;

  testComplaints.forEach((complaint, index) => {
    const sql = `
      INSERT INTO complaints 
      (complaint_id, user_mobile, type, location, description, image, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status=?
    `;

    db.query(
      sql,
      [complaint.complaint_id, complaint.user_mobile, complaint.type, complaint.location, complaint.description, complaint.image, complaint.status, complaint.status],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting complaint:", err);
          errorCount++;
        } else {
          console.log("✅ Complaint inserted:", complaint.complaint_id);
          addedCount++;
        }

        // Send response when all queries are done
        if (addedCount + errorCount === totalCount) {
          console.log(`✅ Test data endpoint completed: ${addedCount} added, ${errorCount} errors`);
          res.json({
            success: true,
            message: `Added ${addedCount} test complaints`,
            addedCount: addedCount,
            errorCount: errorCount,
            complaints: testComplaints
          });
        }
      }
    );
  });
});

// =====================================================

app.get("/", (req, res) => {
  res.send("🚀 V-Connect Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
