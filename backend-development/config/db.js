// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'nc136.idcloudhosting.cloud',
  user: process.env.DB_USER || 'dskgloba_admin',
  password: process.env.DB_PASSWORD || 'DSKGlobal2024',
  database: process.env.DB_NAME || 'dskgloba_erp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: test koneksi sekali saat startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] Connected to MySQL');
    conn.release();
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
  }
})();

module.exports = pool;
