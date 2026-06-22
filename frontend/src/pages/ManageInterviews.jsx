import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const ManageInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await adminService.getInterviews();
      if (res.success) setInterviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">Manage <span className="text-blue-400">Interviews</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {interviews.map((intv) => (
                <tr key={intv._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{intv.candidateId?.name || 'Unknown'}</td>
                  <td className="px-5 py-4">{intv.companyId?.companyName || 'Unknown'}</td>
                  <td className="px-5 py-4">{intv.date ? new Date(intv.date).toLocaleDateString() : 'TBD'} {intv.time ? `at ${intv.time}` : ''}</td>
                  <td className="px-5 py-4">{intv.mode}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs">{intv.status}</span>
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

export default ManageInterviews;
