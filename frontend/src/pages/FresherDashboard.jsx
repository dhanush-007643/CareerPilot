import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Award, Search, Filter, BookOpen, Compass, CheckCircle2, UserCheck } from 'lucide-react';
import JobCard from '../components/JobCard';
import QuizCard from '../components/QuizCard';
import axios from 'axios';

const FresherDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard lists state
  const [jobs, setJobs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Fetch dashboards content on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Run parallel requests
      const [jobsRes, quizzesRes, scoresRes] = await Promise.all([
        axios.get('/api/jobs'),
        axios.get('/api/quizzes'),
        axios.get('/api/quizzes/scores')
      ]);

      if (jobsRes.data.success) setJobs(jobsRes.data.data);
      if (quizzesRes.data.success) setQuizzes(quizzesRes.data.data);
      if (scoresRes.data.success) setScores(scoresRes.data.data);
    } catch (err) {
      console.error('Error fetching fresher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute unique skills tags from all jobs for filter dropdown
  const allSkills = Array.from(
    new Set(jobs.flatMap((job) => job.requiredSkills || []))
  ).sort();

  // Filter jobs based on search query and selected skill tag
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.startupId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesSkill = selectedSkillFilter
      ? job.requiredSkills?.includes(selectedSkillFilter)
      : true;

    return matchesSearch && matchesSkill;
  });

  // Helper mapping quizId to score percentage
  const getScoreForQuiz = (quizId) => {
    const match = scores.find((s) => s.quizId?._id === quizId || s.quizId === quizId);
    return match ? match.score : undefined;
  };

  // Stats calculation
  const totalApplications = jobs.filter(
    (job) => job.applicants?.some((app) => app.userId?._id === user?._id || app.userId === user?._id)
  ).length;

  const averageQuizScore = scores.length > 0
    ? Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length)
    : 0;

  return (
    <div class="max-w-7xl mx-auto px-6 py-10">
      
      {/* Banner */}
      <div class="mb-10 p-8 rounded-2xl bg-gradient-to-r from-neonCyan/20 via-neonIndigo/10 to-transparent border border-white/10 relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-neonCyan/10 rounded-full blur-3xl"></div>
        <h1 class="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          Fresher Cabin <span class="text-2xl">🎓</span>
        </h1>
        <p class="text-textSecondary mt-2 max-w-2xl leading-relaxed">
          Welcome, <span class="text-white font-semibold">{user?.name}</span>! Upgrade your skills by taking technical MCQ evaluations and apply to startup listings using referral credentials.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div class="glass-panel border border-white/10 rounded-xl p-5 flex items-center space-x-4 shadow-md">
          <div class="p-3 bg-neonCyan/10 rounded-lg text-neonCyan border border-neonCyan/20">
            <Briefcase size={22} />
          </div>
          <div>
            <span class="text-xs text-textSecondary uppercase tracking-wider block">Submitted Applications</span>
            <span class="text-2xl font-bold text-white">{totalApplications}</span>
          </div>
        </div>

        <div class="glass-panel border border-white/10 rounded-xl p-5 flex items-center space-x-4 shadow-md">
          <div class="p-3 bg-neonPurple/10 rounded-lg text-neonPurple border border-neonPurple/20">
            <Award size={22} />
          </div>
          <div>
            <span class="text-xs text-textSecondary uppercase tracking-wider block">Quizzes Cleared</span>
            <span class="text-2xl font-bold text-white">{scores.length}</span>
          </div>
        </div>

        <div class="glass-panel border border-white/10 rounded-xl p-5 flex items-center space-x-4 shadow-md">
          <div class="p-3 bg-indigo-500/10 rounded-lg text-neonIndigo border border-indigo-500/20">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span class="text-xs text-textSecondary uppercase tracking-wider block">Average Test Score</span>
            <span class="text-2xl font-bold text-white">{scores.length > 0 ? `${averageQuizScore}%` : 'N/A'}</span>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Jobs Feed Columns */}
        <div class="lg:col-span-2 space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <h2 class="text-2xl font-bold font-display text-white flex items-center gap-2">
              <Compass size={22} class="text-neonCyan" /> Active Startup Listings
            </h2>

            {/* Filters */}
            <div class="flex items-center space-x-3">
              <div class="relative flex-1 md:w-60">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg glow-input text-white"
                />
              </div>

              <div class="relative">
                <select
                  value={selectedSkillFilter}
                  onChange={(e) => setSelectedSkillFilter(e.target.value)}
                  class="pl-3 pr-8 py-1.5 text-xs rounded-lg glow-input text-white appearance-none cursor-pointer bg-darkCard"
                >
                  <option value="">All Skills</option>
                  {allSkills.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none">
                  <Filter size={10} />
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div class="text-center py-12 text-textSecondary">Loading job feeds...</div>
          ) : filteredJobs.length === 0 ? (
            <div class="text-center py-16 text-textSecondary border border-dashed border-white/10 rounded-xl">
              No matching listings found. Try adjusting your search/filter tags.
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} onApplySuccess={fetchDashboardData} />
              ))}
            </div>
          )}
        </div>

        {/* Training Area Catalog Column */}
        <div class="lg:col-span-1">
          <div class="glass-panel rounded-2xl border border-white/10 p-6 shadow-lg space-y-6">
            <h2 class="text-xl font-bold font-display text-white flex items-center gap-2">
              <BookOpen size={20} class="text-neonPurple" /> Training Assessments
            </h2>
            <p class="text-xs text-textSecondary leading-relaxed">
              Unlock tags and verify skills by taking multiple-choice tests. Startups prefer applicants with matching high scores.
            </p>

            {loading ? (
              <div class="text-center py-6 text-textSecondary">Loading assessments...</div>
            ) : quizzes.length === 0 ? (
              <div class="text-center py-6 text-textSecondary italic">No quizzes available at the moment.</div>
            ) : (
              <div class="space-y-4">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    quiz={quiz}
                    userScore={getScoreForQuiz(quiz._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FresherDashboard;
