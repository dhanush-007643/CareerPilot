import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if token is already present
  useEffect(() => {
    if (localStorage.getItem('token')) {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'startup') {
          navigate('/startup/dashboard');
          return;
        }
      }
      navigate('/fresher/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Log the credentials to the console
    console.log('Login Credentials:', { email, password });
    
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res && res.success) {
        alert('Login Successful!');
        // Check role to redirect properly
        const userObj = res.user || {};
        if (userObj.role === 'startup') {
          navigate('/startup/dashboard');
        } else {
          navigate('/fresher/dashboard');
        }
      } else {
        setError(res?.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-auth-pattern tech-grid py-12">
      {/* Background ambient glow shapes */}
      <div className="ambient-glow glow-purple -top-20 -left-20 animate-pulse-glow w-[350px] h-[350px]"></div>
      <div className="ambient-glow glow-cyan -bottom-20 -right-20 animate-pulse-glow w-[350px] h-[350px]" style={{ animationDelay: '3s' }}></div>

      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={64} showText={false} className="mb-4" />
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-textSecondary mt-2">
            Sign in to pilot your career or hire fresh talent.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg glow-input text-white bg-darkCard/50 border border-white/10 focus:border-neonPurple focus:ring-1 focus:ring-neonPurple outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg glow-input text-white bg-darkCard/50 border border-white/10 focus:border-neonPurple focus:ring-1 focus:ring-neonPurple outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 font-bold rounded-lg text-white shimmer-btn"
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-textSecondary">
            Demo Mode enabled. Use any email & password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
