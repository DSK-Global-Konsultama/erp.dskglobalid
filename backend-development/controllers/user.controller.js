// controllers/user.controller.js
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// helper: mapping rows (join) ke struktur user nested
function mapUserRows(rows) {
  const map = new Map();

  // Normalizer untuk kolom tinyint(1) / boolean-ish dari MySQL
  const normalizeIsActive = (val) => {
    // null/undefined => dianggap tidak aktif (lebih aman untuk UI)
    if (val === null || val === undefined) return false;

    // mysql2 kadang mengembalikan Buffer untuk tipe tertentu
    if (Buffer.isBuffer(val)) {
      if (val.length === 0) return false;
      return val[0] === 1;
    }

    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;

    // string: '1'/'0'/'true'/'false'
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (s === '1' || s === 'true' || s === 'yes' || s === 'y') return true;
      if (s === '0' || s === 'false' || s === 'no' || s === 'n') return false;
      // fallback: parseInt
      const n = Number(s);
      if (!Number.isNaN(n)) return n === 1;
      return false;
    }

    return false;
  };

  // Normalizer untuk datetime/timestamp dari MySQL -> ISO string
  const normalizeDateToIsoOrNull = (val) => {
    if (val === null || val === undefined) return null;

    // sudah berupa Date
    if (val instanceof Date) {
      const t = val.getTime();
      return Number.isFinite(t) ? val.toISOString() : null;
    }

    // mysql2 bisa mengembalikan string atau number
    if (typeof val === 'string' || typeof val === 'number') {
      const d = new Date(val);
      const t = d.getTime();
      return Number.isFinite(t) ? d.toISOString() : null;
    }

    // fallback: coba Date() dari string representation
    try {
      const d = new Date(String(val));
      const t = d.getTime();
      return Number.isFinite(t) ? d.toISOString() : null;
    } catch {
      return null;
    }
  };

  for (const row of rows) {
    let user = map.get(row.id);
    if (!user) {
      // Handle is_active: 0 = false (tidak aktif), 1 = true (aktif)
      const isActive = normalizeIsActive(row.is_active);

      // Handle dates: convert to ISO string if exists, otherwise null
      const created_at = normalizeDateToIsoOrNull(row.created_at);
      const last_login_at = normalizeDateToIsoOrNull(row.last_login_at);

      user = {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        username: row.username,
        profile_image_path: row.profile_image_path,
        profile_image_url: row.profile_image_path
          ? `/uploads/${row.profile_image_path}`
          : null,
        is_active: isActive,
        created_at,
        last_login_at,
        role: {
          id: row.role_id,
          code: row.role_code,
          name: row.role_name
        },
        departments: []
      };
      map.set(row.id, user);
    }

    if (row.department_id) {
      user.departments.push({
        id: row.department_id,
        code: row.department_code,
        name: row.department_name
      });
    }
  }

  return Array.from(map.values());
}

// GET /users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.username,
         u.profile_image_path,
         u.is_active,
         u.last_login_at,
         u.created_at,
         u.role_id,
         r.code AS role_code,
         r.name AS role_name,
         d.id AS department_id,
         d.code AS department_code,
         d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN user_departments ud ON ud.user_id = u.id
       LEFT JOIN departments d ON d.id = ud.department_id
       ORDER BY u.id ASC`
    );

    // Debug: log raw data dari database
    console.log('[getAllUsers] Raw rows sample:', rows.length > 0 ? {
      id: rows[0].id,
      full_name: rows[0].full_name,
      is_active: rows[0].is_active,
      is_active_type: typeof rows[0].is_active,
      last_login_at: rows[0].last_login_at,
      last_login_at_type: typeof rows[0].last_login_at,
      created_at: rows[0].created_at,
      created_at_type: typeof rows[0].created_at,
    } : 'No rows');

    const users = mapUserRows(rows);
    
    // Debug: log mapped users
    console.log('[getAllUsers] Mapped users sample:', users.length > 0 ? {
      id: users[0].id,
      full_name: users[0].full_name,
      is_active: users[0].is_active,
      is_active_type: typeof users[0].is_active,
      last_login_at: users[0].last_login_at,
      last_login_at_type: typeof users[0].last_login_at,
      created_at: users[0].created_at,
      created_at_type: typeof users[0].created_at,
    } : 'No users');
    
    return res.json({ data: users });
  } catch (err) {
    console.error('[getAllUsers] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.username,
         u.profile_image_path,
         u.is_active,
         u.last_login_at,
         u.created_at,
         u.role_id,
         r.code AS role_code,
         r.name AS role_name,
         d.id AS department_id,
         d.code AS department_code,
         d.name AS department_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN user_departments ud ON ud.user_id = u.id
       LEFT JOIN departments d ON d.id = ud.department_id
       WHERE u.id = ?
       ORDER BY u.id ASC`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const users = mapUserRows(rows);
    return res.json({ data: users[0] });
  } catch (err) {
    console.error('[getUserById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /users
// body: { full_name, email, username, password, role_code, is_active?, departments?: [ "TAX", "AUDIT" ] }
exports.createUser = async (req, res) => {
  const { full_name, email, username, password, role_code, is_active, departments } = req.body;

  if (!full_name || !email || !username || !password || !role_code) {
    return res.status(400).json({
      message: 'full_name, email, username, password, role_code wajib diisi'
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [roleRows] = await conn.query(
      'SELECT id, code, name FROM roles WHERE code = ? LIMIT 1',
      [role_code]
    );
    if (roleRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'role_code tidak valid' });
    }
    const role = roleRows[0];

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      `INSERT INTO users (full_name, email, username, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        username,
        passwordHash,
        role.id,
        is_active === undefined ? 1 : is_active ? 1 : 0
      ]
    );

    const newUserId = result.insertId;

    let deptObjects = [];
    if (Array.isArray(departments) && departments.length > 0) {
      const [deptRows] = await conn.query(
        'SELECT id, code, name FROM departments WHERE code IN (?)',
        [departments]
      );

      if (deptRows.length !== departments.length) {
        await conn.rollback();
        return res.status(400).json({
          message: 'Beberapa department code tidak valid'
        });
      }

      for (const d of deptRows) {
        await conn.query(
          'INSERT INTO user_departments (user_id, department_id) VALUES (?, ?)',
          [newUserId, d.id]
        );
      }

      deptObjects = deptRows.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name
      }));
    }

    await conn.commit();

    return res.status(201).json({
      message: 'User berhasil dibuat',
      data: {
        id: newUserId,
        full_name,
        email,
        username,
        is_active: is_active === undefined ? true : !!is_active,
        role: {
          id: role.id,
          code: role.code,
          name: role.name
        },
        departments: deptObjects
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('[createUser] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email atau username sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    conn.release();
  }
};

// PUT /users/:id
// body optional: full_name, email, username, password, role_code, is_active, departments:[codes]
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, username, password, role_code, is_active, departments } = req.body;

  if (
    full_name === undefined &&
    email === undefined &&
    username === undefined &&
    password === undefined &&
    role_code === undefined &&
    is_active === undefined &&
    departments === undefined
  ) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // pastikan user ada
    const [existingRows] = await conn.query(
      'SELECT id FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const fields = [];
    const values = [];

    if (full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(full_name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (typeof is_active === 'boolean' || is_active === 0 || is_active === 1) {
      fields.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      values.push(passwordHash);
    }
    if (role_code) {
      const [roleRows] = await conn.query(
        'SELECT id FROM roles WHERE code = ? LIMIT 1',
        [role_code]
      );
      if (roleRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'role_code tidak valid' });
      }
      fields.push('role_id = ?');
      values.push(roleRows[0].id);
    }

    if (fields.length > 0) {
      values.push(userId);
      await conn.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    // update departments kalau dikirim
    if (Array.isArray(departments)) {
      if (departments.length > 0) {
        const [deptRows] = await conn.query(
          'SELECT id, code, name FROM departments WHERE code IN (?)',
          [departments]
        );

        if (deptRows.length !== departments.length) {
          await conn.rollback();
          return res.status(400).json({
            message: 'Beberapa department code tidak valid'
          });
        }

        await conn.query('DELETE FROM user_departments WHERE user_id = ?', [userId]);

        for (const d of deptRows) {
          await conn.query(
            'INSERT INTO user_departments (user_id, department_id) VALUES (?, ?)',
            [userId, d.id]
          );
        }
      } else {
        // array kosong => hapus semua department
        await conn.query('DELETE FROM user_departments WHERE user_id = ?', [userId]);
      }
    }

    await conn.commit();

    return res.json({ message: 'User berhasil diupdate' });
  } catch (err) {
    await conn.rollback();
    console.error('[updateUser] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email atau username sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    conn.release();
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('[deleteUser] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /users/:id/profile-image
exports.updateProfileImage = async (req, res) => {
  console.log('[CONTROLLER] updateProfileImage called, userId =', req.params.id);
  console.log('[CONTROLLER] req.file =', req.file && req.file.filename);
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'File image tidak ditemukan' });
  }

  // path relatif yang disimpan di DB
  const relativePath = path.join('profile_images', req.file.filename).replace(/\\/g, '/');

  try {
    const [result] = await pool.query(
      'UPDATE users SET profile_image_path = ? WHERE id = ?',
      [relativePath, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    return res.json({
      message: 'Profile image berhasil diupdate',
      profile_image_path: relativePath,
      profile_image_url: `/uploads/${relativePath}`
    });
  } catch (err) {
    console.error('[updateProfileImage] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
