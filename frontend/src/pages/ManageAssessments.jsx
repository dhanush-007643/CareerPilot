import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Trash2, Plus } from 'lucide-react';

const ManageAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await adminService.getAssessments();
      if (res.success) setAssessments(res.data);
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-white">Manage <span className="text-purple-400">Assessments</span></h1>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-all shadow">
            <Plus size={14} /> Create Assessment
          </button>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Questions Count</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {assessments.map((quiz) => (
                <tr key={quiz._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{quiz.title}</td>
                  <td className="px-5 py-4">{quiz.questions?.length || 0}</td>
                  <td className="px-5 py-4 flex justify-end gap-2">
                    <button className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
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

export default ManageAssessments;
