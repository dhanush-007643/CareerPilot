const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');

exports.sendInvitation = async (req, res) => {
  try {
    const { candidateId, jobId, message } = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ success: false, message: 'You must belong to a company to send invitations' });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const company = await Company.findById(companyId);

    // Prevent duplicate pending invitations
    const existing = await Invitation.findOne({ companyId, candidateId, status: 'Pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An invitation is already pending for this candidate' });
    }

    const invitation = await Invitation.create({
      companyId,
      candidateId,
      jobId: jobId || null,
      status: 'Pending'
    });

    // Notify candidate
    await Notification.create({
      sender: req.user.id,
      receiver: candidateId,
      role: 'fresher',
      type: 'invitation',
      title: 'New Company Invitation',
      message: `${company.companyName} has invited you to apply for a position. ${message || ''}`
    });

    res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Accepted' or 'Rejected'
    const candidateId = req.user.id;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const invitation = await Invitation.findOne({ _id: id, candidateId }).populate('companyId', 'companyName createdBy');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    invitation.status = status;
    await invitation.save();

    // Notify company
    await Notification.create({
      sender: candidateId,
      receiver: invitation.companyId.createdBy,
      role: 'startup',
      type: 'invitation_response',
      title: `Invitation ${status}`,
      message: `${req.user.name} has ${status.toLowerCase()} your invitation.`
    });

    res.json({ success: true, data: invitation });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCandidateInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ candidateId: req.user.id })
      .populate('companyId', 'companyName logo industry companySize')
      .populate('jobId', 'title location type expectedSalary')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invitations.length, data: invitations });
  } catch (error) {
    console.error('Error getting candidate invitations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCompanyInvitations = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const invitations = await Invitation.find({ companyId })
      .populate('candidateId', 'name email personalInfo skills educationDetails experienceDetails')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invitations.length, data: invitations });
  } catch (error) {
    console.error('Error getting company invitations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
