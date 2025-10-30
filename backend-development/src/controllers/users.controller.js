// src/controllers/users.controller.js
const { pool } = require('../config/db');

// GET /api/v1/users
async function list(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

// GET /api/v1/users/:id
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

// POST /api/v1/users
async function create(req, res, next) {
  try {
    const { name, email, role = 'STAFF' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'name & email wajib' });
    }
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    // Tangani duplicate email
    if (e.code === 'ER_DUP_ENTRY') {
      e.status = 409;
      e.message = 'Email already exists';
    }
    next(e);
  }
}

// PUT /api/v1/users/:id
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body;
    const [result] = await pool.execute(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?',
      [name ?? null, email ?? null, role ?? null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      e.status = 409;
      e.message = 'Email already exists';
    }
    next(e);
  }
}

// DELETE /api/v1/users/:id
async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, update, remove };
