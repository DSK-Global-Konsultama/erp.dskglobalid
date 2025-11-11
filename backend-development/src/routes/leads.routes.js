// src/routes/leads.routes.js
const express = require('express');
const router = express.Router();
const {
  createPublicLead,
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  claimLead,
} = require('../controllers/leads.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public endpoint for external or internal form submission (no auth)
router.post('/public', createPublicLead);

// Authenticated endpoints
const canManageLeads = [requireAuth, requireRole('BDContentCreator', 'BDExecutive', 'Admin', 'ITSpecialist')];

router.get('/', ...canManageLeads, listLeads);
router.get('/:id', ...canManageLeads, getLead);
router.post('/', ...canManageLeads, createLead);
router.put('/:id', ...canManageLeads, updateLead);
router.delete('/:id', ...canManageLeads, deleteLead);

// Claim action
router.post('/:id/claim', ...canManageLeads, claimLead);

module.exports = router;


