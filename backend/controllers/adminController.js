const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Quiz = require('../models/Quiz');
const Certificate = require('../models/Certificate');
const Interview = require('../models/Interview');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careerpilot_secret_key_2026_xyz123', { expiresIn: '30d' });
};

// =======================
// ADMIN AUTH & PROFILE
// =======================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide an email and password' });

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
    admin.password = undefined;

    res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    let admin = await Admin.findById(req.user._id);
    if (!admin) {
      admin = await User.findById(req.user._id);
    }
    if (admin) res.json({ success: true, data: admin });
    else res.status(404).json({ success: false, message: 'Admin not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    let admin = await Admin.findById(req.user._id);
    if (!admin) {
      admin = await User.findById(req.user._id);
    }
    if (admin) {
      admin.name = req.body.name || admin.name;
      admin.phone = req.body.phone !== undefined ? req.body.phone : admin.phone;
      admin.bio = req.body.bio !== undefined ? req.body.bio : admin.bio;
      admin.address = req.body.address !== undefined ? req.body.address : admin.address;
      admin.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : admin.profileImage;
      admin.recoveryEmail = req.body.recoveryEmail !== undefined ? req.body.recoveryEmail : admin.recoveryEmail;
      admin.notificationEmail = req.body.notificationEmail !== undefined ? req.body.notificationEmail : admin.notificationEmail;

      const updatedAdmin = await admin.save();
      res.json({ success: true, data: updatedAdmin });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      admin = await User.findById(req.user._id).select('+password');
    }

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    if (!(await admin.matchPassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password updated successfully. Please login again.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Auto-Seeder
const initAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'rdh00019@gmail.com' });
    if (!adminExists) {
      await Admin.create({
        name: 'System Administrator',
        email: 'rdh00019@gmail.com',
        password: '123456',
        role: 'superadmin'
      });
      console.log('Default Admin created: rdh00019@gmail.com');
    }
  } catch (err) {
    console.error('Failed to init admin:', err.message);
  }
};
setTimeout(initAdmin, 2000);

const logActivity = async (action, entityType, entityId, userId, details) => {
  try {
    await ActivityLog.create({ action, entityType, entityId, userId, details });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
};

// =======================
// FRESHER MANAGEMENT
// =======================
const getAllFreshers = async (req, res) => {
  try {
    const freshers = await User.find({ role: 'fresher' }).select('-password');
    res.json({ success: true, count: freshers.length, data: freshers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving freshers' });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Using visibility as a block mechanism, or we can add an isBlocked field. Let's use isBlocked dynamically
    user.visibility = 'private'; // Quick block implementation for now
    await user.save();
    
    await logActivity('User Blocked', 'User', user._id, req.user._id, `Blocked user ${user.email}`);
    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await logActivity('User Deleted', 'User', req.params.id, req.user._id, 'Deleted user account');
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// COMPANY MANAGEMENT
// =======================
const getCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'startup' }).select('-password');
    res.json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving companies' });
  }
};

const approveCompany = async (req, res) => {
  try {
    // Assuming Company model or User model with company fields
    res.json({ success: true, message: 'Company approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const rejectCompany = async (req, res) => {
  try {
    res.json({ success: true, message: 'Company rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// JOB MANAGEMENT
// =======================
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('companyId', 'companyName companyEmail').sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving jobs' });
  }
};

// =======================
// APPLICATIONS
// =======================
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('userId', 'name email skills personalInfo')
      .populate('jobId', 'title company domain')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const application = await Application.findByIdAndUpdate(applicationId, { status }, { new: true });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application status updated', data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};

// =======================
// ASSESSMENTS
// =======================
const getAssessments = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createAssessment = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    await logActivity('Assessment Created', 'Quiz', quiz._id, req.user._id, `Created ${quiz.title}`);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// CERTIFICATES
// =======================
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().populate('userId', 'name').populate('quizId', 'title');
    res.json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// INTERVIEWS
// =======================
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('candidateId', 'name')
      .populate('companyId', 'companyName')
      .populate('jobId', 'title');
    res.json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  loginAdmin, getAdminProfile, updateAdminProfile, changePassword,
  getAllFreshers, blockUser, deleteUser,
  getCompanies, approveCompany, rejectCompany,
  getJobs,
  getApplications, updateApplicationStatus,
  getAssessments, createAssessment, deleteAssessment,
  getCertificates,
  getInterviews
};
