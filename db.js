const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "Abakash@123", // Replace with your real password
    database: "webskittersDB"
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }
    console.log("✅ MySQL Connected Successfully!");
});

module.exports = db;