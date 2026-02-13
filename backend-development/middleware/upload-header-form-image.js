// filepath: /Users/muhamadfaried/Documents/DSK GLOBAL/erp.dskglobalid/backend-development/middleware/upload-header-form-image.js
const path = require('path');
const multer = require('multer');

// Save uploaded header images to: backend-development/uploads/header_forms
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'header_forms'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const formId = req.params?.id || 'new';
    cb(null, `${formId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('File harus berupa gambar (jpg, jpeg, png, webp)'));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
