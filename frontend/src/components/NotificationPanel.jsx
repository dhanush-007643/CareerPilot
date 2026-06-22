import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Briefcase, FileText, Calendar, Mail, Award, X } from 'lucide-react';
import api from '../services/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const NotificationPanel = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Map backend status 'unread'/'read' to boolean for easy checking
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { withCredentials: true });
    
    socket.emit('join_room', user._id || user.id);
    
    socket.on('receive_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => {
      socket.off('receive_notification');
      socket.disconnect();
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/user');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, status: 'read' } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type) => {
    if (!type) return <Bell size={16} className="text-slate-400" />;
    if (type.includes('job')) return <Briefcase size={16} className="text-cyan-400" />;
    if (type.includes('application')) return <FileText size={16} className="text-amber-400" />;
    if (type.includes('interview')) return <Calendar size={16} className="text-emerald-400" />;
    if (type.includes('invitation')) return <Mail size={16} className="text-indigo-400" />;
    if (type.includes('certificate')) return <Award size={16} className="text-rose-400" />;
    return <Bell size={16} className="text-slate-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <Bell size={20} className="text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 glass-card border border-slate-700 shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
              <h3 className="font-bold text-white">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-slate-400 hover:text-white transition-colors">
                  Mark All Read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <Bell size={32} className="mx-auto mb-2 opacity-20" />
                  No new notifications
                </div>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {notifications.map((notif) => (
                    <li 
                      key={notif._id} 
                      className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${notif.status === 'unread' ? 'bg-slate-800/20' : ''}`}
                      onClick={() => markAsRead(notif._id)}
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-semibold ${notif.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                            {new Date(notif.timestamp || notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                      {notif.status === 'unread' && (
                        <div className="flex-shrink-0 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-2 border-t border-slate-700 bg-slate-900/50">
              <button className="w-full py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors text-center">
                View All Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
