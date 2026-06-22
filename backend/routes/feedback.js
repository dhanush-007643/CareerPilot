const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

router.use(protect);

router.post('/create', feedbackController.createFeedback);
router.get('/my', feedbackController.getMyFeedback);
router.get('/all', authorize('admin'), feedbackController.getAllFeedback);
router.get('/:id', feedbackController.getFeedbackById);

router.put('/reply', authorize('admin'), feedbackController.replyToFeedback);
router.put('/status', authorize('admin'), feedbackController.updateStatus);
router.delete('/delete', authorize('admin'), feedbackController.deleteFeedback);

module.exports = router;
