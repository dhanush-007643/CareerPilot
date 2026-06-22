import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';
import { Building, Users, AlertCircle, CheckCircle, Search, ShieldAlert } from 'lucide-react';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // Assuming we might just need user state, login for re-auth if needed
  
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Company State
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [companySize, setCompanySize] = useState('1-10');
  const [description, setDescription] = useState('');
  const [companyVisibility, setCompanyVisibility] = useState('public');

  // Join Company State
  const [companyCode, setCompanyCode] = useState('');
  const [designation, setDesignation] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/company/create', {
        companyName,
        companyEmail,
        website,
        industry,
        companySize,
        description,
        companyVisibility
      });

      if (res.data.success) {
        setSuccess('Company created successfully! Redirecting...');
        // The user object needs to be updated with companyId and companyRole locally
        const mockUser = JSON.parse(localStorage.getItem('mock_user'));
        if (mockUser) {
          mockUser.companyId = res.data.data._id;
          mockUser.companyRole = 'Admin';
          localStorage.setItem('mock_user', JSON.stringify(mockUser));
        }
        setTimeout(() => {
          navigate('/startup/dashboard');
          window.location.reload(); // Quick refresh to grab new auth state Context
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create company.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/company/join', {
        companyCode,
        designation
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => {
          navigate('/startup/dashboard'); // Or maybe a waiting page
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center py-12 px-4 overflow-hidden text-slate-300">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl z-10">
        <div className="text-center mb-8">
          <Logo size={48} showText={false} className="mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">Startup <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Onboarding</span></h2>
          <p className="text-sm text-slate-400 mt-2">Create your company profile or join an existing team to begin recruiting.</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl mb-8 border border-slate-800/80">
          <button
            onClick={() => { setActiveTab('create'); setError(''); setSuccess(''); }}
            className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Building size={16} /> Create Company
          </button>
          <button
            onClick={() => { setActiveTab('join'); setError(''); setSuccess(''); }}
            className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users size={16} /> Join Team
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-950/20 border border-red-500/30 rounded-xl text-sm text-red-400 flex items-center gap-3">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex items-center gap-3">
            <CheckCircle size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateSubmit} className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all" placeholder="Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Email</label>
                <input type="email" required value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all" placeholder="contact@acme.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all" placeholder="https://acme.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Size</label>
                <select value={companySize} onChange={e => setCompanySize(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all appearance-none">
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry</label>
              <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all" placeholder="Technology, Healthcare, etc." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Short Description</label>
              <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-white transition-all resize-none" placeholder="We build awesome things..."></textarea>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-4 rounded-xl border cursor-pointer transition-all ${companyVisibility === 'public' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'}`}>
                  <input type="radio" name="visibility" value="public" checked={companyVisibility === 'public'} onChange={() => setCompanyVisibility('public')} className="hidden" />
                  <div className="font-bold text-sm text-white mb-1">Public Startup</div>
                  <div className="text-[10px] text-slate-500 leading-tight">Visible on the platform to all candidates.</div>
                </label>
                <label className={`p-4 rounded-xl border cursor-pointer transition-all ${companyVisibility === 'private' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'}`}>
                  <input type="radio" name="visibility" value="private" checked={companyVisibility === 'private'} onChange={() => setCompanyVisibility('private')} className="hidden" />
                  <div className="font-bold text-sm text-white mb-1">Private / Stealth</div>
                  <div className="text-[10px] text-slate-500 leading-tight">Hidden from public directories. Invite-only.</div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 mt-6 font-bold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? 'Creating...' : 'Register Company & Continue'} <Building size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-6 animate-fade-in mt-4">
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-center mb-6">
              <Search size={24} className="text-indigo-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Have an invite or company code?</h3>
              <p className="text-xs text-slate-400">Enter it below to request access to your team's workspace.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unique Company Code</label>
              <input type="text" required value={companyCode} onChange={e => setCompanyCode(e.target.value)} className="w-full px-4 py-3.5 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-white transition-all font-mono text-center tracking-widest uppercase" placeholder="e.g. ACM-1A2B3C" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Designation / Role</label>
              <input type="text" required value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-4 py-3.5 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-white transition-all" placeholder="e.g. HR Manager, Senior Recruiter" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 mt-4 font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? 'Sending Request...' : 'Request Access'} <Users size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompanyRegistration;
