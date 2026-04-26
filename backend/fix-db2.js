const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "vconnect"
});

db.connect((err) => {
  if (err) throw err;
  db.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NULL", (err2) => {
    if (err2) {
      console.log("Error adding email column:", err2.message);
    } else {
      console.log("Successfully added 'email' column.");
    }
    db.end();
  });
});
