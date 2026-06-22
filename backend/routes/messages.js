const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getConversation, getConversationsList } = require('../controllers/messageController');

// All message routes require authentication
router.use(protect);

router.post('/', sendMessage);
router.get('/conversations/list', getConversationsList);
router.get('/:otherUserId', getConversation);

module.exports = router;
