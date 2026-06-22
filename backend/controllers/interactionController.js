const Invitation = require('../models/Invitation');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');

// --- Invitations ---

// @desc    Create invitation
// @route   POST /api/invitations/create
// @access  Private (Startup)
exports.createInvitation = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    if (req.user.role !== 'startup' || !req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Only startup members can send invites.' });
    }

    const company = await Company.findById(req.user.companyId);

    const existingInvite = await Invitation.findOne({ companyId: req.user.companyId, candidateId, jobId });
    if (existingInvite) {
      return res.status(400).json({ success: false, message: 'Invitation already sent for this job.' });
    }

    const invitation = await Invitation.create({
      companyId: req.user.companyId,
      candidateId,
      jobId
    });

    // Notify Candidate
    await Notification.create({
      userId: candidateId,
      title: 'Interview Invitation',
      message: `You have been invited by ${company.companyName} for an interview/screening.`,
      type: 'interview_invitation'
    });

    res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get invitations
// @route   GET /api/invitations
// @access  Private (Fresher or Startup)
exports.getInvitations = async (req, res) => {
  try {
    let invitations;
    if (req.user.role === 'fresher') {
      invitations = await Invitation.find({ candidateId: req.user.id })
        .populate('companyId', 'companyName logo')
        .populate('jobId', 'title location');
    } else if (req.user.role === 'startup' && req.user.companyId) {
      invitations = await Invitation.find({ companyId: req.user.companyId })
        .populate('candidateId', 'name skills')
        .populate('jobId', 'title');
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Respond to invitation
// @route   PUT /api/invitations/:id/respond
// @access  Private (Fresher)
exports.respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // Accepted or Rejected
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    if (invitation.candidateId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    invitation.status = status;
    await invitation.save();

    // Notify Company Admins
    const candidate = await User.findById(req.user.id);
    const admins = await User.find({ companyId: invitation.companyId, companyRole: 'Admin' });
    const notifications = admins.map(admin => ({
      userId: admin._id,
      title: 'Candidate Response',
      message: `${candidate.name} has ${status.toLowerCase()} your interview invitation.`,
      type: 'candidate_acceptance'
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- Interviews ---

// @desc    Create Interview
// @route   POST /api/interviews/create
// @access  Private (Startup)
exports.createInterview = async (req, res) => {
  try {
    const { candidateId, jobId, date, time, mode, meetingLink } = req.body;
    if (req.user.role !== 'startup' || !req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Only startup members can schedule.' });
    }

    const interview = await Interview.create({
      candidateId,
      companyId: req.user.companyId,
      jobId,
      date,
      time,
      mode,
      meetingLink
    });

    const company = await Company.findById(req.user.companyId);
    
    // Notify candidate
    await Notification.create({
      userId: candidateId,
      title: 'Interview Scheduled',
      message: `An interview with ${company.companyName} has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'interview_scheduled'
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Interviews
// @route   GET /api/interviews
// @access  Private (Fresher or Startup)
exports.getInterviews = async (req, res) => {
  try {
    let interviews;
    if (req.user.role === 'fresher') {
      interviews = await Interview.find({ candidateId: req.user.id })
        .populate('companyId', 'companyName logo')
        .populate('jobId', 'title');
    } else if (req.user.role === 'startup' && req.user.companyId) {
      interviews = await Interview.find({ companyId: req.user.companyId })
        .populate('candidateId', 'name email')
        .populate('jobId', 'title');
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Interview Status
// @route   PUT /api/interviews/:id/update
// @access  Private (Startup)
exports.updateInterview = async (req, res) => {
  try {
    const { status } = req.body; // Scheduled, Completed, Cancelled
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (interview.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    interview.status = status;
    await interview.save();

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
