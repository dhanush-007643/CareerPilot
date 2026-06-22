import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timer, Award, ChevronLeft, ChevronRight, CheckCircle, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const TrainingArena = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const quizIdFromState = location.state?.quizId;
  const quizTitleFromState = location.state?.quizTitle;

  // State management
  const [quizId, setQuizId] = useState(quizIdFromState || 'mock_quiz_1');
  const [quizTitle, setQuizTitle] = useState(quizTitleFromState || 'React.js Fundamentals');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOption }
  const [score, setScore] = useState(null); // Score percentage (null if not submitted)
  const [correctCount, setCorrectCount] = useState(0); // Count of correct answers
  const [isSubmitted, setIsSubmitted] = useState(false); // Flag tracking submission
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown (300 seconds)

  // Use a ref to keep track of the latest selectedAnswers to avoid stale state closure in the timer callback
  const selectedAnswersRef = useRef(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Fetch quiz on mount
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quizzes');
      if (res.data.success && res.data.data.length > 0) {
        let found = res.data.data.find(q => q._id === quizId);
        // If specific quiz not found (e.g. mock_quiz_1), fallback to the first available quiz
        if (!found) {
          found = res.data.data[0];
          setQuizId(found._id);
        }
        
        setQuestions(found.questions);
        setQuizTitle(found.title);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch quiz from API:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Live countdown timer using useEffect
  useEffect(() => {
    if (isSubmitted || loading) return;

    if (timeLeft <= 0) {
      alert("Time is up! Your assessment will be submitted automatically.");
      handleSubmitAssessment();
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, isSubmitted, loading]);

  // Formatter for timer display MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isTimeLow = timeLeft < 60;

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    calculateScore();
  };

  const calculateScore = async () => {
    const currentAnswers = selectedAnswersRef.current;
    
    // Attempt backend submission
    try {
      const res = await api.post('/quizzes/submit', {
        quizId,
        answers: currentAnswers
      });
      if (res.data.success) {
        setCorrectCount(res.data.data.correctCount);
        setScore(res.data.data.score);
        setIsSubmitted(true);
        return;
      }
    } catch (err) {
      console.error('API quiz submission failed:', err);
      // Fallback to 0 if API fails, as per no-fake-data rule
      setCorrectCount(0);
      setScore(0);
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex items-center justify-center">
        <p className="text-slate-400 font-bold">Retrieving assessment questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex items-center justify-center flex-col gap-4">
        <AlertTriangle size={48} className="text-amber-500" />
        <p className="text-slate-300 font-bold">This assessment is currently unavailable.</p>
        <button
          onClick={() => navigate('/fresher/dashboard')}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Results Screen
  if (isSubmitted) {
    const isPassed = score >= 70;
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans text-slate-300">
        
        <div className="w-full max-w-lg glass-card p-8 shadow-xl text-center space-y-6 relative overflow-hidden animate-fade-in z-10">
          
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
            <Award size={40} className="text-cyan-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Assessment Complete!</h2>
            <p className="text-sm font-medium text-slate-400">
              Your results for the Technical Evaluation
            </p>
          </div>

          {/* Large Match Percentage / Score */}
          <div className="py-6 border-y border-slate-800">
            <div className="text-5xl font-black text-cyan-400">
              {score}%
            </div>
            <p className="text-sm font-bold text-slate-400 mt-2">
              Match Percentage
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              You answered <span className="text-white font-bold">{correctCount}</span> out of <span className="text-white font-bold">{totalQuestions}</span> questions correctly.
            </p>
          </div>

          <div className="text-xs leading-relaxed">
            {isPassed ? (
              <p className="text-emerald-400 font-bold">
                🎉 Excellent Job! Your high score demonstrates outstanding capability in these technologies.
              </p>
            ) : (
              <p className="text-slate-400 font-medium">
                You scored under 70%. Feel free to study the material and try again to boost your score!
              </p>
            )}
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => navigate('/fresher/dashboard')}
              className="flex-1 py-3 px-4 font-bold rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 shadow-sm transition-all duration-300"
            >
              Dashboard
            </button>
            {isPassed && (
              <button
                onClick={async () => {
                  try {
                    const { jsPDF } = await import('jspdf');
                    const doc = new jsPDF('landscape');
                    // Background
                    doc.setFillColor(11, 17, 32); // #0B1120
                    doc.rect(0, 0, 297, 210, 'F');
                    
                    // Title
                    doc.setTextColor(34, 211, 238); // Cyan
                    doc.setFontSize(40);
                    doc.text("CareerPilot Certificate", 148.5, 50, { align: 'center' });
                    
                    // Subtitle
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(20);
                    doc.text("This certifies that you have successfully passed", 148.5, 90, { align: 'center' });
                    
                    // Quiz Title
                    doc.setTextColor(34, 211, 238);
                    doc.setFontSize(30);
                    doc.text(quizTitle, 148.5, 115, { align: 'center' });

                    // Score
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(20);
                    doc.text(`Score: ${score}%`, 148.5, 140, { align: 'center' });

                    // Date & Footer
                    doc.setFontSize(12);
                    doc.setTextColor(148, 163, 184); // Slate 400
                    doc.text(`Date: ${new Date().toLocaleDateString()}`, 148.5, 180, { align: 'center' });
                    
                    doc.setFontSize(10);
                    doc.text("Verified by CareerPilot | Storage: Local Mock S3", 148.5, 195, { align: 'center' });

                    doc.save(`Certificate_${quizTitle.replace(/\s+/g, '_')}.pdf`);
                  } catch (err) {
                    alert("Please stop the server and run 'npm install jspdf' in the frontend folder to enable PDF generation.");
                  }
                }}
                className="flex-1 py-3 px-4 font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Award size={18} /> PDF Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] px-6 py-12 flex flex-col justify-center items-center text-white relative overflow-hidden font-sans">
      
      {/* Brand Header & Live Countdown Timer */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        {/* Brand logo styled with Gold Accent */}
        <div className="flex items-center space-x-2">
          <Logo size={32} />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 uppercase tracking-widest">
            ASSESSMENTS
          </span>
        </div>

        {/* Countdown Timer */}
        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl border shadow-sm transition-all duration-300 ${
          isTimeLow 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-[#1E293B] border-slate-700 text-slate-300'
        }`}>
          <Timer size={16} className={isTimeLow ? 'text-red-400' : 'text-slate-400'} />
          <span className="font-mono font-bold text-sm tracking-widest">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="w-full max-w-3xl glass-card rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[400px] animate-fade-in">
        
        <div>
          {/* Question Index Info & Progress Bar */}
          <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{quizTitle}</span>
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>

          {/* Crisp progress track bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug">
              {currentQuestion.questionText}
            </h2>

            {/* Clickable options buttons */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion._id] === option;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(currentQuestion._id, option)}
                    className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between shadow-sm ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/50'
                        : 'border-slate-700 bg-[#0F172A] text-slate-300 hover:border-slate-500 hover:bg-[#1E293B]'
                    }`}
                  >
                    <span>{option}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-600 bg-[#0F172A]'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Navigation controls */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-10">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              currentQuestionIndex === 0
                ? 'border-slate-800 text-slate-600 bg-[#0F172A] cursor-not-allowed'
                : 'border-slate-700 text-slate-300 bg-[#1E293B] hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ChevronLeft size={14} /> 
            <span>Previous</span>
          </button>

          {/* Next / Submit Button */}
          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitAssessment}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm transition-all"
            >
              <CheckCircle size={14} />
              <span>Submit Assessment</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm transition-all"
            >
              <span>Next</span> 
              <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>

      {/* Leave assessment alert link */}
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to abandon the assessment? Your progress will not be saved.")) {
            navigate('/fresher/dashboard');
          }
        }}
        className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={12} />
        <span>Return to Dashboard (Abandon Test)</span>
      </button>

    </div>
  );
};

export default TrainingArena;
