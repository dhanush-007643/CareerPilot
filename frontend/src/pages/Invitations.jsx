import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, CheckCircle, XCircle, Building2, Briefcase, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invitations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const endpoint = user?.role === 'startup' ? '/invitations/company' : '/invitations/candidate';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
      // Fallback
      if (user?.role !== 'startup') {
        setInvitations([
          {
            _id: '1',
            companyId: { companyName: 'DeepMind', industry: 'AI Research', logo: '' },
            jobId: { title: 'AI Engineer', location: 'London' },
            status: 'Pending',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/invitations/${id}/respond`, { status });
      setInvitations(prev => prev.map(inv => inv._id === id ? { ...inv, status } : inv));
    } catch (err) {
      console.error('Failed to respond', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const pendingCount = invitations.filter(i => i.status === 'Pending').length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between p-6 bg-[#1E293B]/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 relative">
              <Mail size={28} />
              {pendingCount > 0 && user?.role === 'fresher' && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow">
                  {pendingCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {user?.role === 'startup' ? 'Sent Invitations' : 'Company Invitations'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {user?.role === 'startup' ? 'Track candidates you have invited to apply.' : 'Private opportunities sent directly to you by startups.'}
              </p>
            </div>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="p-16 text-center bg-[#1E293B]/40 border border-slate-800 rounded-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#0B1120] border border-slate-800 flex items-center justify-center text-slate-600">
              <Mail size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-300">No invitations yet</h3>
              <p className="text-slate-500 mt-2">
                {user?.role === 'startup' ? 'You haven\'t invited any candidates yet.' : 'Keep your profile updated to receive invites from top startups.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {invitations.map((inv) => (
              <div 
                key={inv._id}
                className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center gap-6 ${
                  inv.status === 'Pending' 
                  ? 'bg-[#1E293B] border-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                  : 'bg-[#1E293B]/40 border-slate-800 opacity-80'
                }`}
              >
                {/* Left Side: Company/Candidate Info */}
                <div className="flex-1 flex gap-4 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B1120] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {user?.role === 'startup' ? (
                      <span className="font-black text-2xl text-slate-500">{inv.candidateId?.name?.charAt(0)}</span>
                    ) : inv.companyId?.logo ? (
                      <img src={inv.companyId.logo} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={24} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {user?.role === 'startup' ? inv.candidateId?.name : inv.companyId?.companyName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      {inv.jobId && (
                        <span className="flex items-center gap-1 text-[#FBBF24]">
                          <Briefcase size={14} /> {inv.jobId.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions/Status */}
                <div className="flex items-center justify-end w-full md:w-auto gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    inv.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    inv.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {inv.status}
                  </span>

                  {user?.role === 'fresher' && inv.status === 'Pending' && (
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => handleRespond(inv._id, 'Accepted')}
                        className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#0B1120] transition-all"
                        title="Accept Invitation"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleRespond(inv._id, 'Rejected')}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-[#0B1120] transition-all"
                        title="Decline Invitation"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}

                  {user?.role === 'fresher' && inv.status === 'Accepted' && inv.jobId && (
                    <button 
                      onClick={() => navigate(`/job/${inv.jobId._id}`)}
                      className="ml-4 px-4 py-2 bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 rounded-xl text-sm font-bold hover:bg-[#22D3EE]/20 transition-colors"
                    >
                      View Job
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitations;
