// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// register user baru (internal use, bukan public open)
router.post('/register', authController.register);

// login
router.post('/login', authController.login);

module.exports = router;
