// controllers/form.controller.js
const pool = require('../config/db');
const crypto = require('crypto');

// GET /forms
exports.getAllForms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, status, public_link, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       ORDER BY created_at DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllForms] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /forms/:id
exports.getFormById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, status, public_link, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('[getFormById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /forms
exports.createForm = async (req, res) => {
  const { title, description, status, public_link, published_at, primary_campaign_id } = req.body;
  const created_by = req.user?.username || req.user?.email || 'system';

  if (!title || !status) {
    return res.status(400).json({
      message: 'title dan status wajib diisi'
    });
  }

  // Validate enum values
  const validStatuses = ['DRAFT', 'PUBLISHED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
  }

  const id = crypto.randomUUID();

  try {
    await pool.query(
      `INSERT INTO forms (id, title, description, status, public_link, published_at, created_by, primary_campaign_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, status, public_link || null, published_at || null, created_by, primary_campaign_id || null]
    );

    const [rows] = await pool.query(
      `SELECT id, title, description, status, public_link, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.status(201).json({
      message: 'Form berhasil dibuat',
      data: rows[0]
    });
  } catch (err) {
    console.error('[createForm] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /forms/:id
exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, public_link, published_at, primary_campaign_id } = req.body;

  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (status !== undefined) {
    const validStatuses = ['DRAFT', 'PUBLISHED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
    }
    fields.push('status = ?');
    values.push(status);
  }
  if (public_link !== undefined) {
    fields.push('public_link = ?');
    values.push(public_link);
  }
  if (published_at !== undefined) {
    fields.push('published_at = ?');
    values.push(published_at);
  }
  if (primary_campaign_id !== undefined) {
    fields.push('primary_campaign_id = ?');
    values.push(primary_campaign_id);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE forms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    const [rows] = await pool.query(
      `SELECT id, title, description, status, public_link, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.json({
      message: 'Form berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateForm] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /forms/:id
exports.deleteForm = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM forms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    return res.json({ message: 'Form berhasil dihapus' });
  } catch (err) {
    console.error('[deleteForm] Error:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Form masih digunakan oleh campaign atau bank data entry' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

