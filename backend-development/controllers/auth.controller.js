// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function generateToken(user, departments) {
  const payload = {
    sub: user.id,
    role: user.role_code,
    departments: departments.map((d) => d.code),
    full_name: user.full_name,
    username: user.username,
    email: user.email
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return token;
}

// POST /api/auth/register
exports.register = async (req, res) => {
  const { full_name, email, username, password, role_code } = req.body;

  if (!full_name || !email || !username || !password || !role_code) {
    return res.status(400).json({
      message: 'full_name, email, username, password, role_code wajib diisi'
    });
  }

  try {
    // 1. cek role ada
    const [roleRows] = await pool.query(
      'SELECT id FROM roles WHERE code = ? LIMIT 1',
      [role_code]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ message: 'role_code tidak valid' });
    }

    const roleId = roleRows[0].id;

    // 2. hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. insert user
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, username, password_hash, role_id)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, username, passwordHash, roleId]
    );

    const newUserId = result.insertId;

    return res.status(201).json({
      message: 'User berhasil dibuat',
      user: {
        id: newUserId,
        full_name,
        email,
        username,
        role_code
      }
    });
  } catch (err) {
    console.error('[REGISTER] Error:', err);

    // handle duplicate email/username
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Email atau username sudah digunakan'
      });
    }

    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  // identifier = email atau username, terserah

  if (!identifier || !password) {
    return res.status(400).json({
      message: 'identifier (email/username) dan password wajib diisi'
    });
  }

  try {
    // 1. cari user
    const [rows] = await pool.query(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.username,
         u.password_hash,
         u.profile_image_path,
         u.is_active,
         r.code AS role_code,
         r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE (u.email = ? OR u.username = ?)
       LIMIT 1`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username/email atau password salah' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun dinonaktifkan' });
    }

    // 2. cek password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Username/email atau password salah' });
    }

    // 3. ambil departemen user
    const [deptRows] = await pool.query(
      `SELECT d.code, d.name
       FROM departments d
       JOIN user_departments ud ON ud.department_id = d.id
       WHERE ud.user_id = ?`,
      [user.id]
    );

    // Update last_login_at
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user, deptRows);

    // jangan kirim password_hash ke client
    return res.status(200).json({
      message: 'Login sukses',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        profile_image_path: user.profile_image_path,
        profile_image_url: user.profile_image_path
          ? `/uploads/${user.profile_image_path}`
          : null,
        role: {
          code: user.role_code,
          name: user.role_name
        },
        departments: deptRows
      }
    });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
};
