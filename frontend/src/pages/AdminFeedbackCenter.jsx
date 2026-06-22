import React, { useEffect, useState } from 'react';
import { getAllFeedback, replyToFeedback, updateFeedbackStatus } from '../services/supportService';

const AdminFeedbackCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', priority: '' });
  const [replyData, setReplyData] = useState({ ticketId: '', adminReply: '', status: 'Resolved' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllFeedback(filters);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await replyToFeedback(replyData);
      setReplyData({ ticketId: '', adminReply: '', status: 'Resolved' });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-rose-450">Admin Feedback Center</h1>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <select value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-white">
          <option value="">All Roles</option>
          <option value="fresher">Fresher</option>
          <option value="startup">Company</option>
        </select>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-white">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="bg-slate-900 border border-slate-700 rounded p-2 text-white">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid gap-6">
          {tickets.length === 0 ? <p className="text-slate-400">No tickets found.</p> : tickets.map(ticket => (
            <div key={ticket._id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded text-sm">{ticket.ticketId}</span>
                    <span className="font-semibold text-lg">{ticket.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">{ticket.status}</span>
                    <span className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-400">{ticket.priority}</span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm mb-4">From: {ticket.userId?.name} ({ticket.userId?.email}) • {ticket.userRole} • {ticket.category}</p>
                <div className="bg-slate-900 p-4 rounded mb-4 text-slate-300">
                  {ticket.message}
                </div>
                
                {ticket.adminReply && (
                  <div className="bg-emerald-900/20 p-4 rounded border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 font-bold mb-1">Previous Admin Reply:</p>
                    <p className="text-sm text-slate-300">{ticket.adminReply}</p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleReply} className="w-full md:w-1/3 bg-slate-900 p-4 rounded border border-slate-700 flex flex-col gap-3">
                <h3 className="font-bold text-slate-300 text-sm">Update & Reply</h3>
                <textarea 
                  required
                  placeholder="Type your reply here..." 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-rose-450"
                  value={replyData.ticketId === ticket.ticketId ? replyData.adminReply : ''}
                  onChange={e => setReplyData({ ...replyData, ticketId: ticket.ticketId, adminReply: e.target.value })}
                ></textarea>
                <div className="flex gap-2">
                  <select 
                    value={replyData.ticketId === ticket.ticketId ? replyData.status : 'Resolved'}
                    onChange={e => setReplyData({ ...replyData, ticketId: ticket.ticketId, status: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white flex-1"
                  >
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded text-sm transition-all">Send</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackCenter;
