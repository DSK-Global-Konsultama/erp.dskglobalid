// src/routes/deals.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/deals.controller');

const canManageDeals = [requireAuth, requireRole('BDExecutive', 'Admin', 'ITSpecialist')];

router.get('/', ...canManageDeals, ctrl.listDeals);
router.get('/:id', ...canManageDeals, ctrl.getDeal);
router.post('/', ...canManageDeals, ctrl.createDeal);
router.put('/:id', ...canManageDeals, ctrl.updateDeal);
router.delete('/:id', ...canManageDeals, ctrl.deleteDeal);

// nested deal_service_items
router.get('/:dealId/items', ...canManageDeals, ctrl.listItems);
router.post('/:dealId/items', ...canManageDeals, ctrl.createItem);
router.put('/:dealId/items/:itemId', ...canManageDeals, ctrl.updateItem);
router.delete('/:dealId/items/:itemId', ...canManageDeals, ctrl.deleteItem);

module.exports = router;


