const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  // Neon requires this SSL configuration
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('✅ Connected to QBayes PostgreSQL Database'))
  .catch(err => console.error('❌ Database Connection Error:', err.stack));

module.exports = pool;