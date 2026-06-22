import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Code, Github, Linkedin, ExternalLink, Edit3, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileEditModal from '../components/ProfileEditModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col font-sans text-slate-300">

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-10">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card shadow-sm rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-32 h-32 rounded-3xl bg-[#0F172A] border border-slate-800 flex items-center justify-center shadow-sm shrink-0">
              <UserIcon size={64} className="text-slate-500" />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 gap-4">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                    <h1 className="text-3xl font-black text-white tracking-tight">{user?.name || 'Alex Johnson'}</h1>
                    {user?.visibility === 'private' ? (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-700">Private</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/20">Public</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-cyan-400">{user?.role === 'startup' ? 'Startup Admin' : (user?.headline || 'Frontend Engineer')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditModalOpen(true)} className="p-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-slate-400 hover:text-cyan-400 rounded-xl transition-colors border border-slate-800 shadow-sm" title="Edit Profile">
                    <Edit3 size={18} />
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-colors shadow-sm">
                    <Download size={18} /> Resume
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-5 text-sm font-semibold text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-500" /> {user?.location || 'San Francisco, CA'}</span>
                <span className="flex items-center gap-1.5"><Mail size={16} className="text-slate-500" /> {user?.email || 'alex@example.com'}</span>
                <span className="flex items-center gap-1.5"><Phone size={16} className="text-slate-500" /> {user?.phone || '+1 (555) 123-4567'}</span>
              </div>

              <div className="flex justify-center sm:justify-start gap-3">
                <a href="#" className="p-2.5 bg-[#0F172A] border border-slate-800 shadow-sm hover:border-cyan-400 hover:text-cyan-400 text-slate-500 rounded-xl transition-all"><Github size={18} /></a>
                <a href="#" className="p-2.5 bg-[#0F172A] border border-slate-800 shadow-sm hover:border-cyan-400 hover:text-cyan-400 text-slate-500 rounded-xl transition-all"><Linkedin size={18} /></a>
                <a href="#" className="p-2.5 bg-[#0F172A] border border-slate-800 shadow-sm hover:border-cyan-400 hover:text-cyan-400 text-slate-500 rounded-xl transition-all"><ExternalLink size={18} /></a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* About */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserIcon size={16} /> About
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">
                {user?.personalInfo?.bio || 'Passionate developer looking for new opportunities. Please edit your profile to add a bio!'}
              </p>
            </motion.section>

            {/* Skills */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code size={16} /> Skills
                </h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold">Edit</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg">{skill}</span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs italic">No skills added yet</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Certificates */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Award size={16} /> Certificates
              </h2>
              <div className="space-y-5">
                {user?.certificates && user.certificates.length > 0 ? (
                  user.certificates.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight mb-1">{cert.title || 'Certification'}</h4>
                        <p className="text-xs text-slate-400 font-medium">{cert.issuer || 'Issuer'} • Score: {cert.score || 'N/A'}</p>
                        {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-cyan-400 hover:underline mt-1.5 inline-block uppercase tracking-wide">Verify Credential &rarr;</a>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic">No certificates added</p>
                )}
              </div>
            </motion.section>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Experience */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={16} /> Experience
                </h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">+ Add New</button>
              </div>

              <div className="space-y-8 relative border-l-2 border-slate-800 ml-3">
                {user?.experienceDetails && user.experienceDetails.length > 0 ? (
                  user.experienceDetails.map((exp, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-[#1E293B] border-4 border-cyan-500 shadow-sm" />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div>
                          <h3 className="text-lg font-black text-white">{exp.title}</h3>
                          <p className="text-sm font-bold text-cyan-400">{exp.company}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#0F172A] border border-slate-800 px-2.5 py-1 rounded-md shrink-0">{exp.startDate || '2023'} - {exp.endDate || 'Present'}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">{exp.description || 'No description provided.'}</p>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-8"><p className="text-slate-500 text-xs italic">No experience added</p></div>
                )}
              </div>
            </motion.section>

            {/* Projects */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Code size={16} /> Projects
                </h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">+ Add New</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {user?.projects && user.projects.length > 0 ? (
                  user.projects.map((proj, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-sm hover:border-cyan-500/50 hover:shadow-md transition-all group flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">{proj.title}</h4>
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 p-1"><ExternalLink size={16} /></a>}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mb-5 flex-grow">{proj.description}</p>
                      {proj.stack && proj.stack.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-auto">
                          {proj.stack.map(tech => (
                            <span key={tech} className="text-[10px] font-bold px-2 py-1 bg-[#1E293B] border border-slate-700 text-slate-300 rounded-md">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic col-span-2">No projects added</p>
                )}
              </div>
            </motion.section>

            {/* Education */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card shadow-sm rounded-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap size={16} /> Education
                </h2>
              </div>
              
              <div className="space-y-5">
                {user?.educationDetails && user.educationDetails.length > 0 ? (
                  user.educationDetails.map((edu, idx) => (
                    <div key={idx} className="flex gap-5 items-start p-4 rounded-xl border border-transparent hover:border-slate-800 hover:bg-[#0F172A] transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="text-cyan-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white mb-0.5">{edu.degree}</h4>
                        <p className="text-sm font-bold text-slate-400 mb-1">{edu.school}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{edu.startYear} - {edu.endYear}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic">No education details added</p>
                )}
              </div>
            </motion.section>

          </div>
        </div>
      </main>
      
      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={() => {}} />
    </div>
  );
};

export default ProfilePage;
