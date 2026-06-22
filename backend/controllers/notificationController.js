const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send a new notification
// @route   POST /api/notifications/send
// @access  Private (Admin or System)
exports.sendNotification = async (req, res) => {
  try {
    const { receiver, role, type, title, message } = req.body;
    
    // Optional sender (could be the logged in user)
    const sender = req.user ? req.user.id : null;

    const notification = await Notification.create({
      sender,
      receiver,
      role,
      type,
      title,
      message,
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Server error sending notification' });
  }
};

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications/user
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, receiver: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.status = 'read';
    await notification.save();
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user.id, status: 'unread' },
      { $set: { status: 'read' } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};
// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, receiver: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notification' });
  }
};
