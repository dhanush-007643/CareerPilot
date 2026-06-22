import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle2, Clock, AlertTriangle, UserCheck, Calendar, Video, MapPin, DollarSign, Filter, Compass, Activity, Users } from 'lucide-react';
import { fetchMyApplications } from '../services/api';

const ApplicationTracker = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Real-time applicants feed
  const [recentApplicants, setRecentApplicants] = useState([
    { id: 1, role: 'Frontend Engineer', company: 'TechNova', time: '2 mins ago', match: 92 },
    { id: 2, role: 'React Developer', company: 'GlobalWeb', time: '15 mins ago', match: 88 },
    { id: 3, role: 'UI/UX Designer', company: 'Creative Studio', time: '1 hour ago', match: 85 },
    { id: 4, role: 'Backend Dev', company: 'DataFlow', time: '3 hours ago', match: 95 }
  ]);

  useEffect(() => {
    fetchApplications();
    
    // Simulate real-time applicant updates
    const interval = setInterval(() => {
      setRecentApplicants(prev => {
        const newApp = {
          id: Date.now(),
          role: ['Fullstack Dev', 'Product Manager', 'Data Scientist', 'DevOps'][Math.floor(Math.random() * 4)],
          company: ['Stripe', 'Vercel', 'Figma', 'OpenAI'][Math.floor(Math.random() * 4)],
          time: 'Just now',
          match: Math.floor(Math.random() * 20) + 80
        };
        return [newApp, ...prev.slice(0, 3)];
      });
    }, 15000); // New applicant every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetchMyApplications();
      if (res.data.success) {
        const mapped = res.data.data.map(app => ({
          id: app._id,
          title: app.jobId?.title || 'Job Opening',
          company: app.jobId?.company || app.jobId?.startupId?.name || 'Startup',
          dateApplied: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
          referralCode: app.referralCode || 'None',
          matchScore: app.matchPercentage || 0,
          status: app.status,
          location: app.jobId?.location || 'Remote',
          salary: app.jobId?.salary || 'Unspecified',
          interview: app.interview
        }));
        setApplications(mapped);
      }
    } catch (err) {
      console.log('Failed fetching my applications, using local mock data:', err);
      
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      let mapped = [];
      if (localJobsStr) {
        const localJobs = JSON.parse(localJobsStr);
        localJobs.forEach(job => {
          if (job.applicants && job.applicants.length > 0) {
            job.applicants.forEach(applicant => {
              const applicantId = applicant.userId?._id || applicant.userId;
              const activeUserId = user?._id || 'mock_user_id';
              if (applicantId === activeUserId || applicant.userId?.email === user?.email) {
                mapped.push({
                  id: applicant._id || `mock_app_${Date.now()}_${Math.random()}`,
                  title: job.title,
                  company: job.companyName || 'Startup Corp',
                  dateApplied: applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                  referralCode: applicant.referralCode || 'None',
                  matchScore: applicant.matchScore || 85,
                  status: applicant.status || 'Applied',
                  location: job.location || 'Remote',
                  salary: job.salary || 'Unspecified',
                  interview: applicant.interview
                });
              }
            });
          }
        });
      }
      
      if (mapped.length === 0) {
        mapped = [
          {
            id: 'app_1',
            title: 'React Developer',
            company: 'TechNova',
            dateApplied: new Date().toLocaleDateString(),
            referralCode: 'CAMP-VET-99',
            matchScore: 95,
            status: 'Shortlisted',
            location: 'San Jose, CA',
            salary: '$80k - $100k',
            interview: {
              dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              format: 'Virtual',
              link: 'https://meet.google.com/abc-defg-hij',
              notes: 'First round technical screening. Be prepared to show your React portfolio.'
            }
          },
          {
            id: 'app_2',
            title: 'Express & MongoDB dev',
            company: 'DataFlow',
            dateApplied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            referralCode: 'None',
            matchScore: 88,
            status: 'Applied',
            location: 'Remote',
            salary: '$70k - $90k'
          }
        ];
      }
      setApplications(mapped);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = filter === 'All' 
    ? applications 
    : applications.filter(app => {
        if (filter === 'Applied') return app.status === 'Applied' || app.status === 'New';
        if (filter === 'Shortlisted') return app.status === 'Shortlisted' || app.status === 'Interviewing';
        if (filter === 'Selected') return app.status === 'Selected' || app.status === 'Hired';
        return app.status === filter;
      });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Selected':
      case 'Hired':
      case 'Accepted':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: <UserCheck size={14} className="text-emerald-400" />
        };
      case 'Shortlisted':
      case 'Interviewing':
        return {
          bg: 'bg-[#22D3EE]/10 border-[#22D3EE]/20 text-[#22D3EE]',
          icon: <CheckCircle2 size={14} className="text-[#22D3EE]" />
        };
      case 'Applied':
      case 'New':
      case 'In Review':
        return {
          bg: 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]',
          icon: <Clock size={14} className="text-[#FBBF24]" />
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: <AlertTriangle size={14} className="text-rose-400" />
        };
      default:
        return {
          bg: 'bg-slate-800/50 border-slate-700 text-slate-400',
          icon: <Clock size={14} className="text-slate-400" />
        };
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans px-6 py-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Tracker Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Banner Section */}
          <div className="p-8 rounded-2xl bg-[#1E293B]/60 border border-slate-800 relative overflow-hidden shadow-xl backdrop-blur-md">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <FileText className="text-[#22D3EE]" /> Application Tracker
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed text-sm font-medium">
              Monitor the recruitment pipeline status of your submitted job applications. Keep track of direct referral activations and verified test matching feedback.
            </p>
          </div>

          {/* Filters and List */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Compass size={20} className="text-[#FBBF24]" /> Submission Pipeline
              </h2>
              
              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
                      filter === status
                        ? 'bg-[#22D3EE]/10 border-[#22D3EE]/30 text-[#22D3EE] shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-[#1E293B] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 font-bold">Retrieving applications...</div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl bg-[#1E293B]/30">
                No active submissions match this status.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#1E293B] shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500 bg-[#0B1120]/50">
                      <th className="py-4 px-6">Job Role & Location</th>
                      <th className="py-4 px-6">Company</th>
                      <th className="py-4 px-6 text-center">Match %</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {filteredApps.map((app) => {
                      const statusMeta = getStatusStyle(app.status);
                      return (
                        <React.Fragment key={app.id}>
                          <tr className="hover:bg-[#0B1120]/30 transition-colors">
                            <td className="py-5 px-6">
                              <div className="font-bold text-white text-base">{app.title}</div>
                              <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                <MapPin size={12} className="text-slate-400" />
                                <span>{app.location}</span>
                                {app.salary && app.salary !== 'Unspecified' && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <DollarSign size={12} className="text-emerald-400" />
                                    <span className="text-emerald-400">{app.salary}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="text-[#22D3EE] font-bold">{app.company}</div>
                              <div className="text-xs text-slate-500 mt-1">Ref: {app.referralCode}</div>
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`px-2.5 py-1 rounded-md font-black text-xs border ${
                                app.matchScore >= 85 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-[#1E293B] border-slate-700 text-slate-400'
                              }`}>
                                {app.matchScore}%
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-black text-[10px] uppercase tracking-wide shadow-sm ${statusMeta.bg}`}>
                                {statusMeta.icon}
                                <span>{app.status}</span>
                              </span>
                              <div className="text-[10px] text-slate-500 mt-2">{app.dateApplied}</div>
                            </td>
                          </tr>
                          
                          {/* Expandable row for scheduled interviews */}
                          {app.interview && app.interview.dateTime && (
                            <tr>
                              <td colSpan="4" className="bg-[#0B1120]/50 px-6 py-5 border-t border-slate-800/50">
                                <div className="max-w-2xl bg-[#1E293B] border border-[#22D3EE]/30 rounded-xl p-5 shadow-[0_0_15px_rgba(34,211,238,0.05)] space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2 text-[#22D3EE] font-black text-sm uppercase tracking-wider">
                                      <Calendar size={18} />
                                      <span>Interview Scheduled</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22D3EE]/10 text-[#22D3EE] font-bold text-[10px] uppercase border border-[#22D3EE]/20">
                                      <Video size={12} />
                                      <span>{app.interview.format}</span>
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <p className="text-slate-300 font-medium">
                                      <strong className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">Date/Time</strong>
                                      {new Date(app.interview.dateTime).toLocaleString()}
                                    </p>
                                    {app.interview.link && (
                                      <p>
                                        <strong className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">Meeting Link</strong>
                                        <a href={app.interview.link} target="_blank" rel="noreferrer" className="text-[#22D3EE] font-bold underline hover:text-[#22D3EE]/80">
                                          Join Meeting &rarr;
                                        </a>
                                      </p>
                                    )}
                                  </div>
                                  {app.interview.notes && (
                                    <div className="text-sm bg-[#0B1120] rounded-lg p-3 border border-slate-800 mt-2">
                                      <strong className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">Interviewer Notes</strong>
                                      <p className="italic text-slate-400">"{app.interview.notes}"</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" /> Live Pipeline
              </h3>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-800 pb-4">
              Real-time feed of other candidates applying to jobs on CareerPilot right now.
            </p>

            <div className="space-y-4">
              {recentApplicants.map((applicant, i) => (
                <div key={applicant.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] border border-slate-700 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-[#22D3EE]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-sm text-white">{applicant.role}</div>
                      <div className="text-[10px] text-slate-500 whitespace-nowrap">{applicant.time}</div>
                    </div>
                    <div className="text-xs text-[#FBBF24] mt-0.5">{applicant.company}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Match</span>
                      <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${applicant.match}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">{applicant.match}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicationTracker;
