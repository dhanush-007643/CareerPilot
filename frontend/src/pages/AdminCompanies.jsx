import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Globe, Phone, Mail, Edit2, X, CheckCircle } from 'lucide-react';
import api from '../services/api';

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit modal state
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditBio(company.personalInfo?.bio || '');
    setEditLocation(company.personalInfo?.location || '');
    setEditPhone(company.personalInfo?.phone || '');
    setSuccess('');
    setError('');
  };

  const closeEditModal = () => {
    setEditingCompany(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName) {
      setError('Please provide a company name.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/admin/companies/${editingCompany._id}`, {
        name: editName,
        personalInfo: {
          bio: editBio,
          location: editLocation,
          phone: editPhone
        }
      });

      if (res.data.success) {
        setSuccess('Company profile updated successfully.');
        setCompanies(companies.map(c => c._id === editingCompany._id ? res.data.data : c));
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating company:', err);
      setError('Failed to update company profile.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 text-slate-300 px-6 py-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Console</span>
        </button>

        {/* Header section */}
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Company Registry <span className="text-rose-500 text-lg">🏢</span>
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Platform-wide directory of startup recruiters. Edit credentials, descriptions, and regional location flags.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
            Total registered: {companies.length}
          </span>
        </div>

        {/* Company list grid */}
        {loading ? (
          <p className="text-center py-20 text-xs uppercase tracking-widest text-slate-500 animate-pulse">Loading profiles...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <div 
                key={company._id}
                className="bg-slate-900/30 border border-slate-850 hover:border-rose-500/20 rounded-2xl p-6 shadow-lg space-y-4 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">{company.name}</h3>
                    <p className="text-xs text-rose-400 font-semibold mt-0.5">{company.email}</p>
                  </div>
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-normal line-clamp-3">
                  {company.personalInfo?.bio || 'No business bio description added yet.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-600" />
                    <span className="truncate">{company.personalInfo?.location || 'Remote'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 justify-end">
                    <Phone size={11} className="text-slate-600" />
                    <span>{company.personalInfo?.phone || 'N/A'}</span>
                  </span>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="md:col-span-2 text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-850">
                <p className="text-slate-500 text-xs italic">No registered company accounts found.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit modal popup */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              Edit Business Details
            </h3>

            {success && (
              <div className="mb-4 px-4 py-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Business Bio</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Outline organization missions, size, and sectors..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Location Flag</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors pt-2"
              >
                {submitLoading ? 'Updating Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCompanies;
