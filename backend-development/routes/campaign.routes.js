// routes/campaign.routes.js
const express = require('express');
const router = express.Router();

const campaignController = require('../controllers/campaign.controller');

router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;

