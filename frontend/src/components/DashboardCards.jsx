import React from 'react';
import { Users, Briefcase, FileText, Activity, Shield, Target } from 'lucide-react';

const DashboardCards = ({ data }) => {
  if (!data) return null;

  const cards = [
    { title: 'Total Freshers', value: data.totalFreshers, icon: <Users size={20} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { title: 'Total Companies', value: data.totalCompanies, icon: <Activity size={20} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Total Jobs', value: data.totalJobs, icon: <Briefcase size={20} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Total Applications', value: data.totalApplications, icon: <FileText size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Interviews', value: data.totalInterviews, icon: <Target size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Total Hires', value: data.totalHires, icon: <Shield size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-slate-900/40 border border-slate-850 hover:border-rose-500/20 rounded-2xl p-5 shadow-lg flex items-center space-x-4 transition-all hover:-translate-y-0.5 group">
          <div className={`p-3.5 ${card.bg} rounded-xl ${card.color} group-hover:scale-105 transition-transform`}>
            {card.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{card.title}</p>
            <h3 className="text-xl font-black text-white">{card.value || 0}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
