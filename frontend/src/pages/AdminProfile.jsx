import React, { useState, useEffect } from 'react';
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from '../services/adminProfileService';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Mail, Phone, MapPin, Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: '',
    recoveryEmail: '',
    notificationEmail: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getAdminProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        address: res.data.address || '',
        recoveryEmail: res.data.recoveryEmail || '',
        notificationEmail: res.data.notificationEmail || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateAdminProfile(formData);
      setMessage('Profile updated successfully');
      loadProfile();
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      await changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed! Please login again.');
      setTimeout(() => {
        logout();
        navigate('/auth');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B1120] text-slate-300 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FBBF24] mb-8 flex items-center gap-3">
          <Shield className="text-[#22D3EE]" size={32} />
          Admin Security Center
        </h1>

        {message && <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-lg mb-6 border border-emerald-500/50">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 border border-red-500/50">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Account Details & Avatar */}
          <div className="space-y-8">
            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#22D3EE] to-[#FBBF24]"></div>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-[#22D3EE] flex items-center justify-center overflow-hidden">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-slate-500" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={20} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                <p className="text-[#22D3EE] text-sm uppercase tracking-wider font-bold mt-1">{profile?.role}</p>
                
                <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                    <span className="text-slate-500">Email</span>
                    <span className="font-mono text-slate-300">{profile?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                    <span className="text-slate-500">Joined</span>
                    <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2">
                    <span className="text-slate-500">Last Login</span>
                    <span className="text-[#FBBF24]">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Management */}
            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="text-[#FBBF24]" size={20} />
                Email Management
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Recovery Email</label>
                  <input type="email" value={formData.recoveryEmail} onChange={e => setFormData({...formData, recoveryEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-[#22D3EE]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notification Email</label>
                  <input type="email" value={formData.notificationEmail} onChange={e => setFormData({...formData, notificationEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-[#22D3EE]" />
                </div>
                <button onClick={handleProfileUpdate} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-bold text-white transition-colors">
                  Save Emails
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Edit Profile & Password */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="text-[#FBBF24]" size={20} />
                Profile Information
              </h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22D3EE]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-[#22D3EE]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Office Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-[#22D3EE]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Admin Bio</label>
                  <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22D3EE]"></textarea>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#22D3EE] to-[#06b6d4] hover:to-[#0891b2] text-slate-900 font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Key className="text-[#FBBF24]" size={20} />
                Security Settings
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Password</label>
                  <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#FBBF24]" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Password</label>
                    <input type="password" required minLength="6" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#FBBF24]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirm New Password</label>
                    <input type="password" required minLength="6" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#FBBF24]" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-[#FBBF24] text-[#FBBF24] font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    Change Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
