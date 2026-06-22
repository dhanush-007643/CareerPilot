const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, candidateId, jobId, date, time, mode, meetingLink, notes } = req.body;
    
    // We will save it to the Application record since the frontend ApplicationTracker reads it from there
    const application = await Application.findById(applicationId);
    
    if (application) {
      application.status = 'Interviewing';
      application.interview = {
        dateTime: new Date(`${date}T${time}`),
        format: mode || 'Virtual',
        link: meetingLink || '',
        notes: notes || ''
      };
      await application.save();
    }

    // Optionally also create an Interview document if needed by other components
    const interview = await Interview.create({
      candidateId,
      companyId: req.user.id,
      jobId,
      date: new Date(date),
      time,
      mode,
      meetingLink,
      status: 'Scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule interview' });
  }
};

const getCompanyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ companyId: req.user.id })
      .populate('candidateId', 'name email profilePicture')
      .populate('jobId', 'title')
      .sort({ date: 1, time: 1 });
      
    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      { status },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update interview status' });
  }
};

module.exports = {
  scheduleInterview,
  getCompanyInterviews,
  updateInterviewStatus
};
