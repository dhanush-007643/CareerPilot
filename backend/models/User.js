const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['fresher', 'startup', 'admin'],
    default: 'fresher'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  companyVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  companyRole: {
    type: String,
    enum: ['Admin', 'Recruiter', 'HR Manager', 'Interviewer'],
    default: null
  },
  skills: {
    type: [String],
    default: []
  },
  personalInfo: {
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    headline: { type: String, default: '' }
  },
  educationDetails: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startYear: String,
      endYear: String
    }
  ],
  experienceDetails: [
    {
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String
    }
  ],
  resume: {
    fileName: { type: String },
    fileContent: { type: String }, // base64 encoded file data
    fileUrl: { type: String },
    uploadedAt: { type: Date }
  },
  projects: [
    {
      title: String,
      description: String,
      stack: [String],
      link: String
    }
  ],
  certificates: [
    {
      title: String,
      issuer: String,
      score: String,
      link: String
    }
  ],
  assessmentScore: {
    type: Number,
    default: 0
  },
  followingCompanies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.index({ role: 1 });
userSchema.index({ visibility: 1 });

// Encypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
