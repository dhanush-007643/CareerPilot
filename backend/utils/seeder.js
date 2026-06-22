const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const Notification = require('../models/Notification');

const runSeeder = async () => {
  // 1. Clean existing records
  await User.deleteMany({});
  await Company.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});
  await Quiz.deleteMany({});
  await Score.deleteMany({});
  await Notification.deleteMany({});

  // 2. Seed Technical Quizzes
  const quizzes = await Quiz.create([
    {
      title: 'React.js Fundamentals',
      questions: [
        {
          questionText: 'Which React hook is used to manage component state?',
          options: ['useEffect', 'useState', 'useContext', 'useRef'],
          correctAnswer: 'useState'
        },
        {
          questionText: 'What is the correct way to pass data from a parent to a child component?',
          options: ['Using state', 'Using props', 'Using Redux', 'Using localStorage'],
          correctAnswer: 'Using props'
        },
        {
          questionText: 'Which lifecycle event does useEffect with an empty dependency array [] emulate?',
          options: ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'render'],
          correctAnswer: 'componentDidMount'
        },
        {
          questionText: 'What does JSX stand for?',
          options: ['JavaScript Extension', 'JavaScript XML', 'Java Syntax Extension', 'JSON XML'],
          correctAnswer: 'JavaScript XML'
        }
      ]
    },
    {
      title: 'Node.js & Express Essentials',
      questions: [
        {
          questionText: 'Which built-in Node.js module handles file operations?',
          options: ['path', 'http', 'fs', 'os'],
          correctAnswer: 'fs'
        },
        {
          questionText: 'What does the app.use() function do in an Express application?',
          options: [
            'Binds middleware to the application instance',
            'Serves static pages only',
            'Defines a specific database connection',
            'Exits the application process'
          ],
          correctAnswer: 'Binds middleware to the application instance'
        },
        {
          questionText: 'Which Express route parameter definition parses a path variable named "id"?',
          options: ['/users/:id', '/users/?id', '/users/{id}', '/users/id'],
          correctAnswer: '/users/:id'
        },
        {
          questionText: 'What is NPM?',
          options: [
            'Node Project Manager',
            'Node Package Manager',
            'New Package Module',
            'Network Protocol Manager'
          ],
          correctAnswer: 'Node Package Manager'
        }
      ]
    },
    {
      title: 'Modern CSS & Tailwind CSS',
      questions: [
        {
          questionText: 'How do you apply custom colors or fonts in a Tailwind CSS project?',
          options: [
            'Modify tailwind.config.js',
            'Edit index.html directly',
            'Override styles in global.css with !important',
            'Tailwind does not support custom styles'
          ],
          correctAnswer: 'Modify tailwind.config.js'
        },
        {
          questionText: 'Which Tailwind utility class is used to make a container a flexbox?',
          options: ['flex-container', 'display-flex', 'flex', 'layout-flex'],
          correctAnswer: 'flex'
        },
        {
          questionText: 'What does the class "md:grid-cols-3" mean in Tailwind CSS?',
          options: [
            'The grid has 3 columns on medium screens and larger',
            'The grid has 3 columns on mobile screens only',
            'The grid has 3 rows on medium screens and larger',
            'Grid column widths are multiplied by 3'
          ],
          correctAnswer: 'The grid has 3 columns on medium screens and larger'
        }
      ]
    }
  ]);

  // 3. Seed Users
  const adminUser = await User.create({
    name: 'CareerPilot Administrator',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    personalInfo: {
      phone: '+1 (555) 999-0000',
      bio: 'Super Administrator account for overseeing recruiter pipelines and fresher job updates.',
      location: 'CareerPilot HQ'
    }
  });

  const startupUser = await User.create({
    name: 'DeepMind HR',
    email: 'startup@example.com',
    password: 'password123',
    role: 'startup',
    companyRole: 'Admin',
    personalInfo: {
      phone: '+44 20 7600 0000',
      bio: 'HR Manager at Google DeepMind.',
      location: 'London, UK / Remote'
    }
  });

  const startupCompany = await Company.create({
    companyName: 'Google DeepMind',
    companyEmail: 'contact@deepmind.com',
    website: 'https://deepmind.google',
    industry: 'Artificial Intelligence',
    companySize: '500+',
    description: 'We build next-generation artificial intelligence systems to solve science and technology challenges.',
    companyVisibility: 'public',
    companyCode: 'DEEPMIND123',
    createdBy: startupUser._id,
    status: 'approved'
  });

  startupUser.companyId = startupCompany._id;
  await startupUser.save();



  const fresherUser = await User.create({
    name: 'Alex Mercer',
    email: 'fresher@example.com',
    password: 'password123',
    role: 'fresher',
    skills: ['React.js', 'Node.js', 'Express', 'Tailwind CSS', 'JavaScript', 'MongoDB'],
    personalInfo: {
      phone: '+1 (555) 123-4567',
      bio: 'Enthusiastic full-stack web developer passionate about AI integrations and MERN web applications.',
      location: 'San Francisco, CA'
    },
    educationDetails: [
      {
        school: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: '2022',
        endYear: '2026'
      }
    ],
    experienceDetails: [
      {
        title: 'Frontend Intern',
        company: 'AI Solutions Inc.',
        location: 'Remote',
        startDate: 'June 2025',
        endDate: 'August 2025',
        description: 'Developed and optimized client-facing dashboards using React and CSS Grid.'
      }
    ]
  });

  // 4. Seed Scores
  await Score.create([
    {
      userId: fresherUser._id,
      quizId: quizzes[0]._id,
      score: 95,
      certificateUrl: `mock_certificate_for_${quizzes[0]._id}`
    },
    {
      userId: fresherUser._id,
      quizId: quizzes[1]._id,
      score: 90,
      certificateUrl: `mock_certificate_for_${quizzes[1]._id}`
    }
  ]);

  // 5. Seed Jobs
  const jobs = await Job.create([
    {
      companyId: startupCompany._id,
      title: 'Full Stack Engineer (MERN)',
      description: 'We are seeking an outstanding Full Stack Engineer to help build our Next-Generation Research platforms. You will design, develop, and integrate user interfaces with complex backends.',
      requiredSkills: ['React.js', 'Node.js', 'Express', 'Tailwind CSS'],
      isWFH: true,
      jobType: 'Full-Time',
      hasStipend: false,
      location: 'Remote / London',
      salary: '$120,000 - $145,000',
      experience: 'Freshers welcome',
      company: 'Google DeepMind',
      domain: 'Software Engineering',
      applicants: []
    },
    {
      companyId: startupCompany._id,
      title: 'React UI Developer',
      description: 'Help build premium user interfaces with modern glassmorphism design, advanced tailwind themes, and custom animations.',
      requiredSkills: ['React.js', 'Tailwind CSS', 'JavaScript'],
      isWFH: false,
      jobType: 'Internship',
      hasStipend: true,
      location: 'London, UK',
      salary: '£3,500 / month',
      experience: 'Freshers welcome',
      company: 'Google DeepMind',
      domain: 'UI/UX Design',
      applicants: []
    }
  ]);

  // 6. Seed Applications
  const app1 = await Application.create({
    userId: fresherUser._id,
    jobId: jobs[0]._id,
    referralCode: 'DEEPMIND-CAMPUS-99',
    matchPercentage: 100,
    status: 'New',
    coverLetter: 'I am highly passionate about Artificial Intelligence and web application interfaces. I have build several full stack projects and solved complex challenges in your training arena.',
    resume: {
      fileName: 'alex_mercer_resume.pdf',
      fileContent: 'Mock base64 PDF resume content',
      fileUrl: 'https://careerpilot.s3.amazonaws.com/resumes/alex_mercer.pdf'
    }
  });

  jobs[0].applicants.push({
    userId: fresherUser._id,
    referralCode: 'DEEPMIND-CAMPUS-99'
  });
  await jobs[0].save();

  const app2 = await Application.create({
    userId: fresherUser._id,
    jobId: jobs[1]._id,
    referralCode: '',
    matchPercentage: 100,
    status: 'Interviewing',
    coverLetter: 'Vibrant colors, glassmorphic UI, and smooth animations are my expertise. I would love to build top-tier frontends for your research group.',
    resume: {
      fileName: 'alex_mercer_resume.pdf',
      fileContent: 'Mock base64 PDF resume content',
      fileUrl: 'https://careerpilot.s3.amazonaws.com/resumes/alex_mercer.pdf'
    },
    interview: {
      dateTime: new Date(Date.now() + 86400000 * 2),
      format: 'Virtual',
      link: 'https://meet.google.com/abc-defg-hij',
      notes: 'Technical panel interview on React styling, animations and layouts.'
    }
  });

  jobs[1].applicants.push({
    userId: fresherUser._id,
    referralCode: ''
  });
  await jobs[1].save();

  // 7. Seed Notifications
  await Notification.create([
    {
      userId: fresherUser._id,
      title: 'Welcome to CareerPilot!',
      message: 'Take a technical quiz in our training arena to boost your profile match percentage.',
      type: 'system',
      isRead: false
    },
    {
      userId: fresherUser._id,
      title: 'Interview Alert',
      message: 'Your interview for "React UI Developer" at Google DeepMind has been scheduled.',
      type: 'interview_scheduled',
      isRead: false
    },
    {
      userId: startupUser._id,
      title: 'Welcome to Recruiter Portal',
      message: 'Post custom vacancies and watch candidate match grades auto-compute.',
      type: 'system',
      isRead: true
    }
  ]);

  return {
    success: true,
    startup: { email: startupUser.email, name: startupUser.name },
    fresher: { email: fresherUser.email, name: fresherUser.name },
    admin: { email: adminUser.email, name: adminUser.name }
  };
};

module.exports = { runSeeder };
