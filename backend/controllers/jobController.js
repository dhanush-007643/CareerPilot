const Job = require('../models/Job');

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Get all active jobs with optional search filters
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const filterQuery = {};

    // 1. Filter by Work From Home option (isWFH)
    if (req.query.isWFH !== undefined) {
      filterQuery.isWFH = req.query.isWFH === 'true';
    }

    // 2. Filter by Job Type (Internship / Full-Time)
    if (req.query.jobType) {
      filterQuery.jobType = req.query.jobType;
    }

    // 3. Filter by Stipend option (hasStipend)
    if (req.query.hasStipend !== undefined) {
      filterQuery.hasStipend = req.query.hasStipend === 'true';
    }

    // 4. Filter by Location
    if (req.query.location) {
      filterQuery.location = { $regex: req.query.location, $options: 'i' };
    }

    // 5. Filter by Salary range
    if (req.query.salary) {
      filterQuery.salary = { $regex: req.query.salary, $options: 'i' };
    }

    // 6. Filter by Experience level
    if (req.query.experience) {
      filterQuery.experience = { $regex: req.query.experience, $options: 'i' };
    }

    // 7. Filter by Company
    if (req.query.company) {
      filterQuery.$or = [
        { company: { $regex: req.query.company, $options: 'i' } }
      ];
    }

    // 8. Filter by Domain
    if (req.query.domain) {
      filterQuery.domain = req.query.domain;
    }

    // 9. Filter out private jobs and jobs from private companies, UNLESS the user is the startup owning them
    const Company = require('../models/Company');
    const publicCompanies = await Company.find({ companyVisibility: { $ne: 'private' } }).select('_id');
    const publicCompanyIds = publicCompanies.map(c => c._id);

    // Default: only show jobs from public companies, and jobs that are public
    if (req.user && req.user.role === 'startup' && req.query.myJobs === 'true') {
      // If a startup specifically asks for their own jobs, only return theirs (including private)
      filterQuery.companyId = req.user.companyId;
    } else {
      filterQuery.companyId = { $in: publicCompanyIds };
      filterQuery.jobVisibility = { $ne: 'private' };
    }

    // Fetch jobs matching the dynamic query
    const jobs = await Job.find(filterQuery)
      .populate('companyId', 'companyName companyEmail')
      .populate('applicants.userId', 'name email skills assessmentScore')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error inside getJobs controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving job listings'
    });
  }
};

// @desc    Create a new job posting (Startup Recruiter only)
// @route   POST /api/jobs
// @access  Private (Startup only)
const createJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, isWFH, jobType, hasStipend, location, salary, experience, company, domain, jobVisibility, inviteCode } = req.body;

    // Validate inputs
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title and description'
      });
    }

    // Create the job record in MongoDB
    const job = await Job.create({
      companyId: req.user.companyId,
      title,
      description,
      requiredSkills: requiredSkills || [],
      isWFH: isWFH === true || isWFH === 'true',
      jobType: jobType || 'Full-Time',
      hasStipend: hasStipend === true || hasStipend === 'true',
      location: location || 'Remote',
      salary: salary || 'Unspecified',
      experience: experience || 'Freshers welcome',
      company: company || req.user.name || '',
      domain: domain || 'Software Engineering',
      jobVisibility: jobVisibility || 'public',
      inviteCode: jobVisibility === 'private' ? (inviteCode || generateInviteCode()) : null
    });

    // Job Alerts for Public Jobs
    if (job.jobVisibility !== 'private' && job.requiredSkills && job.requiredSkills.length > 0) {
      const emailService = require('../services/emailService');
      const User = require('../models/User');
      User.find({ role: 'fresher', skills: { $in: job.requiredSkills } })
        .then(freshers => {
          freshers.forEach(fresher => {
            emailService.sendJobAlert(fresher.email, fresher.name, job)
              .catch(err => console.error('Failed to send job alert:', err));
          });
        })
        .catch(err => console.error('Failed to query freshers for job alerts:', err));
    }

    // Emit real-time global event for Freshers
    if (job.jobVisibility !== 'private') {
      const io = req.app.get('io');
      if (io) {
        // Find the populated job before emitting
        Job.findById(job._id).populate('companyId', 'companyName companyEmail').then(populatedJob => {
          io.emit('new_job_posted', populatedJob);
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error inside createJob controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating job listing'
    });
  }
};

// @desc    Delete a job posting (Startup Recruiter only)
// @route   DELETE /api/jobs/:id
// @access  Private (Startup only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.companyId && job.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this job opening'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Delete associated applications
    const Application = require('../models/Application');
    await Application.deleteMany({ jobId: req.params.id });

    return res.json({
      success: true,
      message: 'Job listing and associated applications removed successfully'
    });
  } catch (error) {
    console.error('Error inside deleteJob controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting job listing'
    });
  }
};

// @desc    Update a job posting (Startup Recruiter only)
// @route   PUT /api/jobs/:id
// @access  Private (Startup only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.companyId && job.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this job opening'
      });
    }

    const { title, description, requiredSkills, isWFH, jobType, hasStipend, location, salary, experience, company, domain, jobVisibility, inviteCode } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (isWFH !== undefined) job.isWFH = isWFH === true || isWFH === 'true';
    if (jobType) job.jobType = jobType;
    if (hasStipend !== undefined) job.hasStipend = hasStipend === true || hasStipend === 'true';
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (experience) job.experience = experience;
    if (company) job.company = company;
    if (domain) job.domain = domain;
    if (jobVisibility) {
      job.jobVisibility = jobVisibility;
      if (jobVisibility === 'private' && !job.inviteCode) {
        job.inviteCode = inviteCode || generateInviteCode();
      } else if (jobVisibility === 'public') {
        job.inviteCode = null;
      }
    }

    await job.save();

    return res.json({
      success: true,
      message: 'Job listing updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Error inside updateJob controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating job listing'
    });
  }
};

// @desc    Update job visibility explicitly
// @route   PUT /api/jobs/:id/visibility
// @access  Private (Startup only)
const updateJobVisibility = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.companyId && job.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { jobVisibility } = req.body;
    if (!jobVisibility) {
      return res.status(400).json({ success: false, message: 'Please provide jobVisibility' });
    }

    job.jobVisibility = jobVisibility;
    
    if (jobVisibility === 'private' && !job.inviteCode) {
      job.inviteCode = generateInviteCode();
    } else if (jobVisibility === 'public') {
      job.inviteCode = null;
    }

    await job.save();

    return res.json({ success: true, message: 'Job visibility updated', data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error updating job visibility' });
  }
};

// @desc    Get private job by invite code
// @route   GET /api/jobs/private/:inviteCode
// @access  Private (for users to access)
const getJobByInvite = async (req, res) => {
  try {
    const job = await Job.findOne({ inviteCode: req.params.inviteCode })
      .populate('companyId', 'companyName companyEmail companyVisibility');
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invite link' });
    }

    return res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching job by invite:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving private job' });
  }
};

// @desc    Invite a candidate to a private job
// @route   POST /api/jobs/invite
// @access  Private (Startup only)
const inviteCandidate = async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;
    
    if (!jobId || !candidateId) {
      return res.status(400).json({ success: false, message: 'Job ID and Candidate ID are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.companyId && job.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to invite to this job' });
    }

    if (job.jobVisibility !== 'private') {
      return res.status(400).json({ success: false, message: 'Cannot invite candidates to a public job directly through this method' });
    }

    // Check if candidate already invited
    if (job.invitedCandidates.some(id => id.toString() === candidateId.toString())) {
      return res.status(400).json({ success: false, message: 'Candidate is already invited to this job' });
    }

    job.invitedCandidates.push(candidateId);
    await job.save();

    // Create Notification
    const Notification = require('../models/Notification');
    const inviteNotif = await Notification.create({
      sender: req.user.id,
      receiver: candidateId,
      role: 'fresher',
      type: 'invitation',
      title: 'New Job Invitation',
      message: `You have been invited to apply for the ${job.title} role at ${job.company}.`
    });
    
    if (req.app.get('io')) {
      req.app.get('io').to(candidateId.toString()).emit('receive_notification', inviteNotif);
    }

    try {
      const emailService = require('../services/emailService');
      const User = require('../models/User');
      const candidate = await User.findById(candidateId);
      if (candidate) {
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${job.inviteCode}`;
        await emailService.sendJobInvitation(candidate.email, candidate.name, {
          companyName: job.company,
          jobTitle: job.title,
          inviteCode: job.inviteCode,
          inviteLink: inviteLink
        });
      }
    } catch (emailErr) {
      console.error('Failed to send job invitation email:', emailErr);
    }

    return res.json({ success: true, message: 'Candidate invited successfully', inviteCode: job.inviteCode });
  } catch (error) {
    console.error('Error inviting candidate:', error);
    return res.status(500).json({ success: false, message: 'Server error inviting candidate' });
  }
};

// @desc    Get all jobs the user has been invited to
// @route   GET /api/jobs/my-invitations
// @access  Private (User only)
const getMyInvitations = async (req, res) => {
  try {
    const jobs = await Job.find({ invitedCandidates: req.user.id })
      .populate('companyId', 'companyName companyEmail')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching my invitations:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching invitations' });
  }
};

module.exports = {
  getJobs,
  createJob,
  deleteJob,
  updateJob,
  updateJobVisibility,
  getJobByInvite,
  inviteCandidate,
  getMyInvitations
};
