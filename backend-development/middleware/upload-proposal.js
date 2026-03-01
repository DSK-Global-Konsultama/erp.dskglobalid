// middleware/upload-proposal.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'proposal');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const leadId = req.params.id || 'lead';
        const ts = Date.now();
        const rand = Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname || '') || '';
        cb(null, `proposal-${leadId}-${ts}-${rand}${ext}`);
    }
});

const uploadProposal = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

module.exports = {
    uploadProposal
};
