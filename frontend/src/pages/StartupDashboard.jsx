import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Briefcase, Users, KanbanSquare, Calendar, BarChart3, Building2, UserPlus, CheckCircle, Clock, MoreVertical, Eye, EyeOff, Send, Copy, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import CandidateInvitationModal from '../components/CandidateInvitationModal';
import api from '../services/api';

const mockChartData = [
  { name: 'Mon', applications: 4 },
  { name: 'Tue', applications: 7 },
  { name: 'Wed', applications: 5 },
  { name: 'Thu', applications: 12 },
  { name: 'Fri', applications: 18 },
  { name: 'Sat', applications: 9 },
  { name: 'Sun', applications: 15 },
];

const StartupDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  // Real-time recent applications feed state
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs?myJobs=true');
      let fetchedJobs = [];
      if (res.data.success) {
        fetchedJobs = res.data.data;
      }
      
      setJobs(fetchedJobs);
      
      // Extract existing applicants for the initial feed
      let extractedApps = [];
      fetchedJobs.forEach(job => {
        if (job.applicants && job.applicants.length > 0) {
          job.applicants.forEach(app => {
            extractedApps.push({
              id: app._id,
              userId: app.userId?._id,
              name: app.userId?.name || 'Applicant',
              role: job.title,
              time: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
              match: app.matchScore || Math.floor(Math.random() * 10) + 80,
              isNew: false
            });
          });
        }
      });
      
      // Sort by newest first (assuming ID or date implies order)
      extractedApps = extractedApps.reverse();
      
      setRecentApps(extractedApps.slice(0, 4));

    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (job) => {
    try {
      const newVisibility = job.jobVisibility === 'public' ? 'private' : 'public';
      const res = await api.put(`/jobs/${job._id}/visibility`, { jobVisibility: newVisibility });
      if (res.data.success) {
        setJobs(jobs.map(j => j._id === job._id ? { ...j, jobVisibility: newVisibility, inviteCode: res.data.data.inviteCode } : j));
      }
    } catch (error) {
      // Optimistic local update
      const newVisibility = job.jobVisibility === 'public' ? 'private' : 'public';
      setJobs(jobs.map(j => j._id === job._id ? { ...j, jobVisibility: newVisibility } : j));
    }
    setActionMenuOpen(null);
  };

  const openInviteModal = (job) => {
    if (job.jobVisibility !== 'private') {
      alert('You can only invite candidates directly to Private jobs. Change visibility first.');
      return;
    }
    setSelectedJob(job);
    setInviteModalOpen(true);
    setActionMenuOpen(null);
  };

  const copyLink = (job) => {
    if (!job.inviteCode && !job._id) {
      alert('No invite code generated for this job.');
      return;
    }
    navigator.clipboard.writeText(`${window.location.origin}/invite/${job.inviteCode || job._id}`);
    alert('Invite link copied!');
    setActionMenuOpen(null);
  };

  return (
    <div className="flex bg-[#0B1120] text-slate-300 min-h-screen font-sans relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-[calc(100vh-80px)] z-10 relative">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex justify-between items-end bg-[#1E293B]/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black text-white tracking-tight flex items-center gap-3"
              >
                <Building2 className="text-[#22D3EE]" size={32} />
                {user?.companyName || user?.name || 'Acme Startup'} Workspace
              </motion.h1>
              <p className="text-slate-400 mt-2 font-medium">Manage your recruitment pipeline and track hiring metrics.</p>
            </div>
            <Link to="/startup/post-job" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[#22D3EE] text-[#0B1120] font-black rounded-xl hover:bg-[#22D3EE]/90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <PlusCircle size={18} /> Post New Job
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Jobs', value: jobs.length || '0', icon: Briefcase, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10 border-[#22D3EE]/30' },
              { label: 'Total Applicants', value: jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
              { label: 'Interviews', value: '12', icon: Calendar, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10 border-[#FBBF24]/30' },
              { label: 'Hires', value: '3', icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 flex flex-col hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Wider) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Analytics Chart */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BarChart3 className="text-[#22D3EE]" size={20} /> Application Traffic
                  </h2>
                  <select className="bg-[#0B1120] border border-slate-700 text-slate-300 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#22D3EE]">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '8px', color: '#F8FAFC' }}
                        itemStyle={{ color: '#22D3EE', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="applications" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Active Jobs Quick View */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 overflow-visible">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Briefcase className="text-[#FBBF24]" size={20} /> Active Postings
                  </h2>
                  <Link to="/startup/pipeline" className="text-xs font-bold text-[#22D3EE] hover:text-white transition-colors">View Pipeline</Link>
                </div>
                <div className="overflow-visible">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800 bg-[#0B1120]/50">
                      <tr>
                        <th className="py-4 px-4 rounded-tl-lg">Job Title</th>
                        <th className="py-4 px-4">Visibility</th>
                        <th className="py-4 px-4">Applicants</th>
                        <th className="py-4 px-4 text-right rounded-tr-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {loading ? (
                        <tr><td colSpan="4" className="py-8 text-center font-bold text-slate-500">Loading jobs...</td></tr>
                      ) : jobs.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center font-bold text-slate-500">No active postings found.</td></tr>
                      ) : (
                        jobs.map((job) => (
                          <tr key={job._id} className="hover:bg-[#0B1120]/30 transition-colors">
                            <td className="py-4 px-4 font-bold text-white">{job.title}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 flex w-fit items-center gap-1.5 rounded-md text-[10px] uppercase font-black tracking-wide border ${job.jobVisibility === 'private' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                {job.jobVisibility === 'private' ? <EyeOff size={12} /> : <Eye size={12} />}
                                {job.jobVisibility}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-[#22D3EE]">{job.applicants?.length || 0}</td>
                            <td className="py-4 px-4 text-right relative">
                              <button 
                                onClick={() => setActionMenuOpen(actionMenuOpen === job._id ? null : job._id)}
                                className="text-slate-500 hover:text-[#22D3EE] p-1.5 rounded-md hover:bg-[#22D3EE]/10 transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {actionMenuOpen === job._id && (
                                <div className="absolute right-6 top-10 mt-1 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                  <button onClick={() => handleToggleVisibility(job)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-300 hover:bg-[#0B1120] hover:text-[#22D3EE] flex items-center gap-2 transition-colors">
                                    {job.jobVisibility === 'public' ? <EyeOff size={14} /> : <Eye size={14} />}
                                    Make {job.jobVisibility === 'public' ? 'Private' : 'Public'}
                                  </button>
                                  {job.jobVisibility === 'private' && (
                                    <>
                                      <button onClick={() => openInviteModal(job)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-300 hover:bg-[#0B1120] hover:text-[#22D3EE] flex items-center gap-2 transition-colors">
                                        <Send size={14} /> Invite Candidates
                                      </button>
                                      <button onClick={() => copyLink(job)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-300 hover:bg-[#0B1120] hover:text-[#22D3EE] flex items-center gap-2 transition-colors">
                                        <Copy size={14} /> Copy Referral Link
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Real-time Applications Feed */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400" /> Live Applications
                  </h2>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div className="space-y-3">
                  {recentApps.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-500">Waiting for applications...</div>
                  ) : (
                    recentApps.map((app, i) => (
                      <div 
                        key={app.id} 
                        onClick={() => app.userId && window.open(`/candidates/${app.userId}`, '_blank')}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${app.isNew ? 'bg-[#0B1120] border-[#22D3EE]/50 shadow-[0_0_15px_rgba(34,211,238,0.1)] animate-in fade-in slide-in-from-top-4 duration-500' : 'bg-[#0B1120] border-slate-800 hover:border-slate-600'}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-slate-700 shadow-sm flex items-center justify-center font-black text-slate-500 group-hover:text-[#22D3EE] shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h5 className="text-sm font-bold text-white truncate group-hover:text-[#22D3EE] transition-colors">{app.name}</h5>
                            {app.isNew && <span className="w-2 h-2 rounded-full bg-[#22D3EE] shrink-0 mt-1.5 ml-2 shadow-[0_0_5px_#22D3EE]"></span>}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24] truncate">{app.role}</p>
                            <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 ml-2 shrink-0"><Clock size={10} /> {app.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Link to="/startup/pipeline" className="block w-full text-center mt-5 py-2.5 border border-slate-700 rounded-xl text-xs font-bold text-[#22D3EE] bg-[#0B1120] hover:bg-slate-800 transition-all shadow-sm">
                  View Full Pipeline
                </Link>
              </section>

              {/* Hiring Checklist / Setup */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Setup</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-slate-500 line-through font-medium">Complete Profile</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-slate-500 line-through font-medium">Post First Job</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-600 shrink-0" />
                    <span className="text-white font-bold">Review Candidates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-600 shrink-0" />
                    <span className="text-white font-bold">Schedule Interview</span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CandidateInvitationModal 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        job={selectedJob} 
      />
    </div>
  );
};

export default StartupDashboard;
