// routes/user.routes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const uploadProfileImage = require('../middleware/upload-profile-image');
// kalau sudah punya JWT middleware:
// const { authenticate } = require('../middleware/auth.middleware');

// POST /api/users/:id/profile-image
// router.post('/:id/profile-image', authenticate, uploadProfileImage.single('image'), userController.updateProfileImage);
router.post('/:id/profile-image', uploadProfileImage.single('image'), userController.updateProfileImage);

module.exports = router;
