/**
 * Database Setup Script for Aiven MySQL
 * Run: node setup-db.js
 * This creates all required tables on the cloud database.
 */

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to Aiven MySQL!');
  createTables();
});

function createTables() {
  const queries = [
    // ── USERS TABLE ──────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS users (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      mobile       VARCHAR(20)  UNIQUE,
      email        VARCHAR(100) UNIQUE,
      password     VARCHAR(255),
      full_name    VARCHAR(100),
      role         ENUM('citizen','admin') DEFAULT 'citizen',
      village      VARCHAR(100),
      mandal       VARCHAR(100),
      district     VARCHAR(100),
      aadhaar      VARCHAR(20),
      profile_image LONGTEXT,
      first_login  BOOLEAN DEFAULT TRUE,
      created_at   DATETIME DEFAULT NOW()
    )`,

    // ── COMPLAINTS TABLE ─────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS complaints (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id VARCHAR(50)  UNIQUE,
      user_mobile  VARCHAR(20),
      type         VARCHAR(100),
      location     VARCHAR(255),
      description  TEXT,
      image        LONGTEXT,
      status       ENUM('Pending','In Progress','Resolved') DEFAULT 'Pending',
      created_at   DATETIME DEFAULT NOW(),
      FOREIGN KEY (user_mobile) REFERENCES users(mobile) ON DELETE SET NULL
    )`,

    // ── ADMIN SEED (default admin account) ───────────────────
    `INSERT IGNORE INTO users (full_name, mobile, email, password, role, first_login, created_at)
     VALUES ('Admin', '0000000000', 'admin@vconnect.com', 'admin123', 'admin', FALSE, NOW())`
  ];

  let completed = 0;

  queries.forEach((sql, i) => {
    db.query(sql, (err) => {
      if (err) {
        console.error(`❌ Query ${i + 1} failed:`, err.message);
      } else {
        const labels = ['users table', 'complaints table', 'admin seed'];
        console.log(`✅ Created: ${labels[i]}`);
      }
      completed++;
      if (completed === queries.length) {
        console.log('\n🎉 Database setup complete! All tables ready on Aiven.');
        db.end();
      }
    });
  });
}
