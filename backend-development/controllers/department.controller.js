// controllers/department.controller.js
const pool = require('../config/db');

// GET /departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM departments ORDER BY id ASC'
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllDepartments] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /departments/:id
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM departments WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Department tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('[getDepartmentById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /departments
exports.createDepartment = async (req, res) => {
  const { code, name, description } = req.body;

  if (!code || !name) {
    return res.status(400).json({
      message: 'code dan name wajib diisi'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO departments (code, name, description) VALUES (?, ?, ?)',
      [code, name, description || null]
    );

    return res.status(201).json({
      message: 'Department berhasil dibuat',
      data: {
        id: result.insertId,
        code,
        name,
        description: description || null
      }
    });
  } catch (err) {
    console.error('[createDepartment] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Department code sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /departments/:id
exports.updateDepartment = async (req, res) => {
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
      `UPDATE departments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Department tidak ditemukan' });
    }

    const [rows] = await pool.query(
      'SELECT id, code, name, description, created_at, updated_at FROM departments WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({
      message: 'Department berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateDepartment] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Department code sudah digunakan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /departments/:id
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Department tidak ditemukan' });
    }

    return res.json({ message: 'Department berhasil dihapus' });
  } catch (err) {
    console.error('[deleteDepartment] Error:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res
        .status(409)
        .json({ message: 'Department masih digunakan oleh user (user_departments)' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
