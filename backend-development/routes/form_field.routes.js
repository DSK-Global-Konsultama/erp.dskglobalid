// routes/form_field.routes.js
const express = require('express');
const router = express.Router();

const formFieldController = require('../controllers/form_field.controller');

router.get('/', formFieldController.getAllFormFields);
router.get('/:id', formFieldController.getFormFieldById);
router.post('/', formFieldController.createFormField);
router.put('/:id', formFieldController.updateFormField);
router.delete('/:id', formFieldController.deleteFormField);

module.exports = router;

