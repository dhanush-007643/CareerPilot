import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { CheckCircle, XCircle, Trash2, Ban } from 'lucide-react';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await adminService.getCompanies();
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionStr, apiCall) => {
    if (!window.confirm(`Are you sure you want to ${actionStr} this company?`)) return;
    try {
      await apiCall(id);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">Manage <span className="text-rose-500">Companies</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Company Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{company.name}</td>
                  <td className="px-5 py-4">{company.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${company.visibility === 'private' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {company.visibility === 'private' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    <button onClick={() => handleAction(company._id, 'approve', adminService.approveCompany)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded" title="Approve">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => handleAction(company._id, 'block', adminService.blockCompany)} className="p-1.5 text-orange-400 hover:bg-orange-500/10 rounded" title="Block">
                      <Ban size={16} />
                    </button>
                    <button onClick={() => handleAction(company._id, 'delete', adminService.deleteCompany)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
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

export default ManageCompanies;
