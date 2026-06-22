import React, { useEffect, useState } from 'react';
import { getMyFeedback } from '../services/supportService';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await getMyFeedback();
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-rose-450">My Support Tickets</h1>
      
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {tickets.length === 0 ? <p className="text-slate-400">No tickets found.</p> : tickets.map(ticket => (
            <div key={ticket._id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded text-sm">{ticket.ticketId}</span>
                  <span className="font-semibold text-lg">{ticket.subject}</span>
                </div>
                <p className="text-slate-400 text-sm">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                {ticket.adminReply && (
                  <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700">
                    <p className="text-xs text-rose-450 font-bold mb-1">Admin Reply:</p>
                    <p className="text-sm text-slate-300">{ticket.adminReply}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                  ticket.status === 'Open' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {ticket.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded border ${
                  ticket.priority === 'Critical' ? 'border-red-500 text-red-500' : 'border-slate-600 text-slate-400'
                }`}>
                  {ticket.priority} Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
