import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Users, Briefcase, FileText, Settings, Award, Eye, Mail, Star } from 'lucide-react';
import { adminService } from '../services/adminService';
import DashboardCards from '../components/DashboardCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import ActivityTable from '../components/ActivityTable';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [extendedStats, setExtendedStats] = useState({
    visibilityCounts: { public: 0, private: 0, invite_only: 0, campus_specific: 0 },
    invitationsSent: 0,
    invitationsAccepted: 0,
    topCompanies: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAnalytics();
      if (res.success) {
        setData(res.data);
      } else {
        setEmptyFallback();
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setEmptyFallback();
    } finally {
      setLoading(false);
    }
  };

  const setEmptyFallback = () => {
    setData({
      cards: {
        totalFreshers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalInterviews: 0,
        totalHires: 0,
        activeUsers: 0,
        pendingApprovals: 0
      },
      userGrowth: [],
      jobGrowth: [],
      logs: []
    });

    setExtendedStats({
      visibilityCounts: { public: 0, private: 0, invite_only: 0, campus_specific: 0 },
      invitationsSent: 0,
      invitationsAccepted: 0,
      topCompanies: []
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#0B1120] text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Loading Analytics Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 px-6 py-10 font-sans overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 bg-[#1E293B]/40 border border-slate-800 rounded-2xl gap-4 shadow-xl backdrop-blur-md">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Shield className="text-[#22D3EE] shrink-0" size={20} />
              <span className="text-[10px] font-black uppercase text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded tracking-widest">
                Admin Control Center
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Platform <span className="text-[#22D3EE]">Overview</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#22D3EE] hover:bg-[#22D3EE]/90 text-[#0B1120] text-xs font-bold rounded-xl transition-all shadow"
            >
              <Activity size={13} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Existing Dashboard Cards */}
        <DashboardCards data={data?.cards} />

        {/* New Admin Monitoring Cards for Connectivity System */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visibility Analytics */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye size={20} className="text-emerald-400" /> Company Visibility
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-400">Public Profiles</span>
                <span className="font-bold text-emerald-400">{extendedStats.visibilityCounts.public}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-400">Private Mode</span>
                <span className="font-bold text-rose-400">{extendedStats.visibilityCounts.private}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-400">Invite Only</span>
                <span className="font-bold text-[#FBBF24]">{extendedStats.visibilityCounts.invite_only}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-400">Campus Specific</span>
                <span className="font-bold text-indigo-400">{extendedStats.visibilityCounts.campus_specific}</span>
              </div>
            </div>
          </div>

          {/* Invitation Analytics */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Mail size={20} className="text-purple-400" /> Invitation Analytics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Total Sent</span>
                  <span className="font-bold text-white">{extendedStats.invitationsSent}</span>
                </div>
                <div className="w-full bg-[#0B1120] rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Accepted</span>
                  <span className="font-bold text-emerald-400">{extendedStats.invitationsAccepted}</span>
                </div>
                <div className="w-full bg-[#0B1120] rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(extendedStats.invitationsAccepted/extendedStats.invitationsSent)*100}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Conversion Rate</span>
                <div className="text-2xl font-black text-[#22D3EE]">
                  {Math.round((extendedStats.invitationsAccepted/extendedStats.invitationsSent)*100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Top Followed Companies */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star size={20} className="text-[#FBBF24]" /> Most Followed
            </h3>
            <div className="space-y-3">
              {extendedStats.topCompanies.map((c, i) => (
                <div key={i} className="flex justify-between items-center bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">{i+1}</span>
                    <span className="font-bold text-white text-sm">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-1 rounded-lg">
                    {(c.followers / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnalyticsCharts userGrowth={data?.userGrowth} jobGrowth={data?.jobGrowth} />
        <ActivityTable logs={data?.logs} />

      </div>
    </div>
  );
};

export default AdminDashboard;
