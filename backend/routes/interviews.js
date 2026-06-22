const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');

router.use(protect);

// Startups can schedule interviews and view their scheduled interviews
router.post('/', authorize('startup', 'superadmin'), interviewController.scheduleInterview);
router.get('/company', authorize('startup', 'superadmin'), interviewController.getCompanyInterviews);
router.put('/:id/status', authorize('startup', 'superadmin'), interviewController.updateInterviewStatus);

module.exports = router;
