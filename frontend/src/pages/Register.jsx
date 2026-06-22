import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Mail, Lock, User as UserIcon, Plus, X } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fresher'); // 'fresher' or 'startup'
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  
  // Basic arrays for comprehensive profile
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  
  const [projTitle, setProjTitle] = useState('');
  const [certTitle, setCertTitle] = useState('');
  
  // Skill tags state for freshers
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user already logged in, redirect them
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
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

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(
        name,
        email,
        password,
        role,
        role === 'fresher' ? skills : [],
        role === 'fresher' ? phone : '',
        role === 'fresher' ? location : '',
        role === 'fresher' ? headline : '',
        role === 'fresher' ? bio : '',
        role === 'fresher' && eduDegree ? [{ degree: eduDegree, school: eduSchool }] : [],
        role === 'fresher' && expTitle ? [{ title: expTitle, company: expCompany }] : [],
        role === 'fresher' && projTitle ? [{ title: projTitle }] : [],
        role === 'fresher' && certTitle ? [{ title: certTitle }] : []
      );
      setLoading(false);
      if (res && res.success) {
        alert('Registration Successful!');
        if (role === 'startup') {
          navigate('/startup-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res?.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during registration.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-auth-pattern tech-grid py-12">
      {/* Background ambient glow shapes */}
      <div className="ambient-glow glow-purple -top-20 -right-20 animate-pulse-glow w-[350px] h-[350px]"></div>
      <div className="ambient-glow glow-cyan -bottom-20 -left-20 animate-pulse-glow w-[350px] h-[350px]" style={{ animationDelay: '3s' }}></div>

      <div className="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-8 shadow-2xl z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo size={64} showText={false} className="mb-4" />
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-textSecondary mt-2">
            Get started with CareerPilot today.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2 text-center">
              Register As
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('fresher')}
                className={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
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
                className={`py-2 px-4 rounded-lg font-bold text-sm border transition-all ${
                  role === 'startup'
                    ? 'bg-neonCyan/20 border-neonCyan text-white shadow-glow-cyan'
                    : 'bg-white/5 border-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                🚀 Startup Recruiter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textSecondary pointer-events-none">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Password (6+ characters)
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
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg glow-input text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Additional fields for Freshers */}
          {role === 'fresher' && (
            <div className="space-y-4 animate-fade-in border-t border-white/5 pt-4 mt-2">
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2 text-center">
                Profile Details
              </label>

              <div>
                <input
                  type="text"
                  placeholder="Professional Headline (e.g., Frontend Developer)"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white mb-4"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location (e.g., San Francisco, CA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
                <input
                  type="tel"
                  placeholder="Phone (e.g., +1 234 567 890)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white"
                  disabled={loading}
                />
              </div>

              <div>
                <textarea
                  placeholder="About You (Bio)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white mb-2"
                  disabled={loading}
                  rows="2"
                />
              </div>

              {/* Education & Experience Basic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Latest Education</label>
                  <input type="text" placeholder="Degree (e.g. BS Computer Science)" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                  <input type="text" placeholder="School/University" value={eduSchool} onChange={(e) => setEduSchool(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Latest Experience</label>
                  <input type="text" placeholder="Job Title" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                  <input type="text" placeholder="Company Name" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                </div>
              </div>

              {/* Project & Cert */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Top Project</label>
                  <input type="text" placeholder="Project Name" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Top Certificate</label>
                  <input type="text" placeholder="Certificate Name" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} className="w-full px-4 py-2 text-sm rounded-lg glow-input text-white" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  Add Your Technical Skills (Optional)
                </label>
              <p className="text-xs text-textSecondary mb-3">
                Adding skills helps match you with Startup listings.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. React, Node, Python"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg glow-input text-white"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-2 rounded-lg bg-neonIndigo text-white hover:bg-neonPurple transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tag display list */}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs px-2.5 py-1 rounded bg-white/10 border border-white/10 text-white flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-textSecondary hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-textSecondary italic">No skills added yet</span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 font-bold rounded-lg text-white shimmer-btn"
            disabled={loading}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="text-neonCyan hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
