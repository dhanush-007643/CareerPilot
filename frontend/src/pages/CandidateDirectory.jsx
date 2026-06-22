import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, UserPlus, CheckCircle2, ShieldCheck, Mail, Briefcase, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';



const CandidateDirectory = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [invitingId, setInvitingId] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  useEffect(() => {
    fetchCandidates();
    if (user?.role === 'startup') {
      fetchMyJobs();
    }
  }, [user]);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/network/candidates');
      if (res.data.success) {
        const fetchedCandidates = res.data.data.map(u => ({
          id: u._id,
          name: u.name,
          role: u.personalInfo?.title || 'Fresher Candidate',
          location: u.personalInfo?.location || 'Remote',
          score: u.assessmentScore || 0,
          match: u.jobMatchScore || 0, // In reality, this would be computed against a job
          skills: u.skills || [],
          verified: !!u.assessmentScore,
          email: u.email
        }));
        setCandidates(fetchedCandidates);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setCandidates([]);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs?myJobs=true');
      if (res.data.success) {
        setCompanyJobs(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedJob(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleInvite = async (candidateId) => {
    if (!selectedJob && user?.role === 'startup') {
      alert('Please select a job to invite the candidate to.');
      return;
    }

    setInvitingId(candidateId);
    try {
      await api.post('/jobs/invite', {
        candidateId: candidateId,
        jobId: selectedJob
      });

      // Simulate a network request
      await new Promise(r => setTimeout(r, 600));
      
      setInviteSuccess(candidateId);
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingId(null);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const term = searchQuery.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(term) ||
      candidate.role.toLowerCase().includes(term) ||
      candidate.location.toLowerCase().includes(term) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col font-sans text-slate-300 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header & Search */}
      <div className="bg-[#1E293B]/40 border-b border-slate-800 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-black text-white mb-4">Discover Top Talent</h1>
          <p className="text-slate-400 font-bold max-w-2xl mx-auto mb-8">Search our pool of pre-assessed, verified freshers ready to join your startup.</p>
          
          <div className="max-w-2xl mx-auto relative flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search candidates by role, skills, or location..." 
                className="w-full pl-12 pr-4 py-4 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-all shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {user?.role === 'startup' && companyJobs.length > 0 && (
              <div className="relative md:w-64">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <select 
                  className="w-full pl-12 pr-10 py-4 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22D3EE] transition-all appearance-none cursor-pointer"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="" disabled>Select Job to Invite...</option>
                  {companyJobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 flex flex-col group relative overflow-hidden transition-all hover:border-[#22D3EE]/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
            >
              {candidate.verified && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              )}
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B1120] border border-slate-700 flex items-center justify-center font-black text-2xl text-[#22D3EE] shadow-sm">
                    {candidate.name.charAt(0)}
                  </div>
                  {candidate.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0B1120] border border-slate-700 rounded-full flex items-center justify-center text-emerald-400 shadow-sm" title="Verified Assessment">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-black text-white group-hover:text-[#22D3EE] transition-colors leading-tight">{candidate.name}</h3>
                  <p className="text-sm text-slate-400 font-bold mt-1">{candidate.role}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {candidate.location}</p>
                </div>
              </div>

              <div className="mb-6 flex-1 relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs font-bold text-[#22D3EE] rounded-md flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#22D3EE]" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-[#0B1120] rounded-xl border border-slate-800 relative z-10">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{candidate.score}%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Assessment</div>
                </div>
                <div className="text-center border-l border-slate-800">
                  <div className="text-2xl font-black text-[#FBBF24]">{candidate.match}%</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Job Match</div>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                {inviteSuccess === candidate.id ? (
                  <button disabled className="flex-1 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                    <CheckCircle2 size={16} /> Invited!
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInvite(candidate.id)}
                    disabled={invitingId === candidate.id}
                    className="flex-1 py-2.5 bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-[#0B1120] font-black rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    {invitingId === candidate.id ? 'Sending...' : <><UserPlus size={16} /> Invite</>}
                  </button>
                )}
                <button className="px-4 py-2.5 bg-[#0B1120] hover:bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl transition-all flex items-center justify-center shadow-sm">
                  <Mail size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CandidateDirectory;
