import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Building2, FileText, CheckCircle, Bell, User as UserIcon, Activity, Star, ChevronRight, MapPin, Mail, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FresherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    saved: 0,
    invitations: 0
  });

  const [invitations, setInvitations] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [invRes, folRes, notifRes, appsRes, scoresRes] = await Promise.all([
        api.get('/invitations/candidate').catch(() => ({ data: { data: [] } })),
        api.get('/followers/my-followed-companies').catch(() => ({ data: { data: [] } })),
        api.get('/notifications/user').catch(() => ({ data: { data: [] } })),
        api.get('/applications/my').catch(() => ({ data: { data: [] } })),
        api.get('/quizzes/scores').catch(() => ({ data: { data: [] } }))
      ]);

      const invData = invRes.data?.data || [];
      const folData = folRes.data?.data || [];
      const notifData = notifRes.data?.data || [];
      const appsData = appsRes.data?.data || [];
      const scoresData = scoresRes.data?.data || [];

      setInvitations(invData.slice(0, 3));
      setFollowed(folData.slice(0, 3));
      setNotifications(notifData.slice(0, 4));

      // Compute max score
      let highestScore = 0;
      if (scoresData.length > 0) {
        highestScore = Math.max(...scoresData.map(s => s.score));
      }

      // No more mock stats
      setStats({
        applications: appsData.length,
        interviews: appsData.filter(a => a.status === 'Interviewing').length || 0,
        saved: folData.length, // Fallback since saved jobs endpoint doesn't exist
        invitations: invData.filter(i => i.status === 'Pending').length || 0,
        score: highestScore
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-[#0B1120] min-h-screen font-sans text-slate-300">
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex justify-between items-end">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black text-white tracking-tight"
              >
                Welcome back, {user?.name || 'Explorer'}
              </motion.h1>
              <p className="text-slate-400 mt-2 font-medium">Here is what's happening with your job search today.</p>
            </div>
            <Link to="/fresher/profile" className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#1E293B] border border-slate-700 shadow-sm rounded-xl hover:border-[#22D3EE]/50 transition-colors">
              <span className="text-sm font-bold text-[#22D3EE]">Complete Profile (80%)</span>
              <div className="w-24 h-2.5 bg-[#0B1120] rounded-full overflow-hidden border border-slate-800">
                <div className="w-[80%] h-full bg-[#22D3EE] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Applied Jobs', value: stats.applications, icon: FileText, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10 border-[#22D3EE]/20' },
              { label: 'Pending Invites', value: stats.invitations, icon: Mail, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10 border-[#FBBF24]/20' },
              { label: 'Saved Jobs', value: stats.saved, icon: Bookmark, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Assessment Score', value: `${stats.score || 0}%`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 flex flex-col"
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
              
              {/* Pending Invitations */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/5 rounded-full blur-[50px]"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Mail size={20} className="text-[#FBBF24]"/> Recent Invitations
                  </h2>
                  <Link to="/invitations" className="text-sm font-bold text-[#22D3EE] hover:text-white flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                
                {invitations.length === 0 ? (
                  <div className="text-center py-6 border border-slate-800 rounded-xl bg-[#0B1120]">
                    <p className="text-sm text-slate-500">No pending invitations.</p>
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10">
                    {invitations.map((inv, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0B1120] border border-slate-800 rounded-xl hover:border-[#FBBF24]/30 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center font-black text-xl text-slate-500">
                            {inv.companyId?.logo ? <img src={inv.companyId.logo} alt="logo" className="w-full h-full object-cover rounded-xl"/> : inv.companyId?.companyName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{inv.companyId?.companyName || 'Company'}</h4>
                            <div className="text-xs font-semibold text-slate-400 mt-1">Invited you to apply</div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            inv.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                            inv.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-[#FBBF24]/10 text-[#FBBF24]'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recommended Jobs */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Star size={20} className="text-[#22D3EE]"/> Recommended Jobs
                  </h2>
                  <Link to="/fresher/jobs" className="text-sm font-bold text-[#22D3EE] hover:text-white flex items-center gap-1 transition-colors">
                    Browse Jobs <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { role: 'Frontend Engineer', company: 'TechNova', location: 'Remote', salary: '$80k - $120k', match: 92 },
                    { role: 'React Developer', company: 'GlobalWeb', location: 'New York, NY', salary: '$90k - $110k', match: 88 }
                  ].map((job, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.01 }}
                      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#0B1120] border border-slate-800 rounded-xl hover:border-[#22D3EE]/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center font-black text-xl text-slate-500 group-hover:text-[#22D3EE]">
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-[#22D3EE] transition-colors text-base">{job.role}</h4>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mt-1">
                            <span>{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500"/> {job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block border border-emerald-500/20">{job.match}% Match</div>
                          <div className="text-xs font-semibold text-slate-500 mt-1">{job.salary}</div>
                        </div>
                        <button className="px-5 py-2.5 bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 font-bold text-xs rounded-lg hover:bg-[#22D3EE]/20 transition-colors shadow-sm">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Followed Companies */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white">Followed Companies</h2>
                  <Link to="/followed-companies" className="text-xs font-bold text-[#22D3EE] hover:text-white transition-colors">View All</Link>
                </div>
                {followed.length === 0 ? (
                  <div className="text-center py-4 bg-[#0B1120] rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500">Not following any companies.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followed.map((comp, i) => (
                      <div key={i} onClick={() => navigate(`/companies/${comp._id}`)} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#0B1120] hover:border-[#22D3EE]/50 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center font-black text-slate-500 group-hover:text-[#22D3EE]">
                            {comp.logo ? <img src={comp.logo} alt="" className="w-full h-full object-cover rounded-lg"/> : comp.companyName?.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">{comp.companyName}</h5>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{comp.industry}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Notifications */}
              <section className="bg-[#1E293B] border border-slate-700 shadow-xl rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white">Recent Notifications</h2>
                  <Link to="/notifications" className="text-xs font-bold text-[#22D3EE] hover:text-white transition-colors">View All</Link>
                </div>
                <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
                  {notifications.length === 0 ? (
                    <div className="pl-4 text-xs text-slate-500">No new notifications.</div>
                  ) : (
                    notifications.map((act, i) => (
                      <div key={i} className="relative pl-6">
                        <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#1E293B] shadow-sm ${
                          act.status === 'unread' ? 'bg-[#22D3EE]' : 'bg-slate-500'
                        }`} />
                        <h5 className={`text-sm font-bold ${act.status==='unread' ? 'text-white' : 'text-slate-400'}`}>{act.title}</h5>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{act.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FresherDashboard;
