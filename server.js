// 1. IMPORT REQUIRED PACKAGES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const pool = require('./db'); // <-- IMPORT YOUR POSTGRES CONNECTION

// 2. INITIALIZE EXPRESS APP
const app = express();

// 3. MIDDLEWARE 
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
    if (error) console.log("❌ Email Server Error:", error);
    else console.log("✅ Email Server is ready to send messages");
});

// 6. THE POST ROUTE
app.post('/api/contact', async (req, res) => {
    const { first_name, last_name, email, phone, message, selected_date, selected_slot } = req.body;

    if (!first_name || !last_name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // --- NEW: SAVE TO POSTGRESQL DATABASE ---
        const insertQuery = `
            INSERT INTO contacts (first_name, last_name, email, phone, message, selected_date, selected_slot)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        
        const dbValues = [
            first_name, 
            last_name, 
            email, 
            phone, 
            message, 
            selected_date || null, 
            selected_slot || null
        ];

        await pool.query(insertQuery, dbValues);
        console.log(`🗄️ Database: Lead saved for ${first_name}`);

        // --- THEN: SEND THE HTML EMAIL ---
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'abakashray57@gmail.com', 
            subject: `🚀 New Web Lead: ${first_name} ${last_name}`,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <div style="background-color: #0b1c38; padding: 25px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">QBayes Alert</h1>
                <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">New Lead Notification Received</p>
              </div>

              <div style="padding: 30px 20px; background-color: #f8fafc;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>👤 Name:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #334155;">${first_name} ${last_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>✉️ Email:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #334155;">
                      <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>📱 Phone:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #334155;">${phone}</td>
                  </tr>
                  ${selected_date ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>📅 Booking Slot:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #8b5cf6; font-weight: bold;">Feb ${selected_date} at ${selected_slot}</td>
                  </tr>
                  ` : ''}
                </table>

                <div style="margin-top: 25px; background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                  <p style="margin-top: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message from client:</p>
                  <p style="margin-bottom: 0; color: #1e293b; font-size: 15px; line-height: 1.5;">"${message}"</p>
                </div>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px;">This is an automated message from your QBayes platform.</p>
              </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📩 Email successfully sent for: ${first_name}`);
        
        res.status(200).json({ message: "Request Submitted Successfully!" });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error: Failed to process request." });
    }
});

// 7. START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Strong Backend running on port ${PORT}`);
});