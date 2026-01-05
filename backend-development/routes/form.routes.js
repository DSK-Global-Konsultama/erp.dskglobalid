// routes/form.routes.js
const express = require('express');
const router = express.Router();

const formController = require('../controllers/form.controller');

router.get('/', formController.getAllForms);
router.get('/:id', formController.getFormById);
router.post('/', formController.createForm);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

module.exports = router;

