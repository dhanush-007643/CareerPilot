import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Building, Users, Briefcase, UserPlus, ExternalLink, Mail, MapPin, ArrowLeft } from 'lucide-react';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const { data } = await api.get(`/network/companies/${id}`);
      if (data.success) {
        setCompany(data.data);
      }
    } catch (error) {
      console.error('Error fetching company details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/network/companies/${id}/follow`);
      if (data.success) {
        fetchCompany();
      }
    } catch (error) {
      console.error('Error following company', error);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-12">Loading company profile...</div>;
  }

  if (!company) {
    return <div className="text-center text-red-400 py-12">Company not found.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/companies')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Header Profile */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-amber-500/20 to-cyan-500/20"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 pt-16">
          <div className="w-32 h-32 rounded-2xl bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-5xl font-black text-amber-400">
            {company.logo ? <img src={company.logo} alt="logo" className="w-full h-full object-cover rounded-xl" /> : company.companyName.charAt(0)}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-black font-display text-white tracking-tight">{company.companyName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5"><Building size={16} className="text-cyan-400"/> {company.industry}</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-slate-400"/> {company.companySize} Employees</span>
              <span className="flex items-center gap-1.5"><Mail size={16} className="text-slate-400"/> {company.companyEmail}</span>
            </div>
          </div>
          <div className="flex gap-3 pb-2 w-full md:w-auto">
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-md">
                <ExternalLink size={16}/> Website
              </a>
            )}
            <button 
              onClick={handleFollow}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-6 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10"
            >
              <UserPlus size={16}/> Follow ({company.followers?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-4">About the Company</h2>
            <p className="text-slate-300 leading-relaxed">
              {company.description || "This company hasn't added a description yet."}
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display text-white">Open Positions</h2>
              <span className="bg-cyan-500/10 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/20">
                {company.jobsPosted?.length || 0} Jobs
              </span>
            </div>
            
            <div className="space-y-4">
              {company.jobsPosted?.map(job => (
                <div key={job._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                  <div>
                    <h3 className="text-white font-bold text-lg group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12}/> {job.jobType}</span>
                      <span className="text-amber-400/80">{job.salary}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/fresher/jobs/${job._id}`)} className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-sm transition-colors shadow-md">
                    Apply
                  </button>
                </div>
              ))}
              {(!company.jobsPosted || company.jobsPosted.length === 0) && (
                <p className="text-slate-500 text-center py-6">No open positions at the moment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-6">Hiring Team</h2>
            <div className="space-y-4">
              {company.team?.map(member => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold border border-slate-700">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{member.name}</p>
                    <p className="text-slate-400 text-xs">{member.companyRole}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
