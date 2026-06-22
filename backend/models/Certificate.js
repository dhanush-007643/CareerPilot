const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  scoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score',
    required: true
  },
  certificateUrl: {
    type: String,
    required: true // URL to AWS S3
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
