import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, MapPin, Phone, GraduationCap, Briefcase, Bookmark, Calendar, ArrowLeft } from 'lucide-react';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // local state, backend could return this ideally
  
  // For Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');

  useEffect(() => {
    fetchCandidate();
    fetchCompanyJobs();
    checkIfSaved();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const { data } = await api.get(`/network/candidates/${id}`);
      if (data.success) {
        setCandidate(data.data);
      }
    } catch (error) {
      console.error('Error fetching candidate details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      // Assuming we have a route or we just fetch from dashboard context, 
      // let's fetch jobs directly if needed. We might need a new endpoint or use /api/jobs.
      const { data } = await api.get('/jobs');
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data } = await api.get('/network/candidates/saved/all');
      if (data.success) {
        const savedIds = data.data.map(c => c._id);
        setIsSaved(savedIds.includes(id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.post(`/network/candidates/${id}/save`);
      if (data.success) {
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error saving candidate', error);
    }
  };

  const handleInvite = async () => {
    try {
      if (!selectedJob) return alert('Please select a job');
      const { data } = await api.post('/invitations/create', {
        candidateId: id,
        jobId: selectedJob
      });
      if (data.success) {
        alert('Invitation sent successfully!');
        setShowInviteModal(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending invite');
    }
  };

  if (loading) return <div className="text-center text-slate-400 py-12">Loading candidate profile...</div>;
  if (!candidate) return <div className="text-center text-red-400 py-12">Candidate not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/candidates')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Header Profile */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-cyan-500/20"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 pt-16">
          <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-5xl font-black text-cyan-400">
            {candidate.name.charAt(0)}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-black font-display text-white tracking-tight">{candidate.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-cyan-400"/> {candidate.personalInfo?.location || 'Not Specified'}</span>
              <span className="flex items-center gap-1.5"><Mail size={16} className="text-slate-400"/> {candidate.email}</span>
              {candidate.personalInfo?.phone && <span className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400"/> {candidate.personalInfo.phone}</span>}
            </div>
          </div>
          <div className="flex gap-3 pb-2 w-full md:w-auto">
            <button 
              onClick={handleSave}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-5 font-bold rounded-xl transition-all shadow-md ${
                isSaved ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <Bookmark size={16}/> {isSaved ? 'Saved' : 'Save'}
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-6 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <Calendar size={16}/> Invite to Interview
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-4">About</h2>
            <p className="text-slate-300 leading-relaxed">
              {candidate.personalInfo?.bio || "No bio provided."}
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-2"><Briefcase size={20} className="text-amber-400"/> Experience</h2>
            <div className="space-y-6">
              {candidate.experienceDetails?.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l border-slate-700/50 pb-6 last:pb-0 last:border-transparent">
                  <div className="absolute w-3 h-3 bg-amber-400 rounded-full -left-[6.5px] top-1 ring-4 ring-slate-900"></div>
                  <h3 className="text-white font-bold">{exp.title}</h3>
                  <p className="text-cyan-400 text-sm font-medium">{exp.company} <span className="text-slate-500 mx-2">•</span> {exp.location}</p>
                  <p className="text-slate-500 text-xs mt-1 mb-2">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  <p className="text-slate-400 text-sm">{exp.description}</p>
                </div>
              ))}
              {(!candidate.experienceDetails || candidate.experienceDetails.length === 0) && (
                <p className="text-slate-500">No experience details added.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-2"><GraduationCap size={20} className="text-cyan-400"/> Education</h2>
            <div className="space-y-6">
              {candidate.educationDetails?.map((edu, idx) => (
                <div key={idx} className="relative pl-6 border-l border-slate-700/50 pb-6 last:pb-0 last:border-transparent">
                  <div className="absolute w-3 h-3 bg-cyan-400 rounded-full -left-[6.5px] top-1 ring-4 ring-slate-900"></div>
                  <h3 className="text-white font-bold">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-slate-400 text-sm font-medium">{edu.school}</p>
                  <p className="text-slate-500 text-xs mt-1">{edu.startYear} - {edu.endYear}</p>
                </div>
              ))}
              {(!candidate.educationDetails || candidate.educationDetails.length === 0) && (
                <p className="text-slate-500">No education details added.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-white mb-6">Top Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill, idx) => (
                <span key={idx} className="bg-slate-800/80 text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-medium border border-slate-700">
                  {skill}
                </span>
              ))}
              {(!candidate.skills || candidate.skills.length === 0) && (
                <p className="text-slate-500 text-sm">No skills listed.</p>
              )}
            </div>
          </div>

          {candidate.resume?.fileUrl && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold font-display text-white mb-4">Resume</h2>
              <a href={candidate.resume.fileUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-center rounded-xl text-sm font-bold text-white transition-colors border border-slate-700">
                Download Resume
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Invite to Interview</h3>
            <p className="text-slate-400 text-sm mb-6">Select a job posting to invite {candidate.name} to.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Select Job</label>
                <select 
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">-- Choose Job --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-800">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInvite}
                  className="flex-1 py-2.5 rounded-xl text-slate-950 bg-cyan-500 hover:bg-cyan-400 font-bold transition-all"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetails;
