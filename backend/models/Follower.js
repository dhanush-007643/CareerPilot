const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only follow a company once in this collection
followerSchema.index({ userId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema);
