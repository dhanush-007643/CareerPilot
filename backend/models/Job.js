const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  isWFH: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['Full-Time', 'Internship'],
    default: 'Full-Time'
  },
  hasStipend: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: 'Remote'
  },
  salary: {
    type: String,
    default: 'Unspecified'
  },
  experience: {
    type: String,
    default: 'Freshers welcome'
  },
  domain: {
    type: String,
    default: 'Software Engineering',
    index: true
  },
  company: {
    type: String,
    default: ''
  },
  jobVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  inviteCode: {
    type: String,
    default: null
  },
  invitedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applicants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      referralCode: {
        type: String,
        default: ''
      },
      appliedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

jobSchema.index({ companyId: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobVisibility: 1 });
jobSchema.index({ jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);
