import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, Plus, Tag, X, FileText, CheckCircle, Ticket } from 'lucide-react';
import axios from 'axios';

const StartupDashboard = () => {
  const { user } = useAuth();
  
  // Job list state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states for new job posting
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Active Job selection for applicant list details
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/jobs');
      if (res.data.success) {
        // Filter jobs posted by this startup
        const startupJobs = res.data.data.filter(
          (job) => job.startupId?._id === user?._id || job.startupId === user?._id
        );
        setJobs(startupJobs);
        if (startupJobs.length > 0) {
          // Default select first job to display applicants
          setSelectedJob(startupJobs[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch posted jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !requiredSkills.includes(cleanSkill)) {
      setRequiredSkills([...requiredSkills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError('');
    setFormSuccess(false);

    if (!title || !description) {
      setError('Please provide a job title and description.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await axios.post('/api/jobs', {
        title,
        description,
        requiredSkills
      });

      if (res.data.success) {
        setFormSuccess(true);
        setTitle('');
        setDescription('');
        setRequiredSkills([]);
        
        // Refresh job list
        await fetchJobs();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to post new job.');
    } finally {
      setFormLoading(false);
    }
  };

  const selectJobForApplicants = (job) => {
    setSelectedJob(job);
  };

  return (
    <div class="max-w-7xl mx-auto px-6 py-10">
      
      {/* Welcome Banner */}
      <div class="mb-10 p-8 rounded-2xl bg-gradient-to-r from-neonIndigo/20 via-neonPurple/10 to-transparent border border-white/10 relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-neonPurple/10 rounded-full blur-3xl"></div>
        <h1 class="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          Recruiter Console <span class="text-2xl">🚀</span>
        </h1>
        <p class="text-textSecondary mt-2 max-w-2xl leading-relaxed">
          Manage listings for <span class="text-neonCyan font-semibold">{user?.name}</span>, post technical requisites, and vet fresh graduates applying with company referral codes.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Columns: Jobs & Form */}
        <div class="lg:col-span-2 space-y-8">
          
          {/* Post a Job Section */}
          <div class="glass-panel rounded-2xl border border-white/10 p-6 shadow-lg">
            <h2 class="text-xl font-bold font-display text-white mb-5 flex items-center gap-2">
              <Plus size={20} class="text-neonCyan" /> Post a New Opening
            </h2>

            {formSuccess && (
              <div class="mb-4 px-4 py-3 bg-green-950/20 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-2">
                <CheckCircle size={18} />
                <span>Job posting created successfully!</span>
              </div>
            )}

            <form onSubmit={handlePostJob} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Junior Full-Stack Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  class="w-full px-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Role Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Outline responsibilities, day-to-day tasks, and technical expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  class="w-full px-4 py-2 text-sm rounded-lg glow-input text-white resize-none"
                  disabled={formLoading}
                ></textarea>
              </div>

              {/* Skills inputs */}
              <div>
                <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  Required Skill tags
                </label>
                <div class="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Press enter or click add (e.g. React, Node.js)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                    class="flex-1 px-4 py-2 text-sm rounded-lg glow-input text-white"
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    class="px-4 rounded-lg bg-neonCyan text-white hover:bg-cyan-600 transition-all font-semibold text-sm"
                  >
                    Add
                  </button>
                </div>

                <div class="flex flex-wrap gap-2">
                  {requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      class="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white flex items-center gap-1.5 animate-fade-in"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        class="text-textSecondary hover:text-white"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {requiredSkills.length === 0 && (
                    <span class="text-xs text-textSecondary italic">No skills added yet</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-2.5 px-4 font-bold rounded-lg text-white bg-gradient-to-r from-neonCyan to-neonIndigo hover:shadow-glow-cyan transition-all"
                disabled={formLoading}
              >
                {formLoading ? 'Publishing...' : 'Publish Job Listing'}
              </button>
            </form>
          </div>

          {/* List of Posted Jobs */}
          <div class="glass-panel rounded-2xl border border-white/10 p-6 shadow-lg">
            <h2 class="text-xl font-bold font-display text-white mb-5 flex items-center gap-2">
              <Briefcase size={20} class="text-neonPurple" /> Active Job Postings ({jobs.length})
            </h2>

            {loading ? (
              <div class="text-center py-6 text-textSecondary">Loading listings...</div>
            ) : jobs.length === 0 ? (
              <div class="text-center py-8 text-textSecondary border border-dashed border-white/10 rounded-xl">
                No active postings yet. Use the form above to post your first job!
              </div>
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => selectJobForApplicants(job)}
                    class={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedJob?._id === job._id
                        ? 'bg-neonPurple/10 border-neonPurple shadow-glow-purple'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <h3 class="font-bold text-white mb-1 line-clamp-1">{job.title}</h3>
                    <p class="text-xs text-textSecondary line-clamp-2 mb-3">{job.description}</p>
                    <div class="flex justify-between items-center text-xs">
                      <span class="px-2 py-0.5 rounded bg-white/5 text-textSecondary">
                        {job.requiredSkills?.length || 0} Skills Required
                      </span>
                      <span class="text-neonCyan font-bold flex items-center gap-1">
                        <Users size={12} /> {job.applicants?.length || 0} applicants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Applicants list */}
        <div class="lg:col-span-1">
          <div class="glass-panel rounded-2xl border border-white/10 p-6 shadow-lg sticky top-28 h-[calc(100vh-140px)] flex flex-col">
            <h2 class="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
              <Users size={20} class="text-neonCyan" /> Applicant Submissions
            </h2>

            {selectedJob ? (
              <div class="flex-1 flex flex-col overflow-hidden">
                <div class="p-3 bg-white/5 border border-white/10 rounded-xl mb-4">
                  <span class="text-[10px] text-neonCyan font-bold tracking-wider uppercase block">Reviewing Applicants For:</span>
                  <h3 class="font-bold text-sm text-white line-clamp-1">{selectedJob.title}</h3>
                </div>

                {/* List container */}
                <div class="flex-1 overflow-y-auto space-y-3 pr-1">
                  {selectedJob.applicants && selectedJob.applicants.length > 0 ? (
                    selectedJob.applicants.map((app, index) => {
                      const applicantDetails = app.userId;
                      return (
                        <div
                          key={index}
                          class="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between space-y-3 relative overflow-hidden"
                        >
                          {app.referralCode && (
                            <div class="absolute top-0 right-0 px-2 py-0.5 bg-gradient-to-r from-neonCyan to-neonIndigo text-[9px] font-bold uppercase text-white rounded-bl border-l border-b border-neonCyan/30 flex items-center gap-1 shadow-glow-cyan">
                              <Ticket size={8} /> Ref: {app.referralCode}
                            </div>
                          )}
                          
                          <div>
                            <h4 class="font-bold text-sm text-white">{applicantDetails?.name || 'Applicant'}</h4>
                            <p class="text-xs text-textSecondary">{applicantDetails?.email}</p>
                          </div>

                          <div>
                            <span class="text-[10px] text-textSecondary font-bold block mb-1">Declared Skills:</span>
                            <div class="flex flex-wrap gap-1">
                              {applicantDetails?.skills && applicantDetails.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  class="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/90"
                                >
                                  {skill}
                                </span>
                              ))}
                              {(!applicantDetails?.skills || applicantDetails.skills.length === 0) && (
                                <span class="text-[9px] text-textSecondary italic">No skills listed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div class="text-center py-12 text-textSecondary border border-dashed border-white/5 rounded-xl">
                      No applications yet for this position.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div class="flex-1 flex items-center justify-center text-center p-6 text-textSecondary border border-dashed border-white/10 rounded-xl">
                Please select or post a job to review applicant records.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default StartupDashboard;
