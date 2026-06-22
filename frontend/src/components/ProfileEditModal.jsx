import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfileEditModal = ({ isOpen, onClose, onSave }) => {
  const { user, updateUser } = useAuth();
  
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.personalInfo?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(', '));
  const [visibility, setVisibility] = useState(user?.visibility || 'public');
  
  // Complex Arrays
  const [experience, setExperience] = useState(user?.experienceDetails || []);
  const [education, setEducation] = useState(user?.educationDetails || []);
  const [projects, setProjects] = useState(user?.projects || []);
  const [certificates, setCertificates] = useState(user?.certificates || []);
  
  const [loading, setLoading] = useState(false);

  // Handlers for adding new items
  const addExperience = () => setExperience([...experience, { title: '', company: '', startDate: '', endDate: '', description: '' }]);
  const addEducation = () => setEducation([...education, { degree: '', school: '', startYear: '', endYear: '' }]);
  const addProject = () => setProjects([...projects, { title: '', description: '', link: '', stack: [] }]);
  const addCertificate = () => setCertificates([...certificates, { title: '', issuer: '', score: '', link: '' }]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      const payload = {
        personalInfo: { headline, bio, location, phone },
        skills: skillsArray,
        experienceDetails: experience,
        educationDetails: education,
        projects,
        certificates,
        visibility
      };
      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        updateUser({
          headline,
          location,
          phone,
          skills: skillsArray,
          experienceDetails: experience,
          educationDetails: education,
          projects,
          certificates,
          visibility,
          personalInfo: { ...user?.personalInfo, headline, bio, location, phone }
        });
        onSave();
        onClose();
      }
    } catch (err) {
      console.error(err);
      // Mock Fallback
      updateUser({
        headline,
        location,
        phone,
        skills: skillsArray,
        experienceDetails: experience,
        educationDetails: education,
        projects,
        certificates,
        visibility,
        personalInfo: { ...user?.personalInfo, headline, bio, location, phone }
      });
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Headline</label>
              <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="Frontend Developer" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="City, Country" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="+1 234 567 8900" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">About Me (Bio)</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none resize-none" placeholder="Write a short bio..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Skills (Comma Separated)</label>
              <input type="text" value={skillsStr} onChange={e => setSkillsStr(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="React, Node.js, Python" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Profile Visibility</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm focus:border-cyan-500 outline-none">
                <option value="public">Public (Visible to Companies)</option>
                <option value="private">Private (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase">Experience</label>
              <button type="button" onClick={addExperience} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">+ Add</button>
            </div>
            {experience.map((exp, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg mb-3 border border-slate-800 space-y-3 relative">
                <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X size={14} /></button>
                <div className="flex gap-3 mt-2">
                  <input type="text" value={exp.title} onChange={e => { const newArr = [...experience]; newArr[idx].title = e.target.value; setExperience(newArr); }} placeholder="Job Title" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={exp.company} onChange={e => { const newArr = [...experience]; newArr[idx].company = e.target.value; setExperience(newArr); }} placeholder="Company" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
                <div className="flex gap-3">
                  <input type="text" value={exp.startDate} onChange={e => { const newArr = [...experience]; newArr[idx].startDate = e.target.value; setExperience(newArr); }} placeholder="Start Date" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={exp.endDate} onChange={e => { const newArr = [...experience]; newArr[idx].endDate = e.target.value; setExperience(newArr); }} placeholder="End Date" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
                <textarea value={exp.description} onChange={e => { const newArr = [...experience]; newArr[idx].description = e.target.value; setExperience(newArr); }} placeholder="Description" rows="2" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs resize-none" />
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase">Education</label>
              <button type="button" onClick={addEducation} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">+ Add</button>
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg mb-3 border border-slate-800 space-y-3 relative">
                <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X size={14} /></button>
                <div className="flex gap-3 mt-2">
                  <input type="text" value={edu.degree} onChange={e => { const newArr = [...education]; newArr[idx].degree = e.target.value; setEducation(newArr); }} placeholder="Degree" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={edu.school} onChange={e => { const newArr = [...education]; newArr[idx].school = e.target.value; setEducation(newArr); }} placeholder="School" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
                <div className="flex gap-3">
                  <input type="text" value={edu.startYear} onChange={e => { const newArr = [...education]; newArr[idx].startYear = e.target.value; setEducation(newArr); }} placeholder="Start Year" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={edu.endYear} onChange={e => { const newArr = [...education]; newArr[idx].endYear = e.target.value; setEducation(newArr); }} placeholder="End Year" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase">Projects</label>
              <button type="button" onClick={addProject} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">+ Add</button>
            </div>
            {projects.map((proj, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg mb-3 border border-slate-800 space-y-3 relative">
                <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X size={14} /></button>
                <div className="flex gap-3 mt-2">
                  <input type="text" value={proj.title} onChange={e => { const newArr = [...projects]; newArr[idx].title = e.target.value; setProjects(newArr); }} placeholder="Project Title" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={proj.link} onChange={e => { const newArr = [...projects]; newArr[idx].link = e.target.value; setProjects(newArr); }} placeholder="Link URL" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
                <textarea value={proj.description} onChange={e => { const newArr = [...projects]; newArr[idx].description = e.target.value; setProjects(newArr); }} placeholder="Project Description" rows="2" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs resize-none" />
                <input type="text" value={(proj.stack || []).join(', ')} onChange={e => { const newArr = [...projects]; newArr[idx].stack = e.target.value.split(',').map(s=>s.trim()).filter(Boolean); setProjects(newArr); }} placeholder="Tech Stack (Comma Separated)" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase">Certificates</label>
              <button type="button" onClick={addCertificate} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">+ Add</button>
            </div>
            {certificates.map((cert, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg mb-3 border border-slate-800 space-y-3 relative">
                <button type="button" onClick={() => setCertificates(certificates.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><X size={14} /></button>
                <div className="flex gap-3 mt-2">
                  <input type="text" value={cert.title} onChange={e => { const newArr = [...certificates]; newArr[idx].title = e.target.value; setCertificates(newArr); }} placeholder="Certificate Title" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={cert.issuer} onChange={e => { const newArr = [...certificates]; newArr[idx].issuer = e.target.value; setCertificates(newArr); }} placeholder="Issuer" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
                <div className="flex gap-3">
                  <input type="text" value={cert.score} onChange={e => { const newArr = [...certificates]; newArr[idx].score = e.target.value; setCertificates(newArr); }} placeholder="Score" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                  <input type="text" value={cert.link} onChange={e => { const newArr = [...certificates]; newArr[idx].link = e.target.value; setCertificates(newArr); }} placeholder="Verification Link" className="w-1/2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white text-xs" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors text-sm flex items-center gap-2">
              <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
