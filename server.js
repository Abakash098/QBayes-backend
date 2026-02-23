const express = require('express'); // 1. Import express
const cors = require('cors');       // 2. Import cors (needed for React to talk to Node)
const db = require('./db');         // 3. Import your MySQL connection

const app = express();              // 4. Initialize app (This fixes your error!)

app.use(cors());                    // 5. Enable CORS
app.use(express.json());            // 6. Allow the server to read JSON data

// --- UPDATE THIS IN YOUR server.js ---
app.post('/api/contact', (req, res) => {
    // Destructure the fields matching your UI
    const { first_name, last_name, email, phone, message } = req.body;

    const sqlInsert = "INSERT INTO contact_messages (first_name, last_name, email, phone, message) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlInsert, [first_name, last_name, email, phone, message], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "Failed to save request" });
        }
        console.log("📩 New lead from:", first_name, last_name);
        res.status(200).json({ message: "Request submitted successfully!" });
    });
});

// 7. Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});