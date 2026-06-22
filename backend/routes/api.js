const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getJobs, createJob, deleteJob, updateJob } = require('../controllers/jobController');
const { 
  applyForJob, 
  getApplicantsForJob, 
  updateApplicationStatus,
  getMyApplications,
  scheduleInterview,
  updateApplicationVisibility
} = require('../controllers/applicationController');
const { updateJobVisibility, getJobByInvite, inviteCandidate, getMyInvitations } = require('../controllers/jobController');
const {
  createCompany,
  joinCompany,
  getCompanyProfile,
  getTeam,
  approveMember,
  updateCompanyVisibility,
  getCompanyCandidates,
  updateCandidateStatus,
  inviteEmployee,
  searchPublicCandidates,
  approveCompany
} = require('../controllers/companyController');
const User = require('../models/User');

const { getPublicCompanies, getCompanyDetails, toggleFollowCompany, getPublicCandidates, getCandidateDetails, toggleSaveCandidate, getSavedCandidates } = require('../controllers/networkController');
const { createInvitation, getInvitations, respondToInvitation, createInterview, getInterviews, updateInterview } = require('../controllers/interactionController');

// --- User Profile / Visibility Routes ---
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile/visibility', protect, authorize('fresher'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.visibility = req.body.visibility || 'public';
    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Company Routes ---
router.post('/company/create', protect, authorize('startup'), createCompany);
router.post('/company/join', protect, authorize('startup'), joinCompany);
router.get('/company/profile', protect, authorize('startup'), getCompanyProfile);
router.get('/company/team', protect, authorize('startup'), getTeam);
router.put('/company/approve-member', protect, authorize('startup'), approveMember);
router.put('/company/visibility', protect, authorize('startup'), updateCompanyVisibility);
router.get('/company/candidates', protect, authorize('startup'), getCompanyCandidates);
router.get('/company/search-candidates', protect, authorize('startup'), searchPublicCandidates);
router.put('/company/candidates/:id/status', protect, authorize('startup'), updateCandidateStatus);
router.post('/company/invite', protect, authorize('startup'), inviteEmployee);
router.post('/company/approve', protect, authorize('admin'), approveCompany);

// --- Job Routes ---
// GET /api/jobs - Retrieve all active jobs (optionally filtered by query params)
router.get('/jobs', protect, getJobs);

// POST /api/jobs/create - Post a new opening (Startups only)
router.post('/jobs/create', protect, authorize('startup'), createJob);
router.post('/jobs', protect, authorize('startup'), createJob); // Fallback for existing clients

// PUT /api/jobs/:id - Update a job opening (Startups only)
router.put('/jobs/:id', protect, authorize('startup'), updateJob);

// DELETE /api/jobs/:id - Delete a job opening (Startups only)
router.delete('/jobs/:id', protect, authorize('startup'), deleteJob);

// GET /api/jobs/private/:inviteCode - Retrieve private job via invite
router.get('/jobs/private/:inviteCode', protect, getJobByInvite);

// PUT /api/jobs/:id/visibility - Update job visibility
router.put('/jobs/:id/visibility', protect, authorize('startup'), updateJobVisibility);

// POST /api/jobs/invite - Invite a candidate to a private job
router.post('/jobs/invite', protect, authorize('startup'), inviteCandidate);

// GET /api/jobs/my-invitations - Get jobs the fresher is invited to
router.get('/jobs/my-invitations', protect, authorize('fresher'), getMyInvitations);

// --- Application Routes ---
// GET /api/applications/my - Retrieve candidate's applications (Freshers only)
router.get('/applications/my', protect, authorize('fresher'), getMyApplications);

// POST /api/applications/apply - Submit candidacy application (Freshers only)
router.post('/applications/apply', protect, authorize('fresher'), applyForJob);
router.post('/jobs/apply', protect, authorize('fresher'), applyForJob);

// GET /api/applications/job/:jobId - Fetch all applicants for a job sorted by match % (Startups only)
router.get('/applications/job/:jobId', protect, authorize('startup'), getApplicantsForJob);

// PUT /api/applications/status - Update application Kanban ATS state (Startups only)
router.put('/applications/status', protect, authorize('startup'), updateApplicationStatus);

// POST /api/applications/:applicationId/schedule - Schedule candidate interview (Startups only)
router.post('/applications/:applicationId/schedule', protect, authorize('startup'), scheduleInterview);

// PUT /api/applications/:id/visibility - Update application visibility
router.put('/applications/:id/visibility', protect, authorize('fresher'), updateApplicationVisibility);

// --- Network & Discovery Routes ---
router.get('/network/companies', protect, authorize('fresher'), getPublicCompanies);
router.get('/network/companies/:id', protect, getCompanyDetails);
router.post('/network/companies/:id/follow', protect, authorize('fresher'), toggleFollowCompany);

router.get('/network/candidates', protect, authorize('startup'), getPublicCandidates);
router.get('/network/candidates/saved/all', protect, authorize('startup'), getSavedCandidates);
router.get('/network/candidates/:id', protect, authorize('startup'), getCandidateDetails);
router.post('/network/candidates/:id/save', protect, authorize('startup'), toggleSaveCandidate);

// --- Invitations ---
router.post('/invitations/create', protect, authorize('startup'), createInvitation);
router.get('/invitations', protect, getInvitations);
router.put('/invitations/:id/respond', protect, authorize('fresher'), respondToInvitation);

// --- Interviews ---
router.post('/interviews/create', protect, authorize('startup'), createInterview);
router.get('/interviews', protect, getInterviews);
router.put('/interviews/:id/update', protect, authorize('startup'), updateInterview);

// --- Seeding Route ---
// GET & POST /api/seed - Seeds database with rich default records for testing
router.get('/seed', async (req, res, next) => {
  try {
    const { runSeeder } = require('../utils/seeder');
    const result = await runSeeder();
    res.json({
      success: true,
      message: 'Database seeded successfully with initial startup, fresher, job, and application records!',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/seed', async (req, res, next) => {
  try {
    const { runSeeder } = require('../utils/seeder');
    const result = await runSeeder();
    res.json({
      success: true,
      message: 'Database seeded successfully with initial startup, fresher, job, and application records!',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
