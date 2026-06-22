import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit2, X, CheckCircle, Search, MapPin, Briefcase, Tag } from 'lucide-react';
import api from '../services/api';

const AdminJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editDomain, setEditDomain] = useState('Software Engineering');
  const [editDescription, setEditDescription] = useState('');
  const [editIsWFH, setEditIsWFH] = useState(false);
  const [editJobType, setEditJobType] = useState('Full-Time');
  const [editHasStipend, setEditHasStipend] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Fallback local storage mock
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      const localMock = localJobsStr ? JSON.parse(localJobsStr) : [];
      setJobs(localMock);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy listing? This will also remove related applications.')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/jobs/${id}`);
      if (res.data.success) {
        setJobs(jobs.filter(j => j._id !== id));
        alert('Job vacancy removed successfully.');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      setJobs(jobs.filter(j => j._id !== id));
      // Fallback mock delete
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      if (localJobsStr) {
        const local = JSON.parse(localJobsStr).filter(j => j._id !== id);
        localStorage.setItem('mock_startup_jobs', JSON.stringify(local));
      }
      alert('Mock Delete: Job vacancy removed locally.');
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditCompany(job.company || '');
    setEditLocation(job.location || 'Remote');
    setEditSalary(job.salary || 'Unspecified');
    setEditExperience(job.experience || 'Freshers welcome');
    setEditDomain(job.domain || 'Software Engineering');
    setEditDescription(job.description || '');
    setEditIsWFH(job.isWFH === true || job.isWFH === 'true');
    setEditJobType(job.jobType || 'Full-Time');
    setEditHasStipend(job.hasStipend === true || job.hasStipend === 'true');
    setSuccess('');
    setError('');
  };

  const closeEditModal = () => {
    setEditingJob(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      title: editTitle,
      company: editCompany,
      location: editLocation,
      salary: editSalary,
      experience: editExperience,
      domain: editDomain,
      description: editDescription,
      isWFH: editIsWFH,
      jobType: editJobType,
      hasStipend: editHasStipend
    };

    try {
      const res = await api.put(`/admin/jobs/${editingJob._id}`, payload);
      if (res.data.success) {
        setSuccess('Job vacancy updated successfully.');
        setJobs(jobs.map(j => j._id === editingJob._id ? { ...j, ...res.data.data } : j));
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating job:', err);
      // Fallback mock update
      setJobs(jobs.map(j => j._id === editingJob._id ? { ...j, ...payload } : j));
      const localJobsStr = localStorage.getItem('mock_startup_jobs');
      if (localJobsStr) {
        const local = JSON.parse(localJobsStr).map(j => j._id === editingJob._id ? { ...j, ...payload } : j);
        localStorage.setItem('mock_startup_jobs', JSON.stringify(local));
      }
      setSuccess('Mock Update: Vacancy updated locally.');
      setTimeout(() => {
        closeEditModal();
      }, 1500);
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (job.title?.toLowerCase() || '').includes(term);
    const companyMatch = ((job.company || job.startupId?.name || '')?.toLowerCase() || '').includes(term);
    const domainMatch = (job.domain?.toLowerCase() || '').includes(term);
    return titleMatch || companyMatch || domainMatch;
  });

  const domainsList = [
    'Software Engineering',
    'Data Science',
    'UI/UX Design',
    'Product Management',
    'Marketing',
    'Finance',
    'Sales',
    'Operations'
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 text-slate-350 px-6 py-12 overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Console</span>
        </button>

        {/* Title banner */}
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Jobs Manager <span className="text-rose-500 text-lg">💼</span>
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Platform-wide job vacancies controller. Edit title, salary, locations, or delete spam/duplicate listings.
            </p>
          </div>
          
          <div className="relative w-full md:w-72 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by title, company, domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-850 text-white outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <p className="text-center py-20 text-xs uppercase tracking-widest text-slate-500 animate-pulse">Loading vacancies...</p>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div 
                key={job._id}
                className="p-5 bg-slate-900/30 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-500/20 transition-all shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{job.title}</h3>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                      {job.domain || 'Software Engineering'}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      job.jobType === 'Internship' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {job.jobType || 'Full-Time'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400">{job.company || job.startupId?.name || 'Recruiter Corp'}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{job.location}</span>
                    </span>
                    <span>•</span>
                    <span>Salary: {job.salary}</span>
                    <span>•</span>
                    <span>Exp: {job.experience}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:justify-end">
                  <button
                    onClick={() => openEditModal(job)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-800 transition-all"
                  >
                    <Edit2 size={11} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 size={11} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-850">
                <p className="text-slate-500 text-xs italic">No matching job vacancies found.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit modal popup */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              Edit Job Vacancy Details
            </h3>

            {success && (
              <div className="mb-4 px-4 py-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Domain</label>
                  <select
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  >
                    {domainsList.map(dom => (
                      <option key={dom} value={dom}>{dom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Type</label>
                  <select
                    value={editJobType}
                    onChange={(e) => setEditJobType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Salary range</label>
                  <input
                    type="text"
                    value={editSalary}
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Experience level</label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex gap-6 py-2 px-3 bg-slate-950 rounded-xl border border-slate-850">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editIsWFH}
                    onChange={(e) => setEditIsWFH(e.target.checked)}
                    className="rounded border-slate-800 text-rose-500 bg-slate-950 focus:ring-rose-500"
                  />
                  <span>Work From Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editHasStipend}
                    onChange={(e) => setEditHasStipend(e.target.checked)}
                    className="rounded border-slate-800 text-rose-500 bg-slate-950 focus:ring-rose-500"
                  />
                  <span>Has Stipend / Compensation</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Description</label>
                <textarea
                  rows={5}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors pt-2"
              >
                {submitLoading ? 'Saving Changes...' : 'Save Job Opening'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminJobs;
