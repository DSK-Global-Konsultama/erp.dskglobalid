// middleware/upload-profile-image.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
      console.log('[MULTER] destination called'); // debug
      const uploadDir = path.join(__dirname, '..', 'uploads', 'profile_images');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const userId = req.params.id || 'unknown';
      const filename = `${userId}-${unique}${ext}`;
      console.log('[MULTER] filename generated:', filename); // debug
      cb(null, filename);
    }
  });
  

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('File harus berupa gambar'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});

module.exports = upload;
