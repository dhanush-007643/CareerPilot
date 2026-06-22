import React, { useState, useEffect } from 'react';
import { fetchInterviews, updateInterviewStatus } from '../services/api';
import { Calendar, Clock, MapPin, Video, User, Briefcase, CheckCircle2, XCircle, Search, Filter, MoreVertical } from 'lucide-react';

const StartupInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetchInterviews();
      if (res.data?.success) {
        setInterviews(res.data.data);
      } else {
        // Fallback demo data if backend fails/is empty
        setInterviews([
          {
            _id: '1',
            candidateId: { name: 'Alex Mercer', email: 'alex@example.com' },
            jobId: { title: 'Frontend Developer' },
            date: new Date().toISOString(),
            time: '14:00',
            mode: 'Virtual',
            meetingLink: 'https://zoom.us/j/123456789',
            status: 'Scheduled'
          },
          {
            _id: '2',
            candidateId: { name: 'Sarah Connor', email: 'sarah@example.com' },
            jobId: { title: 'Backend Engineer' },
            date: new Date(Date.now() - 86400000).toISOString(),
            time: '10:30',
            mode: 'In-Person',
            meetingLink: 'HQ Office - Room 4',
            status: 'Completed'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load interviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateInterviewStatus(id, newStatus);
      setInterviews(interviews.map(inv => 
        inv._id === id ? { ...inv, status: newStatus } : inv
      ));
    } catch (error) {
      console.error('Failed to update status', error);
      // Optimistic update for demo purposes
      setInterviews(interviews.map(inv => 
        inv._id === id ? { ...inv, status: newStatus } : inv
      ));
    }
  };

  const filteredInterviews = interviews.filter(inv => {
    const matchesFilter = filter === 'All' || inv.status === filter;
    const searchMatch = 
      (inv.candidateId?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inv.jobId?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && searchMatch;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans p-6 pb-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Calendar className="text-[#22D3EE]" size={32} /> 
              Interview Management
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Track and manage scheduled candidate interviews.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search candidates or roles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-white focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:border-[#22D3EE] transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interviews Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="bg-[#1E293B]/50 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Interviews Found</h3>
            <p className="text-slate-400">You don't have any interviews matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.map((inv) => (
              <div key={inv._id} className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-600 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${
                    inv.status === 'Scheduled' ? 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30' :
                    inv.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {inv.status === 'Scheduled' && <Clock size={12} />}
                    {inv.status === 'Completed' && <CheckCircle2 size={12} />}
                    {inv.status === 'Cancelled' && <XCircle size={12} />}
                    {inv.status}
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                    <User size={18} className="text-[#22D3EE]"/> {inv.candidateId?.name || 'Unknown'}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Briefcase size={14} /> {inv.jobId?.title || 'Open Position'}
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-[#0B1120] rounded-xl border border-slate-800 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="font-bold text-white">{new Date(inv.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={16} className="text-slate-500" />
                    <span className="font-bold text-slate-300">{inv.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {inv.mode === 'Virtual' ? <Video size={16} className="text-cyan-400" /> : <MapPin size={16} className="text-amber-400" />}
                    <span className="font-medium text-slate-400 line-clamp-1">{inv.meetingLink || 'No link provided'}</span>
                  </div>
                </div>

                {inv.status === 'Scheduled' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(inv._id, 'Completed')}
                      className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold transition-all"
                    >
                      Mark Done
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(inv._id, 'Cancelled')}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {inv.status !== 'Scheduled' && (
                  <button 
                    disabled
                    className="w-full py-2 bg-slate-800/50 text-slate-500 rounded-xl text-sm font-bold border border-slate-800 cursor-not-allowed"
                  >
                    Action Unavailable
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupInterviews;
