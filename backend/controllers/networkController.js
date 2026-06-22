const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all public companies (for Freshers)
// @route   GET /api/network/companies
// @access  Private (Fresher)
exports.getPublicCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ companyVisibility: 'public' })
      .select('-pendingEmployees -invitations')
      .populate('jobsPosted');
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single company profile
// @route   GET /api/network/companies/:id
// @access  Private
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .select('-pendingEmployees -invitations -savedCandidates')
      .populate('jobsPosted');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    // Also fetch users who are part of the team
    const team = await User.find({ companyId: company._id, role: 'startup' }).select('name companyRole');
    
    res.status(200).json({ success: true, data: { ...company.toObject(), team } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Follow / Unfollow Company
// @route   POST /api/network/companies/:id/follow
// @access  Private (Fresher)
exports.toggleFollowCompany = async (req, res) => {
  try {
    if (req.user.role !== 'fresher') {
      return res.status(403).json({ success: false, message: 'Only freshers can follow companies.' });
    }
    
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const user = await User.findById(req.user.id);
    
    const isFollowing = user.followingCompanies.includes(companyId);
    
    if (isFollowing) {
      // Unfollow
      user.followingCompanies = user.followingCompanies.filter(id => id.toString() !== companyId.toString());
      company.followers = company.followers.filter(id => id.toString() !== req.user.id.toString());
    } else {
      // Follow
      user.followingCompanies.push(companyId);
      company.followers.push(req.user.id);

      // Create Notification for Company Admins
      const admins = await User.find({ companyId: company._id, companyRole: 'Admin' });
      const notifications = admins.map(admin => ({
        userId: admin._id,
        title: 'New Follower',
        message: `${user.name} is now following ${company.companyName}`,
        type: 'company_follow'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
    
    await user.save();
    await company.save();

    res.status(200).json({ success: true, message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all public freshers (Candidate Directory)
// @route   GET /api/network/candidates
// @access  Private (Startup)
exports.getPublicCandidates = async (req, res) => {
  try {
    const freshers = await User.find({ role: 'fresher', visibility: 'public' })
      .select('-password');
    // Note: match percentage will be computed on the frontend based on the specific job requirements
    res.status(200).json({ success: true, data: freshers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single candidate profile
// @route   GET /api/network/candidates/:id
// @access  Private (Startup)
exports.getCandidateDetails = async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'fresher' }).select('-password');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle save candidate
// @route   POST /api/network/candidates/:id/save
// @access  Private (Startup)
exports.toggleSaveCandidate = async (req, res) => {
  try {
    if (req.user.role !== 'startup' || !req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Only startup members can save candidates.' });
    }

    const candidateId = req.params.id;
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const isSaved = company.savedCandidates.includes(candidateId);
    if (isSaved) {
      // Unsave
      company.savedCandidates = company.savedCandidates.filter(id => id.toString() !== candidateId.toString());
    } else {
      // Save
      company.savedCandidates.push(candidateId);
    }
    await company.save();

    res.status(200).json({ success: true, message: isSaved ? 'Candidate removed' : 'Candidate saved', isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get saved candidates for company
// @route   GET /api/network/candidates/saved/all
// @access  Private (Startup)
exports.getSavedCandidates = async (req, res) => {
  try {
    if (req.user.role !== 'startup' || !req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Only startup members can view saved candidates.' });
    }
    const company = await Company.findById(req.user.companyId).populate({
      path: 'savedCandidates',
      select: '-password'
    });
    
    res.status(200).json({ success: true, data: company.savedCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
