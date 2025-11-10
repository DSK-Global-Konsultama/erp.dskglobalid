// src/routes/invoices.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/invoices.controller');

const canManageInvoices = [requireAuth, requireRole('Admin', 'ITSpecialist')];

router.get('/', ...canManageInvoices, ctrl.listInvoices);
router.get('/:id', ...canManageInvoices, ctrl.getInvoice);
router.post('/', ...canManageInvoices, ctrl.createInvoice);
router.put('/:id', ...canManageInvoices, ctrl.updateInvoice);
router.delete('/:id', ...canManageInvoices, ctrl.deleteInvoice);

// installments
router.get('/:id/installments', ...canManageInvoices, ctrl.listInstallments);
router.post('/:id/installments', ...canManageInvoices, ctrl.addInstallment);
router.put('/:id/installments/:instId', ...canManageInvoices, ctrl.updateInstallment);
router.delete('/:id/installments/:instId', ...canManageInvoices, ctrl.deleteInstallment);

module.exports = router;


