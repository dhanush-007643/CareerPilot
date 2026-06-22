const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

const getAnalytics = async (req, res) => {
  try {
    const fresherCount = await User.countDocuments({ role: 'fresher' });
    const startupCount = await User.countDocuments({ role: 'startup' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    const jobCount = await Job.countDocuments();
    const appCount = await Application.countDocuments();
    const hiredCount = await Application.countDocuments({ status: 'Hired' });
    const interviewCount = await Interview.countDocuments();

    // Mock time-series data for User Growth
    const userGrowth = [
      { month: 'Jan', freshers: 120, startups: 10 },
      { month: 'Feb', freshers: 150, startups: 15 },
      { month: 'Mar', freshers: 200, startups: 22 },
      { month: 'Apr', freshers: 280, startups: 30 },
      { month: 'May', freshers: 390, startups: 45 },
      { month: 'Jun', freshers: 500, startups: 60 },
    ];

    // Job Growth
    const jobGrowth = [
      { month: 'Jan', jobs: 40 },
      { month: 'Feb', jobs: 65 },
      { month: 'Mar', jobs: 90 },
      { month: 'Apr', jobs: 150 },
      { month: 'May', jobs: 210 },
      { month: 'Jun', jobs: 300 },
    ];

    res.json({
      success: true,
      data: {
        cards: {
          totalFreshers: fresherCount,
          totalCompanies: startupCount,
          totalJobs: jobCount,
          totalApplications: appCount,
          totalInterviews: interviewCount,
          totalHires: hiredCount,
          activeUsers: fresherCount + startupCount,
          pendingApprovals: 0
        },
        userGrowth,
        jobGrowth
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating analytics' });
  }
};

module.exports = {
  getAnalytics
};
