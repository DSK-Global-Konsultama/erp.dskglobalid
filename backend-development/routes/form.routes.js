// routes/form.routes.js
const express = require('express');
const router = express.Router();

const formController = require('../controllers/form.controller');
const formHeaderController = require('../controllers/form_header.controller');
const uploadHeaderFormImage = require('../middleware/upload-header-form-image');

router.get('/', formController.getAllForms);
router.get('/:id', formController.getFormById);
router.post('/', formController.createForm);
router.put('/:id', formController.updateForm);

// Header image
router.put(
  '/:id/header-image',
  uploadHeaderFormImage.single('header_image'),
  formHeaderController.uploadHeaderImage
);
router.delete('/:id/header-image', formHeaderController.deleteHeaderImage);

router.delete('/:id', formController.deleteForm);

module.exports = router;

