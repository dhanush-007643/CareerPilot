import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Clock, CheckCircle, AlertTriangle, User, FileText, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import api from '../services/api';

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Fallback local mock data
      const mock = [
        {
          _id: 'app_1',
          userId: { _id: 'fresher_1', name: 'Alex Mercer', email: 'fresher@example.com', skills: ['React.js', 'Node.js', 'Express', 'Tailwind CSS'] },
          jobId: { _id: 'job_1', title: 'Full Stack Engineer (MERN)', company: 'Google DeepMind', domain: 'Software Engineering' },
          matchPercentage: 100,
          status: 'New',
          coverLetter: 'I am highly passionate about AI integrations and MERN stack applications.',
          createdAt: new Date().toISOString()
        }
      ];
      setApplications(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      const res = await api.put('/admin/applications/status', { applicationId, status });
      if (res.data.success) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: res.data.data.status } : app
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      // Fallback mock update
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    const candName = app.userId?.name?.toLowerCase() || '';
    const candEmail = app.userId?.email?.toLowerCase() || '';
    const jobTitle = app.jobId?.title?.toLowerCase() || '';
    const company = (app.jobId?.company || '')?.toLowerCase() || '';

    const matchesSearch = candName.includes(term) || candEmail.includes(term) || jobTitle.includes(term) || company.includes(term);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter || (statusFilter === 'Applied' && app.status === 'New');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Selected':
      case 'Hired':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Shortlisted':
      case 'Interviewing':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Applied':
      case 'New':
      default:
        return 'bg-amber-500/10 text-amber-550 border-amber-500/20';
    }
  };

  const statusOptions = ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected'];

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 text-slate-300 px-6 py-12 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Console</span>
        </button>

        {/* Header Block */}
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              ATS pipelines <span className="text-rose-500 text-lg">📁</span>
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Inspect candidate submissions, check compatibility scores, read cover letters, and modify ATS pipelines globally.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60 md:flex-initial">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search candidates, jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-850 text-white outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-850 text-white outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Applied">Applied / New</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <p className="text-center py-20 text-xs uppercase tracking-widest text-slate-500 animate-pulse">Loading candidacies...</p>
        ) : (
          <div className="space-y-6">
            {filteredApps.map((app) => (
              <div 
                key={app._id}
                className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4 hover:border-rose-500/10 transition-colors"
              >
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold text-white">
                        <User size={13} className="text-slate-500" />
                        <span>{app.userId?.name || 'Candidate'}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{app.userId?.email}</span>
                    </div>

                    <div className="pt-1">
                      <h4 className="text-sm font-black text-slate-200">
                        {app.jobId?.title || 'Job Opening'}
                      </h4>
                      <p className="text-[10px] font-bold text-rose-400 mt-0.5">
                        {app.jobId?.company || 'Startup Corp'}
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Score & Status Controls */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Match Grade</span>
                      <strong className="text-base font-black text-cyan-400">{app.matchPercentage}%</strong>
                    </div>

                    <div className="relative">
                      {updatingId === app._id ? (
                        <div className="h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <select
                          value={app.status === 'New' ? 'Applied' : app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${getStatusBadgeStyle(app.status)}`}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-slate-950 text-slate-350">{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate details / Skills */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/80 space-y-3">
                  {app.userId?.skills && app.userId.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Skills Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {app.userId.skills.map((skill, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.coverLetter && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Candidacy Statement</span>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{app.coverLetter}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer date */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.resume?.fileName && (
                    <span className="text-rose-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <FileText size={11} />
                      <span>{app.resume.fileName}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredApps.length === 0 && (
              <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-850">
                <p className="text-slate-500 text-xs italic">No candidate applications found.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminApplications;
