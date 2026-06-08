const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Quiz = require('./models/Quiz');

// Load environment variables
dotenv.config();

// Connect to MongoDB database
connectDB().then(() => {
  // Seed initial quizzes if db is empty
  seedQuizzes();
});

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/quizzes', require('./routes/quizzes'));

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

app.listen(PORT, () => {
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
