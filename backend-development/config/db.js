// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'nc136.idcloudhosting.cloud',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'dskgloba_admin',
  password: process.env.DB_PASSWORD || 'DSKGlobal2024',
  database: process.env.DB_NAME || 'dskgloba_erp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: process.env.DB_CONNECT_TIMEOUT
    ? Number(process.env.DB_CONNECT_TIMEOUT)
    : 10000,
});

// Optional: test koneksi sekali saat startup
(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 as ok');
    console.log('[DB] Connected to MySQL', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      db: process.env.DB_NAME,
      ok: rows?.[0]?.ok,
    });
    conn.release();
  } catch (err) {
    console.error('[DB] Connection error:', {
      message: err.message,
      code: err.code,
    });
  }
})();

module.exports = pool;
