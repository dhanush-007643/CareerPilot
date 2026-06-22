import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bookmark, Users, MapPin, Search } from 'lucide-react';

const SavedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedCandidates();
  }, []);

  const fetchSavedCandidates = async () => {
    try {
      const { data } = await api.get('/network/candidates/saved/all');
      if (data.success) {
        setCandidates(data.data);
      }
    } catch (error) {
      console.error('Error fetching saved candidates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/network/candidates/${id}/save`);
      if (data.success) {
        // Remove from list
        setCandidates(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error unsaving candidate', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading saved candidates...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-3xl font-black font-display text-white tracking-tight flex items-center gap-3">
            <Bookmark className="text-amber-400" size={32} fill="currentColor" />
            Saved Candidates
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Your shortlisted talent pool for future opportunities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <div 
            key={candidate._id} 
            onClick={() => navigate(`/candidates/${candidate._id}`)}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 hover:border-slate-700 transition-all flex flex-col cursor-pointer group relative"
          >
            <button 
              onClick={(e) => handleUnsave(e, candidate._id)}
              className="absolute top-4 right-4 p-2 text-amber-400 bg-amber-500/10 rounded-lg transition-all"
              title="Remove from saved"
            >
              <Bookmark size={18} fill="currentColor"/>
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-bold text-white">
                  {candidate.name.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{candidate.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {candidate.personalInfo?.location || 'Remote'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {candidate.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-md font-medium border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>

          </div>
        ))}
        {candidates.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
            <p>You haven't saved any candidates yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCandidates;
