import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, ChevronRight, ChevronLeft, HelpCircle, CheckCircle, ArrowLeft, BarChart } from 'lucide-react';
import axios from 'axios';

const TrainingArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizId = location.state?.quizId;

  // State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Test progress states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionText }
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState(null); // { score, correctCount, totalQuestions }

  useEffect(() => {
    if (!quizId) {
      setError('No assessment selected. Please select a quiz from the dashboard.');
      setLoading(false);
      return;
    }
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/quizzes');
      if (res.data.success) {
        const found = res.data.data.find(q => q._id === quizId);
        if (found) {
          setQuiz(found);
        } else {
          setError('Selected assessment not found.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch the technical assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post('/api/quizzes/submit', {
        quizId: quiz._id,
        answers
      });

      if (res.data.success) {
        setScoreResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit quiz results.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper check if all questions are answered
  const isComplete = quiz && Object.keys(answers).length === quiz.questions.length;

  if (loading) {
    return (
      <div class="min-h-[calc(100vh-80px)] flex items-center justify-center bg-auth-pattern">
        <div class="text-textSecondary text-lg font-medium animate-pulse">Initializing testing environment...</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div class="max-w-md mx-auto mt-20 p-6 glass-panel rounded-2xl border border-white/10 text-center space-y-4 shadow-lg">
        <HelpCircle size={48} class="text-neonPurple mx-auto" />
        <h2 class="text-xl font-bold text-white">Assessment Error</h2>
        <p class="text-sm text-textSecondary">{error}</p>
        <button
          onClick={() => navigate('/fresher-dashboard')}
          class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-neonIndigo to-neonPurple rounded-lg flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  // Finished state - Score board
  if (scoreResult) {
    const isPassed = scoreResult.score >= 70;
    return (
      <div class="min-h-[calc(100vh-80px)] flex items-center justify-center bg-auth-pattern px-4 py-12">
        <div class="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl text-center space-y-6 relative overflow-hidden animate-fade-in">
          {/* Neon success bubble background */}
          <div class={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl ${isPassed ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

          <div class="mx-auto w-20 h-20 rounded-full flex items-center justify-center border bg-white/5 border-white/10 shadow-lg">
            <Award size={40} class={isPassed ? 'text-green-400' : 'text-neonPurple'} />
          </div>

          <div class="space-y-2">
            <h2 class="text-3xl font-extrabold font-display text-white">Assessment Complete!</h2>
            <p class="text-sm text-textSecondary">
              Your results for <span class="text-neonCyan font-semibold">{quiz.title}</span>
            </p>
          </div>

          {/* Large Score Number */}
          <div class="py-6 border-y border-white/5">
            <div class="text-5xl font-black text-white bg-gradient-to-r from-neonCyan via-neonIndigo to-neonPurple bg-clip-text text-transparent inline-block">
              {scoreResult.score}%
            </div>
            <p class="text-xs text-textSecondary mt-2">
              You answered <span class="text-white font-bold">{scoreResult.correctCount}</span> out of <span class="text-white font-bold">{scoreResult.totalQuestions}</span> questions correctly.
            </p>
          </div>

          {/* Success indicator text */}
          <div class="text-xs text-textSecondary leading-relaxed">
            {isPassed ? (
              <p class="text-green-400 font-semibold">
                🔥 Outstanding! Your high score will highlight your skills to startups on this platform.
              </p>
            ) : (
              <p class="text-textSecondary">
                Nice try! You can study up and retake this evaluation at any time from the dashboard.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/fresher-dashboard')}
            class="w-full py-2.5 px-4 font-bold rounded-lg text-white bg-gradient-to-r from-neonIndigo to-neonPurple hover:shadow-glow-purple transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div class="max-w-4xl mx-auto px-6 py-12 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      
      {/* Header back navigation */}
      <button
        onClick={() => navigate('/fresher-dashboard')}
        class="flex items-center gap-1.5 text-xs text-textSecondary hover:text-white transition-colors mb-6 self-start bg-white/5 border border-white/5 hover:border-white/15 px-3 py-1.5 rounded-lg"
      >
        <ArrowLeft size={12} /> Leave Assessment
      </button>

      {/* Progress Card */}
      <div class="w-full glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
        
        {/* Top bar progress info */}
        <div>
          <div class="flex justify-between items-center mb-5">
            <span class="text-xs text-neonCyan font-bold tracking-wider uppercase">
              {quiz.title}
            </span>
            <span class="text-xs text-textSecondary">
              Question <span class="text-white font-bold">{currentIdx + 1}</span> of {quiz.questions.length}
            </span>
          </div>

          {/* Progress bar line */}
          <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-8">
            <div
              class="h-full bg-gradient-to-r from-neonCyan to-neonPurple transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div class="space-y-6">
            <div class="flex items-start space-x-3">
              <span class="p-1 bg-neonPurple/15 rounded text-neonPurple border border-neonPurple/20 mt-1">
                <HelpCircle size={16} />
              </span>
              <h2 class="text-xl font-bold font-display text-white tracking-tight leading-snug">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options grid */}
            <div class="grid grid-cols-1 gap-3 pt-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion._id] === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(currentQuestion._id, option)}
                    class={`p-4 rounded-xl border text-left text-sm transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-neonPurple/10 border-neonPurple text-white shadow-glow-purple font-medium'
                        : 'bg-white/5 border-white/10 text-textSecondary hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{option}</span>
                    <div
                      class={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-neonPurple bg-neonPurple'
                          : 'border-white/25'
                      }`}
                    >
                      {isSelected && <div class="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div class="flex items-center justify-between pt-8 border-t border-white/5 mt-10">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            class={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              currentIdx === 0
                ? 'border-neutral-800 text-neutral-600 bg-neutral-900 cursor-not-allowed'
                : 'border-white/10 text-textSecondary bg-white/5 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChevronLeft size={14} /> Back
          </button>

          {currentIdx === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || !isComplete}
              class={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 transition-all ${
                !isComplete || submitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-glow-cyan hover:scale-[1.01]'
              }`}
            >
              <CheckCircle size={14} />
              <span>{submitting ? 'Evaluating...' : 'Finish and Submit'}</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default TrainingArena;
