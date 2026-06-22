const fs = require('fs');
const path = require('path');

// Simulated email logging helper
const logEmail = (to, subject, body) => {
  const timestamp = new Date().toISOString();
  const logDir = path.join(__dirname, '../logs');
  const logFile = path.join(logDir, 'emails.log');

  const logMessage = `
========================================
[EMAIL SENT AT: ${timestamp}]
TO: ${to}
SUBJECT: ${subject}
BODY:
${body}
========================================
\n`;

  // Print to console for immediate visibility during testing
  console.log(`[SIMULATED EMAIL] Sent to ${to} with subject: "${subject}"`);

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error('Failed to write email log to file:', err.message);
  }
};

let transporter = null;
try {
  const nodemailer = require('nodemailer');
  // If env variables for SMTP exist, configure transport
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Nodemailer SMTP transporter initialized successfully.');
  }
} catch (e) {
  // Nodemailer not installed, falling back to simulated mail delivery
  console.log('Nodemailer not available. Email notifications will be logged to backend/logs/emails.log.');
}

/**
 * Send an email alert
 * @param {string} to Receiver email address
 * @param {string} subject Email subject
 * @param {string} body Plain text or HTML body content
 */
const sendMail = async (to, subject, body) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"CareerPilot Notifications" <noreply@careerpilot.com>',
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      });
      console.log(`Email successfully delivered via SMTP to ${to}`);
      return;
    } catch (err) {
      console.error(`Failed to send email via SMTP to ${to}, falling back to log simulator:`, err.message);
    }
  }

  // Fallback / simulation mode
  logEmail(to, subject, body);
};

/**
 * Triggered when candidate submits application
 */
const sendApplicationEmail = async (candidateEmail, candidateName, jobTitle, companyName, companyEmail) => {
  // To Candidate
  const candidateBody = `Hi ${candidateName},

Thank you for applying for the position of "${jobTitle}" at ${companyName}. 
Your application has been received and the hiring team will review it shortly. You can track your match percentage and ATS stage directly inside your CareerPilot dashboard.

Best of luck!
The CareerPilot Team`;
  await sendMail(candidateEmail, `Application Received: ${jobTitle} at ${companyName}`, candidateBody);

  // To Company Recruiter
  const recruiterBody = `Hi Hiring Team,

A new application has been submitted by "${candidateName}" for your vacancy: "${jobTitle}".
Log in to your CareerPilot Startup Command Center to view their matching score, resume details, and cover letter.

Regards,
CareerPilot ATS System`;
  if (companyEmail) {
    await sendMail(companyEmail, `New Application: ${candidateName} - ${jobTitle}`, recruiterBody);
  }
};

/**
 * Triggered when interview is scheduled
 */
const sendInterviewAlert = async (candidateEmail, candidateName, jobTitle, companyName, dateTime, format, link, notes) => {
  const body = `Hi ${candidateName},

Great news! ${companyName} has scheduled an interview with you for the "${jobTitle}" position.

Details of your interview:
- Date & Time: ${new Date(dateTime).toLocaleString()}
- Format: ${format}
- Interview Link/Location: ${link || 'To be shared'}
- Recruiter Notes: ${notes || 'No extra notes provided.'}

Please ensure you join on time and have a stable internet connection.

Best regards,
The CareerPilot Team`;

  await sendMail(candidateEmail, `Interview Scheduled: ${jobTitle} at ${companyName}`, body);
};

/**
 * Triggered when application status changes
 */
const sendStatusUpdateAlert = async (candidateEmail, candidateName, jobTitle, companyName, status) => {
  const body = `Hi ${candidateName},

Your application status for "${jobTitle}" at ${companyName} has been updated.

New Status: ${status}

Please log in to your CareerPilot Candidate Console to review the status update and track next steps.

Best regards,
The CareerPilot Team`;

  await sendMail(candidateEmail, `Application Update: ${jobTitle} at ${companyName}`, body);
};

module.exports = {
  sendApplicationEmail,
  sendInterviewAlert,
  sendStatusUpdateAlert
};
