const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  referralCode: {
    type: String,
    default: ''
  },
  applicationVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  matchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'New', 'Interviewing', 'Hired'],
    default: 'Applied'
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resume: {
    fileName: { type: String, default: '' },
    fileContent: { type: String, default: '' }, // Base64
    fileUrl: { type: String, default: '' }
  },
  interview: {
    dateTime: { type: Date },
    format: { type: String, default: 'Virtual' }, // e.g., 'Virtual' or 'In-person'
    link: { type: String, default: '' },
    notes: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
