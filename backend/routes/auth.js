const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careerpilot_secret_key_2026_xyz123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, skills, personalInfo, educationDetails, experienceDetails, projects, certificates } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'fresher',
      skills: skills || [],
      personalInfo: personalInfo || {},
      educationDetails: educationDetails || [],
      experienceDetails: experienceDetails || [],
      projects: projects || [],
      certificates: certificates || []
    });

    if (user) {
      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.personalInfo?.location,
        phone: user.personalInfo?.phone,
        headline: user.personalInfo?.headline,
        visibility: user.visibility,
        companyId: user.companyId,
        companyRole: user.companyRole,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    let user = await User.findOne({ email }).select('+password');
    let isAdmin = false;

    if (!user) {
      // Fallback to Admin model
      user = await Admin.findOne({ email }).select('+password');
      isAdmin = true;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (isAdmin) {
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    }

    return res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      location: user.personalInfo?.location,
      phone: user.personalInfo?.phone,
      headline: user.personalInfo?.headline,
      visibility: user.visibility,
      companyId: user.companyId,
      companyRole: user.companyRole,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const userDoc = await User.findById(req.user.id).select('-password');
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Format user for frontend compatibility
    const user = userDoc.toObject();
    user.location = user.personalInfo?.location;
    user.phone = user.personalInfo?.phone;
    user.headline = user.personalInfo?.headline;
    
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { personalInfo, educationDetails, experienceDetails, skills, projects, certificates, visibility } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (personalInfo) user.personalInfo = { ...user.personalInfo, ...personalInfo };
    if (educationDetails) user.educationDetails = educationDetails;
    if (experienceDetails) user.experienceDetails = experienceDetails;
    if (skills) user.skills = skills;
    if (projects) user.projects = projects;
    if (certificates) user.certificates = certificates;
    if (visibility) user.visibility = visibility;

    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// @desc    Upload user resume
// @route   PUT /api/auth/resume
// @access  Private
router.put('/resume', protect, async (req, res) => {
  try {
    const { fileName, fileContent } = req.body;
    if (typeof fileName !== 'string' || typeof fileContent !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide file name and content' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let fileUrl = '';
    if (fileName && fileContent) {
      const { uploadToS3 } = require('../utils/s3Upload');
      try {
        fileUrl = await uploadToS3(fileContent, fileName, 'resumes');
      } catch (uploadErr) {
        console.error('S3 upload helper failed, proceeding without URL:', uploadErr.message);
      }
    }

    user.resume = {
      fileName,
      fileContent,
      fileUrl,
      uploadedAt: new Date()
    };

    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error uploading resume' });
  }
});

// @desc    Get user resume
// @route   GET /api/auth/resume
// @access  Private
router.get('/resume', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('resume');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, resume: user.resume });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching resume' });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/password/forgot
// @access  Public
router.post('/password/forgot', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    try {
      await emailService.sendPasswordReset(user.email, {
        resetLink,
        expiresIn: '1 hour'
      });
      res.json({ success: true, message: 'Password reset link sent to email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reset password
// @route   POST /api/auth/password/reset
// @access  Public
router.post('/password/reset', async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful', token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
