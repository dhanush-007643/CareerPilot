import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Trash2, Ban } from 'lucide-react';

const ManageFreshers = () => {
  const [freshers, setFreshers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreshers();
  }, []);

  const fetchFreshers = async () => {
    try {
      const res = await adminService.getFreshers();
      if (res.success) setFreshers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionStr, apiCall) => {
    if (!window.confirm(`Are you sure you want to ${actionStr} this fresher?`)) return;
    try {
      await apiCall(id);
      fetchFreshers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">Manage <span className="text-cyan-400">Freshers</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Skills</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {freshers.map((fresher) => (
                <tr key={fresher._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{fresher.name}</td>
                  <td className="px-5 py-4">{fresher.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {fresher.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    <button onClick={() => handleAction(fresher._id, 'block', adminService.blockFresher)} className="p-1.5 text-orange-400 hover:bg-orange-500/10 rounded" title="Block">
                      <Ban size={16} />
                    </button>
                    <button onClick={() => handleAction(fresher._id, 'delete', adminService.deleteFresher)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
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

export default ManageFreshers;
