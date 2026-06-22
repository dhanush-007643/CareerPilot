import React, { useState } from 'react';
import { createFeedback } from '../services/supportService';

const CompanyFeedback = () => {
  const [formData, setFormData] = useState({ subject: '', category: 'ATS Feedback', message: '', priority: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFeedback(formData);
      setSuccess(`Support ticket created successfully! ID: ${res.data.ticketId}`);
      setFormData({ subject: '', category: 'ATS Feedback', message: '', priority: 'Medium' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#0B1120] min-h-[calc(100vh-80px)] text-slate-300 font-sans">
      <h1 className="text-3xl font-black mb-6 text-white font-display tracking-tight">Company Support & Feedback</h1>
      {success && <div className="p-4 bg-emerald-500/10 text-emerald-400 font-bold mb-6 rounded-lg border border-emerald-500/20">{success}</div>}
      
      <form onSubmit={handleSubmit} className="max-w-2xl glass-card p-8 rounded-2xl shadow-sm">
        <div className="mb-5">
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">Subject</label>
          <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
              <option>ATS Feedback</option>
              <option>Recruitment Feedback</option>
              <option>Platform Suggestion</option>
              <option>Technical Issue</option>
              <option>Feature Request</option>
              <option>Candidate Quality Feedback</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">Message</label>
          <textarea required rows="5" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Support Request'}
        </button>
      </form>
    </div>
  );
};

export default CompanyFeedback;
