import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === 'startup') {
        navigate('/startup-dashboard');
      } else {
        navigate('/fresher-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div class="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-auth-pattern py-12">
      {/* Background ambient glow shapes */}
      <div class="ambient-glow -top-20 -left-20 animate-pulse-glow"></div>
      <div class="ambient-glow -bottom-20 -right-20 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

      <div class="w-full max-w-md glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl z-10 animate-fade-in">
        
        {/* Header */}
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold font-display text-white tracking-tight">
            Welcome Back
          </h2>
          <p class="text-sm text-textSecondary mt-2">
            Sign in to pilot your career or hire fresh talent.
          </p>
        </div>

        {error && (
          <div class="mb-6 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={18} class="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-5">
          <div>
            <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg glow-input text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Password
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg glow-input text-white"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full flex items-center justify-center space-x-2 py-3 px-4 font-bold rounded-lg text-white bg-gradient-to-r from-neonIndigo to-neonPurple hover:shadow-glow-purple transition-all duration-300 transform hover:scale-[1.01]"
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer link */}
        <div class="text-center mt-6 pt-6 border-t border-white/5">
          <p class="text-sm text-textSecondary">
            New to CareerPilot?{' '}
            <Link to="/register" class="text-neonCyan hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
