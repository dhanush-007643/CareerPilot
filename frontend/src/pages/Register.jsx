import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Mail, Lock, User as UserIcon, Plus, X } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fresher'); // 'fresher' or 'startup'
  
  // Skill tags state for freshers
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

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

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    // Send list of skills if registering as a fresher, else send empty array
    const skillList = role === 'fresher' ? skills : [];
    const result = await register(name, email, password, role, skillList);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div class="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-auth-pattern py-12">
      {/* Background ambient glow shapes */}
      <div class="ambient-glow -top-20 -right-20 animate-pulse-glow"></div>
      <div class="ambient-glow -bottom-20 -left-20 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

      <div class="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl z-10 animate-fade-in">
        
        {/* Header */}
        <div class="text-center mb-6">
          <h2 class="text-3xl font-extrabold font-display text-white tracking-tight">
            Create Account
          </h2>
          <p class="text-sm text-textSecondary mt-2">
            Get started with CareerPilot today.
          </p>
        </div>

        {error && (
          <div class="mb-5 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={18} class="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4">
          
          {/* Role selector buttons */}
          <div>
            <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2 text-center">
              Register As
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('fresher')}
                class={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
                  role === 'fresher'
                    ? 'bg-neonIndigo/20 border-neonIndigo text-white shadow-glow-purple'
                    : 'bg-white/5 border-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                🎓 Fresher (Student / Grad)
              </button>
              <button
                type="button"
                onClick={() => setRole('startup')}
                class={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
                  role === 'startup'
                    ? 'bg-neonCyan/20 border-neonCyan text-white shadow-glow-cyan'
                    : 'bg-white/5 border-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                🚀 Startup Recruiter
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  class="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Password (6+ characters)
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
                class="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Interactive Skills section for Freshers */}
          {role === 'fresher' && (
            <div class="p-4 rounded-xl border border-white/5 bg-white/5 animate-fade-in">
              <label class="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                Add Your Technical Skills (Optional)
              </label>
              <p class="text-xs text-textSecondary mb-3">
                Adding skills helps match you with Startup listings.
              </p>

              <div class="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. React, Node, Python"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  class="flex-1 px-3 py-1.5 text-xs rounded-lg glow-input text-white"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  class="p-2 rounded-lg bg-neonIndigo text-white hover:bg-neonPurple transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tag display list */}
              <div class="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    class="text-xs px-2.5 py-1 rounded bg-white/10 border border-white/10 text-white flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      class="text-textSecondary hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span class="text-xs text-textSecondary italic">No skills added yet</span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            class="w-full flex items-center justify-center space-x-2 py-3 px-4 font-bold rounded-lg text-white bg-gradient-to-r from-neonIndigo to-neonPurple hover:shadow-glow-purple transition-all duration-300 transform hover:scale-[1.01]"
            disabled={loading}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div class="text-center mt-6 pt-6 border-t border-white/5">
          <p class="text-sm text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" class="text-neonCyan hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
