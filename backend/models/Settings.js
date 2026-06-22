const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'CareerPilot' },
  emailSettings: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: String, default: '' },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' }
  },
  notificationSettings: {
    enableEmailAlerts: { type: Boolean, default: true },
    enableInAppAlerts: { type: Boolean, default: true }
  },
  securitySettings: {
    requireEmailVerification: { type: Boolean, default: false },
    maxLoginAttempts: { type: Number, default: 5 }
  },
  assessmentSettings: {
    defaultPassingScore: { type: Number, default: 70 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
