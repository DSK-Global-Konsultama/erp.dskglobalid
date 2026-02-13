// controllers/form_file.controller.js
const path = require('path');

const CATEGORY_EXTS = {
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  AUDIO: ['mp3', 'wav', 'm4a', 'aac', 'ogg'],
  ARCHIVE: ['zip', 'rar', '7z']
};

const getExtLower = (filename) => {
  const ext = path.extname(String(filename || '')).toLowerCase();
  return ext.startsWith('.') ? ext.slice(1) : ext;
};

const parseCategories = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

// PUT /public/forms/:id/files
// Expects multipart/form-data with field name: file
// Optional: query ?categories=DOCUMENT,IMAGE (to harden type checking)
exports.uploadPublicFormFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const categories = parseCategories(req.query.categories);
    if (categories.length > 0 && !categories.includes('ANY')) {
      const allowed = new Set();
      categories.forEach((c) => {
        (CATEGORY_EXTS[c] || []).forEach((e) => allowed.add(e));
      });

      if (allowed.size > 0) {
        const ext = getExtLower(req.file.originalname);
        if (!ext || !allowed.has(ext)) {
          return res.status(400).json({
            message: 'Tipe file tidak diizinkan',
            details: { ext, categories }
          });
        }
      }
    }

    const rel = `/uploads/file_forms/${req.file.filename}`;

    return res.status(201).json({
      message: 'File berhasil diupload',
      data: {
        path: rel,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('[uploadPublicFormFile] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
