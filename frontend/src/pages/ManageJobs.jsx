import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Trash2 } from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await adminService.getJobs();
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this job?`)) return;
    try {
      // Assuming a delete endpoint exists in adminController or we rely on startup controller
      // await adminService.deleteJob(id);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">Manage <span className="text-indigo-400">Jobs</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{job.title}</td>
                  <td className="px-5 py-4">{job.companyId?.companyName || job.company || 'Unknown'}</td>
                  <td className="px-5 py-4">{job.domain}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${job.jobVisibility === 'public' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {job.jobVisibility || 'public'}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    <button onClick={() => handleDelete(job._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
