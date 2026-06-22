const Report = require('../models/Report');
const User = require('../models/User');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporterId', 'name email').populate('reportedId', 'name email');
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNotes }, { new: true });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getReports,
  resolveReport
};
