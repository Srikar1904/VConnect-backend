const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ADD COMPLAINT */
router.post("/add", (req, res) => {

  console.log("🔥 POST /add HIT");
  console.log("📦 DATA RECEIVED:", req.body);

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
    (err, result) => {
      if (err) {
        console.error("❌ MySQL Insert Error:", err);
        return res.json({ success: false });
      }

      console.log("✅ Complaint inserted into MySQL");
      res.json({ success: true });
    }
  );
});

/* GET ALL COMPLAINTS */
router.get("/all", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY created_at DESC", (err, result) => {
    if (err) {
  console.error("❌ MySQL Insert Error:");
  console.error(err);
  return res.status(500).json({ success: false, error: err.message });
}

    res.json(result);
  });
});

module.exports = router;
