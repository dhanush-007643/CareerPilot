import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { CheckCircle } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await adminService.getReports();
      if (res.success) setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminService.resolveReport(id, 'Resolved', 'Resolved by admin via dashboard');
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">System <span className="text-red-400">Reports</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Reporter</th>
                <th className="px-5 py-3">Reported Entity</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {reports.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-8 text-center">No reports found.</td></tr>
              ) : reports.map((report) => (
                <tr key={report._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{report.reporterId?.name}</td>
                  <td className="px-5 py-4">{report.reportedId?.name || 'Unknown User'}</td>
                  <td className="px-5 py-4">{report.reason}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    {report.status !== 'Resolved' && (
                      <button onClick={() => handleResolve(report._id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded" title="Mark Resolved">
                        <CheckCircle size={16} />
                      </button>
                    )}
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

export default Reports;
