const Follower = require('../models/Follower');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.followCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    const userId = req.user.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Check if already following
    const existing = await Follower.findOne({ userId, companyId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already following this company' });
    }

    await Follower.create({ userId, companyId });

    // Update arrays
    await User.findByIdAndUpdate(userId, { $addToSet: { followingCompanies: companyId } });
    await Company.findByIdAndUpdate(companyId, { $addToSet: { followers: userId } });

    // Notification to startup
    await Notification.create({
      sender: userId,
      receiver: company.createdBy, // notify the company owner
      role: 'startup',
      type: 'follow',
      title: 'New Follower',
      message: `${req.user.name || 'A candidate'} started following your company.`
    });

    res.status(201).json({ success: true, message: 'Successfully followed company' });
  } catch (error) {
    console.error('Error following company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.unfollowCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    await Follower.findOneAndDelete({ userId, companyId });

    await User.findByIdAndUpdate(userId, { $pull: { followingCompanies: companyId } });
    await Company.findByIdAndUpdate(companyId, { $pull: { followers: userId } });

    res.json({ success: true, message: 'Successfully unfollowed company' });
  } catch (error) {
    console.error('Error unfollowing company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFollowedCompanies = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await Follower.find({ userId }).populate('companyId', 'companyName industry companySize logo companyVisibility followers');
    const companies = followers.map(f => f.companyId).filter(Boolean);
    res.json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    console.error('Error getting followed companies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCompanyFollowers = async (req, res) => {
  try {
    const companyId = req.params.companyId || req.user.companyId;
    const followers = await Follower.find({ companyId }).populate('userId', 'name email personalInfo skills educationDetails experienceDetails');
    const users = followers.map(f => f.userId).filter(Boolean);
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Error getting company followers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
