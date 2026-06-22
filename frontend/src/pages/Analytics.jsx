import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminService.getAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setData({
        userGrowth: [
          { month: 'Jan', freshers: 120, startups: 10 },
          { month: 'Feb', freshers: 150, startups: 15 },
          { month: 'Mar', freshers: 200, startups: 22 },
          { month: 'Apr', freshers: 280, startups: 30 },
          { month: 'May', freshers: 390, startups: 45 },
          { month: 'Jun', freshers: 500, startups: 60 }
        ],
        jobGrowth: [
          { month: 'Jan', jobs: 40 },
          { month: 'Feb', jobs: 65 },
          { month: 'Mar', jobs: 90 },
          { month: 'Apr', jobs: 150 },
          { month: 'May', jobs: 210 },
          { month: 'Jun', jobs: 300 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-10">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-350 px-6 py-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-white">Platform <span className="text-rose-500">Analytics</span></h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* User Growth */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl h-96">
            <h3 className="text-lg font-bold text-white mb-4">User Acquisition Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.userGrowth}>
                <defs>
                  <linearGradient id="colorFreshers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStartups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none' }} />
                <Legend />
                <Area type="monotone" dataKey="freshers" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFreshers)" />
                <Area type="monotone" dataKey="startups" stroke="#f59e0b" fillOpacity={1} fill="url(#colorStartups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Job Postings */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl h-96">
            <h3 className="text-lg font-bold text-white mb-4">Job Listings Growth</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.jobGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{ fill: '#0f172a' }} contentStyle={{ backgroundColor: '#020617', border: 'none' }} />
                <Bar dataKey="jobs" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
