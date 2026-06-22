const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Common styling for all emails
const brandStyles = `
  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #0b1120;
    color: #f8fafc;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .header {
    background-color: #0b1120;
    padding: 30px;
    text-align: center;
    border-bottom: 2px solid #06b6d4; /* Cyan Glow */
  }
  .logo {
    color: #eab308; /* Gold Accent */
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
  }
  .content {
    padding: 30px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  .title {
    color: #eab308;
    font-size: 22px;
    margin-top: 0;
    margin-bottom: 20px;
  }
  .button {
    display: inline-block;
    background-color: #06b6d4;
    color: #ffffff;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    margin-top: 20px;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  }
  .footer {
    background-color: #0b1120;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid #1e293b;
  }
  .highlight {
    color: #06b6d4;
    font-weight: 600;
  }
  .data-box {
    background-color: #0b1120;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #1e293b;
    margin: 15px 0;
  }
`;

const generateHtml = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${brandStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">CareerPilot</h1>
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CareerPilot. Connecting Fresher Talents with Disruptive Startups.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper to send emails
const sendMail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials missing. Simulating email send to:', to);
      return { success: true, simulated: true };
    }
    const info = await transporter.sendMail({
      from: `"CareerPilot" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Module 2: Company Registration Emails
exports.sendAdminCompanyRegistrationAlert = async (adminEmail, companyData) => {
  const content = `
    <p>A new company has requested registration on CareerPilot.</p>
    <div class="data-box">
      <p><strong>Company Name:</strong> ${companyData.name}</p>
      <p><strong>Email:</strong> ${companyData.email}</p>
      <p><strong>Industry:</strong> ${companyData.industry}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <p>Please log in to the admin dashboard to review this request.</p>
  `;
  return sendMail(adminEmail, 'New Company Registration Request', generateHtml('New Registration Request', content));
};

exports.sendCompanyRegistrationPending = async (companyEmail, companyName) => {
  const content = `
    <p>Hello <strong>${companyName}</strong>,</p>
    <p>Your company registration request is currently under review by our administration team.</p>
    <p>Status: <span class="highlight">Pending Approval</span></p>
    <p>We will notify you once your account has been approved. Thank you for choosing CareerPilot!</p>
  `;
  return sendMail(companyEmail, 'Registration Submitted Successfully', generateHtml('Registration Pending', content));
};

// Module 3: Company Approval Emails
exports.sendCompanyApproval = async (companyEmail, companyName, approved) => {
  if (approved) {
    const content = `
      <p>Congratulations <strong>${companyName}</strong>!</p>
      <p>Your company account has been <span class="highlight">approved</span>.</p>
      <p>You can now:</p>
      <ul>
        <li>Post Jobs</li>
        <li>Search Candidates</li>
        <li>Manage ATS</li>
      </ul>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth" class="button">Log In Now</a>
    `;
    return sendMail(companyEmail, 'Company Account Approved', generateHtml('Welcome to CareerPilot', content));
  } else {
    const content = `
      <p>Hello <strong>${companyName}</strong>,</p>
      <p>Unfortunately, your registration request has been rejected at this time.</p>
      <p>If you believe this is a mistake, please contact our support team.</p>
    `;
    return sendMail(companyEmail, 'Company Registration Rejected', generateHtml('Registration Update', content));
  }
};

// Module 4: Public Job Alerts
exports.sendJobAlert = async (fresherEmail, fresherName, jobData) => {
  const content = `
    <p>Hello <strong>${fresherName}</strong>,</p>
    <p>A new job matching your skills has just been posted!</p>
    <div class="data-box">
      <p><strong>Company:</strong> ${jobData.companyName}</p>
      <p><strong>Role:</strong> ${jobData.title}</p>
      <p><strong>Salary:</strong> ${jobData.salary || 'Not specified'}</p>
      <p><strong>Skills Required:</strong> ${jobData.skills.join(', ')}</p>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/fresher/jobs/${jobData._id}" class="button">Apply Now</a>
  `;
  return sendMail(fresherEmail, 'New Job Opportunity', generateHtml('Job Match Found!', content));
};

// Module 5: Private Job Invitation Emails
exports.sendJobInvitation = async (candidateEmail, candidateName, inviteData) => {
  const content = `
    <p>Hello <strong>${candidateName}</strong>,</p>
    <p>You have been exclusively invited to apply for a private job position.</p>
    <div class="data-box">
      <p><strong>Company:</strong> ${inviteData.companyName}</p>
      <p><strong>Role:</strong> ${inviteData.jobTitle}</p>
      <p><strong>Invite Code:</strong> <span style="font-family: monospace; font-size: 18px; color: #06b6d4;">${inviteData.inviteCode}</span></p>
    </div>
    <a href="${inviteData.inviteLink}" class="button">View Private Invite</a>
  `;
  return sendMail(candidateEmail, 'Exclusive Job Invitation', generateHtml('Exclusive Invitation', content));
};

// Module 6 & 7: Application & ATS Emails
exports.sendApplicationSubmittedFresher = async (fresherEmail, fresherName, appData) => {
  const content = `
    <p>Hello <strong>${fresherName}</strong>,</p>
    <p>Your application for <strong>${appData.jobTitle}</strong> at <strong>${appData.companyName}</strong> has been successfully submitted.</p>
    <div class="data-box">
      <p><strong>Match Score:</strong> ${appData.matchPercentage}%</p>
      <p><strong>Status:</strong> <span class="highlight">${appData.status}</span></p>
    </div>
    <p>You can track your application status in your Fresher Dashboard.</p>
  `;
  return sendMail(fresherEmail, 'Application Submitted Successfully', generateHtml('Application Received', content));
};

exports.sendApplicationReceivedCompany = async (companyEmail, appData) => {
  const content = `
    <p>You have received a new application for the <strong>${appData.jobTitle}</strong> position.</p>
    <div class="data-box">
      <p><strong>Candidate:</strong> ${appData.candidateName}</p>
      <p><strong>Match Score:</strong> ${appData.matchPercentage}%</p>
      <p><strong>Top Skills:</strong> ${appData.skills.join(', ')}</p>
    </div>
    <p>Review the application in your Startup Dashboard.</p>
  `;
  return sendMail(companyEmail, 'New Job Application Received', generateHtml('New Candidate Alert', content));
};

exports.sendApplicationStatusUpdate = async (fresherEmail, fresherName, appData) => {
  let statusMessage = `Your application status for <strong>${appData.jobTitle}</strong> at <strong>${appData.companyName}</strong> has been updated.`;
  
  if (appData.status === 'Shortlisted') {
    statusMessage = `Great news! Your application for <strong>${appData.jobTitle}</strong> at <strong>${appData.companyName}</strong> has been shortlisted.`;
  } else if (appData.status === 'Hired') {
    statusMessage = `Congratulations! You have been hired for the <strong>${appData.jobTitle}</strong> position at <strong>${appData.companyName}</strong>.`;
  }

  const content = `
    <p>Hello <strong>${fresherName}</strong>,</p>
    <p>${statusMessage}</p>
    <div class="data-box">
      <p><strong>New Status:</strong> <span class="highlight">${appData.status}</span></p>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/fresher/tracker" class="button">View Tracker</a>
  `;
  return sendMail(fresherEmail, 'Application Status Update', generateHtml('Status Update', content));
};

// Module 8: Interview Scheduling Emails
exports.sendInterviewScheduled = async (fresherEmail, fresherName, interviewData) => {
  const content = `
    <p>Hello <strong>${fresherName}</strong>,</p>
    <p>An interview has been scheduled for your application at <strong>${interviewData.companyName}</strong>.</p>
    <div class="data-box">
      <p><strong>Date:</strong> ${new Date(interviewData.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${interviewData.time}</p>
      <p><strong>Mode:</strong> ${interviewData.mode}</p>
      ${interviewData.meetingLink ? `<p><strong>Link/Location:</strong> <a style="color: #06b6d4;" href="${interviewData.meetingLink}">${interviewData.meetingLink}</a></p>` : ''}
    </div>
    <p>Please log in to your dashboard to Accept, Reject, or Reschedule this interview.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/fresher/tracker" class="button">Manage Interview</a>
  `;
  return sendMail(fresherEmail, 'Interview Scheduled', generateHtml('Interview Invitation', content));
};

// Module 9: Follow Company Emails
exports.sendNewFollowerAlert = async (companyEmail, companyName, fresherData) => {
  const content = `
    <p>Hello <strong>${companyName}</strong>,</p>
    <p>You have a new follower on your company profile!</p>
    <div class="data-box">
      <p><strong>Name:</strong> ${fresherData.name}</p>
      <p><strong>Skills:</strong> ${fresherData.skills ? fresherData.skills.join(', ') : 'Not specified'}</p>
    </div>
  `;
  return sendMail(companyEmail, 'New Company Follower', generateHtml('New Follower Alert', content));
};

// Module 10: Certificate Emails
exports.sendCertificate = async (fresherEmail, fresherName, certData) => {
  const content = `
    <p>Hello <strong>${fresherName}</strong>,</p>
    <p>Congratulations on successfully completing your assessment!</p>
    <div class="data-box">
      <p><strong>Assessment:</strong> ${certData.assessmentName}</p>
      <p><strong>Score:</strong> ${certData.score}%</p>
    </div>
    <p>Your official CareerPilot certificate has been generated.</p>
    <a href="${certData.downloadLink}" class="button">Download Certificate</a>
  `;
  return sendMail(fresherEmail, 'Certificate Generated Successfully', generateHtml('Assessment Passed', content));
};

// Module 11: Password Reset Emails
exports.sendPasswordReset = async (userEmail, resetData) => {
  const content = `
    <p>We received a request to reset your password.</p>
    <p>Click the button below to set a new password. This link will expire in ${resetData.expiresIn || '1 hour'}.</p>
    <a href="${resetData.resetLink}" class="button">Reset Password</a>
    <p style="margin-top: 20px; font-size: 12px;">If you did not request this, please ignore this email.</p>
  `;
  return sendMail(userEmail, 'Password Reset Request', generateHtml('Password Reset', content));
};
