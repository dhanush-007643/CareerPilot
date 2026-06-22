const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create a job posting (Startups only)
// @route   POST /api/jobs
// @access  Private (Startup only)
router.post('/', protect, authorize('startup'), async (req, res) => {
  try {
    const { title, description, requiredSkills } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide job title and description' });
    }

    const job = await Job.create({
      startupId: req.user.id,
      title,
      description,
      requiredSkills: requiredSkills || []
    });

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Populate startupId to get details of the startup (User) who posted
    const jobs = await Job.find()
      .populate('startupId', 'name email')
      .populate('applicants.userId', 'name email skills')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all jobs the user has been invited to
// @route   GET /api/jobs/my-invitations
// @access  Private (Fresher only)
router.get('/my-invitations', protect, authorize('fresher'), require('../controllers/jobController').getMyInvitations);

// @desc    Invite a candidate to a private job
// @route   POST /api/jobs/invite
// @access  Private (Startup only)
router.post('/invite', protect, authorize('startup'), require('../controllers/jobController').inviteCandidate);

// @desc    Apply for a job
// @route   POST /api/jobs/apply
// @access  Private (Fresher only)
router.post('/apply', protect, authorize('fresher'), async (req, res) => {
  try {
    const { jobId, userId, referralCode } = req.body;

    // Use user ID from JWT if not explicitly provided in body
    const applicantId = userId || req.user.id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide a job ID' });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if user has already applied
    const alreadyApplied = job.applicants.some(
      (applicant) => applicant.userId.toString() === applicantId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    job.applicants.push({
      userId: applicantId,
      referralCode: referralCode || ''
    });

    await job.save();

    try {
      const user = await User.findById(applicantId);
      const startup = await User.findById(job.startupId);

      if (user && user.email) {
        await sendEmail({
          email: user.email,
          subject: `Application Submitted: ${job.title}`,
          message: `Hi ${user.name},\n\nYour application for the position of ${job.title} at ${startup ? startup.name : 'the company'} has been successfully submitted.\n\nGood luck!\nCareerPilot Team`
        });
      }

      if (startup && startup.email) {
        await sendEmail({
          email: startup.email,
          subject: `New Applicant for ${job.title}`,
          message: `Hello ${startup.name},\n\nYou have a new applicant (${user ? user.name : 'a candidate'}) for the position of ${job.title}.\n\nLog in to your dashboard to review their profile.\n\nCareerPilot Team`
        });
      }
    } catch (emailErr) {
      console.error('Failed to send application emails:', emailErr);
    }

    return res.json({ success: true, message: 'Application submitted successfully', data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
