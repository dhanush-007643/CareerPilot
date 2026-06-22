import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader } from 'lucide-react';
import api from '../services/api';

const InviteHandler = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const res = await api.get(`/jobs/private/${inviteCode}`);
        if (res.data.success) {
          const jobId = res.data.data._id;
          navigate(`/fresher/jobs/${jobId}?inviteCode=${inviteCode}`, { replace: true });
        }
      } catch (err) {
        // Fallback or error
        console.log('Invite verify failed', err);
        // Maybe check mock local storage
        const localJobsStr = localStorage.getItem('mock_startup_jobs');
        if (localJobsStr) {
          const localJobs = JSON.parse(localJobsStr);
          const found = localJobs.find(j => j.inviteCode === inviteCode);
          if (found) {
            return navigate(`/fresher/jobs/${found._id}?inviteCode=${inviteCode}`, { replace: true });
          }
        }
        setError('Invalid, expired, or unauthorized invite link.');
      }
    };
    verifyInvite();
  }, [inviteCode, navigate]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
          <ShieldAlert size={32} className="text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Invite Not Found</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-[#1E293B] border border-slate-700 text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-8 glass-card border border-slate-800 rounded-2xl flex flex-col items-center">
        <Loader className="animate-spin text-[#22D3EE] mb-4" size={40} />
        <h2 className="text-xl font-bold text-white font-display">Verifying Secure Invite...</h2>
        <p className="text-slate-400 text-sm mt-2">Connecting to private job portal.</p>
      </div>
    </div>
  );
};

export default InviteHandler;
