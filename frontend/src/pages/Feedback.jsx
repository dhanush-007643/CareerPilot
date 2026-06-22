import React, { useState } from 'react';
import { createFeedback } from '../services/supportService';

const Feedback = () => {
  const [formData, setFormData] = useState({ subject: '', category: 'Website Feedback', message: '', priority: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFeedback(formData);
      setSuccess(`Ticket created successfully! ID: ${res.data.ticketId}`);
      setFormData({ subject: '', category: 'Website Feedback', message: '', priority: 'Medium' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 bg-[#0B1120] min-h-[calc(100vh-80px)] text-slate-300 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-6 text-white tracking-tight">Submit <span className="text-cyan-400">Feedback</span></h1>
        
        {success && (
          <div className="p-4 bg-emerald-500/10 text-emerald-400 mb-6 rounded-xl border border-emerald-500/20 shadow-sm font-medium">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl shadow-sm">
          <div className="mb-5">
            <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Subject</label>
            <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer">
                <option>Website Feedback</option>
                <option>Assessment Feedback</option>
                <option>Company Review</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Job Application Feedback</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Message</label>
            <textarea required rows="6" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm text-sm">
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
