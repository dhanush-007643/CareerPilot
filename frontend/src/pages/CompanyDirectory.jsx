import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Building2, MapPin, Users, ExternalLink, UserPlus, UserMinus, Sparkles, TrendingUp, ChevronRight, Check, Filter, Briefcase } from 'lucide-react';

const CompanyDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  
  const [companies, setCompanies] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try fetching from API
      const [companiesRes, followedRes] = await Promise.all([
        api.get('/companies'), // Assuming this exists or returns companies
        api.get('/followers/my-followed-companies').catch(() => ({ data: { data: [] } }))
      ]);
      
      let fetchedCompanies = [];
      if (companiesRes.data && companiesRes.data.data) {
        // Filter only public companies
        fetchedCompanies = companiesRes.data.data.filter(c => c.companyVisibility === 'public');
      }

      const followed = new Set((followedRes.data?.data || []).map(c => c._id));
      setFollowedIds(followed);

      if (fetchedCompanies.length > 0) {
        setCompanies(fetchedCompanies);
      } else {
        loadFallback();
      }
    } catch (err) {
      console.error('Failed to fetch companies API, using fallback:', err);
      loadFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadFallback = () => {
    const mockCompanies = [
      { _id: '1', companyName: 'Google', industry: 'Technology', location: 'Mountain View, CA', companySize: '10000+', openJobs: 45, followers: ['1','2','3'], isFollowing: false, tags: ['AI', 'Cloud'] },
      { _id: '2', companyName: 'Stripe', industry: 'Fintech', location: 'San Francisco, CA', companySize: '5000+', openJobs: 12, followers: ['1'], isFollowing: true, tags: ['Payments'] },
      { _id: '3', companyName: 'Vercel', industry: 'Developer Tools', location: 'Remote', companySize: '500+', openJobs: 8, followers: [], isFollowing: false, tags: ['Next.js'] }
    ];
    setCompanies(mockCompanies);
  };

  const toggleFollow = async (e, companyId, currentlyFollowing) => {
    e.stopPropagation();
    try {
      if (currentlyFollowing) {
        await api.delete(`/followers/unfollow/${companyId}`);
        setFollowedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(companyId);
          return newSet;
        });
      } else {
        await api.post('/followers/follow', { companyId });
        setFollowedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(companyId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
      // Optimistic fallback for demo
      setFollowedIds(prev => {
        const newSet = new Set(prev);
        currentlyFollowing ? newSet.delete(companyId) : newSet.add(companyId);
        return newSet;
      });
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (c.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (c.industry?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const matchesIndustry = filterIndustry ? (c.industry?.toLowerCase() || '') === filterIndustry.toLowerCase() : true;
    const matchesLocation = filterLocation ? (c.location?.toLowerCase() || '').includes(filterLocation.toLowerCase()) : true;

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col relative overflow-hidden font-sans text-slate-300">
      
      {/* Header & Search */}
      <div className="relative z-40 bg-[#1E293B]/50 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] font-bold text-sm mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <TrendingUp size={16} /> Public Company Directory
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Discover Your Next <span className="text-[#22D3EE]">Launchpad</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg font-medium">
            Explore industry-leading startups and visionary enterprises. Follow companies to get notified when they hire.
          </p>
          
          <div className="w-full md:w-[600px] mx-auto relative group">
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-[#22D3EE]" size={24} />
              <input 
                type="text" 
                placeholder="Search companies, industries..." 
                className="w-full pl-14 pr-14 py-4 bg-[#1E293B] border border-slate-700 rounded-2xl text-white text-lg focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] shadow-lg transition-all font-medium placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-4 p-2 rounded-xl transition-colors ${showFilters ? 'bg-[#22D3EE] text-[#0B1120]' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 text-left"
              >
                <div className="flex flex-wrap gap-4 p-5 bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-2xl mx-auto shadow-xl">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Industry</label>
                    <select 
                      value={filterIndustry} 
                      onChange={(e) => setFilterIndustry(e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22D3EE]"
                    >
                      <option value="">All Industries</option>
                      <option value="technology">Technology</option>
                      <option value="fintech">Fintech</option>
                      <option value="ai">AI Research</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => { setFilterIndustry(''); setFilterLocation(''); setSearchQuery(''); }}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors h-[50px]"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 relative z-10">
        <AnimatePresence>
          {filteredCompanies.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 bg-[#1E293B] rounded-3xl border border-slate-800 shadow-xl max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-[#0B1120] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Building2 size={32} className="text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No companies found</h3>
              <p className="text-slate-400">We couldn't find anything matching your search criteria.</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.map((company, index) => {
                const isFollowing = followedIds.has(company._id);
                return (
                  <motion.div
                    key={company._id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                    onClick={() => navigate(`/companies/${company._id}`)}
                    className="relative p-8 rounded-3xl bg-[#1E293B] border border-slate-700 hover:border-[#22D3EE]/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-[#0B1120] border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {company.logo ? (
                          <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-2xl text-slate-500">{company.companyName?.charAt(0)}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => toggleFollow(e, company._id, isFollowing)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border z-20 ${
                          isFollowing 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-[#22D3EE]/10 border-[#22D3EE]/30 text-[#22D3EE] hover:bg-[#22D3EE]/20 hover:scale-105'
                        }`}
                      >
                        {isFollowing ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                      </button>
                    </div>

                    <div className="mb-6 flex-1 relative z-10">
                      <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[#22D3EE] transition-colors flex items-center gap-2">
                        {company.companyName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm font-bold text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 inline-block px-3 py-1 rounded-lg mb-5">
                        {company.industry || 'Technology'}
                      </div>
                      
                      <div className="space-y-3 text-sm font-semibold text-slate-400">
                        <div className="flex items-center gap-3"><MapPin size={18} className="text-slate-500" /> {company.location || 'Remote'}</div>
                        <div className="flex items-center gap-3"><Users size={18} className="text-slate-500" /> {company.companySize || 'Startup'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-700 mt-auto relative z-10">
                      <div className="flex items-center gap-6 text-sm font-bold">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Followers</span>
                          <span className="text-white text-lg">{company.followers?.length || 0}</span>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-[#0B1120] border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-[#22D3EE] group-hover:border-[#22D3EE]/30 transition-all shadow-sm">
                        <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CompanyDirectory;
