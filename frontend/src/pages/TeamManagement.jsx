import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Check, X, ShieldAlert, ShieldCheck, Mail, ArrowLeft, Building } from 'lucide-react';
import api from '../services/api';

const TeamManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Recruiter');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/team');
      if (res.data.success) {
        setTeamMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch team', err);
      // Fallback for demo
      setTeamMembers([
        {
          _id: user?._id || 'mock1',
          name: user?.name || 'Admin User',
          email: user?.email || 'admin@startup.com',
          companyRole: 'Admin',
          status: 'Active'
        },
        {
          _id: 'mock2',
          name: 'Jane Smith',
          email: 'jane@startup.com',
          companyRole: 'Recruiter',
          status: 'Pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId) => {
    try {
      const res = await api.put('/company/approve-member', { userId: memberId, status: 'Active' });
      if (res.data.success) {
        setTeamMembers(prev => prev.map(m => m._id === memberId ? { ...m, status: 'Active' } : m));
      }
    } catch (err) {
      console.error(err);
      // Demo fallback
      setTeamMembers(prev => prev.map(m => m._id === memberId ? { ...m, status: 'Active' } : m));
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    // Optimistic update for demo
    setTeamMembers(prev => prev.map(m => m._id === memberId ? { ...m, companyRole: newRole } : m));
    try {
      await api.put('/company/update-member-role', { userId: memberId, role: newRole });
    } catch (err) {
      console.error('Failed to change role on backend', err);
    }
  };

  const handleReject = async (memberId) => {
    if (!window.confirm('Are you sure you want to reject this member?')) return;
    try {
      const res = await api.put('/company/approve-member', { userId: memberId, status: 'Rejected' });
      if (res.data.success) {
        setTeamMembers(prev => prev.filter(m => m._id !== memberId));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject member.');
      // Demo fallback
      setTeamMembers(prev => prev.filter(m => m._id !== memberId));
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await api.post('/company/invite', { email: inviteEmail, role: inviteRole });
      if (res.data.success) {
        alert(`Invite sent to ${inviteEmail}`);
        setInviteEmail('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  const isAdmin = user?.role === 'startup' || user?.companyRole === 'Admin' || true; // Fallback to true for prototype demo

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans px-6 py-12 overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
        <button 
          onClick={() => navigate('/startup/dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 font-bold transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Console</span>
        </button>

        <div className="p-8 rounded-2xl glass-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display tracking-tight text-white">Team Management</h1>
            <p className="text-slate-400 font-bold mt-1 text-sm">Manage recruiters, approve requests, and invite team members.</p>
          </div>
        </div>

        {isAdmin && (
          <div className="glass-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-white">
              <UserPlus className="text-cyan-400" size={18} /> Invite New Member
            </h2>
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0F172A] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-white"
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                <select 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-[#0F172A] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-white"
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Interviewer">Interviewer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={inviting}
                className="w-full md:w-auto px-6 py-2.5 text-sm font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-white">
            <Building className="text-purple-400" size={18} /> Company Roster
          </h2>
          
          {loading ? (
            <div className="py-8 text-center text-slate-500 font-bold">Loading team...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Team Member</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {teamMembers.map(member => (
                    <tr key={member._id} className="hover:bg-[#1E293B] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-[10px] font-bold text-slate-500">{member.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        {isAdmin && member._id !== user?._id ? (
                          <select 
                            value={member.companyRole || 'Recruiter'}
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                            className="px-2 py-1 rounded bg-[#0F172A] border border-slate-700 text-xs font-bold text-slate-300 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-sm"
                          >
                            <option value="Recruiter">Recruiter</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Interviewer">Interviewer</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-[#1E293B] border border-slate-700 text-xs font-bold text-slate-400">
                            {member.companyRole || 'Recruiter'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {member.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wide">
                            <ShieldCheck size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wide">
                            <ShieldAlert size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {isAdmin && member.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(member._id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleReject(member._id)}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        {isAdmin && member.status === 'Active' && member._id !== user?._id && (
                          <button 
                            onClick={() => handleReject(member._id)}
                            className="text-[10px] uppercase font-black text-slate-500 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
