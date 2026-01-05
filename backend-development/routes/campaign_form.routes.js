// routes/campaign_form.routes.js
const express = require('express');
const router = express.Router();

const campaignFormController = require('../controllers/campaign_form.controller');

router.get('/', campaignFormController.getAllCampaignForms);
router.post('/', campaignFormController.createCampaignForm);
router.delete('/:campaign_id/:form_id', campaignFormController.deleteCampaignForm);

module.exports = router;

