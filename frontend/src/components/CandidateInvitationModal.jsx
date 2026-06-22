import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Send, Copy, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CandidateInvitationModal = ({ isOpen, onClose, job }) => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
      setMessage('');
    }
  }, [isOpen]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Fetch public freshers/candidates from network API
      const res = await api.get('/network/candidates');
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      // Fallback mock if network fails
      setCandidates([
        { _id: 'user_1', name: 'Alice Smith', email: 'alice@example.com', skills: ['React', 'Node.js'] },
        { _id: 'user_2', name: 'Bob Jones', email: 'bob@example.com', skills: ['Python', 'Django'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (candidateId) => {
    setInviting(candidateId);
    try {
      const res = await api.post('/jobs/invite', {
        jobId: job._id,
        candidateId
      });
      if (res.data.success) {
        alert('Invitation sent successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(null);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${job?.inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  if (!isOpen || !job) return null;

  const filteredCandidates = candidates.filter(c => 
    (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm">
      <div className="glass-card bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Invite Candidates</h2>
            <p className="text-xs text-cyan-400 mt-1">Inviting to: {job.title} ({job.jobVisibility})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Invite Link Section for Private Jobs */}
        {job.jobVisibility === 'private' && (
          <div className="p-6 bg-indigo-500/10 border-b border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
              <AlertCircle size={14} /> Referral Invite Link
            </h3>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/invite/${job.inviteCode}`}
                className="flex-1 bg-[#0B1120] border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none"
              />
              <button 
                onClick={copyInviteLink}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Only candidates with this link or direct invites can view and apply to this job.</p>
          </div>
        )}

        {/* Body - Candidates List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search public candidates by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500 text-sm">Loading candidates...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No candidates found.</div>
            ) : (
              filteredCandidates.map(candidate => {
                const isAlreadyInvited = job.invitedCandidates?.includes(candidate._id);
                return (
                  <div key={candidate._id} className="flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition-all">
                    <div>
                      <h4 className="font-bold text-white text-sm">{candidate.name || 'Anonymous User'}</h4>
                      <p className="text-xs text-slate-400">{candidate.email}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {candidate.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleInvite(candidate._id)}
                      disabled={isAlreadyInvited || inviting === candidate._id}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isAlreadyInvited 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      }`}
                    >
                      {isAlreadyInvited ? (
                        <><CheckCircle size={14} /> Invited</>
                      ) : inviting === candidate._id ? (
                        'Sending...'
                      ) : (
                        <><Send size={14} /> Send Invite</>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateInvitationModal;
