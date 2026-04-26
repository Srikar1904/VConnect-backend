const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login", (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.json({ success: false, message: "Missing credentials" });
  }

  db.query(
    "SELECT role FROM users WHERE mobile=? AND password=?",
    [mobile, password],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      if (result.length > 0) {
        res.json({
          success: true,
          role: result[0].role
        });
      } else {
        res.json({ success: false });
      }
    }
  );
});

module.exports = router;
