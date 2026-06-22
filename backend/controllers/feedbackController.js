const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Generate unique ticket ID
const generateTicketId = async () => {
  const count = await Feedback.countDocuments();
  return `CP-TKT-${1001 + count}`;
};

exports.createFeedback = async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;
    
    const ticketId = await generateTicketId();

    const feedback = await Feedback.create({
      userId: req.user.id,
      userRole: req.user.role,
      subject,
      category,
      message,
      priority: priority || 'Medium',
      ticketId
    });

    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      title: 'New Support Ticket',
      message: `Ticket ${ticketId} created by ${req.user.role}. Priority: ${priority}`,
      type: 'system',
      isRead: false
    }));
    await Notification.insertMany(notifications);

    try {
      await sendEmail({
        email: req.user.email,
        subject: `Support Ticket Created: ${ticketId}`,
        message: `Your ticket has been received. Ticket ID: ${ticketId}\n\nSubject: ${subject}\nCategory: ${category}\n\nWe will get back to you shortly.`
      });
    } catch (err) {
      console.log('Email sending failed', err);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const filters = {};
    if (req.query.role) filters.userRole = req.query.role;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;

    const feedbacks = await Feedback.find(filters)
      .populate('userId', 'name email')
      .sort('-createdAt');
      
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('userId', 'name email');
    if (!feedback) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    if (req.user.role !== 'admin' && feedback.userId._id.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.replyToFeedback = async (req, res) => {
  try {
    const { ticketId, adminReply, status } = req.body;
    
    const feedback = await Feedback.findOne({ ticketId }).populate('userId', 'email name');
    if (!feedback) return res.status(404).json({ success: false, message: 'Ticket not found' });

    feedback.adminReply = adminReply || feedback.adminReply;
    feedback.status = status || feedback.status;
    await feedback.save();

    await Notification.create({
      userId: feedback.userId._id,
      title: `Ticket ${ticketId} Updated`,
      message: `Admin replied to your ticket: ${ticketId}. Status: ${feedback.status}`,
      type: 'system'
    });

    try {
      await sendEmail({
        email: feedback.userId.email,
        subject: `Update on your Support Ticket: ${ticketId}`,
        message: `Admin replied:\n${feedback.adminReply}\n\nCurrent Status: ${feedback.status}`
      });
    } catch (err) {
      console.log('Email sending failed', err);
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    const feedback = await Feedback.findOneAndUpdate({ ticketId }, { status }, { new: true });
    
    if (!feedback) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const feedback = await Feedback.findOneAndDelete({ ticketId });
    if (!feedback) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
