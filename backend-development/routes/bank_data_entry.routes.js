// routes/bank_data_entry.routes.js
const express = require('express');
const router = express.Router();

const bankDataEntryController = require('../controllers/bank_data_entry.controller');

router.get('/', bankDataEntryController.getAllBankDataEntries);
router.get('/:id', bankDataEntryController.getBankDataEntryById);
router.post('/', bankDataEntryController.createBankDataEntry);
router.put('/:id', bankDataEntryController.updateBankDataEntry);
router.delete('/:id', bankDataEntryController.deleteBankDataEntry);

module.exports = router;

