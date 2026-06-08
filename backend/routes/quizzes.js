const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all quizzes (MCQ details, but exclude correctAnswers to prevent client-side cheating)
// @route   GET /api/quizzes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find();

    // Map through quizzes and remove correct answers to prevent cheaters from looking at response payload
    const sanitizedQuizzes = quizzes.map((quiz) => {
      const questions = quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options
      }));
      return {
        _id: quiz._id,
        title: quiz.title,
        questions
      };
    });

    return res.json({ success: true, count: sanitizedQuizzes.length, data: sanitizedQuizzes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Submit quiz answers, grade them, and save score
// @route   POST /api/quizzes/submit
// @access  Private (Fresher only)
router.post('/submit', protect, authorize('fresher'), async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers is expected to be an object: { questionId: selectedOptionText }

    if (!quizId || !answers) {
      return res.status(400).json({ success: false, message: 'Please provide quiz ID and your answers' });
    }

    // Retrieve quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Evaluate answers
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question._id.toString()];
      // Check if user answer matches correct answer (case-insensitive trim compare)
      if (
        userAnswer &&
        userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()
      ) {
        correctCount++;
      }
    });

    // Calculate score percentage
    const finalPercentage = Math.round((correctCount / totalQuestions) * 100);

    // Save score to database
    const scoreRecord = await Score.create({
      userId: req.user.id,
      quizId: quiz._id,
      score: finalPercentage
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted and graded successfully',
      data: {
        scoreId: scoreRecord._id,
        score: finalPercentage,
        correctCount,
        totalQuestions
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get current user scores
// @route   GET /api/quizzes/scores
// @access  Private (Fresher only)
router.get('/scores', protect, authorize('fresher'), async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user.id })
      .populate('quizId', 'title')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: scores });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
