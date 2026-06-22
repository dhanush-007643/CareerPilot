import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsCharts = ({ userGrowth, jobGrowth }) => {
  if (!userGrowth || !jobGrowth) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* User Growth Chart */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">User Growth Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }} 
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="freshers" name="Freshers" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="startups" name="Startups" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Job Postings Chart */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Job Listings Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#0f172a' }}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }} 
                itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
              />
              <Bar dataKey="jobs" name="New Jobs" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
