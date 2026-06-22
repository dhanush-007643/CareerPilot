const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/notifications/send
router.post('/send', protect, sendNotification);

// @route   GET /api/notifications/user
router.get('/user', protect, getUserNotifications);
// Keep the old route just in case it's used elsewhere in frontend temporarily
router.get('/', protect, getUserNotifications);

// @route   PUT /api/notifications/read-all
router.put('/read-all', protect, markAllAsRead);

// @route   PUT /api/notifications/:id/read
router.put('/:id/read', protect, markAsRead);

// @route   DELETE /api/notifications/:id
router.delete('/:id', protect, deleteNotification);

module.exports = router;
