const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  companyEmail: {
    type: String,
    required: [true, 'Please add a company email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: 'Technology'
  },
  companySize: {
    type: String,
    default: '1-10'
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: '' // Could be base64 or URL
  },
  companyCode: {
    type: String,
    unique: true,
    required: true
  },
  companyVisibility: {
    type: String,
    enum: ['public', 'private', 'invite_only', 'campus_specific'],
    default: 'public'
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  allowedCampuses: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  jobsPosted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pendingEmployees: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      designation: String,
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  invitations: [
    {
      email: String,
      role: String,
      token: String,
      invitedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  savedCandidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
