import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Clock, Bookmark, Filter, Building2, CheckCircle2, Share2, AlertCircle, EyeOff, Briefcase, Sparkles, Zap, ChevronRight, BellRing } from 'lucide-react';
import api from '../services/api';
import io from 'socket.io-client';
import { useToast, ToastContainer } from '../components/Toast';

const FresherJobBoard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('public');
  const [publicJobs, setPublicJobs] = useState([]);
  const [privateJobs, setPrivateJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterWFH, setFilterWFH] = useState(false);
  const [filterInternship, setFilterInternship] = useState(false);
  const [filterStipend, setFilterStipend] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchJobs();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { withCredentials: true });
    
    socket.on('new_job_posted', (newJob) => {
      // Prepend the new job to the public jobs array
      setPublicJobs(prev => [newJob, ...prev]);
      addToast(`🚨 Real-time update: ${newJob.companyId?.companyName || 'A startup'} just posted a new role: ${newJob.title}!`, 'success');
    });

    return () => {
      socket.off('new_job_posted');
      socket.disconnect();
    };
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [publicRes, privateRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/my-invitations')
      ]);

      let fetchedPublic = publicRes.data.success ? publicRes.data.data : [];
      let fetchedPrivate = privateRes.data.success ? privateRes.data.data : [];



      setPublicJobs(fetchedPublic);
      setPrivateJobs(fetchedPrivate);

      if (fetchedPublic.length > 0) {
        setActiveJobId(fetchedPublic[0]._id);
      } else if (fetchedPrivate.length > 0) {
        setActiveTab('private');
        setActiveJobId(fetchedPrivate[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setPublicJobs([]);
      setPrivateJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const jobs = tab === 'public' ? publicJobs : privateJobs;
    if (jobs.length > 0) {
      setActiveJobId(jobs[0]._id);
    } else {
      setActiveJobId(null);
    }
  };

  const displayedJobs = activeTab === 'public' ? publicJobs : privateJobs;
  
  const filteredJobs = displayedJobs.filter(j => {
    const matchesSearch = (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (j.company || j.companyId?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.requiredSkills || []).some(s => (s || '').toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = filterLocation ? (j.location || 'Remote').toLowerCase().includes(filterLocation.toLowerCase()) : true;
    const matchesType = filterType ? (j.jobType || 'Full-Time').toLowerCase() === filterType.toLowerCase() : true;
    
    // Advanced Filters
    const matchesWFH = filterWFH ? (j.location || 'Remote').toLowerCase().includes('remote') || (j.location || 'Remote').toLowerCase().includes('wfh') : true;
    const matchesInternship = filterInternship ? (j.jobType || '').toLowerCase().includes('internship') : true;
    const matchesStipend = filterStipend ? (j.salary || '').toLowerCase().includes('stipend') || (j.salary || '').toLowerCase().includes('paid') || /\$[1-9]/.test(j.salary) : true;

    return matchesSearch && matchesLocation && matchesType && matchesWFH && matchesInternship && matchesStipend;
  });

  const activeJob = displayedJobs.find(j => j._id === activeJobId);

  const toggleSave = (id, e) => {
    e.stopPropagation();
    if (activeTab === 'public') {
      setPublicJobs(publicJobs.map(j => j._id === id ? { ...j, isSaved: !j.isSaved } : j));
    } else {
      setPrivateJobs(privateJobs.map(j => j._id === id ? { ...j, isSaved: !j.isSaved } : j));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans text-slate-600 circuit-bg-light">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Header & Search */}
      <div className="relative z-40 bg-[#0F172A] border-b border-slate-800 sticky top-[80px] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <Briefcase size={28} className="text-blue-600" />
                Opportunities Hub
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Discover roles that match your ambition and skills.</p>
            </div>

            <div className="w-full md:w-[450px] relative group">
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search jobs, skills, or companies..." 
                  className="w-full pl-12 pr-12 py-3 bg-[#0F172A] border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all font-medium placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`absolute right-3 p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options Menu */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 mt-6 p-5 bg-slate-50 border border-slate-800 rounded-xl shadow-sm">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Location</label>
                    <select 
                      value={filterLocation} 
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="new york">New York</option>
                      <option value="san francisco">San Francisco</option>
                      <option value="london">London</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Job Type</label>
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px] flex flex-col justify-center gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={filterWFH} onChange={(e) => setFilterWFH(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      Work From Home
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={filterInternship} onChange={(e) => setFilterInternship(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      Internships Only
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={filterStipend} onChange={(e) => setFilterStipend(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      Stipend / Paid Only
                    </label>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => { setFilterLocation(''); setFilterType(''); setSearchQuery(''); setFilterWFH(false); setFilterInternship(false); setFilterStipend(false); }}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors h-11"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-6 mt-8">
            <button 
              onClick={() => handleTabChange('public')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'public' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase size={16} /> Explore Market
            </button>
            <button 
              onClick={() => handleTabChange('private')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'private' 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap size={16} /> Exclusive Invites
              {privateJobs.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {privateJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] relative z-10">
        
        {/* Left Panel: Job Listings */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>{loading ? 'Scanning market...' : `${filteredJobs.length} matches found`}</span>
          </p>
          
          <AnimatePresence>
            {!loading && filteredJobs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center p-12 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No roles found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your search terms or filters.</p>
              </motion.div>
            )}
            {filteredJobs.map((job, index) => {
              const companyName = job.company || job.companyId?.companyName || 'Startup';
              const isActive = activeJobId === job._id;
              
              return (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveJobId(job._id)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 group ${
                  isActive 
                    ? `bg-blue-50/50 border-2 border-blue-500 shadow-md` 
                    : 'bg-[#0F172A] border-2 border-slate-100 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${activeTab === 'private' ? 'bg-purple-600' : 'bg-blue-600'}`} />
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-4 pl-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${
                      isActive ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-800 text-slate-600'
                    }`}>
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base leading-tight transition-colors ${isActive ? 'text-slate-900' : 'text-slate-800 group-hover:text-blue-600'}`}>
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-semibold text-slate-500">{companyName}</p>
                        {activeTab === 'private' && (
                          <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <EyeOff size={10} /> Invite
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => toggleSave(job._id, e)}
                    className={`p-2 rounded-lg transition-all ${job.isSaved ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-slate-100'}`}
                  >
                    <Bookmark size={18} className={job.isSaved ? 'fill-amber-500' : ''} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold text-slate-600 relative z-10 pl-1">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md"><MapPin size={14} className="text-slate-400" /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md"><DollarSign size={14} className="text-emerald-600" /> {job.salary || 'Competitive'}</span>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10 pl-1">
                  {job.requiredSkills?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills?.length > 3 && <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">+{job.requiredSkills.length - 3}</span>}
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>

        {/* Right Panel: Job Details */}
        <div className="hidden lg:flex lg:col-span-7 h-full relative">
          <AnimatePresence mode="wait">
            {activeJob ? (
              <motion.div
                key={activeJob._id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg relative"
              >
                {/* Solid Top Banner */}
                <div className={`absolute top-0 inset-x-0 h-1.5 ${activeTab === 'private' ? 'bg-purple-600' : 'bg-blue-600'}`} />

                {/* Job Header */}
                <div className="p-8 border-b border-slate-100 bg-[#0F172A] pt-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-800 flex items-center justify-center font-black text-3xl text-slate-800 shadow-sm">
                      {(activeJob.company || activeJob.companyId?.companyName || 'S').charAt(0)}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{activeJob.title}</h1>
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-500">
                      <Building2 size={18} />
                      {activeJob.company || activeJob.companyId?.companyName}
                      
                      {activeTab === 'private' && (
                        <span className="ml-2 px-2.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-xs font-bold flex items-center gap-1 uppercase tracking-wide">
                          <Zap size={12} className="fill-purple-700" /> Exclusive Invite
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-800 rounded-lg"><MapPin className="text-slate-400" size={16} /> {activeJob.location || 'Remote'}</div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-800 rounded-lg"><DollarSign className="text-emerald-600" size={16} /> {activeJob.salary || 'Competitive Match'}</div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-800 rounded-lg"><Briefcase className="text-slate-400" size={16} /> {activeJob.jobType || 'Full-Time'}</div>
                  </div>
                </div>

                {/* Job Body */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
                  
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-blue-600" /> 
                      Tech Stack & Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeJob.requiredSkills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-[#0F172A] text-slate-700 text-sm font-semibold rounded-lg border border-slate-800 shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">About the Role</h3>
                    <div 
                      className="text-slate-600 leading-relaxed text-base bg-[#0F172A] p-6 rounded-xl border border-slate-800 prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeJob.description || '<p>No description provided.</p>' }}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t border-slate-800 bg-[#0F172A] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <AlertCircle size={18} className="text-slate-400" />
                    <span>Review details and apply directly.</span>
                  </div>
                  <button 
                    onClick={() => {
                      const url = `/fresher/jobs/${activeJob._id}/apply${activeJob.inviteCode ? `?inviteCode=${activeJob.inviteCode}` : ''}`;
                      navigate(url);
                    }}
                    className={`px-8 py-3.5 font-bold text-base rounded-xl transition-colors flex items-center gap-2 ${
                      activeTab === 'private' 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    Apply Now <ChevronRight size={18} />
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-[#0F172A] border border-slate-800 rounded-2xl">
                {loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <span className="font-bold text-slate-500">Syncing opportunities...</span>
                  </div>
                ) : (
                  <>
                    <Briefcase size={48} className="mb-4 text-slate-300" />
                    <span className="font-bold text-slate-500">Select a role to view the full JD</span>
                  </>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default FresherJobBoard;
