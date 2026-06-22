import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Send, CheckCircle, AlertCircle, Upload, Sparkles } from 'lucide-react';
import api, { fetchJobs, applyForJob } from '../services/api';
import { useToast, ToastContainer } from '../components/Toast';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [profileResume, setProfileResume] = useState(null);
  
  // Form states
  const [coverLetter, setCoverLetter] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [newResume, setNewResume] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const inviteCode = searchParams.get('inviteCode');

      if (inviteCode) {
        let found = null;
        try {
          const res = await api.get(`/jobs/private/${inviteCode}`);
          if (res.data.success && res.data.data._id === id) {
            found = res.data.data;
          }
        } catch (e) {
          console.log('Failed to fetch private job from API, checking mock...');
        }
        
        if (!found) {
          const localJobsStr = localStorage.getItem('mock_startup_jobs');
          if (localJobsStr) {
            const localJobs = JSON.parse(localJobsStr);
            found = localJobs.find(j => j._id === id && j.inviteCode === inviteCode);
          }
        }
        if (found) setJob(found);
      } else {
        // Fetch job list via api service
        const jobsRes = await fetchJobs();
        let found = null;
        if (jobsRes.data.success) {
          found = jobsRes.data.data.find(j => j._id === id);
        }
        
        // If not found in API, check local mock jobs
        if (!found) {
          const localJobsStr = localStorage.getItem('mock_startup_jobs');
          if (localJobsStr) {
            const localJobs = JSON.parse(localJobsStr);
            found = localJobs.find(j => j._id === id);
          }
        }
        
        if (found) setJob(found);
      }
      
      // Fetch user profile resume
      const resumeRes = await api.get('/auth/resume');
      if (resumeRes.data.success && (resumeRes.data.resume?.fileContent || resumeRes.data.resume?.fileUrl)) {
        setProfileResume(resumeRes.data.resume);
      }
    } catch (err) {
      console.log('Failed fetching apply requirements, fallback to mock:', err);
      // Fallback
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      if (localJobsStr) {
        const localJobs = JSON.parse(localJobsStr);
        const found = localJobs.find(j => j._id === id);
        if (found) setJob(found);
      }

      const savedUserStr = localStorage.getItem('mock_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.resume?.fileContent || u.resume?.fileUrl) {
          setProfileResume(u.resume);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setNewResume({
          fileName: file.name,
          fileContent: reader.result
        });
        setUseProfileResume(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
 
    const activeResume = useProfileResume ? profileResume : newResume;
    if (!activeResume || (!activeResume.fileContent && !activeResume.fileUrl)) {
      setError('Please provide a resume to apply.');
      setLoading(false);
      return;
    }

    const applicationData = {
      jobId: id,
      referralCode: referralCode.trim(),
      coverLetter,
      resume: activeResume
    };

    try {
      const res = await applyForJob(applicationData);
      if (res.data.success) {
        setSuccess(true);
        addToast(`✅ Application submitted! Match: ${res.data.data?.matchPercentage ?? '–'}%`, 'success');
        setTimeout(() => navigate('/fresher/tracker'), 1500);
      }
    } catch (err) {
      console.log('API apply failed, saving to mock localStorage:', err);
      
      // Fallback update to mock_startup_jobs
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      if (localJobsStr) {
        let localJobs = JSON.parse(localJobsStr);
        const jobIndex = localJobs.findIndex(j => j._id === id);
        if (jobIndex !== -1) {
          if (!localJobs[jobIndex].applicants) localJobs[jobIndex].applicants = [];
          
          // Check if already applied in mock
          const activeUserId = user?._id || 'mock_user_id';
          const alreadyApplied = localJobs[jobIndex].applicants.some(
            app => {
              const applicantId = app.userId?._id || app.userId;
              return applicantId === activeUserId || app.userId?.email === user?.email;
            }
          );
          if (alreadyApplied) {
            setError('You have already applied for this job');
            setLoading(false);
            return;
          }

          // Calculate match score
          let matchScore = 80;
          const reqs = localJobs[jobIndex].requiredSkills || [];
          if (reqs.length > 0) {
            const userSkills = (user?.skills || []).map(s => s.toLowerCase().trim());
            const matched = reqs.filter(r => userSkills.includes(r.toLowerCase().trim()));
            matchScore = Math.round((matched.length / reqs.length) * 100);
          }

          localJobs[jobIndex].applicants.push({
            _id: `mock_app_${Date.now()}`,
            userId: {
              _id: activeUserId,
              name: user?.name || 'John Doe',
              email: user?.email || 'john@example.com',
              skills: user?.skills || [],
              personalInfo: user?.personalInfo || {},
              educationDetails: user?.educationDetails || [],
              experienceDetails: user?.experienceDetails || []
            },
            referralCode: referralCode.trim(),
            coverLetter,
            resume: activeResume,
            matchScore,
            status: 'Applied',
            appliedAt: new Date().toISOString()
          });

          localStorage.setItem('mock_startup_jobs', JSON.stringify(localJobs));
          setSuccess(true);
          setTimeout(() => navigate('/fresher/tracker'), 1500);
        } else {
          setError('Failed to submit application.');
        }
      } else {
        setError('Failed to submit application.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 flex items-center justify-center">
        <p className="text-slate-400 font-medium">Loading application configurations...</p>
      </div>
    );
  }

  const companyName = job.company || job.companyName || job.startupId?.name || 'Startup Recruiters';

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans px-6 py-12 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl mx-auto space-y-8 z-10 relative">
        {/* Back link */}
        <button 
          onClick={() => {
            const searchParams = new URLSearchParams(window.location.search);
            const inviteCode = searchParams.get('inviteCode');
            navigate(`/fresher/jobs/${id}${inviteCode ? `?inviteCode=${inviteCode}` : ''}`);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Job Details</span>
        </button>

        {/* Header */}
        <div className="p-8 rounded-2xl glass-card relative overflow-hidden">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">Applying For Position</span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {job.title}
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            At {companyName} • {job.location || 'Remote'}
          </p>
        </div>

        {success && (
          <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2 font-bold">
            <CheckCircle size={18} />
            <span>Candidacy application submitted successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2 font-bold">
            <AlertCircle size={18} className="text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Application Form Card */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 shadow-sm space-y-6">
          
          {/* Cover Letter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cover Letter / Application Note
            </label>
            <textarea
              rows="6"
              required
              placeholder="Explain why you are the ideal fit for this position. Mention relevant course achievements, quiz badges, or stack alignments..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0F172A] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-white resize-none transition-all"
            ></textarea>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Company Referral Code (Optional)
              </label>
              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">Priority rank boost</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Acme-Ref-500"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0F172A] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-white transition-all font-mono"
            />
          </div>

          {/* Resume Selector */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Resume Document
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Profile Resume */}
              <div 
                onClick={() => profileResume && setUseProfileResume(true)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  useProfileResume && profileResume
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50 shadow-sm' 
                    : 'border-slate-700 bg-[#0F172A] hover:border-slate-500'
                } ${!profileResume ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={useProfileResume && profileResume ? 'text-cyan-400' : 'text-slate-500'} size={24} />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Use Profile Resume</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {profileResume ? profileResume.fileName : 'No profile resume found'}
                    </p>
                  </div>
                </div>
                {profileResume && (
                  <input
                    type="radio"
                    checked={useProfileResume}
                    onChange={() => setUseProfileResume(true)}
                    className="accent-cyan-500 w-4 h-4"
                  />
                )}
              </div>

              {/* Option B: Upload new */}
              <div 
                onClick={() => newResume && setUseProfileResume(false)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  !useProfileResume && newResume
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50 shadow-sm' 
                    : 'border-slate-700 bg-[#0F172A] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Upload className={!useProfileResume && newResume ? 'text-cyan-400' : 'text-slate-500'} size={24} />
                  <div className="text-left w-full">
                    <p className="text-xs font-bold text-white">Upload Custom Resume</p>
                    {newResume ? (
                      <p className="text-[10px] text-cyan-400 font-bold truncate max-w-[150px]">{newResume.fileName}</p>
                    ) : (
                      <label htmlFor="application-file-upload" className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer block mt-0.5">
                        Choose document file...
                      </label>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  id="application-file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                {newResume && (
                  <input
                    type="radio"
                    checked={!useProfileResume}
                    onChange={() => setUseProfileResume(false)}
                    className="accent-cyan-500 w-4 h-4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-700 flex gap-4">
            <button
              type="button"
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                const inviteCode = searchParams.get('inviteCode');
                navigate(`/fresher/jobs/${id}${inviteCode ? `?inviteCode=${inviteCode}` : ''}`);
              }}
              className="flex-1 py-3 px-4 font-bold text-slate-400 hover:text-white rounded-xl bg-[#1E293B] border border-slate-700 hover:border-slate-500 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApplyJob;
