// filepath: /Users/muhamadfaried/Documents/DSK GLOBAL/erp.dskglobalid/backend-development/controllers/form_header.controller.js
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'header_forms');

// PUT /forms/:id/header-image
exports.uploadHeaderImage = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'File header image wajib diupload' });
  }

  try {
    const [rows] = await pool.query('SELECT header_image_path FROM forms WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    // Delete old file if exists
    const oldPath = rows[0].header_image_path;
    if (oldPath) {
      const oldFile = path.basename(String(oldPath));
      const absOld = path.join(UPLOADS_DIR, oldFile);
      try {
        fs.existsSync(absOld) && fs.unlinkSync(absOld);
      } catch {
        // ignore
      }
    }

    const headerImagePath = `/uploads/header_forms/${req.file.filename}`;
    await pool.query('UPDATE forms SET header_image_path = ? WHERE id = ?', [headerImagePath, id]);

    return res.json({
      message: 'Header image berhasil diupload',
      data: { header_image_path: headerImagePath }
    });
  } catch (err) {
    console.error('[uploadHeaderImage] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /forms/:id/header-image
exports.deleteHeaderImage = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT header_image_path FROM forms WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    const oldPath = rows[0].header_image_path;
    if (oldPath) {
      const oldFile = path.basename(String(oldPath));
      const absOld = path.join(UPLOADS_DIR, oldFile);
      try {
        fs.existsSync(absOld) && fs.unlinkSync(absOld);
      } catch {
        // ignore
      }
    }

    await pool.query('UPDATE forms SET header_image_path = NULL WHERE id = ?', [id]);

    return res.json({ message: 'Header image berhasil dihapus' });
  } catch (err) {
    console.error('[deleteHeaderImage] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
