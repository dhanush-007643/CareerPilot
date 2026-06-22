import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Tag, X, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const JobCreator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('Freshers welcome');
  const [company, setCompany] = useState(user?.name || '');
  const [isWFH, setIsWFH] = useState(false);
  const [jobType, setJobType] = useState('Full-Time');
  const [hasStipend, setHasStipend] = useState(false);
  const [domain, setDomain] = useState('Software Engineering');
  const [jobVisibility, setJobVisibility] = useState('public');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Sync company name when user context changes
  useEffect(() => {
    if (user?.name) {
      setCompany(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (jobVisibility === 'private' && !inviteCode) {
      setInviteCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    } else if (jobVisibility === 'public') {
      setInviteCode('');
    }
  }, [jobVisibility]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title || !description || description === '<p><br></p>') {
      setError('Please provide a job title and description.');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please add at least one mandatory skill tag.');
      return;
    }

    setLoading(true);
    const jobData = {
      title,
      description, // HTML string from Quill
      requiredSkills,
      location,
      salary: salary || 'Unspecified',
      experience,
      company: company || user?.name || 'Acme Startup Corp',
      isWFH,
      jobType,
      hasStipend,
      domain,
      jobVisibility,
      inviteCode: jobVisibility === 'private' ? inviteCode : null
    };

    try {
      const res = await api.post('/jobs', jobData);

      if (res.data.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setRequiredSkills([]);
        setSalary('');
        setIsWFH(false);
        setJobType('Full-Time');
        setHasStipend(false);
        setJobVisibility('public');
        setInviteCode('');
      }
    } catch (err) {
      console.error('API post failed:', err);
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans px-6 py-12 overflow-hidden">
      
      <div className="max-w-3xl mx-auto space-y-8 z-10 relative">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/startup/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Recruiter Console</span>
        </button>

        {/* Banner Section */}
        <div className="p-8 rounded-2xl bg-[#1E293B]/40 border border-slate-800 backdrop-blur-md shadow-xl relative overflow-hidden">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Publish Opportunity <span className="text-2xl">🚀</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed text-sm font-medium">
            Outline job requirements, role descriptors, and attach mandatory skill tags. Our matching engine will grade and filter candidate applications instantly.
          </p>
        </div>

        {/* Creation Card */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-8 shadow-xl">
          
          {success && (
            <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle size={18} />
                <span>Job opening created and published successfully!</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 font-bold">
              <X size={18} className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Job Visibility Segment */}
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2 uppercase tracking-wider">
                <Eye size={16} /> Job Visibility Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setJobVisibility('public')}
                  className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${
                    jobVisibility === 'public'
                      ? 'bg-[#22D3EE]/10 border-[#22D3EE]/30 shadow-sm ring-1 ring-[#22D3EE]'
                      : 'bg-[#1E293B] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Eye size={18} className={jobVisibility === 'public' ? 'text-[#22D3EE] mt-0.5' : 'text-slate-500 mt-0.5'} />
                  <div>
                    <h4 className={`text-sm font-bold ${jobVisibility === 'public' ? 'text-[#22D3EE]' : 'text-slate-300'}`}>Public Job</h4>
                    <p className="text-xs text-slate-500 mt-1">Listed on the global Job Board for all candidates to see.</p>
                  </div>
                </div>

                <div
                  onClick={() => setJobVisibility('private')}
                  className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${
                    jobVisibility === 'private'
                      ? 'bg-[#FBBF24]/10 border-[#FBBF24]/30 shadow-sm ring-1 ring-[#FBBF24]'
                      : 'bg-[#1E293B] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <EyeOff size={18} className={jobVisibility === 'private' ? 'text-[#FBBF24] mt-0.5' : 'text-slate-500 mt-0.5'} />
                  <div>
                    <h4 className={`text-sm font-bold ${jobVisibility === 'private' ? 'text-[#FBBF24]' : 'text-slate-300'}`}>Private Job</h4>
                    <p className="text-xs text-slate-500 mt-1">Hidden from public listing. Can be shared privately via invite link.</p>
                  </div>
                </div>
              </div>

              {jobVisibility === 'private' && inviteCode && (
                <div className="mt-4 p-4 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#FBBF24] uppercase tracking-widest flex items-center gap-2">
                    Auto-Generated Invite Link
                  </span>
                  <div className="flex items-center justify-between bg-[#0B1120] px-3 py-2 rounded-lg border border-slate-700 shadow-sm">
                    <span className="text-sm font-mono text-slate-300 truncate mr-4">
                      {window.location.origin}/invite/{inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteCode}`);
                        alert('Invite link copied to clipboard!');
                      }}
                      className="shrink-0 text-[10px] uppercase font-bold px-3 py-1.5 bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-[#0B1120] rounded-md transition-colors shadow-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Share this link directly with chosen candidates.</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Job Position Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Frontend Engineer (React.js)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                disabled={loading}
              />
            </div>

            {/* Company & Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TechNova"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120]/50 border border-slate-800 text-slate-500 outline-none transition-all shadow-sm"
                  disabled={true} // Usually locked to user's company
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Location (e.g. City / Remote)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote, San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Salary & Experience Requisite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Salary / Compensation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $80,000 - $100,000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freshers welcome, 1-3 years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Job Type and Domain Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                  disabled={loading}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Job Domain / Category
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0B1120] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white transition-all shadow-sm"
                  disabled={loading}
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            {/* Checkboxes Row */}
            <div className="flex flex-wrap gap-8 py-4 px-5 bg-[#0B1120] border border-slate-800 rounded-xl shadow-sm">
              <label className="flex items-center space-x-2 cursor-pointer text-sm font-bold text-slate-300">
                <input
                  type="checkbox"
                  id="isWFH"
                  checked={isWFH}
                  onChange={(e) => setIsWFH(e.target.checked)}
                  className="rounded border-slate-700 bg-[#1E293B] text-[#22D3EE] focus:ring-[#22D3EE] h-4 w-4"
                  disabled={loading}
                />
                <span>Work From Home / Remote</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-sm font-bold text-slate-300">
                <input
                  type="checkbox"
                  id="hasStipend"
                  checked={hasStipend}
                  onChange={(e) => setHasStipend(e.target.checked)}
                  className="rounded border-slate-700 bg-[#1E293B] text-[#22D3EE] focus:ring-[#22D3EE] h-4 w-4"
                  disabled={loading}
                />
                <span>Compensated / Paid Stipend</span>
              </label>
            </div>

            {/* Description using native textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Role Description & Scope
              </label>
              <div className="bg-[#0B1120] rounded-lg border border-slate-700 overflow-hidden shadow-sm">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={8}
                  className="w-full p-4 text-sm outline-none text-white bg-transparent resize-y placeholder-slate-500"
                  placeholder="Responsibilities, technical requisites, day-to-day scopes..."
                />
              </div>
            </div>

            {/* Mandatory skills tagging */}
            <div className="p-5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Required Technical Skill tags
                </label>
                <p className="text-[10px] text-slate-500 font-medium">
                  Tagging is mandatory. Matches candidates based on their verified Challenge scores.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Press Enter or click Add (e.g. Node.js, Next.js)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-[#1E293B] border border-slate-700 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none text-white shadow-sm placeholder-slate-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-bold px-3 py-1.5 rounded-md bg-[#1E293B] border border-slate-700 text-slate-300 shadow-sm flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {requiredSkills.length === 0 && (
                  <span className="text-xs text-slate-500 font-semibold italic">No skills tagged yet (At least 1 required)</span>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 font-black rounded-xl text-[#0B1120] bg-[#22D3EE] hover:bg-[#22D3EE]/90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 mt-4"
              disabled={loading}
            >
              <Briefcase size={18} />
              <span>{loading ? 'Publishing Requisition...' : 'Publish Job Listing'}</span>
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default JobCreator;
