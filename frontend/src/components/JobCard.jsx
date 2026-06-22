import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tag, Send, CheckCircle2, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const JobCard = ({ job, onApplySuccess }) => {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationVisibility, setApplicationVisibility] = useState('public');

  // Check if current user is a fresher and has already applied to this job
  const hasApplied = user && job.applicants?.some(
    (app) => app.userId?._id === user._id || app.userId === user._id
  );

  // Check if current user is the startup that posted the job
  const isOwner = user && job.startupId?._id === user._id || job.startupId === user._id;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/jobs/apply', {
        jobId: job._id,
        userId: user._id,
        referralCode: referralCode.trim(),
        applicationVisibility
      });

      if (res.data.success) {
        setShowApplyModal(false);
        setReferralCode('');
        if (onApplySuccess) {
          onApplySuccess();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="relative overflow-hidden rounded-xl glass-card p-6 shadow-md hover:shadow-glow-cyan hover:scale-[1.01] transition-all duration-300">
      {/* Visual indicator corner glow */}
      <div class="absolute -top-10 -right-10 w-24 h-24 bg-neonCyan/10 rounded-full blur-xl"></div>
      
      <div class="flex flex-col h-full justify-between">
        <div>
          {/* Header */}
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-bold font-display text-white tracking-tight">{job.title}</h3>
              <p class="text-xs text-neonCyan font-semibold tracking-wider uppercase mt-0.5">
                {job.startupId?.name || 'Fast-Growing Startup'}
              </p>
            </div>
            
            {isOwner && (
              <span class="px-2.5 py-1 text-xs font-semibold text-neonPurple bg-neonPurple/10 rounded-full border border-neonPurple/20 flex items-center gap-1 animate-pulse">
                <UserCheck size={12} />
                <span>My Posting</span>
              </span>
            )}
            
            {hasApplied && (
              <span class="px-2.5 py-1 text-xs font-semibold text-green-400 bg-green-950/20 rounded-full border border-green-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Applied</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p class="text-sm text-textSecondary line-clamp-3 mb-4 leading-relaxed">
            {job.description}
          </p>
        </div>

        <div>
          {/* Skill tags */}
          <div class="mb-5">
            <span class="text-xs text-textSecondary font-semibold block mb-2 flex items-center gap-1.5">
              <Tag size={12} class="text-neonIndigo" /> Required Skills:
            </span>
            <div class="flex flex-wrap gap-1.5">
              {job.requiredSkills && job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  class="text-xs px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/90"
                >
                  {skill}
                </span>
              ))}
              {(!job.requiredSkills || job.requiredSkills.length === 0) && (
                <span class="text-xs text-textSecondary italic">No specific skills listed</span>
              )}
            </div>
          </div>

          {/* Footer stats / Actions */}
          <div class="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
            <span class="text-xs text-textSecondary">
              Applicants: <span class="text-white font-bold">{job.applicants?.length || 0}</span>
            </span>

            {user && user.role === 'fresher' && (
              <button
                disabled={hasApplied}
                onClick={() => setShowApplyModal(true)}
                class={`px-4 py-1.5 text-xs font-bold rounded-lg tracking-wide transition-all ${
                  hasApplied
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : 'bg-gradient-to-r from-neonCyan to-neonIndigo text-white hover:shadow-glow-cyan hover:scale-[1.02]'
                }`}
              >
                {hasApplied ? 'Application Sent' : 'Apply for Role'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Referral Code Modal */}
      {showApplyModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div class="w-full max-w-md glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl animate-fade-in">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold font-display text-white">Apply to {job.title}</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                class="text-textSecondary hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            
            <p class="text-sm text-textSecondary mb-4">
              Do you have an employee referral code? If so, enter it below to boost your application's visibility. If not, you can leave it blank and submit directly.
            </p>

            {error && (
              <div class="mb-4 px-3 py-2 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STARTUP-REF-99"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  class="w-full px-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>

              <div class="space-y-3 pt-2">
                <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Application Visibility
                </label>
                <div class="grid grid-cols-1 gap-3">
                  {/* Public Option */}
                  <div
                    onClick={() => setApplicationVisibility('public')}
                    className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${
                      applicationVisibility === 'public'
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                        : 'bg-slate-900 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`mt-0.5 ${applicationVisibility === 'public' ? 'text-amber-400' : 'text-slate-500'}`}>
                      <Eye size={18} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${applicationVisibility === 'public' ? 'text-amber-400' : 'text-slate-300'}`}>
                        Public Application
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Boost my exposure to all Startups.
                      </p>
                    </div>
                  </div>

                  {/* Private Option */}
                  <div
                    onClick={() => setApplicationVisibility('private')}
                    className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${
                      applicationVisibility === 'private'
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                        : 'bg-slate-900 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`mt-0.5 ${applicationVisibility === 'private' ? 'text-amber-400' : 'text-slate-500'}`}>
                      <EyeOff size={18} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${applicationVisibility === 'private' ? 'text-amber-400' : 'text-slate-300'}`}>
                        Private Application
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Keep my profile hidden from other recruiters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  class="px-4 py-2 text-xs font-bold text-textSecondary hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-neonCyan to-neonIndigo rounded-lg hover:shadow-glow-cyan flex items-center gap-1.5 transition-all"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Send size={12} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
