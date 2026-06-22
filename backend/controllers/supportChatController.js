const SupportChat = require('../models/SupportChat');

exports.getChatHistory = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const messages = await SupportChat.find({
      $or: [
        { senderId: targetUserId },
        { receiverId: targetUserId }
      ]
    }).sort('createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await SupportChat.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderRole", "admin"] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $last: "$message" },
          updatedAt: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverRole", "admin"] },
                  { $eq: ["$isRead", false] }
                ]},
                1, 0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          role: "$user.role",
          lastMessage: 1,
          updatedAt: 1,
          unreadCount: 1
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (req.user.role === 'admin') {
      await SupportChat.updateMany(
        { senderId: targetUserId, receiverRole: 'admin', isRead: false },
        { isRead: true }
      );
    } else {
      await SupportChat.updateMany(
        { senderRole: 'admin', receiverId: req.user.id, isRead: false },
        { isRead: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, receiverRole } = req.body;

    const chat = await SupportChat.create({
      senderId: req.user.id,
      senderRole: req.user.role,
      receiverId,
      receiverRole: receiverRole || 'admin',
      message
    });

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
