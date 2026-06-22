const crypto = require('crypto');
const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new company
// @route   POST /api/company/create
// @access  Private (Startup role)
exports.createCompany = async (req, res) => {
  try {
    const { companyName, companyEmail, website, industry, companySize, description, companyVisibility } = req.body;

    // Check if user already belongs to a company
    if (req.user.companyId) {
      return res.status(400).json({ success: false, message: 'You already belong to a company.' });
    }

    // Generate unique company code
    const companyCode = companyName.substring(0, 3).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const company = await Company.create({
      companyName,
      companyEmail,
      website,
      industry,
      companySize,
      description,
      companyCode,
      companyVisibility: companyVisibility || 'public',
      createdBy: req.user._id
    });

    // Update user
    req.user.companyId = company._id;
    req.user.companyRole = 'Admin';
    await req.user.save();

    // Trigger emails
    try {
      const emailService = require('../services/emailService');
      const adminUsers = await User.find({ role: 'admin' });
      if (adminUsers.length > 0) {
        // Send alert to the first admin (or iterate over them)
        await emailService.sendAdminCompanyRegistrationAlert(adminUsers[0].email, {
          name: companyName,
          email: companyEmail,
          industry: industry || 'Not specified'
        });
      }
      
      await emailService.sendCompanyRegistrationPending(companyEmail, companyName);
    } catch (emailErr) {
      console.error('Failed to send registration emails:', emailErr);
    }

    res.status(201).json({
      success: true,
      data: company,
      userRole: 'Admin'
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Request to join an existing company
// @route   POST /api/company/join
// @access  Private (Startup role)
exports.joinCompany = async (req, res) => {
  try {
    const { companyCode, designation } = req.body;

    if (req.user.companyId) {
      return res.status(400).json({ success: false, message: 'You already belong to a company.' });
    }

    const company = await Company.findOne({ companyCode });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found with that code.' });
    }

    // Check if already pending
    const isPending = company.pendingEmployees.some(emp => emp.userId.toString() === req.user._id.toString());
    if (isPending) {
      return res.status(400).json({ success: false, message: 'You have already requested to join this company.' });
    }

    company.pendingEmployees.push({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      designation: designation || 'Recruiter'
    });

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Request to join sent successfully. Awaiting admin approval.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current company profile
// @route   GET /api/company/profile
// @access  Private (Startup role with companyId)
exports.getCompanyProfile = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(404).json({ success: false, message: 'You do not belong to a company.' });
    }

    const company = await Company.findById(req.user.companyId).populate('createdBy', 'name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get team members
// @route   GET /api/company/team
// @access  Private (Startup role with companyId)
exports.getTeam = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(404).json({ success: false, message: 'You do not belong to a company.' });
    }

    const company = await Company.findById(req.user.companyId);
    
    // Find all users belonging to this company
    const teamMembers = await User.find({ companyId: company._id }).select('name email companyRole');

    res.status(200).json({
      success: true,
      data: {
        active: teamMembers,
        pending: company.pendingEmployees
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve or reject a team member request
// @route   PUT /api/company/approve-member
// @access  Private (Admin role)
exports.approveMember = async (req, res) => {
  try {
    if (req.user.companyRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can approve members.' });
    }

    const { userId, action, role } = req.body; // action: 'approve' or 'reject'
    const company = await Company.findById(req.user.companyId);

    const pendingIndex = company.pendingEmployees.findIndex(emp => emp.userId.toString() === userId);
    if (pendingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pending request not found.' });
    }

    if (action === 'approve') {
      const user = await User.findById(userId);
      if (user) {
        user.companyId = company._id;
        user.companyRole = role || 'Recruiter';
        await user.save();
      }
    }

    // Remove from pending
    company.pendingEmployees.splice(pendingIndex, 1);
    await company.save();

    res.status(200).json({
      success: true,
      message: `User request ${action}d.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update company visibility
// @route   PUT /api/company/visibility
// @access  Private (Admin role)
exports.updateCompanyVisibility = async (req, res) => {
  try {
    if (req.user.companyRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can change visibility.' });
    }

    const { visibility } = req.body;
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({ success: false, message: 'Invalid visibility state.' });
    }

    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { companyVisibility: visibility },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get candidates (ATS Pipeline)
// @route   GET /api/company/candidates
// @access  Private (Startup role)
exports.getCompanyCandidates = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(404).json({ success: false, message: 'You do not belong to a company.' });
    }

    // Find all jobs for the company
    const jobs = await Job.find({ companyId: req.user.companyId });
    const jobIds = jobs.map(j => j._id);

    // Find applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('userId', 'name email skills personalInfo educationDetails experienceDetails resume')
      .populate('jobId', 'title location jobType company');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Search public candidates
// @route   GET /api/company/search-candidates
// @access  Private (Startup role)
exports.searchPublicCandidates = async (req, res) => {
  try {
    const freshers = await User.find({ role: 'fresher', visibility: 'public' })
      .select('-password');
    res.status(200).json({
      success: true,
      count: freshers.length,
      data: freshers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update candidate application status (Kanban drag-and-drop support)
// @route   PUT /api/company/candidates/:id/status
// @access  Private (Startup role)
exports.updateCandidateStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify company ownership via job
    const job = await Job.findById(application.jobId);
    if (job.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = req.body.status;
    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Invite employee (generate link)
// @route   POST /api/company/invite
// @access  Private (Admin role)
exports.inviteEmployee = async (req, res) => {
  try {
    if (req.user.companyRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can invite employees.' });
    }

    const { email, role } = req.body;
    const company = await Company.findById(req.user.companyId);

    const inviteToken = crypto.randomBytes(20).toString('hex');

    company.invitations.push({
      email,
      role: role || 'Recruiter',
      token: inviteToken
    });

    await company.save();

    // In a real app, send email here. We return the token/link.
    const inviteUrl = `${req.protocol}://${req.get('host')}/register?invite=${inviteToken}`;

    res.status(200).json({
      success: true,
      data: inviteUrl,
      message: 'Invitation generated successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve or reject a company registration
// @route   POST /api/company/approve
// @access  Private (Admin role)
exports.approveCompany = async (req, res) => {
  try {
    const { companyId, status } = req.body; // status: 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.status = status;
    await company.save();

    // Trigger emails
    try {
      const emailService = require('../services/emailService');
      await emailService.sendCompanyApproval(
        company.companyEmail,
        company.companyName,
        status === 'approved'
      );
    } catch (emailErr) {
      console.error('Failed to send company approval emails:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: `Company has been ${status}`,
      data: company
    });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
