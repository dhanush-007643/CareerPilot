import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import {
  LayoutDashboard, Building2, Users, Briefcase, FileText, 
  ClipboardCheck, Award, Calendar, BarChart3, Settings, 
  LineChart, MessageSquare, HelpCircle, UserCircle, 
  LogOut, Menu, X, Bell
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuCategories = [
    {
      title: 'Core',
      links: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'Management',
      links: [
        { name: 'Companies', path: '/admin/companies', icon: Building2 },
        { name: 'Freshers', path: '/admin/freshers', icon: Users },
        { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
        { name: 'Applications', path: '/admin/applications', icon: FileText },
      ]
    },
    {
      title: 'Platform Features',
      links: [
        { name: 'Assessments', path: '/admin/assessments', icon: ClipboardCheck },
        { name: 'Certificates', path: '/admin/certificates', icon: Award },
        { name: 'Interviews', path: '/admin/interviews', icon: Calendar },
      ]
    },
    {
      title: 'Communication',
      links: [
        { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
        { name: 'Support', path: '/admin/support', icon: HelpCircle },
      ]
    },
    {
      title: 'System',
      links: [
        { name: 'Profile', path: '/admin/profile', icon: UserCircle },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-300">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
        <Logo size={32} showText={sidebarOpen} />
      </div>

      {/* Sidebar Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {menuCategories.map((category, idx) => (
          <div key={idx}>
            {sidebarOpen && (
              <h3 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {category.title}
              </h3>
            )}
            <ul className="space-y-1">
              {category.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <NavLink
                      to={link.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive 
                          ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      } ${!sidebarOpen ? 'justify-center' : ''}`}
                      title={!sidebarOpen ? link.name : ''}
                    >
                      <Icon size={20} className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                      {sidebarOpen && <span className="ml-3 truncate">{link.name}</span>}
                      {isActive && sidebarOpen && (
                        <motion.div 
                          layoutId="sidebar-active"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
          title={!sidebarOpen ? 'Logout' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span className="ml-3 font-semibold">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300 selection:bg-cyan-500/30 selection:text-white">
      
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden md:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (sidebarOpen ? 280 : 80) : 0 }}
      >
        {/* Top Header */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Desktop sidebar toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Current Route Title */}
            <h2 className="text-lg font-bold text-white capitalize hidden sm:block">
              {location.pathname.split('/').pop().replace(/-/g, ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            </button>

            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-white">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Admin</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <UserCircle size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
