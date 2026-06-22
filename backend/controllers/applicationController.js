const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job posting (Student / Fresher only)
// @route   POST /api/applications/apply
// @access  Private (Fresher only)
const applyForJob = async (req, res) => {
  try {
    const { jobId, referralCode, coverLetter, resume, applicationVisibility } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job ID'
      });
    }

    // 1. Verify that the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // 2. Check if user has already applied
    const alreadyApplied = await Application.findOne({
      userId: req.user.id,
      jobId
    });
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Retrieve fresh user details to check skills and resume fallback
    const user = await User.findById(req.user.id);

    // 3. Calculate match percentage (Case-insensitive intersection)
    let matchPercentage = 100;
    if (job.requiredSkills && job.requiredSkills.length > 0) {
      const jobSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
      const userSkills = (user.skills || []).map(s => s.toLowerCase().trim());

      const intersection = jobSkills.filter(skill => userSkills.includes(skill));
      matchPercentage = Math.round((intersection.length / job.requiredSkills.length) * 100);
    }

    // Fallback resume if not explicitly sent during application
    const applicationResume = {
      fileName: resume?.fileName || user.resume?.fileName || '',
      fileContent: resume?.fileContent || user.resume?.fileContent || '',
      fileUrl: resume?.fileUrl || user.resume?.fileUrl || ''
    };

    // 4. Save the Application in database
    const application = await Application.create({
      userId: req.user.id,
      jobId,
      referralCode: referralCode || '',
      matchPercentage,
      status: 'Applied',
      coverLetter: coverLetter || '',
      resume: applicationResume,
      applicationVisibility: applicationVisibility || 'public'
    });

    // 4.5. Update global profile visibility if public
    if (applicationVisibility === 'public') {
      await User.findByIdAndUpdate(req.user.id, { visibility: 'public' });
    }

    // 5. Update the Job's applicants array for backwards compatibility
    job.applicants.push({
      userId: req.user.id,
      referralCode: referralCode || ''
    });
    await job.save();

    // Trigger notifications
    try {
      const Notification = require('../models/Notification');
      const emailService = require('../services/emailService');

      // 1. Notify Candidate (fresher)
      const fresherNotif = await Notification.create({
        sender: null,
        receiver: req.user.id,
        role: 'fresher',
        title: 'Application Submitted',
        message: `You successfully applied for the "${job.title}" position at "${job.company || 'Startup'}".`,
        type: 'application_status'
      });
      if (req.app.get('io')) {
        req.app.get('io').to(req.user.id).emit('receive_notification', fresherNotif);
      }

      await emailService.sendApplicationSubmittedFresher(req.user.email, req.user.name, {
        jobTitle: job.title,
        companyName: job.company || 'Startup',
        matchPercentage,
        status: 'Applied'
      }).catch(err => console.error(err));

      // 2. Notify Startup Recruiters (Admins)
      const adminUsers = await User.find({ companyId: job.companyId, companyRole: 'Admin' });
      
      for (const admin of adminUsers) {
        const adminNotif = await Notification.create({
          sender: req.user.id,
          receiver: admin._id,
          role: 'startup',
          title: 'New Applicant',
          message: `"${req.user.name}" has applied for your vacancy: "${job.title}".`,
          type: 'application_status'
        });
        if (req.app.get('io')) {
          req.app.get('io').to(admin._id.toString()).emit('receive_notification', adminNotif);
        }

        await emailService.sendApplicationReceivedCompany(admin.email, {
          jobTitle: job.title,
          candidateName: req.user.name,
          matchPercentage,
          skills: user.skills || []
        }).catch(err => console.error(err));
      }
    } catch (notifError) {
      console.error('Failed to trigger application alerts:', notifError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error inside applyForJob controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing application'
    });
  }
};

// @desc    Get all applications for a job (Startup Recruiter only)
// @route   GET /api/applications/job/:jobId
// @access  Private (Startup only)
const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job exists and belongs to this recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Fetch applications, populate applicant user details, sort descending by matchPercentage
    const applications = await Application.find({ jobId })
      .populate('userId', 'name email skills personalInfo educationDetails experienceDetails resume')
      .sort({ matchPercentage: -1 });

    return res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error inside getApplicantsForJob controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
};

// @desc    Update application status (Startup Recruiter only)
// @route   PUT /api/applications/status
// @access  Private (Startup only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application ID and new status'
      });
    }

    // Validate the new status
    const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'New', 'Interviewing', 'Hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    // Find and update the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const jobObj = await Job.findById(application.jobId);
    if (!jobObj || jobObj.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Trigger notifications
    try {
      const Notification = require('../models/Notification');
      const emailService = require('../services/emailService');
      const candidateUser = await User.findById(application.userId);
      const jobObj = await Job.findById(application.jobId);

      if (candidateUser && jobObj) {
        // 1. In-app Notification
        const statusNotif = await Notification.create({
          sender: req.user.id,
          receiver: application.userId,
          role: 'fresher',
          title: 'Application Status Updated',
          message: `Your application status for "${jobObj.title}" has been updated to "${status}".`,
          type: 'application_status'
        });
        if (req.app.get('io')) {
          req.app.get('io').to(application.userId.toString()).emit('receive_notification', statusNotif);
        }

        // 2. Email alert
        await emailService.sendApplicationStatusUpdate(candidateUser.email, candidateUser.name, {
          jobTitle: jobObj.title,
          companyName: jobObj.company || 'Startup Corp',
          status
        }).catch(err => console.error('Error sending status update email:', err));
      }
    } catch (notifError) {
      console.error('Failed to trigger status update alerts:', notifError.message);
    }

    return res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error inside updateApplicationStatus controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating application status'
    });
  }
};

// @desc    Get current user's job applications (Student/Fresher only)
// @route   GET /api/applications/my
// @access  Private (Fresher only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location salary experience requiredSkills companyId',
        populate: {
          path: 'companyId',
          select: 'companyName companyEmail'
        }
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error inside getMyApplications controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your applications'
    });
  }
};

// @desc    Schedule interview for application (Startup Recruiter only)
// @route   POST /api/applications/:applicationId/schedule
// @access  Private (Startup only)
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { dateTime, format, link, notes } = req.body;

    if (!dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide interview date and time'
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.interview = {
      dateTime: new Date(dateTime),
      format: format || 'Virtual',
      link: link || '',
      notes: notes || ''
    };

    // Auto-update status to Shortlisted if it was just Applied/New
    if (application.status === 'Applied' || application.status === 'New') {
      application.status = 'Shortlisted';
    }

    await application.save();

    // Trigger notifications
    try {
      const Notification = require('../models/Notification');
      const emailService = require('../services/emailService');
      const candidateUser = await User.findById(application.userId);
      const jobObj = await Job.findById(application.jobId);

      if (candidateUser && jobObj) {
        // 1. In-app Notification
        const interviewNotif = await Notification.create({
          sender: req.user.id,
          receiver: application.userId,
          role: 'fresher',
          title: 'Interview Scheduled',
          message: `An interview has been scheduled for "${jobObj.title}" at ${jobObj.company || 'Startup'} on ${new Date(dateTime).toLocaleString()}.`,
          type: 'interview_scheduled'
        });
        if (req.app.get('io')) {
          req.app.get('io').to(application.userId.toString()).emit('receive_notification', interviewNotif);
        }

        // 2. Email alert
        await emailService.sendInterviewScheduled(candidateUser.email, candidateUser.name, {
          companyName: jobObj.company || 'Startup Corp',
          date: dateTime,
          time: new Date(dateTime).toLocaleTimeString(),
          mode: format,
          meetingLink: link
        }).catch(err => console.error('Error sending interview email:', err));
      }
    } catch (notifError) {
      console.error('Failed to trigger interview alerts:', notifError.message);
    }

    return res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application
    });
  } catch (error) {
    console.error('Error inside scheduleInterview controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error scheduling interview'
    });
  }
};

// @desc    Update application visibility explicitly
// @route   PUT /api/applications/:id/visibility
// @access  Private (Fresher only)
const updateApplicationVisibility = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    if (application.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { applicationVisibility } = req.body;
    if (!applicationVisibility) {
      return res.status(400).json({ success: false, message: 'Please provide applicationVisibility' });
    }

    application.applicationVisibility = applicationVisibility;
    await application.save();

    return res.json({ success: true, message: 'Application visibility updated', data: application });
  } catch (error) {
    console.error('Error inside updateApplicationVisibility controller:', error);
    return res.status(500).json({ success: false, message: 'Server error updating application visibility' });
  }
};

module.exports = {
  applyForJob,
  getApplicantsForJob,
  updateApplicationStatus,
  getMyApplications,
  scheduleInterview,
  updateApplicationVisibility
};
