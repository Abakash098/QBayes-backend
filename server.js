// 1. IMPORT REQUIRED PACKAGES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const pool = require('./db'); // Connects to your PostgreSQL database

// 2. INITIALIZE EXPRESS APP
const app = express();

// 3. MIDDLEWARE (Allows your React frontend to communicate with this backend)
app.use(cors());
app.use(express.json());

// 4. SET UP EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
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

// 6. THE POST ROUTE (Handles the form submission & saves to DB)
app.post('/api/contact', async (req, res) => {
    // Extract everything sent by your React frontend
    const { first_name, last_name, email, phone, message, selected_date, selected_slot } = req.body;

    if (!first_name || !last_name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Format the data to match your database table columns
    const fullName = `${first_name} ${last_name}`;
    const bookingDetails = selected_date && selected_slot 
        ? `Phone: ${phone} | Slot: Feb ${selected_date} at ${selected_slot}` 
        : `Phone: ${phone}`;

    try {
        // A. SAVE DATA TO POSTGRESQL DATABASE
        const query = `
            INSERT INTO hire_us_messages (name, email, service, message) 
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [fullName, email, bookingDetails, message];
        await pool.query(query, values);
        
        console.log(`✅ Data saved to Database for: ${fullName}`);

        // B. SEND THE EMAIL NOTIFICATION
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@qbayes.com', // DEMAND 21 Requirement
            subject: `🚀 New Web Lead: ${fullName}`,
            text: `
New Contact Request Received:
--------------------------------
Name:    ${fullName}
Email:   ${email}
Phone:   ${phone}
Date:    Feb ${selected_date || 'N/A'}
Slot:    ${selected_slot || 'N/A'}

Message:
${message}
--------------------------------
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📩 Email sent for lead: ${first_name}`);
        
        // C. RESPOND TO FRONTEND
        res.status(200).json({ message: "Request Submitted Successfully!" });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error: Failed to process request." });
    }
});

// 7. START THE SERVER (Required to keep the backend running)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Strong Backend running on port ${PORT}`);
});