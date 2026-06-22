const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Quiz = require('./models/Quiz');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB().then(() => {
  // Seed initial quizzes if db is empty
  seedQuizzes();
  // Seed full database if empty
  seedFullDatabaseIfEmpty();
});

// Custom Security Middlewares (NFRs: Security & Protection against SQL/NoSQL Injection and XSS)
const mongoSanitize = (req, res, next) => {
  const sanitizeObj = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitizeObj(obj[key]);
        }
      }
    }
  };
  sanitizeObj(req.body);
  sanitizeObj(req.query);
  sanitizeObj(req.params);
  next();
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible to routers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', (data) => {
    io.to(data.receiverId).emit('receive_message', data);
    if (data.senderId) {
      io.to(data.senderId).emit('receive_message', data);
    }
  });

  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(securityHeaders);
app.use(mongoSanitize);
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/support-chat', require('./routes/supportChat'));
app.use('/api/followers', require('./routes/followers'));
app.use('/api/invitations', require('./routes/invitations'));

// Trigger automated backup on startup
setTimeout(async () => {
  try {
    const { runBackup } = require('./scripts/backup');
    await runBackup();
    console.log('Automated database startup backup succeeded.');
  } catch (err) {
    console.error('Automated startup backup failed:', err.message);
  }
}, 5000);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CareerPilot API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});

// Database seeding logic for testing
async function seedQuizzes() {
  try {
    const quizCount = await Quiz.countDocuments();
    if (quizCount > 0) {
      console.log('Quizzes already present in database. Skipping seed.');
      return;
    }

    const sampleQuizzes = [
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
    ];

    await Quiz.create(sampleQuizzes);
    console.log('Successfully seeded database with 3 technical quizzes.');
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  }
}

// Automatically seed users, jobs, applications, quizzes, scores if no users are in DB
async function seedFullDatabaseIfEmpty() {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No user accounts found in MongoDB. Automatically seeding initial demo data...');
      const { runSeeder } = require('./utils/seeder');
      await runSeeder();
      console.log('Initial demo database seeded successfully with Startup (Google DeepMind) and Fresher (Alex Mercer) records!');
    } else {
      console.log('Users already exist in MongoDB. Skipping database auto-seeding.');
    }
  } catch (error) {
    console.error('Failed to run automatic database seeder:', error);
  }
}
