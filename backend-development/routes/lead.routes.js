// routes/lead.routes.js
const express = require('express');
const router = express.Router();

const leadController = require('../controllers/lead.controller');
const { uploadProposal } = require('../middleware/upload-proposal');

// Promote dari Bank Data ke Lead
router.post('/promote-from-bank/:bankDataId', leadController.promoteFromBankData);

// Inbox CEO (list leads berdasarkan status follow-up)
router.get('/ceo-inbox', leadController.getCEOInboxLeads);

// CEO Approvals (list leads that have docs waiting CEO approval)
router.get('/ceo-approvals', leadController.getCEOApprovals);

// Update status follow-up oleh CEO (Followed-up / Drop)
router.put('/ceo-inbox/:id/followup', leadController.updateCEOFollowUp);

// Lead Tracker (BD Executive)
router.get('/tracker', leadController.getLeadTrackerLeads);

// Lead Tracker detail (BD Executive)
router.get('/tracker/:id', leadController.getLeadTrackerDetail);

// Tracker actions -> persist to DB
router.post('/:id/meetings', leadController.createLeadMeeting);
router.put('/:id/meetings/:meetingId', leadController.updateLeadMeeting);
router.delete('/:id/meetings/:meetingId', leadController.deleteLeadMeeting);

router.post('/:id/notulensi', leadController.createLeadNotulensi);
router.put('/:id/notulensi/:notulensiId', leadController.updateLeadNotulensi);

router.post('/:id/proposals', uploadProposal.single('file'), leadController.createLeadProposal);
router.put('/:id/proposals/:proposalId', uploadProposal.single('file'), leadController.updateLeadProposal);

router.post('/:id/engagement-letters', leadController.createLeadEngagementLetter);
router.put('/:id/engagement-letters/:elId', leadController.updateLeadEngagementLetter);

router.post('/:id/handovers', leadController.createLeadHandover);
router.put('/:id/handovers/:handoverId', leadController.updateLeadHandover);

module.exports = router;

