// routes/user.routes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const uploadProfileImage = require('../middleware/upload-profile-image');

// CRUD users
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// upload profile image
router.post(
  '/:id/profile-image',
  uploadProfileImage.single('image'),
  userController.updateProfileImage
);

module.exports = router;
