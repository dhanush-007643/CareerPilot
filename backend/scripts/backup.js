const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const Notification = require('../models/Notification');

const runBackup = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';
  const backupDir = path.join(__dirname, '../backups');

  try {
    console.log('Connecting to MongoDB for backup...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }
    console.log('Connection established.');

    // Fetch data from collections
    const users = await User.find({});
    const jobs = await Job.find({});
    const applications = await Application.find({});
    const quizzes = await Quiz.find({});
    const scores = await Score.find({});
    const notifications = await Notification.find({});

    const backupData = {
      timestamp: new Date().toISOString(),
      metadata: {
        users: users.length,
        jobs: jobs.length,
        applications: applications.length,
        quizzes: quizzes.length,
        scores: scores.length,
        notifications: notifications.length
      },
      collections: {
        users,
        jobs,
        applications,
        quizzes,
        scores,
        notifications
      }
    };

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    console.log(`[BACKUP SUCCESS] Saved database backup to: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('[BACKUP FAILED] Error backing up user data:', error.message);
    throw error;
  } finally {
    // Only close if we opened a new connection inside this script execution
    if (require.main === module) {
      mongoose.connection.close();
    }
  }
};

// If executed directly
if (require.main === module) {
  runBackup().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { runBackup };
