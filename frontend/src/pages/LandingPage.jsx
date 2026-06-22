import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, Building2, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 overflow-hidden font-sans circuit-bg">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          The New Standard in Tech Recruitment
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 max-w-4xl tracking-tight leading-[1.1]"
        >
          Find Jobs. <br className="md:hidden" />
          <span className="text-cyan-400">Hire Talent.</span> <br className="md:hidden" />
          Build Careers.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Connect Freshers and Startups through a modern, AI-driven recruitment ecosystem designed for speed, accuracy, and growth.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link to="/auth" className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-colors shadow-sm flex items-center justify-center gap-2">
            Get Started <TrendingUp size={18} />
          </Link>
          <Link to="/fresher/jobs" className="px-8 py-4 glass-card text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
            Explore Jobs <Search size={18} />
          </Link>
        </motion.div>

        {/* Floating Abstract UI Elements */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-10 hidden lg:flex items-center gap-3 p-4 glass-card shadow-xl transform -rotate-6"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Briefcase className="text-cyan-400" size={20} />
          </div>
          <div className="text-left">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">New Match</div>
            <div className="text-sm font-black text-white">Frontend Developer</div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-60 right-10 hidden lg:flex items-center gap-3 p-4 glass-card shadow-xl transform rotate-6"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <div className="text-left">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status Update</div>
            <div className="text-sm font-black text-white">Application Hired</div>
          </div>
        </motion.div>

      </section>

      {/* Trusted Companies */}
      <section className="py-10 border-y border-slate-800 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted by innovative companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-slate-500">
            {/* Mock Company Logos */}
            <div className="text-xl font-black font-serif">ACME Corp</div>
            <div className="text-xl font-black font-sans tracking-tighter">GlobalTech</div>
            <div className="text-xl font-black italic">Nexus</div>
            <div className="text-xl font-black tracking-widest">AEROSPACE</div>
            <div className="text-xl font-black">Quantum</div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Active Jobs', value: '10,000+', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
            { label: 'Startups Hiring', value: '2,500+', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
            { label: 'Freshers Placed', value: '15,000+', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 text-center flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${stat.bg} ${stat.border}`}>
                <stat.icon className={stat.color} size={32} />
              </div>
              <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">A complete ecosystem for your career</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to find jobs, track applications, and prove your skills in one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                { title: 'Smart Job Matching', desc: 'Our AI analyzes your skills and recommends the best startup roles for you.' },
                { title: 'Technical Arenas', desc: 'Take coding assessments and earn verified certificates to boost your profile.' },
                { title: 'Visual ATS Tracking', desc: 'Track your application status in real-time with our intuitive pipeline view.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                    <span className="text-cyan-400 font-black text-lg">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">{feature.title}</h4>
                    <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative h-[400px] glass-card p-3 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1E293B] to-transparent z-10" />
              {/* Abstract dashboard mockup graphic */}
              <div className="w-full h-full bg-[#0F172A] rounded-2xl border border-slate-800 flex flex-col p-5 gap-4">
                <div className="flex gap-4 mb-2">
                  <div className="w-1/3 h-24 glass-card rounded-xl" />
                  <div className="w-1/3 h-24 glass-card rounded-xl" />
                  <div className="w-1/3 h-24 glass-card rounded-xl" />
                </div>
                <div className="flex-1 glass-card rounded-xl p-5 flex flex-col gap-4">
                  <div className="w-1/2 h-6 bg-slate-800 rounded-md" />
                  <div className="w-full h-12 bg-[#0F172A] rounded-lg" />
                  <div className="w-full h-12 bg-[#0F172A] rounded-lg" />
                  <div className="w-5/6 h-12 bg-[#0F172A] rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to launch your career?</h2>
        <p className="text-xl text-slate-400 mb-10 font-medium">Join thousands of freshers and startups building the future together.</p>
        <Link to="/auth" className="inline-block px-10 py-4 bg-cyan-600 text-white font-bold text-lg rounded-xl hover:bg-cyan-500 transition-colors shadow-lg">
          Create Free Account
        </Link>
      </section>

    </div>
  );
};

export default LandingPage;
