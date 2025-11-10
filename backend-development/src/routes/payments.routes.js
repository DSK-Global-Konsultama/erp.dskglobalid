// src/routes/payments.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/payments.controller');

const canManagePayments = [requireAuth, requireRole('Admin', 'ITSpecialist')];

router.get('/', ...canManagePayments, ctrl.listPayments); // query: invoiceId
router.post('/', ...canManagePayments, ctrl.createPayment);

module.exports = router;


