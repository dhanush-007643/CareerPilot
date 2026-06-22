import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, User as UserIcon, Plus, X, ShieldAlert } from 'lucide-react';
import Logo from '../components/Logo';
import { seedDatabase } from '../services/api';

const AuthPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Tab state: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fresher'); // 'fresher' or 'startup'
  
  // Skills tags state for fresher registration
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedStatus, setSeedStatus] = useState(''); // '', 'loading', 'success', 'error'

  const handleSeed = async () => {
    setSeedStatus('loading');
    setError('');
    try {
      const res = await seedDatabase();
      if (res.data.success) {
        setSeedStatus('success');
        // Pre-fill demo credentials for Recruiter
        setEmail('startup@example.com');
        setPassword('password123');
      } else {
        setSeedStatus('error');
        setError('Failed to seed database.');
      }
    } catch (err) {
      console.error(err);
      setSeedStatus('error');
      setError(err.response?.data?.message || 'Network error seeding database. Ensure the backend is running.');
    }
  };

  // Read default role from LandingPage portal state redirection
  useEffect(() => {
    if (location.state?.defaultRole) {
      setRole(location.state.defaultRole);
      setActiveTab('register'); // Go straight to register tab if coming from portal selection
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl));
        return;
      }
      
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.role === 'startup') {
            navigate('/startup/dashboard');
            return;
          }
        } catch (e) {}
      }
      navigate('/fresher/dashboard');
    }
  }, [navigate]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (activeTab === 'login') {
      try {
        const res = await login(email, password);
        setLoading(false);
        if (res && res.success) {
          const params = new URLSearchParams(window.location.search);
          const returnUrl = params.get('returnUrl');
          if (returnUrl) {
            navigate(decodeURIComponent(returnUrl));
            return;
          }
          const userObj = res.user || {};
          if (userObj.role === 'startup') {
            navigate('/startup/dashboard');
          } else {
            navigate('/fresher/dashboard');
          }
        } else {
          setError(res?.message || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        setLoading(false);
        setError('An error occurred during sign in.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      try {
        const res = await register(
          name,
          email,
          password,
          role,
          role === 'fresher' ? skills : []
        );
        setLoading(false);
        if (res && res.success) {
          const params = new URLSearchParams(window.location.search);
          const returnUrl = params.get('returnUrl');
          if (returnUrl) {
            navigate(decodeURIComponent(returnUrl));
            return;
          }
          if (role === 'startup') {
            navigate('/startup/dashboard');
          } else {
            navigate('/fresher/dashboard');
          }
        } else {
          setError(res?.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        setLoading(false);
        setError('An error occurred during registration.');
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-[#0B1120] py-12 text-slate-300 circuit-bg">

      <div className="w-full max-w-lg glass-card p-8 shadow-2xl z-10">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <Logo size={48} showText={false} className="mb-2" />
          <h2 className="text-2xl font-black font-display tracking-tight text-white uppercase mt-2">
            Career<span className="text-cyan-400">Pilot</span> Gate
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 gap-1 p-1.5 bg-[#0F172A] rounded-xl mb-6 border border-slate-800">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-[#1E293B] border border-slate-700 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-[#1E293B] border border-slate-700 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Register-only Name field */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glow-input w-full pl-10 pr-4 py-2.5 text-sm"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="pilot@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glow-input w-full pl-10 pr-4 py-2.5 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glow-input w-full pl-10 pr-4 py-2.5 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Register-only Fields */}
          {activeTab === 'register' && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              
              {/* Role Toggle Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('fresher')}
                    className={`py-2 px-3 rounded-lg font-bold text-sm border transition-all ${
                      role === 'fresher'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm'
                        : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🎓 Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('startup')}
                    className={`py-2 px-3 rounded-lg font-bold text-sm border transition-all ${
                      role === 'startup'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm'
                        : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🚀 Recruiter
                  </button>
                </div>
              </div>

              {/* Fresher Skills tag input */}
              {role === 'fresher' && (
                <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Declare Skills tags (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                      className="glow-input flex-1 px-3 py-2 text-xs"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-[10px] px-2 py-1 rounded-md bg-[#1E293B] border border-slate-700 text-slate-300 shadow-sm flex items-center gap-1 font-semibold"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-500 hover:text-red-400 ml-1"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-[10px] text-slate-500 italic">No skills listed yet</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 font-bold rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 transition-all font-sans shadow-sm mt-4"
            disabled={loading}
          >
            <LogIn size={18} />
            <span>
              {loading
                ? 'Authenticating...'
                : activeTab === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </span>
          </button>
        </form>

        {/* Database Seeding Control Panel */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
          <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                MERN Database
              </h4>
              <button
                type="button"
                onClick={handleSeed}
                disabled={seedStatus === 'loading'}
                className="text-[10px] font-bold px-3 py-1.5 rounded-md bg-[#1E293B] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-sm"
              >
                {seedStatus === 'loading' ? 'Seeding...' : 'Reset & Seed DB'}
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Resets all MongoDB collections and inserts fresh, interconnected Startup, Candidate, Job, and ATS Pipeline records.
            </p>

            {seedStatus === 'success' && (
              <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 space-y-1">
                <p className="font-bold">✔ Database Seeded Successfully!</p>
                <p>Click "Sign In" below. Credentials have been pre-filled.</p>
              </div>
            )}

            {seedStatus === 'error' && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                ❌ Failed to seed database. Make sure backend is running.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[10px] pt-2 text-slate-400">
              <div 
                className="p-2.5 rounded-lg bg-[#1E293B] border border-slate-700 cursor-pointer hover:border-cyan-400 hover:shadow-sm transition-all text-center"
                onClick={() => {
                  setEmail('startup@example.com');
                  setPassword('password123');
                }}
              >
                <span className="font-bold text-white block mb-1">🚀 Recruiter</span>
                <span className="truncate block">startup@...</span>
              </div>
              <div 
                className="p-2.5 rounded-lg bg-[#1E293B] border border-slate-700 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all text-center"
                onClick={() => {
                  setEmail('fresher@example.com');
                  setPassword('password123');
                }}
              >
                <span className="font-bold text-white block mb-1">🎓 Candidate</span>
                <span className="truncate block">fresher@...</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center font-medium mt-2">
              Password is <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">password123</code>. Click cards to auto-fill.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
