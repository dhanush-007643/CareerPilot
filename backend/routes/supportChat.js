const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const chatController = require('../controllers/supportChatController');

router.use(protect);

router.post('/send', chatController.sendMessage);
router.get('/history/:userId', chatController.getChatHistory);
router.get('/conversations', authorize('admin'), chatController.getConversations);
router.put('/read/:userId', chatController.markAsRead);

module.exports = router;
