import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, Award, Compass, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav class="sticky top-0 z-50 w-full px-6 py-4 glass-panel border-b border-white/10 shadow-glow-purple">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" class="flex items-center space-x-2 font-display text-2xl font-bold tracking-tight text-white hover:opacity-90">
          <span class="bg-gradient-to-r from-neonCyan via-neonIndigo to-neonPurple bg-clip-text text-transparent">
            CareerPilot
          </span>
          <span class="text-xl">✈️</span>
        </Link>

        {/* Navigation Actions */}
        <div class="flex items-center space-x-6">
          {user ? (
            <>
              {/* Common User Badge */}
              <div class="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <UserIcon size={14} class="text-neonCyan" />
                <span class="text-xs text-textSecondary font-medium">
                  {user.name} ({user.role === 'startup' ? 'Startup' : 'Fresher'})
                </span>
              </div>

              {/* Conditional Routing Links */}
              {user.role === 'fresher' && (
                <>
                  <Link
                    to="/fresher-dashboard"
                    class="flex items-center space-x-1.5 text-sm text-textSecondary hover:text-white transition-colors"
                  >
                    <Compass size={16} />
                    <span>Jobs Board</span>
                  </Link>
                  <Link
                    to="/training-arena"
                    class="flex items-center space-x-1.5 text-sm text-textSecondary hover:text-white transition-colors"
                  >
                    <Award size={16} />
                    <span>Training Arena</span>
                  </Link>
                </>
              )}

              {user.role === 'startup' && (
                <Link
                  to="/startup-dashboard"
                  class="flex items-center space-x-1.5 text-sm text-textSecondary hover:text-white transition-colors"
                >
                  <Briefcase size={16} />
                  <span>Startup Console</span>
                </Link>
              )}

              {/* Logout Trigger */}
              <button
                onClick={handleLogout}
                class="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold tracking-wide rounded-lg text-white bg-gradient-to-r from-red-600/70 to-orange-600/70 hover:from-red-600 hover:to-orange-600 transition-all border border-red-500/20"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                class="text-sm text-textSecondary hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                class="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-neonIndigo to-neonPurple hover:shadow-glow-purple hover:scale-105 transition-all text-white"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
