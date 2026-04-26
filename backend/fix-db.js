const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "vconnect"
});

db.connect((err) => {
  if (err) throw err;
  db.query("DESCRIBE users", (err, result) => {
    if (err) throw err;
    console.log("Current schema for 'users':", result);

    db.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NULL, ADD COLUMN password VARCHAR(255) NULL", (err2) => {
      if (err2) {
        console.log("Error adding columns (maybe they exist):", err2.message);
      } else {
        console.log("Successfully added 'email' and 'password' columns.");
      }
      db.end();
    });
  });
});
