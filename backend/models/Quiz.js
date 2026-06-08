const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please add the question text']
  },
  options: {
    type: [String],
    required: [true, 'Please add options for the question'],
    validate: [arr => arr.length >= 2, 'A question must have at least 2 options']
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please specify the correct answer option value']
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    unique: true
  },
  questions: [questionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
