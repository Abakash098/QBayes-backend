// 1. IMPORT REQUIRED PACKAGES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// 2. INITIALIZE EXPRESS APP
const app = express();

// 3. MIDDLEWARE 
// This allows your React frontend (port 5173) to talk to this backend (port 5000)
app.use(cors()); 
app.use(express.json());

// 4. SET UP EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Your 16-character App Password
    }
});

// 5. VERIFY TRANSPORTER CONNECTION
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email Server Error:", error);
    } else {
        console.log("✅ Email Server is ready to send messages");
    }
});

// 6. THE POST ROUTE (Demand 21 Requirement)
app.post('/api/contact', async (req, res) => {
    const { first_name, last_name, email, phone, message } = req.body;

    // Simple validation
    if (!first_name || !last_name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@qbayes.com', //
            subject: `🚀 New Web Lead: ${first_name} ${last_name}`,
            text: `
New Contact Request Received:
--------------------------------
Name:    ${first_name} ${last_name}
Email:   ${email}
Phone:   ${phone}

Message:
${message}
--------------------------------
            `
        };

        await transporter.sendMail(mailOptions);
        
        console.log(`📩 Email successfully sent for: ${first_name}`);
        res.status(200).json({ message: "Request Submitted Successfully!" });

    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        res.status(500).json({ error: "Internal Server Error: Failed to send email." });
    }
});

// 7. START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Strong Backend running on port ${PORT}`);
});