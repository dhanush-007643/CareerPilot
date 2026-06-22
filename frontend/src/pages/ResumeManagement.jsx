import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Download, Trash2, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

const ResumeManagement = () => {
  const { user, updateUser } = useAuth();
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Fetch current resume on mount
  useEffect(() => {
    fetchResume();
  }, [user]);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/resume');
      if (res.data.success && res.data.resume?.fileContent) {
        setResume(res.data.resume);
      }
    } catch (err) {
      console.log('API get resume failed, loading mock state:', err);
      // Fallback
      const savedUserStr = localStorage.getItem('mock_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.resume?.fileContent) {
          setResume(u.resume);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Convert file to Base64
  const processFile = (file) => {
    if (!file) return;

    // Check size limit: e.g. 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      
      const newResume = {
        fileName: file.name,
        fileContent: base64Data,
        uploadedAt: new Date().toISOString(),
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      };

      setLoading(true);
      setError('');
      setSuccess(false);

      try {
        const res = await api.put('/auth/resume', {
          fileName: newResume.fileName,
          fileContent: newResume.fileContent
        });

        if (res.data.success) {
          setResume(newResume);
          setSuccess(true);
          updateUser({ resume: newResume });
        }
      } catch (err) {
        console.log('API upload failed, updating local mock state:', err);
        setResume(newResume);
        setSuccess(true);
        updateUser({ resume: newResume });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const syncMockResume = (newResume) => {
    const savedUserStr = localStorage.getItem('mock_user');
    if (savedUserStr) {
      const u = JSON.parse(savedUserStr);
      u.resume = newResume;
      localStorage.setItem('mock_user', JSON.stringify(u));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownload = () => {
    if (!resume || (!resume.fileContent && !resume.fileUrl)) return;

    let downloadUrl = resume.fileUrl || resume.fileContent;
    if (resume.fileUrl && resume.fileUrl.startsWith('/public')) {
      downloadUrl = `http://localhost:5000${resume.fileUrl}`;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = resume.fileName || 'resume_download.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Clear on database
      await api.put('/auth/resume', { fileName: '', fileContent: '' });
      setResume(null);
      setSuccess(true);
      updateUser({ resume: null });
    } catch (err) {
      console.log('API delete failed, clearing local mock:', err);
      setResume(null);
      setSuccess(true);
      updateUser({ resume: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#0B1120] text-slate-300 font-sans px-6 py-12 overflow-hidden">
      
      <div className="max-w-3xl mx-auto space-y-8 z-10 relative">
        {/* Banner Section */}
        <div className="p-8 rounded-2xl glass-card relative overflow-hidden shadow-sm">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Resume Control Room <span className="text-2xl">📄</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed text-sm font-medium">
            Upload and update your primary resume file. Submitting your resume allows the matches to reflect accurately on recruiter ATS dashboards.
          </p>
        </div>

        {success && (
          <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-400 flex items-center gap-2 shadow-sm">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>Action completed successfully!</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 flex items-center gap-2 shadow-sm">
            <AlertCircle size={18} className="text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current File Display */}
          <div className="md:col-span-1 glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-4">Current Resume</span>
              {resume ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white line-clamp-2" title={resume.fileName}>
                      {resume.fileName}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      Uploaded: {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {resume.fileSize && (
                      <p className="text-[10px] font-bold px-2 py-1 rounded bg-[#0F172A] border border-slate-700 inline-block text-slate-400 mt-2 font-mono">
                        {resume.fileSize}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-6 text-slate-500 text-center">
                  <FileText size={40} className="mx-auto text-slate-500 opacity-60" />
                  <p className="text-xs font-bold italic">No resume uploaded yet</p>
                </div>
              )}
            </div>

            {resume && (
              <div className="flex gap-2 border-t border-slate-700 pt-4 mt-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-2 rounded-lg border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all bg-[#0F172A] shadow-sm"
                  title="Remove Resume"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Upload Area Dropzone */}
          <div className="md:col-span-2">
            <form
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative bg-[#0F172A] ${
                dragActive 
                  ? 'border-cyan-500 bg-cyan-500/5' 
                  : 'border-slate-700 hover:border-cyan-500/50 hover:bg-[#1E293B]'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={loading}
              />
              
              <div className="space-y-4 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
                  <Upload size={22} className={loading ? 'animate-bounce text-cyan-400' : ''} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {loading ? 'Processing file upload...' : 'Upload PDF, DOCX, or Text'}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1 max-w-[280px] mx-auto">
                    Drag and drop your file here, or click to browse. Maximum file size is 5MB.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                    Direct Match Sync Active
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Demo Guidelines Alert */}
        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex gap-3 items-start shadow-sm">
          <ArrowUpRight className="text-cyan-400 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1">
            <h5 className="text-sm font-black text-cyan-100">Interactive Resume Engine</h5>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              When applying for startup positions, this document will be included as your verification sheet. The scoring engine scans the contents and grades candidate suitability based on the tagged requirements on the dashboard.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeManagement;
