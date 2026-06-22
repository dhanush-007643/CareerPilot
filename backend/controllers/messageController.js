const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, senderModel } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Please provide receiverId and content' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      senderModel: senderModel || 'User',
      receiverId,
      content
    });

    // Create a notification for the receiver
    await Notification.create({
      recipient: receiverId,
      type: 'message',
      message: `You have a new message from ${req.user.name}`,
      link: '/messages'
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get conversation between current user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user._id }
      ]
    }).sort('createdAt');

    // Mark received messages as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get list of users the current user has conversations with
// @route   GET /api/messages/conversations/list
// @access  Private
exports.getConversationsList = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort('-createdAt');

    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== req.user._id.toString()) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== req.user._id.toString()) {
        userIds.add(msg.receiverId.toString());
      }
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name role companyId email');

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching conversations list:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
