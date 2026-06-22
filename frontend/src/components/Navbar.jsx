import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, Bell } from 'lucide-react';
import Logo from './Logo';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ role: propRole }) => {
  const { user: contextUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active role
  const currentPath = location.pathname;

  let resolvedRole = propRole || 'public';

  if (contextUser) {
    resolvedRole = contextUser.role;
  } else {
    if (currentPath.startsWith('/fresher')) resolvedRole = 'fresher';
    else if (currentPath.startsWith('/startup')) resolvedRole = 'startup';
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => currentPath === path;

  // Nav Items configuration based on user role
  const getNavItems = () => {
    switch (resolvedRole) {
      case 'fresher':
        return [
          { name: 'Dashboard', path: '/fresher/dashboard' },
          { name: 'Jobs', path: '/fresher/jobs' },
          { name: 'Companies', path: '/companies' },
          { name: 'Arena', path: '/fresher/arena' },
          { name: 'Tracker', path: '/fresher/tracker' },
          { name: 'Resume', path: '/fresher/resume' },
          { name: 'Profile', path: '/fresher/profile' },
          { name: 'Support', path: '/fresher/feedback' }
        ];
      case 'startup':
        return [
          { name: 'Dashboard', path: '/startup/dashboard' },
          { name: 'Post Job', path: '/startup/post-job' },
          { name: 'Candidates', path: '/candidates' },
          { name: 'Pipeline', path: '/startup/pipeline' },
          { name: 'Interviews', path: '/startup/interviews' },
          { name: 'Team', path: '/startup/team' },
          { name: 'Support', path: '/startup/feedback' }
        ];
      case 'public':
      default:
        return [
          { name: 'Home', path: '/' },
          { name: 'Companies', path: '/companies' },
          { name: 'Assessments', path: '/fresher/arena' },
        ];
    }
  };

  const navItems = getNavItems();

  const getLogoRedirectPath = () => {
    if (resolvedRole === 'fresher') return '/fresher/dashboard';
    if (resolvedRole === 'startup') return '/startup/dashboard';
    return '/';
  };

  const activeUser = contextUser || (resolvedRole !== 'public' ? { name: 'Demo User', role: resolvedRole } : null);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B1120] border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to={getLogoRedirectPath()} className="flex-shrink-0 flex items-center gap-2">
            <Logo size={40} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative group"
              >
                <span className={`text-sm font-semibold transition-colors ${
                  isActive(item.path) ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {item.name}
                </span>
                {isActive(item.path) && (
                  <div
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {activeUser ? (
              <>
                <NotificationPanel />
                
                <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white">{activeUser.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">{resolvedRole}</span>
                  </div>
                  <Link to={resolvedRole === 'startup' ? '/startup/profile' : '/fresher/profile'}>
                    <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center overflow-hidden hover:border-cyan-400 transition-colors cursor-pointer">
                      <UserIcon size={20} className="text-slate-400" />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="ml-2 p-2 text-slate-500 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/auth" className="px-5 py-2.5 text-sm font-bold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {activeUser && <NotificationPanel />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-4 p-2 rounded-md text-slate-400 hover:text-white hover:bg-[#1E293B] focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B1120] border-b border-slate-800 shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path) ? 'bg-[#1E293B] text-cyan-400' : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!activeUser && (
                <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
                  <Link to="/auth" className="block text-center px-4 py-2 text-slate-400 font-semibold border border-slate-700 hover:bg-[#1E293B] hover:text-white rounded-md">Login</Link>
                  <Link to="/auth" className="block text-center px-4 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500">Register</Link>
                </div>
              )}
              {activeUser && (
                <button onClick={handleLogout} className="w-full text-left mt-4 px-3 py-2 text-red-400 font-medium hover:bg-[#1E293B] rounded-md flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
