import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ role, links }) => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-80px)] sticky top-20 glass-panel border-r-0 border-t-0 border-b-0 rounded-none overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-amber-400/10 border-l-4 border-amber-400"
                  />
                )}
                <Icon size={20} className={isActive ? 'text-amber-400 relative z-10' : 'text-slate-500 group-hover:text-white relative z-10'} />
                <span className="font-semibold text-sm relative z-10">{link.name}</span>
                {link.badge && (
                  <span className="ml-auto bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-400 mb-2">Need Help?</p>
          <a href="#" className="text-sm font-bold text-cyan-400 hover:text-cyan-300">Contact Support</a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
