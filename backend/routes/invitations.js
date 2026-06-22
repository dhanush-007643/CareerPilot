const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendInvitation,
  respondToInvitation,
  getCandidateInvitations,
  getCompanyInvitations
} = require('../controllers/invitationController');

router.post('/send', protect, sendInvitation);
router.put('/:id/respond', protect, respondToInvitation);
router.get('/candidate', protect, getCandidateInvitations);
router.get('/company', protect, getCompanyInvitations);

module.exports = router;
