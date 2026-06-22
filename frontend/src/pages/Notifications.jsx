import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Check, Trash2, Clock, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/user');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Fallback Mock
      setNotifications([
        { _id: '1', type: 'system', title: 'Welcome to CareerPilot', message: 'Set up your profile to get started!', status: 'unread', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-300 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 relative">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Notification Center</h1>
              <p className="text-slate-400 text-sm">You have {unreadCount} unread messages.</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow"
            >
              <Check size={14} /> Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                <Bell size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">All caught up!</h3>
                <p className="text-slate-500 text-sm mt-1">You have no new notifications right now.</p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  notif.status === 'unread' 
                  ? 'bg-slate-900 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                  : 'bg-slate-900/40 border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'invitation' ? 'bg-indigo-500/10 text-indigo-400' :
                  notif.type === 'follow' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {notif.type === 'invitation' ? <AlertCircle size={20} /> : <Bell size={20} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${notif.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(notif.timestamp || notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{notif.message}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                  {notif.status === 'unread' && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
