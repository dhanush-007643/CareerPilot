const mongoose = require('mongoose');

const savedCandidateSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  savedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // the specific recruiter who saved them
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a company can only save a specific candidate once
savedCandidateSchema.index({ companyId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('SavedCandidate', savedCandidateSchema);
