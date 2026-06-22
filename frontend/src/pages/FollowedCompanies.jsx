import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Building, MapPin, Users, Briefcase, ChevronRight, UserMinus } from 'lucide-react';

const FollowedCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowed();
  }, []);

  const fetchFollowed = async () => {
    try {
      const res = await api.get('/followers/my-followed-companies');
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch followed companies', err);
      // Fallback Mock
      setCompanies([
        { _id: 'mock1', companyName: 'Acme Corp', industry: 'Technology', companySize: '51-200', followers: ['1','2','3'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/followers/unfollow/${id}`);
      setCompanies(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to unfollow', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Loading Companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-300 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Followed Companies</h1>
            <p className="text-slate-400 text-sm mt-1">Keep track of the startups you're interested in.</p>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
              <Building size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-300">No companies followed yet</h3>
              <p className="text-slate-500 mt-2">Start exploring the directory to find startups that match your career goals.</p>
            </div>
            <button 
              onClick={() => navigate('/companies')}
              className="mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg"
            >
              Browse Directory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company._id}
                onClick={() => navigate(`/companies/${company._id}`)}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all cursor-pointer flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      {company.logo ? (
                        <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <Building size={28} className="text-slate-500" />
                      )}
                    </div>
                    <button 
                      onClick={(e) => unfollow(company._id, e)}
                      className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all z-10"
                      title="Unfollow"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{company.companyName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold tracking-wider">{company.industry}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users size={14} className="text-indigo-400" />
                      <span>{company.followers?.length || 0} Followers</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Briefcase size={14} className="text-emerald-400" />
                      <span>{company.companySize} Size</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center group-hover:bg-slate-900 transition-colors">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">View Profile</span>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedCompanies;
