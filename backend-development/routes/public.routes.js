// routes/public.routes.js
const express = require('express');
const router = express.Router();

const publicController = require('../controllers/public.controller');
const { uploadFormFile } = require('../middleware/upload-form-file');
const formFileController = require('../controllers/form_file.controller');

// Public form access by slug
router.get('/forms/:slug', publicController.getPublicFormBySlug);

// Public form fields by form id
router.get('/forms/:id/fields', publicController.getPublicFormFields);

// Public submission
router.post('/forms/:id/submit', publicController.submitPublicForm);

// Upload a file for a public form submission (max 10MB)
router.put('/forms/:id/files', uploadFormFile.single('file'), formFileController.uploadPublicFormFile);

module.exports = router;
