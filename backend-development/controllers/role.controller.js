// controllers/role.controller.js
const pool = require('../config/db');

// GET /roles
exports.getAllRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM roles ORDER BY id ASC'
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllRoles] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /roles/:id
exports.getRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM roles WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Role tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('[getRoleById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /roles
exports.createRole = async (req, res) => {
  const { code, name, description } = req.body;

  if (!code || !name) {
    return res.status(400).json({
      message: 'code dan name wajib diisi'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO roles (code, name, description) VALUES (?, ?, ?)',
      [code, name, description || null]
    );

    return res.status(201).json({
      message: 'Role berhasil dibuat',
      data: {
        id: result.insertId,
        code,
        name,
        description: description || null
      }
    });
  } catch (err) {
    console.error('[createRole] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Role code sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /roles/:id
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { code, name, description } = req.body;

  const fields = [];
  const values = [];

  if (code !== undefined) {
    fields.push('code = ?');
    values.push(code);
  }
  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE roles SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role tidak ditemukan' });
    }

    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM roles WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({
      message: 'Role berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateRole] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Role code sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /roles/:id
exports.deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role tidak ditemukan' });
    }

    return res.json({ message: 'Role berhasil dihapus' });
  } catch (err) {
    console.error('[deleteRole] Error:', err);

    // role masih dipakai di users (FK)
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Role masih digunakan oleh user' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
