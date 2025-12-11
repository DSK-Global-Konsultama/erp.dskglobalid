// controllers/user.controller.js
const path = require('path');
const pool = require('../config/db');

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
