import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Award, Calendar, ArrowLeft, Send, Sparkles } from 'lucide-react';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const inviteCode = searchParams.get('inviteCode');

      let found = null;
      if (inviteCode) {
        const res = await api.get(`/jobs/private/${inviteCode}`);
        if (res.data.success && res.data.data._id === id) {
          found = res.data.data;
        }
      } else {
        const res = await api.get('/jobs');
        if (res.data.success) {
          found = res.data.data.find(j => j._id === id);
        }
      }

      if (found) {
        setJob(found);
        checkAppliedStatus(found);
      } else {
        loadMockJob();
      }
    } catch (err) {
      console.log('Failed fetching job details from API, loading mock:', err);
      loadMockJob();
    } finally {
      setLoading(false);
    }
  };

  const loadMockJob = () => {
    // Read from mock startup jobs
    const localJobsStr = localStorage.getItem('mock_startup_jobs');
    let found = null;
    if (localJobsStr) {
      const localJobs = JSON.parse(localJobsStr);
      found = localJobs.find(j => j._id === id);
    }

    if (!found) {
      // Look in defaults
      const defaults = [
        {
          _id: 'mock_job_1',
          title: 'React Developer',
          description: 'We are seeking a Frontend Engineer skilled in React.js, Tailwind CSS, and state management frameworks to build our next-generation web application. You will collaborate with designers and backend engineers to deploy responsive interfaces.',
          requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux'],
          companyName: 'TechNova',
          location: 'San Jose, CA',
          salary: '$80,000 - $100,000',
          experience: '0-1 years',
          applicants: []
        },
        {
          _id: 'mock_job_2',
          title: 'Node Engineer',
          description: 'Join our backend engineering team to design, build, and optimize robust RESTful microservices and manage MongoDB integration. You will be responsible for setting up secure auth protocols, DB indexing, and scaling container deployments.',
          requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
          companyName: 'DataFlow',
          location: 'Remote',
          salary: '$75,000 - $95,000',
          experience: 'Freshers welcome',
          applicants: []
        },
        {
          _id: 'mock_job_3',
          title: 'Full Stack Engineer',
          description: 'Looking for a generalist who can work across the stack, building responsive client portals and scaling server deployments. Experience with TypeScript and relational databases is a major plus.',
          requiredSkills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
          companyName: 'CloudSphere',
          location: 'Remote',
          salary: '$90,000 - $110,000',
          experience: '1-3 years',
          applicants: []
        }
      ];
      found = defaults.find(d => d._id === id);
    }

    if (found) {
      setJob(found);
      checkAppliedStatus(found);
    }
  };

  const checkAppliedStatus = (jobObj) => {
    const activeUserId = user?._id || 'mock_user_id';
    const applied = jobObj.applicants?.some(
      app => {
        const applicantId = app.userId?._id || app.userId;
        return applicantId === activeUserId || app.userId?.email === user?.email;
      }
    );
    setHasApplied(applied);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-500">Compiling job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-500">Job position not found or has been closed.</p>
        <button onClick={() => navigate('/fresher/jobs')} className="text-cyan-400 underline hover:text-cyan-300">
          Return to Jobs Feed
        </button>
      </div>
    );
  }

  const companyName = job.company || job.companyName || job.startupId?.name || 'Startup Recruiters';

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-950 text-white font-sans px-6 py-12 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
        {/* Back link */}
        <button 
          onClick={() => navigate('/fresher/jobs')}
          className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Opportunity Portal</span>
        </button>

        {/* Job Header Card */}
        <div className="p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">Job Posting</span>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">{job.title}</h1>
            <p className="text-sm text-cyan-400 font-bold tracking-wide uppercase">{companyName}</p>
            
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-500" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign size={13} className="text-slate-500" />
                {job.salary || 'Unspecified'}
              </span>
              <span className="flex items-center gap-1.5">
                <Award size={13} className="text-slate-500" />
                {job.experience || 'Freshers welcome'}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-slate-850">
            {hasApplied ? (
              <button
                disabled
                className="w-full md:w-auto py-3 px-6 text-xs font-bold rounded-lg text-slate-500 bg-slate-950 border border-slate-900 cursor-not-allowed"
              >
                Application Already Sent
              </button>
            ) : (
              <button
                onClick={() => {
                  const searchParams = new URLSearchParams(window.location.search);
                  const inviteCode = searchParams.get('inviteCode');
                  const url = `/fresher/jobs/${job._id}/apply${inviteCode ? `?inviteCode=${inviteCode}` : ''}`;
                  navigate(url);
                }}
                className="w-full md:w-auto py-3 px-6 text-xs font-bold rounded-lg text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send size={13} /> Apply For Position
              </button>
            )}
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="md:col-span-2 space-y-6 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-850 pb-3">
              Role Scope & Description
            </h3>
            <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Requirements Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">
                Mandatory Skill tags
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.requiredSkills && job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 border border-indigo-500/10 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wide">
                <Sparkles size={13} />
                <span>Verification Match</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Applying cross-references your profile portfolio and quiz assessment results. The matcher calculates skill alignments and assigns a priority rank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
