import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

const QuizCard = ({ quiz, userScore }) => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/training-arena', { state: { quizId: quiz._id } });
  };

  return (
    <div class="relative overflow-hidden rounded-xl glass-card p-6 shadow-md hover:shadow-glow-purple hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between">
      {/* Corner glow */}
      <div class="absolute -top-10 -right-10 w-24 h-24 bg-neonPurple/10 rounded-full blur-xl"></div>

      <div>
        {/* Title */}
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-lg font-bold font-display text-white tracking-tight leading-snug">
            {quiz.title}
          </h3>
          <div class="p-2 bg-neonPurple/10 rounded-lg text-neonPurple border border-neonPurple/20">
            <BookOpen size={16} />
          </div>
        </div>

        {/* Stats */}
        <p class="text-xs text-textSecondary mb-4">
          Contains <span class="text-white font-semibold">{quiz.questions?.length || 0}</span> technical questions.
        </p>

        {/* Performance indicator */}
        {userScore !== undefined ? (
          <div class="mt-2 mb-5 p-3 rounded-lg bg-green-950/20 border border-green-500/20 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <CheckCircle2 size={14} class="text-green-400" />
              <span class="text-xs text-textSecondary font-medium">Completed</span>
            </div>
            <span class="text-sm font-bold text-green-400">Score: {userScore}%</span>
          </div>
        ) : (
          <div class="mt-2 mb-5 p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
            <span class="text-xs text-textSecondary italic">Not taken yet</span>
            <span class="text-xs text-neonPurple font-bold">Unlocks Skill Tag</span>
          </div>
        )}
      </div>

      <button
        onClick={handleStartQuiz}
        class="w-full flex items-center justify-center space-x-2 py-2 px-4 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-neonIndigo to-neonPurple hover:shadow-glow-purple transition-all"
      >
        <span>{userScore !== undefined ? 'Retake assessment' : 'Start assessment'}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default QuizCard;
