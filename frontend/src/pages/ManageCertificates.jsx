import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const ManageCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      const res = await adminService.getCertificates();
      if (res.success) setCerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-white">Manage <span className="text-yellow-400">Certificates</span></h1>
        
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-850">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Assessment</th>
                <th className="px-5 py-3">Verification Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {certs.map((cert) => (
                <tr key={cert._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-bold text-slate-200">{cert.userId?.name}</td>
                  <td className="px-5 py-4">{cert.quizId?.title}</td>
                  <td className="px-5 py-4 font-mono text-xs">{cert.verificationCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCertificates;
